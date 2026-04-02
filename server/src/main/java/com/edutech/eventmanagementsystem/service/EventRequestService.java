package com.edutech.eventmanagementsystem.service;

import com.edutech.eventmanagementsystem.dto.ApproveRequestDTO;
import com.edutech.eventmanagementsystem.dto.RejectRequestDTO;
import com.edutech.eventmanagementsystem.entity.*;
import com.edutech.eventmanagementsystem.repository.*;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class EventRequestService {

    private final EventRequestRepository eventRequestRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ResourceRepository resourceRepository;
    private final AllocationRepository allocationRepository;

    public EventRequestService(EventRequestRepository eventRequestRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            ResourceRepository resourceRepository,
            AllocationRepository allocationRepository) {
        this.eventRequestRepository = eventRequestRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.resourceRepository = resourceRepository;
        this.allocationRepository = allocationRepository;
    }

    // ── CLIENT: Submit a new event request ──────────────────────────
    public EventRequest submitRequest(EventRequest request, String clientUsername) {
        User client = userRepository.findByUsername(clientUsername);
        request.setClient(client);
        request.setStatus("PENDING");
        request.setSubmittedAt(new Date());
        request.setUpdatedAt(new Date());
        return eventRequestRepository.save(request);
    }

    // ── CLIENT: View their own requests ────────────────────────────
    public List<EventRequest> getClientRequests(String clientUsername) {
        User client = userRepository.findByUsername(clientUsername);
        return eventRequestRepository.findByClientId(client.getId());
    }

    // ── PLANNER: View all PENDING requests ─────────────────────────
    public List<EventRequest> getPendingRequests() {
        return eventRequestRepository.findByStatus("PENDING");
    }

    // ── PLANNER: View all requests regardless of status ────────────
    public List<EventRequest> getAllRequests() {
        return eventRequestRepository.findAll();
    }

    // ── PLANNER: Mark request as UNDER_REVIEW ──────────────────────
    public EventRequest markUnderReview(Long requestId) {
        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus("UNDER_REVIEW");
        req.setUpdatedAt(new Date());
        return eventRequestRepository.save(req);
    }

    // ── PLANNER: Approve request ────────────────────────────────────
    // This creates the actual Event, allocates resources, links them back
    public EventRequest approveRequest(Long requestId, ApproveRequestDTO dto) {

        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // 1. Validate all requested allocations have enough available quantity
        for (ApproveRequestDTO.AllocationItem item : dto.getAllocations()) {
            Resource resource = resourceRepository.findById(item.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found: " + item.getResourceId()));

            int available = resource.getAvailableQuantity();
            if (available < item.getQuantity()) {
                throw new RuntimeException(
                        "Not enough quantity for resource: " + resource.getName() +
                                ". Available: " + available + ", Requested: " + item.getQuantity());
            }
        }

        // 2. Create the actual Event from the request data
        Event event = new Event();
        event.setTitle(req.getEventTitle());
        event.setDescription(req.getEventDescription());
        event.setLocation(req.getEventLocation());
        event.setDateTime(req.getEventDate());
        event.setStatus("PLANNED");
        Event savedEvent = eventRepository.save(event);

        // 3. Allocate each resource — reduce available quantity
        for (ApproveRequestDTO.AllocationItem item : dto.getAllocations()) {
            Resource resource = resourceRepository.findById(item.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            // Deduct from available pool
            resource.setAllocatedQuantity(resource.getAllocatedQuantity() + item.getQuantity());
            resource.recalculateAvailability(); // flip availability if pool hits 0
            resourceRepository.save(resource);

            // Save allocation record
            Allocation allocation = new Allocation();
            allocation.setEvent(savedEvent);
            allocation.setResource(resource);
            allocation.setQuantity(item.getQuantity());
            allocationRepository.save(allocation);
        }

        // 4. Update request status and link to event
        req.setStatus("APPROVED");
        req.setLinkedEvent(savedEvent);
        req.setUpdatedAt(new Date());
        return eventRequestRepository.save(req);
    }

    // ── PLANNER: Reject request with mandatory reason ───────────────
    public EventRequest rejectRequest(Long requestId, RejectRequestDTO dto) {
        if (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank()) {
            throw new RuntimeException("Rejection reason is mandatory");
        }

        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setStatus("REJECTED");
        req.setRejectionReason(dto.getRejectionReason());
        req.setUpdatedAt(new Date());
        return eventRequestRepository.save(req);
    }

    // ── Called when Event status becomes COMPLETED ──────────────────
    // Releases all allocated resources back to the pool
    public void releaseResourcesOnCompletion(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        for (Allocation allocation : event.getAllocations()) {
            Resource resource = allocation.getResource();
            int released = allocation.getQuantity();

            // Return quantity to available pool
            int newAllocated = resource.getAllocatedQuantity() - released;
            resource.setAllocatedQuantity(Math.max(newAllocated, 0)); // never go below 0
            resource.recalculateAvailability();
            resourceRepository.save(resource);
        }
    }
}

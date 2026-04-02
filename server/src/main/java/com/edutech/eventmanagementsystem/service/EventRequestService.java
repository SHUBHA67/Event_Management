package com.edutech.eventmanagementsystem.service;

import com.edutech.eventmanagementsystem.dto.ApproveRequestDTO;
import com.edutech.eventmanagementsystem.dto.RejectRequestDTO;
import com.edutech.eventmanagementsystem.entity.*;
import com.edutech.eventmanagementsystem.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
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

    // ── Utility: Convert LocalDateTime → java.util.Date ─────────────
    private Date toDate(LocalDateTime ldt) {
        return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
    }

    // ── Utility: Convert java.util.Date → LocalDateTime ─────────────
    private LocalDateTime toLocalDateTime(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    // ── CLIENT: Submit a new event request ──────────────────────────
    public EventRequest submitRequest(EventRequest request, String clientUsername) {
        User client = userRepository.findByUsername(clientUsername);
        request.setClient(client);
        request.setStatus("PENDING");
        request.setSubmittedAt(toDate(LocalDateTime.now()));   // :white_check_mark: Fix #1 & #2
        request.setUpdatedAt(toDate(LocalDateTime.now()));     // :white_check_mark: Fix #2
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
        req.setUpdatedAt(toDate(LocalDateTime.now()));         // :white_check_mark: Fix #2
        return eventRequestRepository.save(req);
    }

    // ── PLANNER: Approve request ────────────────────────────────────
    @Transactional
    public EventRequest approveRequest(Long requestId, ApproveRequestDTO dto) {

        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // 1. Validate all requested allocations have enough available quantity
        for (ApproveRequestDTO.AllocationItem item : dto.getAllocations()) {
            Resource resource = resourceRepository.findById(item.getResourceId())
                    .orElseThrow(() -> new RuntimeException(
                            "Resource not found: " + item.getResourceId()));

            int available = resource.getAvailableQuantity();
            if (available < item.getQuantity()) {
                throw new RuntimeException(
                        "Not enough quantity for resource: " + resource.getName() +
                                ". Available: " + available +
                                ", Requested: " + item.getQuantity());
            }
        }

        // 2. Create the actual Event from the request data
        Event event = new Event();
        event.setTitle(req.getEventTitle());
        event.setDescription(req.getEventDescription());
        event.setLocation(req.getEventLocation());
        event.setDateTime(toLocalDateTime(req.getEventDate())); // ✅ Fix #3
        event.setStatus("PLANNED");
        Event savedEvent = eventRepository.save(event);

        // 3. Allocate each resource — reduce available quantity
        for (ApproveRequestDTO.AllocationItem item : dto.getAllocations()) {
            Resource resource = resourceRepository.findById(item.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            resource.setAllocatedQuantity(
                    resource.getAllocatedQuantity() + item.getQuantity()
            );
            resource.recalculateAvailability();
            resourceRepository.save(resource);

            Allocation allocation = new Allocation();
            allocation.setEvent(savedEvent);
            allocation.setResource(resource);
            allocation.setQuantity(item.getQuantity());
            allocationRepository.save(allocation);
        }

        // 4. Update request status and link to event
        req.setStatus("APPROVED");
        req.setLinkedEvent(savedEvent);
        req.setUpdatedAt(toDate(LocalDateTime.now()));         // :white_check_mark: Fix #2
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
        req.setUpdatedAt(toDate(LocalDateTime.now()));         // :white_check_mark: Fix #2
        return eventRequestRepository.save(req);
    }

    // ── Called when Event status becomes COMPLETED ──────────────────
    public void releaseResourcesOnCompletion(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        for (Allocation allocation : event.getAllocations()) {
            Resource resource = allocation.getResource();
            int released = allocation.getQuantity();

            int newAllocated = resource.getAllocatedQuantity() - released;
            resource.setAllocatedQuantity(Math.max(newAllocated, 0));
            resource.recalculateAvailability();
            resourceRepository.save(resource);
        }
    }
}
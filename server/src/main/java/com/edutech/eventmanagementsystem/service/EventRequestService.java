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

    public EventRequestService(EventRequestRepository eventRequestRepository,
            UserRepository userRepository,
            EventRepository eventRepository) {
        this.eventRequestRepository = eventRequestRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
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

    // ── CLIENT: View their own requests ─────────────────────────────
    public List<EventRequest> getClientRequests(String clientUsername) {
        User client = userRepository.findByUsername(clientUsername);
        return eventRequestRepository.findByClientId(client.getId());
    }

    // ── CLIENT: Get approved bookings with linked event details ─────
    // Returns only APPROVED requests for the logged-in client
    // The linkedEvent on each request carries event + planner + staff info
    public List<EventRequest> getClientBookings(String clientUsername) {
        User client = userRepository.findByUsername(clientUsername);
        return eventRequestRepository.findByClientIdAndStatus(client.getId(), "APPROVED");
    }

    // ── PLANNER: View all requests regardless of status ─────────────
    public List<EventRequest> getAllRequests() {
        return eventRequestRepository.findAll();
    }

    // ── PLANNER: Mark request as UNDER_REVIEW ───────────────────────
    public EventRequest markUnderReview(Long requestId) {
        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus("UNDER_REVIEW");
        req.setUpdatedAt(new Date());
        return eventRequestRepository.save(req);
    }

    // ── PLANNER: Approve request ─────────────────────────────────────
    // Planner has already manually created the event and allocated resources
    // This action simply links the chosen event to the request and marks it
    // APPROVED
    public EventRequest approveRequest(Long requestId, ApproveRequestDTO dto) {
        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Find the event the planner created and wants to link
        Event linkedEvent = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found. Please create the event first."));

        // Link the event and approve
        req.setLinkedEvent(linkedEvent);
        req.setStatus("APPROVED");
        req.setUpdatedAt(new Date());
        return eventRequestRepository.save(req);
    }

    // ── PLANNER: Reject request with mandatory reason ────────────────
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
}

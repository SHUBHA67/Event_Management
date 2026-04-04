package com.edutech.eventmanagementsystem.service;

import com.edutech.eventmanagementsystem.dto.ApproveRequestDTO;
import com.edutech.eventmanagementsystem.dto.CancelRequestDTO;
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

    // ── CLIENT: Get approved bookings ───────────────────────────────
    public List<EventRequest> getClientBookings(String clientUsername) {
        User client = userRepository.findByUsername(clientUsername);
        return eventRequestRepository.findByClientIdAndStatus(client.getId(), "APPROVED");
    }

    // ── CLIENT: Cancel a request with feedback ───────────────────────
    // Only PENDING or UNDER_REVIEW requests can be cancelled
    public EventRequest cancelRequest(Long requestId, CancelRequestDTO dto, String clientUsername) {
        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Ensure the request belongs to the calling client
        if (!req.getClient().getUsername().equals(clientUsername)) {
            throw new RuntimeException("Unauthorized: this request does not belong to you");
        }

        if (!"PENDING".equals(req.getStatus()) && !"UNDER_REVIEW".equals(req.getStatus())) {
            throw new RuntimeException("Only PENDING or UNDER_REVIEW requests can be cancelled");
        }

        req.setStatus("CANCELLED");
        req.setCancellationFeedback(dto.getCancellationFeedback());
        req.setUpdatedAt(new Date());
        return eventRequestRepository.save(req);
    }

    // ── PLANNER: View all requests ───────────────────────────────────
    public List<EventRequest> getAllRequests() {
        return eventRequestRepository.findAll();
    }

    // ── PLANNER: Get a single request by ID (for auto-fill) ──────────
    public EventRequest getRequestById(Long requestId) {
        return eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    // ── PLANNER: Mark request as UNDER_REVIEW ───────────────────────
    public EventRequest markUnderReview(Long requestId) {
        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus("UNDER_REVIEW");
        req.setUpdatedAt(new Date());
        return eventRequestRepository.save(req);
    }

    // ── PLANNER: Approve request — links an existing event ───────────
    public EventRequest approveRequest(Long requestId, ApproveRequestDTO dto) {
        EventRequest req = eventRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Event linkedEvent = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found. Please create the event first."));

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

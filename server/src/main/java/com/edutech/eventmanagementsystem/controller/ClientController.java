package com.edutech.eventmanagementsystem.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.dto.CancelRequestDTO;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.EventRequest;
import com.edutech.eventmanagementsystem.service.EventRequestService;
import com.edutech.eventmanagementsystem.service.EventService;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    private final EventService eventService;
    private final EventRequestService eventRequestService;

    public ClientController(EventService eventService,
            EventRequestService eventRequestService) {
        this.eventService = eventService;
        this.eventRequestService = eventRequestService;
    }

    // ── Browse all events ────────────────────────────────────────────
    @GetMapping("/events")
    public ResponseEntity<List<Event>> browseEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // ── Submit an event request ──────────────────────────────────────
    @PostMapping("/event-request")
    public ResponseEntity<?> submitRequest(@RequestBody EventRequest request,
            Principal principal) {
        try {
            EventRequest saved = eventRequestService.submitRequest(request, principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to submit request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // ── View all own requests ────────────────────────────────────────
    @GetMapping("/my-requests")
    public ResponseEntity<List<EventRequest>> getMyRequests(Principal principal) {
        return ResponseEntity.ok(eventRequestService.getClientRequests(principal.getName()));
    }

    // ── View only APPROVED bookings ──────────────────────────────────
    @GetMapping("/my-bookings")
    public ResponseEntity<List<EventRequest>> getMyBookings(Principal principal) {
        return ResponseEntity.ok(eventRequestService.getClientBookings(principal.getName()));
    }

    // ── Cancel a request with feedback ──────────────────────────────
    // Only PENDING or UNDER_REVIEW requests can be cancelled
    @PutMapping("/event-request/{requestId}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long requestId,
            @RequestBody CancelRequestDTO dto,
            Principal principal) {
        try {
            EventRequest updated = eventRequestService.cancelRequest(requestId, dto, principal.getName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }
}

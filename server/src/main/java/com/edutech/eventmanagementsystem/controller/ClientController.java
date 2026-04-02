package com.edutech.eventmanagementsystem.controller;


import java.util.List;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.service.EventService;

import com.edutech.eventmanagementsystem.entity.EventRequest;
import com.edutech.eventmanagementsystem.service.EventRequestService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;

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

    // ── Existing: view booking/event details by ID ──────────────────
    @GetMapping("/booking-details/{eventId}")
    public ResponseEntity<Event> getBookingDetails(@PathVariable Long eventId) {
        Event event = eventService.getEventDetails(eventId);
        return ResponseEntity.ok(event);
    }

    // ── NEW: Browse all PLANNED / upcoming events ───────────────────
    @GetMapping("/events")
    public ResponseEntity<List<Event>> browseEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    // ── NEW: Submit an event request ───────────────────────────────
    // Principal gives us the logged-in client's username from JWT
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

    // ── NEW: Client views their own requests and statuses ──────────
    @GetMapping("/my-requests")
    public ResponseEntity<List<EventRequest>> getMyRequests(Principal principal) {
        List<EventRequest> requests = eventRequestService.getClientRequests(principal.getName());
        return ResponseEntity.ok(requests);
    }
}

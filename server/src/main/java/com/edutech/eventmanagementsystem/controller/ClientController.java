package com.edutech.eventmanagementsystem.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.EventRequest;
import com.edutech.eventmanagementsystem.service.EventService;
import com.edutech.eventmanagementsystem.service.EventRequestService;

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

    // ── Existing: View booking / event details by ID ────────────────
    @GetMapping("/booking-details/{eventId}")
    public ResponseEntity<Event> getBookingDetails(@PathVariable Long eventId) {
        Event event = eventService.getEventDetails(eventId);
        return ResponseEntity.ok(event);
    }

    // ── Browse all planned / upcoming events ───────────────────────
    @GetMapping("/events")
    public ResponseEntity<List<Event>> browseEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    // ── Submit an event request ────────────────────────────────────
    // NOTE (future improvement): Accept a DTO instead of EventRequest entity
    @PostMapping("/event-request")
    public ResponseEntity<?> submitRequest(@RequestBody EventRequest request,
                                           Principal principal) {

        if (principal == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Unauthorized: user not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        try {
            EventRequest saved =
                    eventRequestService.submitRequest(request, principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to submit request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // ── Client views their own requests and statuses ────────────────
    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(Principal principal) {

        if (principal == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Unauthorized: user not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        List<EventRequest> requests =
                eventRequestService.getClientRequests(principal.getName());
        return ResponseEntity.ok(requests);
    }
}
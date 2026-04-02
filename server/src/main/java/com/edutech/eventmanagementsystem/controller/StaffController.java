package com.edutech.eventmanagementsystem.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.service.EventService;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class StaffController {

    private final EventService eventService;

    public StaffController(EventService eventService) {
        this.eventService = eventService;
    }

    // ── Get only events assigned to logged-in staff ──────────────────
    // Auto-fetched using Principal — no manual ID search needed
    @GetMapping("/api/staff/my-events")
    public ResponseEntity<?> getMyEvents(Principal principal) {
        try {
            List<Event> events = eventService.getMyAssignedEvents(principal.getName());
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to load events");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ── Update event status ONLY ─────────────────────────────────────
    // Staff cannot edit title, description, location, dateTime
    // Only status is accepted in the request body
    @PutMapping("/api/staff/update-status/{eventId}")
    public ResponseEntity<?> updateEventStatus(@PathVariable Long eventId,
            @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (newStatus == null || newStatus.isBlank()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Status is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Event updated = eventService.updateEventStatus(eventId, newStatus);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Event not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
package com.edutech.eventmanagementsystem.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.service.EventService;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final EventService eventService;

    public StaffController(EventService eventService) {
        this.eventService = eventService;
    }

    /**
     * Get event details by eventId.
     *
     * @param eventId the ID of the event
     * @return the event details with status 200 OK, or 404 if not found
     */
    @GetMapping("/event-details/{eventId}")
    public ResponseEntity<?> getEventDetails(@PathVariable Long eventId) {
        Event event = eventService.getEventDetails(eventId);
        if (event != null) {
            return ResponseEntity.ok(event);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Event not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Update event setup details.
     *
     * @param eventId the ID of the event to update
     * @param updatedEvent the updated event data
     * @return the updated event with status 200 OK, or error message if failed
     */
    @PutMapping("/update-setup/{eventId}")
    public ResponseEntity<?> updateEventSetup(
            @PathVariable Long eventId,
            @RequestBody Event updatedEvent) {

        try {
            Event event = eventService.updateEventSetup(eventId, updatedEvent);
            if (event != null) {
                return ResponseEntity.ok(event);
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update event setup");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update event setup");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
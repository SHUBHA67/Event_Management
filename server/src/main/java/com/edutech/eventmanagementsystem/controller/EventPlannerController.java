package com.edutech.eventmanagementsystem.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.service.EventService;
import com.edutech.eventmanagementsystem.service.ResourceService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;




import com.edutech.eventmanagementsystem.dto.ApproveRequestDTO;
import com.edutech.eventmanagementsystem.dto.RejectRequestDTO;

import com.edutech.eventmanagementsystem.entity.EventRequest;

import com.edutech.eventmanagementsystem.service.EventRequestService;



@RestController
public class EventPlannerController {

    private final EventService eventService;
    private final ResourceService resourceService;
    private final EventRequestService eventRequestService;

    public EventPlannerController(EventService eventService,
            ResourceService resourceService,
            EventRequestService eventRequestService) {
        this.eventService = eventService;
        this.resourceService = resourceService;
        this.eventRequestService = eventRequestService;
    }

    // ── Existing endpoints ──────────────────────────────────────────

    @PostMapping("/api/planner/event")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            Event saved = eventService.createEvent(event);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to create event");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/planner/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // ── Updated: addResource now accepts totalQuantity ──────────────
    @PostMapping("/api/planner/resource")
    public ResponseEntity<?> addResource(@RequestBody Resource resource) {
        try {
            // Set allocatedQuantity to 0 on creation
            resource.setAllocatedQuantity(0);
            // Derive initial availability from totalQuantity
            resource.recalculateAvailability();
            Resource result = resourceService.addResource(resource);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to add resource");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/planner/resources")
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @PostMapping("/api/planner/allocate-resources")
    public ResponseEntity<?> allocateResources(@RequestParam Long eventId,
            @RequestParam Long resourceId,
            @RequestBody Allocation allocation) {
        try {
            resourceService.allocateResources(eventId, resourceId, allocation);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource allocated successfully for Event ID: " + eventId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage()); // surface the real error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ── NEW: View all client event requests ─────────────────────────
    @GetMapping("/api/planner/event-requests")
    public ResponseEntity<List<EventRequest>> getAllRequests() {
        return ResponseEntity.ok(eventRequestService.getAllRequests());
    }

    // ── NEW: View only PENDING requests ─────────────────────────────
    @GetMapping("/api/planner/event-requests/pending")
    public ResponseEntity<List<EventRequest>> getPendingRequests() {
        return ResponseEntity.ok(eventRequestService.getPendingRequests());
    }

    // ── NEW: Mark a request as UNDER_REVIEW ─────────────────────────
    @PutMapping("/api/planner/event-requests/{requestId}/review")
    public ResponseEntity<?> markUnderReview(@PathVariable Long requestId) {
        try {
            EventRequest updated = eventRequestService.markUnderReview(requestId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ── NEW: Approve a request (creates event + allocates resources) ─
    @PutMapping("/api/planner/event-requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId,
            @RequestBody ApproveRequestDTO dto) {
        try {
            EventRequest updated = eventRequestService.approveRequest(requestId, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage()); // tells planner exactly what's unavailable
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // ── NEW: Reject a request with mandatory reason ──────────────────
    @PutMapping("/api/planner/event-requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId,
            @RequestBody RejectRequestDTO dto) {
        try {
            EventRequest updated = eventRequestService.rejectRequest(requestId, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}


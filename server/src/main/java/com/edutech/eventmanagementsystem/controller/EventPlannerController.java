package com.edutech.eventmanagementsystem.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.entity.EventRequest;

import com.edutech.eventmanagementsystem.service.EventService;
import com.edutech.eventmanagementsystem.service.ResourceService;
import com.edutech.eventmanagementsystem.service.EventRequestService;

import com.edutech.eventmanagementsystem.dto.ApproveRequestDTO;
import com.edutech.eventmanagementsystem.dto.RejectRequestDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/planner")   // ✅ Centralized base path
public class EventPlannerController {

    private final EventService eventService;
    private final ResourceService resourceService;
    private final EventRequestService eventRequestService;

    public EventPlannerController(
            EventService eventService,
            ResourceService resourceService,
            EventRequestService eventRequestService) {

        this.eventService = eventService;
        this.resourceService = resourceService;
        this.eventRequestService = eventRequestService;
    }

    // ─────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────

    @PostMapping("/event")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            Event saved = eventService.createEvent(event);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to create event");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents()); // ✅ 200 OK
    }

    // ─────────────────────────────────────────────
    // Resources
    // ─────────────────────────────────────────────

    @PostMapping("/resource")
    public ResponseEntity<?> addResource(@RequestBody Resource resource) {
        try {
            resource.setAllocatedQuantity(0);
            resource.recalculateAvailability();

            Resource result = resourceService.addResource(resource);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to add resource");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/resources")
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources()); // ✅ 200 OK
    }

    @PostMapping("/allocate-resources")
    public ResponseEntity<?> allocateResources(
            @RequestParam Long eventId,
            @RequestParam Long resourceId,
            @RequestBody Allocation allocation) {

        try {
            resourceService.allocateResources(eventId, resourceId, allocation);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource allocated successfully for Event ID: " + eventId);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // ─────────────────────────────────────────────
    // Event Requests (Client → Planner)
    // ─────────────────────────────────────────────

    @GetMapping("/event-requests")
    public ResponseEntity<List<EventRequest>> getAllRequests() {
        return ResponseEntity.ok(eventRequestService.getAllRequests()); // ✅ 200 OK
    }

    @GetMapping("/event-requests/pending")
    public ResponseEntity<List<EventRequest>> getPendingRequests() {
        return ResponseEntity.ok(eventRequestService.getPendingRequests()); // ✅ 200 OK
    }

    @PutMapping("/event-requests/{requestId}/review")
    public ResponseEntity<?> markUnderReview(@PathVariable Long requestId) {
        try {
            EventRequest updated = eventRequestService.markUnderReview(requestId);
            return ResponseEntity.ok(updated); // ✅ 200 OK
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/event-requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long requestId,
            @RequestBody ApproveRequestDTO dto) {

        try {
            EventRequest updated = eventRequestService.approveRequest(requestId, dto);
            return ResponseEntity.ok(updated); // ✅ 200 OK
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/event-requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody RejectRequestDTO dto) {

        try {
            EventRequest updated = eventRequestService.rejectRequest(requestId, dto);
            return ResponseEntity.ok(updated); // ✅ 200 OK
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
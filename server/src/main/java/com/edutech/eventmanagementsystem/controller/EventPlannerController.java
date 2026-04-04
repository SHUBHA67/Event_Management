package com.edutech.eventmanagementsystem.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.dto.ApproveRequestDTO;
import com.edutech.eventmanagementsystem.dto.RejectRequestDTO;
import com.edutech.eventmanagementsystem.dto.StaffAvailabilityResponse;
import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.EventRequest;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.entity.User;
import com.edutech.eventmanagementsystem.service.EventRequestService;
import com.edutech.eventmanagementsystem.service.EventService;
import com.edutech.eventmanagementsystem.service.ResourceService;
import com.edutech.eventmanagementsystem.service.UserService;

import java.security.Principal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class EventPlannerController {

    private final EventService eventService;
    private final ResourceService resourceService;
    private final EventRequestService eventRequestService;
    private final UserService userService;

    public EventPlannerController(EventService eventService,
            ResourceService resourceService,
            EventRequestService eventRequestService,
            UserService userService) {
        this.eventService = eventService;
        this.resourceService = resourceService;
        this.eventRequestService = eventRequestService;
        this.userService = userService;
    }

    // ── Get all staff users for dropdown ────────────────────────────
    @GetMapping("/api/planner/staff-users")
    public ResponseEntity<List<User>> getStaffUsers() {
        return ResponseEntity.ok(userService.getStaffUsers());
    }

    // ── Get all vendor users for dropdown ───────────────────────────
    @GetMapping("/api/planner/vendors")
    public ResponseEntity<List<User>> getVendors() {
        return ResponseEntity.ok(userService.getVendorUsers());
    }

    // ── Get resources for a specific vendor ─────────────────────────
    @GetMapping("/api/planner/vendor/{vendorId}/resources")
    public ResponseEntity<?> getVendorResources(@PathVariable Long vendorId) {
        try {
            List<Resource> resources = resourceService.getResourcesByVendor(vendorId);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to load vendor resources: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // ── Check staff availability at a given datetime ─────────────────
    // Frontend calls this before assigning staff, passing staffId and dateTime
    // dateTime format: ISO 8601 e.g. 2025-08-15T10:00:00
    @GetMapping("/api/planner/staff/{staffId}/availability")
    public ResponseEntity<?> checkStaffAvailability(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date dateTime) {
        try {
            StaffAvailabilityResponse response = eventService.checkStaffAvailability(staffId, dateTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    // ── Create event ─────────────────────────────────────────────────
    // staffId is passed as request param after availability has been confirmed
    // Resource allocation (vendorId, resourceId, quantity) is handled inline
    // after event creation via the allocate-resources endpoint below
    @PostMapping("/api/planner/event")
    public ResponseEntity<?> createEvent(@RequestBody Event event,
            @RequestParam(required = false) Long staffId,
            Principal principal) {
        try {
            Event saved = eventService.createEvent(event, principal.getName(), staffId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to create event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ── Get all events ───────────────────────────────────────────────
    @GetMapping("/api/planner/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // ── Get single event details ─────────────────────────────────────
    @GetMapping("/api/planner/event/{eventId}")
    public ResponseEntity<?> getEventDetails(@PathVariable Long eventId) {
        Event event = eventService.getEventDetails(eventId);
        if (event == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Event not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        return ResponseEntity.ok(event);
    }

    // ── Allocate vendor resource to event ────────────────────────────
    // Called from the create-event form after event is created.
    // Takes vendorId for traceability, resourceId and quantity.
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
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ── Get all resources (all vendors combined) ─────────────────────
    @GetMapping("/api/planner/resources")
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // ── View all client event requests ───────────────────────────────
    @GetMapping("/api/planner/event-requests")
    public ResponseEntity<List<EventRequest>> getAllRequests() {
        return ResponseEntity.ok(eventRequestService.getAllRequests());
    }

    // ── Get single event request by ID (for create-event auto-fill) ──
    @GetMapping("/api/planner/event-requests/{requestId}")
    public ResponseEntity<?> getRequestById(@PathVariable Long requestId) {
        try {
            EventRequest req = eventRequestService.getRequestById(requestId);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
    }

    // ── Mark request as UNDER_REVIEW ────────────────────────────────
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

    // ── Approve request ──────────────────────────────────────────────
    @PutMapping("/api/planner/event-requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId,
            @RequestBody ApproveRequestDTO dto) {
        try {
            EventRequest updated = eventRequestService.approveRequest(requestId, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // ── Reject request ───────────────────────────────────────────────
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

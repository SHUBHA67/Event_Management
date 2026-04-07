package com.edutech.eventmanagementsystem.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.EventRequest;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.entity.User;
import com.edutech.eventmanagementsystem.service.EventService;
import com.edutech.eventmanagementsystem.service.ResourceService;
import com.edutech.eventmanagementsystem.service.EventRequestService;
import com.edutech.eventmanagementsystem.service.UserService;
import com.edutech.eventmanagementsystem.dto.ApproveRequestDTO;
import com.edutech.eventmanagementsystem.dto.RejectRequestDTO;

import java.security.Principal;
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



    // ── Get AVAILABLE staff for a given date (no collision) ─────────
    @GetMapping("/api/planner/available-staff")
    public ResponseEntity<List<User>> getAvailableStaff(@RequestParam String dateTime) {
        return ResponseEntity.ok(userService.getAvailableStaff(dateTime));
    }

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

    @GetMapping("/api/planner/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping("/api/planner/resource")
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
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/planner/event-requests")
    public ResponseEntity<List<EventRequest>> getAllRequests() {
        return ResponseEntity.ok(eventRequestService.getAllRequests());
    }

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
    @GetMapping("/api/planner/event-requests/{requestId}")
public ResponseEntity<?> getRequestById(@PathVariable Long requestId) {
    try {
        EventRequest req = eventRequestService.getRequestById(requestId);
        return ResponseEntity.ok(req);
    } catch (Exception e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}


    @GetMapping("/api/planner/vendors")
    public ResponseEntity<List<User>> getVendors() {
        return ResponseEntity.ok(userService.getVendorUsers());
    }

    @GetMapping("/api/planner/vendor/{vendorId}/resources")
    public ResponseEntity<List<Resource>> getVendorResources(@PathVariable Long vendorId) {
        return ResponseEntity.ok(resourceService.getResourcesByVendor(vendorId));
    }


}

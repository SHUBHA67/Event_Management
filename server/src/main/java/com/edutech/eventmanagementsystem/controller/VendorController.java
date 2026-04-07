package com.edutech.eventmanagementsystem.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.dto.VendorEventDTO;
import com.edutech.eventmanagementsystem.dto.VendorResourceDispatchDTO;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.service.ResourceService;
import com.edutech.eventmanagementsystem.service.UserService;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    private final ResourceService resourceService;
    private final UserService userService;

    public VendorController(ResourceService resourceService, UserService userService) {
        this.resourceService = resourceService;
        this.userService = userService;
    }

    // ── Add a new resource ───────────────────────────────────────────
    @PostMapping("/resource")
    public ResponseEntity<?> addResource(@RequestBody Resource resource, Principal principal) {
        try {
            Resource saved = resourceService.addVendorResource(resource, principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to add resource: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // ── Get vendor's own resources ───────────────────────────────────
    @GetMapping("/my-resources")
    public ResponseEntity<?> getMyResources(Principal principal) {
        try {
            List<Resource> resources = resourceService.getVendorResources(principal.getName());
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to load resources: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // ── Get events where this vendor's resources are allocated ────────
    // Returns only the allocations belonging to this vendor per event
    @GetMapping("/my-events")
    public ResponseEntity<?> getMyEvents(Principal principal) {
        try {
            List<VendorEventDTO> result = resourceService.getEventsByVendor(principal.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to load vendor events: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // ── Update a resource (name, type, totalQuantity) ────────────────
    @PutMapping("/resource/{resourceId}/update")
    public ResponseEntity<?> updateResource(@PathVariable Long resourceId,
            @RequestBody Resource updates,
            Principal principal) {
        try {
            Resource updated = resourceService.updateVendorResource(resourceId, updates, principal.getName());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to update resource: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // ── Delete a resource ─────────────────────────────────────────────
    @DeleteMapping("/resource/{resourceId}")
    public ResponseEntity<?> deleteResource(@PathVariable Long resourceId,
            Principal principal) {
        try {
            resourceService.deleteVendorResource(resourceId, principal.getName());
            Map<String, String> res = new HashMap<>();
            res.put("message", "Resource deleted successfully");
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to delete resource: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }
}

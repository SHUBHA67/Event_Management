package com.edutech.eventmanagementsystem.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.dto.VendorResourceDispatchDTO;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.service.ResourceService;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    private final ResourceService resourceService;

    public VendorController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // ── Add a new resource (vendor's own) ────────────────────────────
    @PostMapping("/resource")
    public ResponseEntity<?> addResource(@RequestBody Resource resource, Principal principal) {
        try {
            Resource saved = resourceService.addVendorResource(resource, principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
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

    // ── Dispatch a resource ──────────────────────────────────────────
    // Vendor dispatches a quantity of a specific resource.
    // This reduces available quantity and sets dispatchStatus to DISPATCHED.
    @PutMapping("/resource/{resourceId}/dispatch")
    public ResponseEntity<?> dispatchResource(@PathVariable Long resourceId,
            @RequestBody VendorResourceDispatchDTO dto,
            Principal principal) {
        try {
            Resource updated = resourceService.dispatchResource(resourceId, dto.getQuantity(), principal.getName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }
}

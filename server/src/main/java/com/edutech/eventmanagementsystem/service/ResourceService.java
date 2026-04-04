package com.edutech.eventmanagementsystem.service;

import org.springframework.stereotype.Service;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.entity.User;
import com.edutech.eventmanagementsystem.repository.AllocationRepository;
import com.edutech.eventmanagementsystem.repository.EventRepository;
import com.edutech.eventmanagementsystem.repository.ResourceRepository;
import com.edutech.eventmanagementsystem.repository.UserRepository;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class ResourceService {

    private final AllocationRepository allocationRepository;
    private final ResourceRepository resourceRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public ResourceService(AllocationRepository allocationRepository,
            ResourceRepository resourceRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {
        this.allocationRepository = allocationRepository;
        this.resourceRepository = resourceRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    // ── VENDOR: Add a resource owned by the vendor ───────────────────
    public Resource addVendorResource(Resource resource, String vendorUsername) {
        User vendor = userRepository.findByUsername(vendorUsername);
        if (vendor == null) throw new RuntimeException("Vendor not found");
        resource.setVendor(vendor);
        resource.setAllocatedQuantity(0);
        resource.setDispatchStatus("AVAILABLE");
        resource.recalculateAvailability();
        return resourceRepository.save(resource);
    }

    // ── VENDOR: Get only their own resources ─────────────────────────
    public List<Resource> getVendorResources(String vendorUsername) {
        return resourceRepository.findByVendorUsername(vendorUsername);
    }

    // ── VENDOR: Dispatch a resource (mark as dispatched, update qty) ─
    // Dispatching reduces available quantity by the dispatched amount
    public Resource dispatchResource(Long resourceId, int quantity, String vendorUsername) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found"));

        // Ensure this resource belongs to the calling vendor
        if (resource.getVendor() == null ||
                !resource.getVendor().getUsername().equals(vendorUsername)) {
            throw new RuntimeException("Unauthorized: this resource does not belong to you");
        }

        if (resource.getAvailableQuantity() < quantity) {
            throw new RuntimeException("Not enough available quantity to dispatch. " +
                    "Available: " + resource.getAvailableQuantity() + ", Requested: " + quantity);
        }

        resource.setAllocatedQuantity(resource.getAllocatedQuantity() + quantity);
        resource.setDispatchStatus("DISPATCHED");
        resource.recalculateAvailability();
        return resourceRepository.save(resource);
    }

    // ── PLANNER: Get all resources from a specific vendor ────────────
    public List<Resource> getResourcesByVendor(Long vendorId) {
        return resourceRepository.findByVendorId(vendorId);
    }

    // ── PLANNER: Get all resources (all vendors) ─────────────────────
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // ── PLANNER: Allocate a vendor resource to an event ─────────────
    // Called during event creation — replaces the old standalone allocate flow
    public void allocateResources(Long eventId, Long resourceId, Allocation allocation) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + eventId));

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with ID: " + resourceId));

        int available = resource.getAvailableQuantity();
        if (available < allocation.getQuantity()) {
            throw new RuntimeException(
                    "Not enough quantity for resource: " + resource.getName() +
                            ". Available: " + available + ", Requested: " + allocation.getQuantity());
        }

        resource.setAllocatedQuantity(resource.getAllocatedQuantity() + allocation.getQuantity());
        resource.recalculateAvailability();
        resourceRepository.save(resource);

        allocation.setEvent(event);
        allocation.setResource(resource);
        allocationRepository.save(allocation);

        event.getAllocations().add(allocation);
        eventRepository.save(event);
    }

    // ── Legacy: kept for any internal use ────────────────────────────
    public Resource addResource(Resource resource) {
        return resourceRepository.save(resource);
    }
}

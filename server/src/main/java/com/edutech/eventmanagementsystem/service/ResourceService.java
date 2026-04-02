package com.edutech.eventmanagementsystem.service;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.repository.AllocationRepository;
import com.edutech.eventmanagementsystem.repository.EventRepository;
import com.edutech.eventmanagementsystem.repository.ResourceRepository;

import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class ResourceService {

    private final AllocationRepository allocationRepository;
    private final ResourceRepository resourceRepository;
    private final EventRepository eventRepository;

    public ResourceService(AllocationRepository allocationRepository,
                           ResourceRepository resourceRepository,
                           EventRepository eventRepository) {
        this.allocationRepository = allocationRepository;
        this.resourceRepository = resourceRepository;
        this.eventRepository = eventRepository;
    }

    // :white_check_mark: ADDED: Save a new resource to the database
    public Resource addResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    // :white_check_mark: ADDED: Fetch all resources
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // Existing method — unchanged
    public void allocateResources(Long eventId, Long resourceId, Allocation allocation) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Event not found: " + eventId));

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Resource not found: " + resourceId));

        int available = resource.getAvailableQuantity();
        if (allocation.getQuantity() > available) {
            throw new RuntimeException(
                    "Not enough quantity for resource: " + resource.getName() +
                    ". Available: " + available +
                    ", Requested: " + allocation.getQuantity()
            );
        }

        resource.setAllocatedQuantity(
                resource.getAllocatedQuantity() + allocation.getQuantity()
        );
        resource.recalculateAvailability();
        resourceRepository.save(resource);

        allocation.setEvent(event);
        allocation.setResource(resource);
        allocationRepository.save(allocation);
    }
}
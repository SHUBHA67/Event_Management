package com.edutech.eventmanagementsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.repository.AllocationRepository;
import com.edutech.eventmanagementsystem.repository.EventRepository;
import com.edutech.eventmanagementsystem.repository.ResourceRepository;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class ResourceService {

  @Autowired
  private AllocationRepository allocationRepository;

  @Autowired
  private ResourceRepository resourceRepository;

  @Autowired
  private EventRepository eventRepository;

  public Resource addResource(Resource resource) {
    return resourceRepository.save(resource);
  }

  public List<Resource> getAllResources() {
    return resourceRepository.findAll();
  }

  public void allocateResources(Long eventId, Long resourceId, Allocation allocation) {
    Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + eventId));

    Resource resource = resourceRepository.findById(resourceId)
        .orElseThrow(() -> new EntityNotFoundException("Resource not found with ID: " + resourceId));

    // Check if enough quantity is available
    int available = resource.getAvailableQuantity();
    if (available < allocation.getQuantity()) {
      throw new RuntimeException(
          "Not enough quantity for resource: " + resource.getName() +
              ". Available: " + available + ", Requested: " + allocation.getQuantity());
    }

    // Deduct from available pool and recalculate availability
    resource.setAllocatedQuantity(resource.getAllocatedQuantity() + allocation.getQuantity());
    resource.recalculateAvailability();
    resourceRepository.save(resource);

    // Save the allocation record
    allocation.setEvent(event);
    allocation.setResource(resource);
    allocationRepository.save(allocation);

    // Update the event's allocation list
    event.getAllocations().add(allocation);
    eventRepository.save(event);
  }
}

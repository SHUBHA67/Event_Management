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
    Resource savedResource = resourceRepository.save(resource);
    return savedResource;
  }
 
  public List<Resource> getAllResources() {
    return resourceRepository.findAll();
  }
 
  // @Transactional
  public void allocateResources(Long eventId, Long resourceId, Allocation allocation) {
    Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + eventId));
    Resource resource = resourceRepository.findById(resourceId)
        .orElseThrow(() -> new EntityNotFoundException("Resource not found with ID: " + resourceId));
   
    // Validate resource availability or implement other business rules as needed
    // if (!resource.isAvailability()) {
    //   throw new ResourcesInUseException("Resource is not available for allocation: " + resource.getName());
    // }
   
    // Update resource availability status
    resource.setAvailability(false);
    resourceRepository.save(resource);
   
    // Allocate the resource to the event
    allocation.setEvent(event);
    allocation.setResource(resource);
   
    // Save the allocation
    allocationRepository.save(allocation);
   
    // Update the event with resource allocation
    event.getAllocations().add(allocation);
    eventRepository.save(event);
  }



  
}

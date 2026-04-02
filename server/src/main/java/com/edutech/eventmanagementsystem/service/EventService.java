package com.edutech.eventmanagementsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.repository.EventRepository;

import java.util.List;
import java.util.Optional;



import com.edutech.eventmanagementsystem.entity.Resource;

import com.edutech.eventmanagementsystem.repository.ResourceRepository;




@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ResourceRepository resourceRepository;

    public EventService(EventRepository eventRepository,
            ResourceRepository resourceRepository) {
        this.eventRepository = eventRepository;
        this.resourceRepository = resourceRepository;
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventDetails(Long eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }

    public Event updateEventSetup(Long eventId, Event updatedEvent) {
        Optional<Event> existingOpt = eventRepository.findById(eventId);
        if (existingOpt.isPresent()) {
            Event existing = existingOpt.get();
            existing.setTitle(updatedEvent.getTitle());
            existing.setDescription(updatedEvent.getDescription());
            existing.setDateTime(updatedEvent.getDateTime());
            existing.setLocation(updatedEvent.getLocation());

            String newStatus = updatedEvent.getStatus();

            // ── AUTO RELEASE RESOURCES WHEN EVENT COMPLETES ─────────
            // If staff or planner flips status to COMPLETED,
            // return all allocated quantities back to the resource pool
            if ("COMPLETED".equals(newStatus) && !"COMPLETED".equals(existing.getStatus())) {
                for (Allocation allocation : existing.getAllocations()) {
                    Resource resource = allocation.getResource();

                    int released = allocation.getQuantity();
                    int newAllocated = resource.getAllocatedQuantity() - released;
                    resource.setAllocatedQuantity(Math.max(newAllocated, 0));
                    resource.recalculateAvailability(); // flip availability back to true if qty > 0
                    resourceRepository.save(resource);
                }
            }

            existing.setStatus(newStatus);
            return eventRepository.save(existing);
        }
        return null;
    }
}

package com.edutech.eventmanagementsystem.service;

import org.springframework.stereotype.Service;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.repository.EventRepository;

import java.util.List;
import java.util.Optional;

import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.entity.User;
import com.edutech.eventmanagementsystem.repository.ResourceRepository;
import com.edutech.eventmanagementsystem.repository.UserRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
            ResourceRepository resourceRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    public Event createEvent(Event event, String plannerUsername, Long staffId) {
        User planner = userRepository.findByUsername(plannerUsername);
        event.setPlanner(planner);

        if (staffId != null) {
            User staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            event.setAssignedStaff(staff);
        }

        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventDetails(Long eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }

    public List<Event> getMyAssignedEvents(String staffUsername) {
        return eventRepository.findByAssignedStaffUsername(staffUsername);
    }

    public Event updateEventStatus(Long eventId, String newStatus) {
        Optional<Event> existingOpt = eventRepository.findById(eventId);
        if (existingOpt.isPresent()) {
            Event existing = existingOpt.get();

            // Release resources when COMPLETED
            if ("COMPLETED".equals(newStatus) && !"COMPLETED".equals(existing.getStatus())|| "CANCELLED".equals(newStatus) && !"CANCELLED".equals(existing.getStatus())) {
                for (Allocation allocation : existing.getAllocations()) {
                    Resource resource = allocation.getResource();
                    int newAllocated = resource.getAllocatedQuantity() - allocation.getQuantity();
                    resource.setAllocatedQuantity(Math.max(newAllocated, 0));
                    resource.recalculateAvailability();
                    resourceRepository.save(resource);
                }
            }

            // Unlink staff when COMPLETED or CANCELLED
            if ("COMPLETED".equals(newStatus) || "CANCELLED".equals(newStatus)) {
                
                if(existing.getAssignedStaff()!=null){
                    existing.setCompletedByStaff(existing.getAssignedStaff().getUsername());
                }
                existing.setAssignedStaff(null);

            }

            existing.setStatus(newStatus);
            return eventRepository.save(existing);
        }
        return null;
    }
}

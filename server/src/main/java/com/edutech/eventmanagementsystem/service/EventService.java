package com.edutech.eventmanagementsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
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

    // ── PLANNER: Create event ────────────────────────────────────────
    // plannerUsername is auto-captured from logged-in user via Principal
    // staffId is selected by planner from the dropdown
    public Event createEvent(Event event, String plannerUsername, Long staffId) {
        // Auto-capture planner
        User planner = userRepository.findByUsername(plannerUsername);
        event.setPlanner(planner);

        // Assign selected staff
        if (staffId != null) {
            User staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            event.setAssignedStaff(staff);
        }

        return eventRepository.save(event);
    }

    // ── PLANNER: Get all events ──────────────────────────────────────
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // ── PLANNER / CLIENT: Get single event details ───────────────────
    public Event getEventDetails(Long eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }

    // ── STAFF: Get only events assigned to this staff member ─────────
    public List<Event> getMyAssignedEvents(String staffUsername) {
        return eventRepository.findByAssignedStaffUsername(staffUsername);
    }

    // ── STAFF: Update status ONLY ────────────────────────────────────
    // Staff cannot change title, description, location, dateTime
    // Only status can be updated
    // Auto-releases resources back to pool when status becomes COMPLETED
    public Event updateEventStatus(Long eventId, String newStatus) {
        Optional<Event> existingOpt = eventRepository.findById(eventId);
        if (existingOpt.isPresent()) {
            Event existing = existingOpt.get();

            // Auto-release resources when event is marked COMPLETED
            if ("COMPLETED".equals(newStatus) && !"COMPLETED".equals(existing.getStatus())) {
                for (Allocation allocation : existing.getAllocations()) {
                    Resource resource = allocation.getResource();
                    int newAllocated = resource.getAllocatedQuantity() - allocation.getQuantity();
                    resource.setAllocatedQuantity(Math.max(newAllocated, 0));
                    resource.recalculateAvailability();
                    resourceRepository.save(resource);
                }
            }

            existing.setStatus(newStatus);
            return eventRepository.save(existing);
        }
        return null;
    }
}

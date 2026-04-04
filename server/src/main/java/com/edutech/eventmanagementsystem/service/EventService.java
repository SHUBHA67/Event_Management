package com.edutech.eventmanagementsystem.service;

import org.springframework.stereotype.Service;

import com.edutech.eventmanagementsystem.dto.StaffAvailabilityResponse;
import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.entity.User;
import com.edutech.eventmanagementsystem.repository.EventRepository;
import com.edutech.eventmanagementsystem.repository.ResourceRepository;
import com.edutech.eventmanagementsystem.repository.UserRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

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

    // ── PLANNER: Check staff availability at a given datetime ────────
    // Checks for any active event assigned to that staff within a ±2hr window
    public StaffAvailabilityResponse checkStaffAvailability(Long staffId, Date dateTime) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // 2-hour window: 2hrs before and 2hrs after the target time
        long TWO_HOURS = 2 * 60 * 60 * 1000L;
        Date windowStart = new Date(dateTime.getTime() - TWO_HOURS);
        Date windowEnd   = new Date(dateTime.getTime() + TWO_HOURS);

        List<Event> conflicts = eventRepository.findConflictingEvents(staffId, windowStart, windowEnd);

        if (conflicts.isEmpty()) {
            return new StaffAvailabilityResponse(true,
                    staff.getUsername() + " is available at this time.", null);
        } else {
            Event conflict = conflicts.get(0);
            return new StaffAvailabilityResponse(false,
                    staff.getUsername() + " is already assigned to '" +
                            conflict.getTitle() + "' around that time.",
                    conflict);
        }
    }

    // ── PLANNER: Create event ────────────────────────────────────────
    // plannerUsername auto-captured from Principal
    // staffId is selected only after availability is confirmed on the frontend
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

    // ── PLANNER: Get all events ──────────────────────────────────────
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // ── Get single event details ─────────────────────────────────────
    public Event getEventDetails(Long eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }

    // ── STAFF: Get only events assigned to this staff member ─────────
    public List<Event> getMyAssignedEvents(String staffUsername) {
        return eventRepository.findByAssignedStaffUsername(staffUsername);
    }

    // ── STAFF: Update status ONLY ────────────────────────────────────
    // Auto-releases resources back to pool when event is COMPLETED
    public Event updateEventStatus(Long eventId, String newStatus) {
        Optional<Event> existingOpt = eventRepository.findById(eventId);
        if (existingOpt.isPresent()) {
            Event existing = existingOpt.get();

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

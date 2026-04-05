package com.edutech.eventmanagementsystem.dto;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;

import java.util.List;

/**
 * DTO returned by GET /api/vendor/my-events
 *
 * Contains:
 *  - the full Event (title, location, dateTime, status, planner, assignedStaff)
 *  - only the allocations that belong to THIS vendor's resources
 *    (other vendors' allocations on the same event are excluded)
 */
public class VendorEventDTO {

    private Event event;
    private List<Allocation> allocations;

    public VendorEventDTO() {}

    public VendorEventDTO(Event event, List<Allocation> allocations) {
        this.event       = event;
        this.allocations = allocations;
    }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public List<Allocation> getAllocations() { return allocations; }
    public void setAllocations(List<Allocation> allocations) { this.allocations = allocations; }
}

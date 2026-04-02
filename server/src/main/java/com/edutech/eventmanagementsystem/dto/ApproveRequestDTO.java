package com.edutech.eventmanagementsystem.dto;

import java.util.List;

public class ApproveRequestDTO {

    
    // Planner selects an already-created event to link to this request
    private Long eventId;

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }
}

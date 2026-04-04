package com.edutech.eventmanagementsystem.dto;

public class StaffAvailabilityResponse {

    private boolean available;
    private String message;
    private Object conflictingEvent; // holds the conflicting event summary if any

    public StaffAvailabilityResponse(boolean available, String message, Object conflictingEvent) {
        this.available = available;
        this.message = message;
        this.conflictingEvent = conflictingEvent;
    }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Object getConflictingEvent() { return conflictingEvent; }
    public void setConflictingEvent(Object conflictingEvent) { this.conflictingEvent = conflictingEvent; }
}

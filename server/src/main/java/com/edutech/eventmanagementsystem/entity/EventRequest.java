package com.edutech.eventmanagementsystem.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "event_requests")
public class EventRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    // Client who submitted the request
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    // Basic event info submitted by client
    private String eventTitle;
    private String eventDescription;
    private String eventLocation;

    @Temporal(TemporalType.TIMESTAMP)
    private Date eventDate;

    private int expectedAttendees;

    // Resources the client says they need
    private String resourceRequirements; // e.g. "2 projectors, 50 chairs, 1 mic"

    // Request lifecycle status
    // PENDING -> UNDER_REVIEW -> APPROVED / REJECTED
    private String status; // PENDING, UNDER_REVIEW, APPROVED, REJECTED

    // Planner fills this on rejection
    private String rejectionReason;

    // When approved, link to the actual created event
    @OneToOne
    @JoinColumn(name = "event_id")
    private Event linkedEvent;

    @Temporal(TemporalType.TIMESTAMP)
    private Date submittedAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // ─── Getters & Setters ───────────────────────────────────────────

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public User getClient() {
        return client;
    }

    public void setClient(User client) {
        this.client = client;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getEventDescription() {
        return eventDescription;
    }

    public void setEventDescription(String eventDescription) {
        this.eventDescription = eventDescription;
    }

    public String getEventLocation() {
        return eventLocation;
    }

    public void setEventLocation(String eventLocation) {
        this.eventLocation = eventLocation;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public int getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(int expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }

    public String getResourceRequirements() {
        return resourceRequirements;
    }

    public void setResourceRequirements(String resourceRequirements) {
        this.resourceRequirements = resourceRequirements;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Event getLinkedEvent() {
        return linkedEvent;
    }

    public void setLinkedEvent(Event linkedEvent) {
        this.linkedEvent = linkedEvent;
    }

    public Date getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Date submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}


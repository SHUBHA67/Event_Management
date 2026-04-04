package com.edutech.eventmanagementsystem.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "event_requests")
public class EventRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    private String eventTitle;
    private String eventDescription;
    private String eventLocation;

    @Temporal(TemporalType.TIMESTAMP)
    private Date eventDate;

    private int expectedAttendees;
    private String resourceRequirements;

    // PENDING -> UNDER_REVIEW -> APPROVED / REJECTED / CANCELLED
    private String status;

    private String rejectionReason;

    // Client fills this when cancelling
    private String cancellationFeedback;

    @OneToOne
    @JoinColumn(name = "event_id")
    private Event linkedEvent;

    @Temporal(TemporalType.TIMESTAMP)
    private Date submittedAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // ── Getters & Setters ────────────────────────────────────────────

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }

    public String getEventLocation() { return eventLocation; }
    public void setEventLocation(String eventLocation) { this.eventLocation = eventLocation; }

    public Date getEventDate() { return eventDate; }
    public void setEventDate(Date eventDate) { this.eventDate = eventDate; }

    public int getExpectedAttendees() { return expectedAttendees; }
    public void setExpectedAttendees(int expectedAttendees) { this.expectedAttendees = expectedAttendees; }

    public String getResourceRequirements() { return resourceRequirements; }
    public void setResourceRequirements(String resourceRequirements) { this.resourceRequirements = resourceRequirements; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getCancellationFeedback() { return cancellationFeedback; }
    public void setCancellationFeedback(String cancellationFeedback) { this.cancellationFeedback = cancellationFeedback; }

    public Event getLinkedEvent() { return linkedEvent; }
    public void setLinkedEvent(Event linkedEvent) { this.linkedEvent = linkedEvent; }

    public Date getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Date submittedAt) { this.submittedAt = submittedAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}

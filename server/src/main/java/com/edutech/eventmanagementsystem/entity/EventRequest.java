package com.edutech.eventmanagementsystem.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "event_requests")
public class EventRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================
       Event details
       ========================= */

    @Column(nullable = false)
    private String eventTitle;

    @Column(length = 2000)
    private String eventDescription;

    private String eventLocation;

    @Temporal(TemporalType.DATE)
    private Date eventDate;

    private Integer expectedAttendees;

    /* =========================
       Request metadata
       ========================= */

    @Column(nullable = false)
    private String status;

    @Column(length = 1000)
    private String rejectionReason;

    @Temporal(TemporalType.TIMESTAMP)
    private Date submittedAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    /* =========================
       Relationships
       ========================= */

    // Client / requester (e.g. User entity)
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    @OneToOne
    @JoinColumn(name = "event_id")
    private Event linkedEvent;

    /* =========================
       Lifecycle Hooks
       ========================= */

    @PrePersist
    protected void onCreate() {
        this.submittedAt = new Date();
        this.updatedAt = new Date();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

    /* =========================
       Getters & Setters
       ========================= */

    public Long getId() {
        return id;
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

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
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

    public User getClient() {
        return client;
    }

    public void setClient(User client) {
        this.client = client;
    }

    public Event getLinkedEvent() {
        return linkedEvent;
    }

    public void setLinkedEvent(Event linkedEvent) {
        this.linkedEvent = linkedEvent;
    }
}
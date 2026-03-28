package com.edutech.eventmanagementsystem.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;

@Table(name = "allocations") // do not change table name
public class Allocation {
    // implement entity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long allocationID;

    @ManyToOne
    @JoinColumn(name = "event_id")
    @JsonBackReference
    private Event event;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    private int quantity;

    public Long getAllocationID() {
        return allocationID;
    }

    public Event getEvent() {
        return event;
    }

    public Resource getResource() {
        return resource;
    }

    public int getQuantity() {
        return quantity;
    }

    
}

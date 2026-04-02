package com.edutech.eventmanagementsystem.entity;

import javax.persistence.*;

@Entity
@Table(name = "resources") // do not change table name
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceID;

    private String name;
    private String type;

    // ── NEW: quantity tracking ──────────────────────────────────────
    private int totalQuantity; // total stock added by planner
    private int allocatedQuantity; // how many are currently in use

    // availability = true when (totalQuantity - allocatedQuantity) > 0
    // availability = false when allocatedQuantity >= totalQuantity
    private boolean availability;

    // ── Constructors ────────────────────────────────────────────────
    public Resource() {
    }

    public Resource(Long resourceID, String name, String type,
            int totalQuantity, boolean availability) {
        this.resourceID = resourceID;
        this.name = name;
        this.type = type;
        this.totalQuantity = totalQuantity;
        this.allocatedQuantity = 0;
        this.availability = availability;
    }

    // ── Helper: recalculate availability after every change ─────────
    public void recalculateAvailability() {
        this.availability = (this.totalQuantity - this.allocatedQuantity) > 0;
    }

    // ── Getters & Setters ───────────────────────────────────────────
    public Long getResourceID() {
        return resourceID;
    }

    public void setResourceID(Long resourceID) {
        this.resourceID = resourceID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public int getAllocatedQuantity() {
        return allocatedQuantity;
    }

    public void setAllocatedQuantity(int allocatedQuantity) {
        this.allocatedQuantity = allocatedQuantity;
    }

    public boolean isAvailability() {
        return availability;
    }

    public void setAvailability(boolean availability) {
        this.availability = availability;
    }

    // Convenience: how many units are still free
    public int getAvailableQuantity() {
        return this.totalQuantity - this.allocatedQuantity;
    }
}

package com.edutech.eventmanagementsystem.entity;

import javax.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceID;

    private String name;
    private String type;

    private int totalQuantity;
    private int allocatedQuantity;
    private boolean availability;

    // Dispatch status: AVAILABLE, DISPATCHED
    private String dispatchStatus = "AVAILABLE";

    // Vendor who owns this resource
    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private User vendor;

    public Resource() {}

    public Resource(Long resourceID, String name, String type,
            int totalQuantity, boolean availability) {
        this.resourceID = resourceID;
        this.name = name;
        this.type = type;
        this.totalQuantity = totalQuantity;
        this.allocatedQuantity = 0;
        this.availability = availability;
        this.dispatchStatus = "AVAILABLE";
    }

    public void recalculateAvailability() {
        this.availability = (this.totalQuantity - this.allocatedQuantity) > 0;
    }

    public Long getResourceID() { return resourceID; }
    public void setResourceID(Long resourceID) { this.resourceID = resourceID; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

    public int getAllocatedQuantity() { return allocatedQuantity; }
    public void setAllocatedQuantity(int allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; }

    public boolean isAvailability() { return availability; }
    public void setAvailability(boolean availability) { this.availability = availability; }

    public String getDispatchStatus() { return dispatchStatus; }
    public void setDispatchStatus(String dispatchStatus) { this.dispatchStatus = dispatchStatus; }

    public User getVendor() { return vendor; }
    public void setVendor(User vendor) { this.vendor = vendor; }

    public int getAvailableQuantity() {
        return this.totalQuantity - this.allocatedQuantity;
    }
}

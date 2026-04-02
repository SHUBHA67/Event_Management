package com.edutech.eventmanagementsystem.dto;

import java.util.List;

public class ApproveRequestDTO {

    // Each resource the planner wants to allocate
    private List<AllocationItem> allocations;

    public List<AllocationItem> getAllocations() {
        return allocations;
    }

    public void setAllocations(List<AllocationItem> allocations) {
        this.allocations = allocations;
    }

    public static class AllocationItem {
        private Long resourceId;
        private int quantity;

        public Long getResourceId() {
            return resourceId;
        }

        public void setResourceId(Long resourceId) {
            this.resourceId = resourceId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }
}

package com.edutech.eventmanagementsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.eventmanagementsystem.entity.Allocation;

import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    // Fetch all allocations where the resource belongs to a specific vendor
    List<Allocation> findByResourceVendorUsername(String username);
}

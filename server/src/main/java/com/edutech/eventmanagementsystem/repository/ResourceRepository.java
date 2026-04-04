package com.edutech.eventmanagementsystem.repository;

import com.edutech.eventmanagementsystem.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("SELECT r FROM Resource r WHERE r.name = :name")
    Resource findByName(@Param("name") String name);

    // Vendor fetches their own resources
    List<Resource> findByVendorUsername(String username);

    // Planner fetches resources by vendor ID
    List<Resource> findByVendorId(Long vendorId);
}

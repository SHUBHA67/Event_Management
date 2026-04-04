package com.edutech.eventmanagementsystem.repository;

import com.edutech.eventmanagementsystem.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("SELECT r FROM Resource r WHERE r.name = :name")
    Resource findByName(@Param("name") String name);

    List<Resource> findByVendorUsername(String username);

    List<Resource> findByVendorId(Long vendorId);

    // Check duplicate name per vendor (excluding a specific resource ID for update scenarios)
    Optional<Resource> findByNameAndVendorId(String name, Long vendorId);

    @Query("SELECT r FROM Resource r WHERE r.name = :name AND r.vendor.id = :vendorId AND r.resourceID != :excludeId")
    Optional<Resource> findByNameAndVendorIdExcluding(
            @Param("name") String name,
            @Param("vendorId") Long vendorId,
            @Param("excludeId") Long excludeId);
}


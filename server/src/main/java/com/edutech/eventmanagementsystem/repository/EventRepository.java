package com.edutech.eventmanagementsystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.eventmanagementsystem.entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Used by Staff to fetch only their assigned events
    List<Event> findByAssignedStaffUsername(String username);
}

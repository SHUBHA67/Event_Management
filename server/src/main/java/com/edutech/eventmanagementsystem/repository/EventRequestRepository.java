package com.edutech.eventmanagementsystem.repository;

import com.edutech.eventmanagementsystem.entity.EventRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {

    // Planner sees all requests by status
    // Planner: filter requests by status
    List<EventRequest> findByStatus(String status);

    // Client: view their own requests
    List<EventRequest> findByClientId(Long clientId);

    // Client: view only approved bookings (to show linked events)
    List<EventRequest> findByClientIdAndStatus(Long clientId, String status);
}
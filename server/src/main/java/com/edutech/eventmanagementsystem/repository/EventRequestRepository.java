package com.edutech.eventmanagementsystem.repository;

import com.edutech.eventmanagementsystem.entity.EventRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {

    // Planner sees all requests by status
    List<EventRequest> findByStatus(String status);

    // Client sees their own requests (by their user id)
    List<EventRequest> findByClientId(Long clientId);
}
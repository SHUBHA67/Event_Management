package com.edutech.eventmanagementsystem.repository;

import com.edutech.eventmanagementsystem.entity.EventRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {

    // Client sees their own requests
    List<EventRequest> findByClientId(Long clientId);

    // Planner sees all requests by status
    List<EventRequest> findByStatus(String status);

    // Client sees their requests ordered by latest submission
    List<EventRequest> findByClientIdOrderBySubmittedAtDesc(Long clientId);
}
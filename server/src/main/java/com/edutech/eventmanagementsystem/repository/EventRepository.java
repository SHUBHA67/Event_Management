package com.edutech.eventmanagementsystem.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edutech.eventmanagementsystem.entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Used by Staff to fetch only their assigned events
    List<Event> findByAssignedStaffUsername(String username);

    // Used by Planner to check if a staff member is already assigned
    // at a given dateTime (within a 2-hour window around the target time)
    @Query("SELECT e FROM Event e WHERE e.assignedStaff.id = :staffId " +
           "AND e.dateTime BETWEEN :start AND :end " +
           "AND e.status NOT IN ('CANCELLED', 'COMPLETED')")
    List<Event> findConflictingEvents(@Param("staffId") Long staffId,
                                      @Param("start") Date start,
                                      @Param("end") Date end);
}

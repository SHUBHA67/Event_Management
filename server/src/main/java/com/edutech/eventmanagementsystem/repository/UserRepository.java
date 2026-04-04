package com.edutech.eventmanagementsystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edutech.eventmanagementsystem.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String username);

    List<User> findByRole(String role);

    // Returns STAFF users who have no event assigned on the same calendar day as the given dateTime
    // Excludes staff who have an active (non-COMPLETED, non-CANCELLED) event on that day
    @Query("SELECT u FROM User u WHERE u.role = 'STAFF' AND u.id NOT IN (" +
           "SELECT e.assignedStaff.id FROM Event e " +
           "WHERE e.assignedStaff IS NOT NULL " +
           "AND e.status NOT IN ('COMPLETED', 'CANCELLED') " +
           "AND FUNCTION('DATE', e.dateTime) = FUNCTION('DATE', CAST(:dateTime AS timestamp)))")
    List<User> findAvailableStaff(@Param("dateTime") String dateTime);
    
}

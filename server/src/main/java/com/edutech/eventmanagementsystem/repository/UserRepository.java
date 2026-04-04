package com.edutech.eventmanagementsystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.eventmanagementsystem.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    // Used for staff dropdown, vendor list, etc.
    List<User> findByRole(String role);
}

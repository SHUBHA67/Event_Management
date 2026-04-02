package com.edutech.eventmanagementsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.eventmanagementsystem.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Fetch user by username
    User findByUsername(String username);

    // Check if a username already exists (for uniqueness check)
    boolean existsByUsername(String username);
}
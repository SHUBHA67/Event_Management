package com.edutech.eventmanagementsystem.repository;


import com.edutech.eventmanagementsystem.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository  extends JpaRepository<Resource, Long>{

    //newly added today
    @Query("SELECT r FROM Resource r WHERE r.name = :name")
    Resource findByName(@Param("name") String name);
}
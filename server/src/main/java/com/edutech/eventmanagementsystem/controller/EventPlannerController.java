package com.edutech.eventmanagementsystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ResourceCondition;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.eventmanagementsystem.entity.Allocation;
import com.edutech.eventmanagementsystem.entity.Event;
import com.edutech.eventmanagementsystem.entity.Resource;
import com.edutech.eventmanagementsystem.service.EventService;
import com.edutech.eventmanagementsystem.service.ResourceService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.swing.text.html.parser.Entity;

@RestController
public class EventPlannerController {

    private final EventService eventService;
    private final ResourceService resourceService;

    public EventPlannerController(EventService eventService, ResourceService resourceService) {
        this.eventService = eventService;
        this.resourceService = resourceService;
    }

    @PostMapping("/api/planner/event")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
           Event saved = eventService.createEvent(event);
           return new ResponseEntity<>(saved , HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to create event");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/planner/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @PostMapping("/api/planner/resource")
    public ResponseEntity<?> addResource(@RequestBody Resource resource) throws Exception {
 
        
        try {

            //added if condition here

            
            Resource result = resourceService.addResource(resource);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }
        catch (Exception e) {
            Map<String, String> response = new HashMap<>();


            response.put("message", "Failed to add resource");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
       
    }

    @GetMapping("/api/planner/resources")
    public ResponseEntity<List<Resource>> getAllResources() {
        List<Resource> resources = resourceService.getAllResources();
        return ResponseEntity.ok(resources);
    }

    @PostMapping("/api/planner/allocate-resources")
    public ResponseEntity<?> allocateResources(@RequestParam Long eventId,
            @RequestParam Long resourceId,
            @RequestBody Allocation allocation) {
        try {
            resourceService.allocateResources(eventId, resourceId, allocation);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource allocated successfully for Event ID: " + eventId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to allocate resource");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}

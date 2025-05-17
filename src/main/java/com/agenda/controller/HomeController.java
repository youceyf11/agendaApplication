package com.agenda.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> home() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bienvenue sur l'API Agenda");
        response.put("status", "active");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, String>> apiInfo() {
        Map<String, String> response = new HashMap<>();
        response.put("version", "1.0.0");
        response.put("endpoints", "/api/categories, /api/users, /api/events, /api/tasks");
        return ResponseEntity.ok(response);
    }
} 
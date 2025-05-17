package com.agenda.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agenda.model.AgendaItem;
import com.agenda.model.AgendaItem.Priority;
import com.agenda.model.Event;
import com.agenda.model.Notification;
import com.agenda.model.Task;
import com.agenda.service.AgendaItemService;
import com.agenda.service.NotificationService;

@RestController
@RequestMapping("/api/items")
public class AgendaItemController {

    @Autowired
    private AgendaItemService agendaItemService;
    
    @Autowired
    private NotificationService notificationService;
    
    // For simplicity, we're using a fixed user ID
    // In a real application, this would come from authentication
    private static final Long CURRENT_USER_ID = 1L;
    
    @GetMapping
    public ResponseEntity<List<AgendaItem>> getAllItems() {
        List<AgendaItem> items = agendaItemService.getAllItems(CURRENT_USER_ID);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AgendaItem> getItemById(@PathVariable Long id) {
        Optional<AgendaItem> itemOpt = agendaItemService.getItemById(id);
        return itemOpt.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/date")
    public ResponseEntity<List<AgendaItem>> getItemsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AgendaItem> items = agendaItemService.getItemsByDate(date, CURRENT_USER_ID);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<AgendaItem>> getItemsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AgendaItem> items = agendaItemService.getItemsByDateRange(startDate, endDate, CURRENT_USER_ID);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/tasks")
    public ResponseEntity<List<AgendaItem>> getTasks() {
        List<AgendaItem> tasks = agendaItemService.getTasksByUserId(CURRENT_USER_ID);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/events")
    public ResponseEntity<List<AgendaItem>> getEvents() {
        List<AgendaItem> events = agendaItemService.getEventsByUserId(CURRENT_USER_ID);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<AgendaItem>> getItemsByPriority(@PathVariable Priority priority) {
        List<AgendaItem> items = agendaItemService.getItemsByPriority(priority, CURRENT_USER_ID);
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<AgendaItem>> getItemsByCategory(@PathVariable Long categoryId) {
        List<AgendaItem> items = agendaItemService.getItemsByCategory(categoryId, CURRENT_USER_ID);
        return ResponseEntity.ok(items);
    }
    
    @PostMapping("/task")
    public ResponseEntity<AgendaItem> createTask(@RequestBody Task task) {
        AgendaItem createdTask = agendaItemService.createItem(task, CURRENT_USER_ID);
        
        // Create reminder notification if needed
        if (createdTask.getReminder() != null) {
            notificationService.createReminderFromAgendaItem(createdTask);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }
    
    @PostMapping("/event")
    public ResponseEntity<AgendaItem> createEvent(@RequestBody Event event) {
        AgendaItem createdEvent = agendaItemService.createItem(event, CURRENT_USER_ID);
        
        // Create reminder notification if needed
        if (createdEvent.getReminder() != null) {
            notificationService.createReminderFromAgendaItem(createdEvent);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AgendaItem> updateItem(@PathVariable Long id, @RequestBody AgendaItem item) {
        Optional<AgendaItem> updatedItemOpt = agendaItemService.updateItem(id, item);
        
        if (!updatedItemOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        AgendaItem updatedItem = updatedItemOpt.get();
        
        // Update reminders
        if (updatedItem.getReminder() != null) {
            // Delete existing notifications for this item
            notificationService.deleteNotificationsForAgendaItem(id);
            
            // Create a new notification
            notificationService.createReminderFromAgendaItem(updatedItem);
        }
        
        return ResponseEntity.ok(updatedItem);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        // Delete associated notifications first
        notificationService.deleteNotificationsForAgendaItem(id);
        
        boolean deleted = agendaItemService.deleteItem(id);
        
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
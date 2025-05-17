package com.agenda.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.agenda.model.AgendaItem;
import com.agenda.model.AgendaItem.Priority;
import com.agenda.model.Category;
import com.agenda.model.Event;
import com.agenda.model.Task;
import com.agenda.model.User;
import com.agenda.repository.AgendaItemRepository;
import com.agenda.repository.CategoryRepository;
import com.agenda.repository.UserRepository;

@Service
public class AgendaItemService {

    @Autowired
    private AgendaItemRepository agendaItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<AgendaItem> getAllItems(Long userId) {
        return agendaItemRepository.findByUserIdOrderByDateAsc(userId);
    }
    
    public Optional<AgendaItem> getItemById(Long id) {
        return agendaItemRepository.findById(id);
    }
    
    public List<AgendaItem> getItemsByDate(LocalDate date, Long userId) {
        return agendaItemRepository.findByDateAndUserId(date, userId);
    }
    
    public List<AgendaItem> getItemsByDateRange(LocalDate startDate, LocalDate endDate, Long userId) {
        return agendaItemRepository.findByDateBetweenAndUserId(startDate, endDate, userId);
    }
    
    public List<AgendaItem> getTasksByUserId(Long userId) {
        return agendaItemRepository.findByTypeAndUserId(Task.class, userId);
    }
    
    public List<AgendaItem> getEventsByUserId(Long userId) {
        return agendaItemRepository.findByTypeAndUserId(Event.class, userId);
    }
    
    public List<AgendaItem> getItemsByPriority(Priority priority, Long userId) {
        return agendaItemRepository.findByPriorityAndUserIdOrderByDateAsc(priority, userId);
    }
    
    public List<AgendaItem> getItemsByCategory(Long categoryId, Long userId) {
        return agendaItemRepository.findByCategoryIdAndUserIdOrderByDateAsc(categoryId, userId);
    }
    
    public AgendaItem createItem(AgendaItem item, Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        item.setUser(userOpt.get());
        
        if (item.getCategory() != null && item.getCategory().getId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(item.getCategory().getId());
            if (categoryOpt.isPresent()) {
                item.setCategory(categoryOpt.get());
            } else {
                item.setCategory(null);
            }
        }
        
        return agendaItemRepository.save(item);
    }
    
    public Optional<AgendaItem> updateItem(Long id, AgendaItem updatedItem) {
        Optional<AgendaItem> existingItemOpt = agendaItemRepository.findById(id);
        if (!existingItemOpt.isPresent()) {
            return Optional.empty();
        }
        
        AgendaItem existingItem = existingItemOpt.get();
        
        // Update common fields
        existingItem.setTitle(updatedItem.getTitle());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setDate(updatedItem.getDate());
        existingItem.setPriority(updatedItem.getPriority());
        existingItem.setReminder(updatedItem.getReminder());
        
        // Update category if provided
        if (updatedItem.getCategory() != null && updatedItem.getCategory().getId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(updatedItem.getCategory().getId());
            if (categoryOpt.isPresent()) {
                existingItem.setCategory(categoryOpt.get());
            }
        } else {
            existingItem.setCategory(null);
        }
        
        // Update type-specific fields
        if (existingItem instanceof Task && updatedItem instanceof Task) {
            Task existingTask = (Task) existingItem;
            Task updatedTask = (Task) updatedItem;
            
            existingTask.setDeadline(updatedTask.getDeadline());
            existingTask.setCompleted(updatedTask.isCompleted());
        } else if (existingItem instanceof Event && updatedItem instanceof Event) {
            Event existingEvent = (Event) existingItem;
            Event updatedEvent = (Event) updatedItem;
            
            existingEvent.setStartTime(updatedEvent.getStartTime());
            existingEvent.setEndTime(updatedEvent.getEndTime());
            existingEvent.setLocation(updatedEvent.getLocation());
        }
        
        return Optional.of(agendaItemRepository.save(existingItem));
    }
    
    public boolean deleteItem(Long id) {
        if (agendaItemRepository.existsById(id)) {
            agendaItemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
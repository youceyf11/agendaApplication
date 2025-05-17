package com.agenda;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.agenda.model.AgendaItem.Priority;
import com.agenda.model.Category;
import com.agenda.model.Event;
import com.agenda.model.Task;
import com.agenda.model.User;
import com.agenda.repository.CategoryRepository;
import com.agenda.repository.AgendaItemRepository;
import com.agenda.repository.UserRepository;

@SpringBootApplication
@EnableScheduling
public class AgendaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgendaApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner setupData(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            AgendaItemRepository agendaItemRepository) {
        return args -> {
            // Create a default user
            User defaultUser = new User();
            defaultUser.setUsername("user");
            defaultUser.setEmail("user@example.com");
            defaultUser.setPassword("password");
            defaultUser.setFirstName("Default");
            defaultUser.setLastName("User");
            userRepository.save(defaultUser);
            
            // Create some default categories
            Category workCategory = new Category();
            workCategory.setName("Work");
            workCategory.setColor("#3B82F6");
            workCategory.setUser(defaultUser);
            
            Category personalCategory = new Category();
            personalCategory.setName("Personal");
            personalCategory.setColor("#F97316");
            personalCategory.setUser(defaultUser);
            
            Category healthCategory = new Category();
            healthCategory.setName("Health");
            healthCategory.setColor("#10B981");
            healthCategory.setUser(defaultUser);
            
            categoryRepository.saveAll(Arrays.asList(workCategory, personalCategory, healthCategory));
            
            // Create some sample tasks and events
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            LocalDate nextWeek = today.plusDays(7);
            
            // Tasks
            Task task1 = new Task();
            task1.setTitle("Complete project proposal");
            task1.setDescription("Finish the first draft of the project proposal");
            task1.setDate(today);
            task1.setPriority(Priority.HIGH);
            task1.setDeadline(tomorrow);
            task1.setCompleted(false);
            task1.setUser(defaultUser);
            task1.setCategory(workCategory);
            
            Task task2 = new Task();
            task2.setTitle("Buy groceries");
            task2.setDescription("Milk, eggs, bread, and vegetables");
            task2.setDate(today);
            task2.setPriority(Priority.MEDIUM);
            task2.setCompleted(true);
            task2.setUser(defaultUser);
            task2.setCategory(personalCategory);
            
            // Events
            Event event1 = new Event();
            event1.setTitle("Team meeting");
            event1.setDescription("Weekly team sync-up");
            event1.setDate(tomorrow);
            event1.setStartTime(LocalDateTime.of(tomorrow.getYear(), tomorrow.getMonth(), 
                tomorrow.getDayOfMonth(), 10, 0));
            event1.setEndTime(LocalDateTime.of(tomorrow.getYear(), tomorrow.getMonth(), 
                tomorrow.getDayOfMonth(), 11, 0));
            event1.setPriority(Priority.HIGH);
            event1.setLocation("Conference Room A");
            event1.setUser(defaultUser);
            event1.setCategory(workCategory);
            
            Event event2 = new Event();
            event2.setTitle("Dentist appointment");
            event2.setDate(nextWeek);
            event2.setStartTime(LocalDateTime.of(nextWeek.getYear(), nextWeek.getMonth(), 
                nextWeek.getDayOfMonth(), 14, 0));
            event2.setEndTime(LocalDateTime.of(nextWeek.getYear(), nextWeek.getMonth(), 
                nextWeek.getDayOfMonth(), 15, 0));
            event2.setPriority(Priority.MEDIUM);
            event2.setLocation("Dental Clinic");
            event2.setUser(defaultUser);
            event2.setCategory(healthCategory);
            
            agendaItemRepository.saveAll(Arrays.asList(task1, task2, event1, event2));
        };
    }
}
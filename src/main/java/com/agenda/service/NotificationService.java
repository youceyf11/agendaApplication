package com.agenda.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.agenda.model.AgendaItem;
import com.agenda.model.Notification;
import com.agenda.model.Notification.NotificationStatus;
import com.agenda.model.User;
import com.agenda.repository.AgendaItemRepository;
import com.agenda.repository.NotificationRepository;
import com.agenda.repository.UserRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private AgendaItemRepository agendaItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Notification> getAllNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByScheduledTimeDesc(userId);
    }
    
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndStatusOrderByScheduledTimeDesc(
            userId, NotificationStatus.DELIVERED);
    }
    
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }
    
    public Notification createNotification(Notification notification, Long agendaItemId, Long userId) {
        Optional<AgendaItem> agendaItemOpt = agendaItemRepository.findById(agendaItemId);
        if (!agendaItemOpt.isPresent()) {
            throw new RuntimeException("Agenda item not found");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        notification.setAgendaItem(agendaItemOpt.get());
        notification.setUser(userOpt.get());
        notification.setStatus(NotificationStatus.PENDING);
        
        return notificationRepository.save(notification);
    }
    
    public Notification createReminderFromAgendaItem(AgendaItem item) {
        if (item.getReminder() == null) {
            throw new RuntimeException("Agenda item doesn't have a reminder set");
        }
        
        Notification notification = new Notification();
        notification.setAgendaItem(item);
        notification.setUser(item.getUser());
        notification.setMessage("Reminder: " + item.getTitle());
        notification.setScheduledTime(item.getReminder());
        notification.setStatus(NotificationStatus.PENDING);
        
        return notificationRepository.save(notification);
    }
    
    public Optional<Notification> markAsRead(Long id) {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);
        if (!notificationOpt.isPresent()) {
            return Optional.empty();
        }
        
        Notification notification = notificationOpt.get();
        notification.setStatus(NotificationStatus.READ);
        
        return Optional.of(notificationRepository.save(notification));
    }
    
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndStatusOrderByScheduledTimeDesc(
            userId, NotificationStatus.DELIVERED);
        
        notifications.forEach(notification -> {
            notification.setStatus(NotificationStatus.READ);
            notificationRepository.save(notification);
        });
    }
    
    public boolean deleteNotification(Long id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public void deleteNotificationsForAgendaItem(Long agendaItemId) {
        List<Notification> notifications = notificationRepository.findByAgendaItemId(agendaItemId);
        notificationRepository.deleteAll(notifications);
    }
    
    @Scheduled(fixedRate = 60000) // Run every minute
    public void checkAndDeliverNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<Notification> pendingNotifications = notificationRepository
            .findByScheduledTimeLessThanEqualAndStatus(now, NotificationStatus.PENDING);
        
        pendingNotifications.forEach(notification -> {
            notification.setStatus(NotificationStatus.DELIVERED);
            notificationRepository.save(notification);
            
            // In a real application, this would trigger a push notification
            // or other delivery mechanism. For this example, we just log it.
            System.out.println("Delivering notification: " + notification.getMessage() + 
                " to user: " + notification.getUser().getUsername());
        });
    }
}
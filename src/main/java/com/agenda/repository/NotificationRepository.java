package com.agenda.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.agenda.model.Notification;
import com.agenda.model.Notification.NotificationStatus;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderByScheduledTimeDesc(Long userId);
    
    List<Notification> findByUserIdAndStatusOrderByScheduledTimeDesc(Long userId, NotificationStatus status);
    
    List<Notification> findByScheduledTimeLessThanEqualAndStatus(
        LocalDateTime time, NotificationStatus status);
    
    List<Notification> findByAgendaItemId(Long agendaItemId);
}
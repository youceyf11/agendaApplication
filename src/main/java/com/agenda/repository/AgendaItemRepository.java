package com.agenda.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.agenda.model.AgendaItem;
import com.agenda.model.AgendaItem.Priority;
import com.agenda.model.User;

@Repository
public interface AgendaItemRepository extends JpaRepository<AgendaItem, Long> {

    List<AgendaItem> findByUserIdOrderByDateAsc(Long userId);
    
    @Query("SELECT a FROM AgendaItem a WHERE a.date = :date AND a.user.id = :userId ORDER BY CASE WHEN TYPE(a) = Task THEN 0 ELSE 1 END, a.priority")
    List<AgendaItem> findByDateAndUserId(@Param("date") LocalDate date, @Param("userId") Long userId);
    
    @Query("SELECT a FROM AgendaItem a WHERE a.date BETWEEN :startDate AND :endDate AND a.user.id = :userId ORDER BY a.date")
    List<AgendaItem> findByDateBetweenAndUserId(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate, 
        @Param("userId") Long userId
    );
    
    @Query("SELECT a FROM AgendaItem a WHERE TYPE(a) = :type AND a.user.id = :userId ORDER BY a.date")
    List<AgendaItem> findByTypeAndUserId(
        @Param("type") Class<?> type,  
        @Param("userId") Long userId
    );
    
    List<AgendaItem> findByPriorityAndUserIdOrderByDateAsc(Priority priority, Long userId);
    
    List<AgendaItem> findByCategoryIdAndUserIdOrderByDateAsc(Long categoryId, Long userId);

    List<AgendaItem> findByUserAndDate(User user, LocalDate date);
    List<AgendaItem> findByUser(User user);
}
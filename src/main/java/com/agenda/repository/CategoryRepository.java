package com.agenda.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.agenda.model.Category;
import com.agenda.model.User;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser(User user);
    List<Category> findByUserId(Long userId);
    List<Category> findByUserIdOrderByNameAsc(Long userId);
    
    boolean existsByNameAndUserId(String name, Long userId);
}
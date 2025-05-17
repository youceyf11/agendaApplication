package com.agenda.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.agenda.model.Category;
import com.agenda.model.User;
import com.agenda.repository.CategoryRepository;
import com.agenda.repository.UserRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Category> getAllCategories(Long userId) {
        return categoryRepository.findByUserIdOrderByNameAsc(userId);
    }
    
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public Category createCategory(Category category, Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        // Check if a category with this name already exists for the user
        if (categoryRepository.existsByNameAndUserId(category.getName(), userId)) {
            throw new RuntimeException("A category with this name already exists");
        }
        
        category.setUser(userOpt.get());
        
        return categoryRepository.save(category);
    }
    
    public Optional<Category> updateCategory(Long id, Category updatedCategory) {
        Optional<Category> existingCategoryOpt = categoryRepository.findById(id);
        if (!existingCategoryOpt.isPresent()) {
            return Optional.empty();
        }
        
        Category existingCategory = existingCategoryOpt.get();
        
        // Check if the updated name conflicts with another category
        if (!existingCategory.getName().equals(updatedCategory.getName()) &&
            categoryRepository.existsByNameAndUserId(updatedCategory.getName(), existingCategory.getUser().getId())) {
            throw new RuntimeException("A category with this name already exists");
        }
        
        existingCategory.setName(updatedCategory.getName());
        existingCategory.setColor(updatedCategory.getColor());
        
        return Optional.of(categoryRepository.save(existingCategory));
    }
    
    public boolean deleteCategory(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
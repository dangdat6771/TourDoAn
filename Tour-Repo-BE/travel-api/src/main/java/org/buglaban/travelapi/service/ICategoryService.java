package org.buglaban.travelapi.service;

import org.buglaban.travelapi.model.Category;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICategoryService {
    Page<Category> getAllCategories(int page, int pageSize);
    Category getCategoryById(Long id);
    List<Category> getAllActiveCategories();
    Long createCategory(Category category);
    void updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    void changeCategoryStatus(Long id, String status);
}

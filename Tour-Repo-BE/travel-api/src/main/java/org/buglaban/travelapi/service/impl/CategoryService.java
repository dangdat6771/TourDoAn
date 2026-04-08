package org.buglaban.travelapi.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.buglaban.travelapi.model.Category;
import org.buglaban.travelapi.repository.ICategoryRepository;
import org.buglaban.travelapi.service.ICategoryService;
import org.buglaban.travelapi.util.CategoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService implements ICategoryService {
    private final ICategoryRepository categoryRepository;

    @Override
    public Page<Category> getAllCategories(int page, int pageSize) {
        return categoryRepository.findAll(PageRequest.of(page, pageSize));
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public List<Category> getAllActiveCategories() {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getStatus() != null && c.getStatus().name().equals("ACTIVE"))
                .toList();
    }

    @Override
    public Long createCategory(Category category) {
        category.setStatus(CategoryStatus.ACTIVE);
        return categoryRepository.save(category).getId();
    }

    @Override
    public void updateCategory(Long id, Category category) {
        Category existing = categoryRepository.findById(id).orElse(null);
        if (existing != null) {
            if (category.getCategoryName() != null) existing.setCategoryName(category.getCategoryName());
            if (category.getDescription() != null) existing.setDescription(category.getDescription());
            if (category.getImageUrl() != null) existing.setImageUrl(category.getImageUrl());
            if (category.getDisplayOrder() != null) existing.setDisplayOrder(category.getDisplayOrder());
            categoryRepository.save(existing);
        }
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public void changeCategoryStatus(Long id, String status) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category != null) {
            category.setStatus(CategoryStatus.valueOf(status.toUpperCase()));
            categoryRepository.save(category);
        }
    }
}

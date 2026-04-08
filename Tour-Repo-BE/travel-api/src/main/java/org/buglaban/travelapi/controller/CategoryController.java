package org.buglaban.travelapi.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.buglaban.travelapi.dto.response.ResponseData;
import org.buglaban.travelapi.dto.response.ResponseFailure;
import org.buglaban.travelapi.model.Category;
import org.buglaban.travelapi.service.ICategoryService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/category/")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    private final ICategoryService categoryService;

    @GetMapping("")
    public ResponseData<?> getAllCategories(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {
        try {
            Page<Category> result = categoryService.getAllCategories(page, pageSize);
            return new ResponseData<>(HttpStatus.OK.value(), "Get categories successfully", result);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Get categories fail");
        }
    }

    @GetMapping("active")
    public ResponseData<?> getActiveCategories() {
        try {
            List<Category> result = categoryService.getAllActiveCategories();
            return new ResponseData<>(HttpStatus.OK.value(), "Get active categories successfully", result);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Get active categories fail");
        }
    }

    @GetMapping("{id}")
    public ResponseData<?> getCategoryById(@PathVariable Long id) {
        try {
            Category result = categoryService.getCategoryById(id);
            return new ResponseData<>(HttpStatus.OK.value(), "Get category successfully", result);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Get category fail");
        }
    }

    @PostMapping("")
    public ResponseData<?> createCategory(@Valid @RequestBody Category category) {
        try {
            Long id = categoryService.createCategory(category);
            return new ResponseData<>(HttpStatus.CREATED.value(), "Category created successfully", id);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Create category fail");
        }
    }

    @PutMapping("{id}")
    public ResponseData<?> updateCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
        try {
            categoryService.updateCategory(id, category);
            return new ResponseData<>(HttpStatus.OK.value(), "Category updated successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Update category fail");
        }
    }

    @DeleteMapping("{id}")
    public ResponseData<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return new ResponseData<>(HttpStatus.OK.value(), "Category deleted successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Delete category fail");
        }
    }

    @PatchMapping("{id}/status")
    public ResponseData<?> changeCategoryStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            categoryService.changeCategoryStatus(id, status);
            return new ResponseData<>(HttpStatus.OK.value(), "Status updated successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Change status fail");
        }
    }
}

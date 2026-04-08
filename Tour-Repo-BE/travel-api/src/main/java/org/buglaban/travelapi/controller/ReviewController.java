package org.buglaban.travelapi.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.buglaban.travelapi.dto.response.ResponseData;
import org.buglaban.travelapi.dto.response.ResponseFailure;
import org.buglaban.travelapi.model.Review;
import org.buglaban.travelapi.service.IReviewService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/review/")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {
    private final IReviewService reviewService;

    @GetMapping("")
    public ResponseData<?> getAllReviews(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {
        try {
            Page<Review> result = reviewService.getAllReviews(page, pageSize);
            return new ResponseData<>(HttpStatus.OK.value(), "Get reviews successfully", result);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Get reviews fail");
        }
    }

    @GetMapping("{id}")
    public ResponseData<?> getReviewById(@PathVariable Long id) {
        try {
            Review result = reviewService.getReviewById(id);
            return new ResponseData<>(HttpStatus.OK.value(), "Get review successfully", result);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Get review fail");
        }
    }

    @PostMapping("")
    public ResponseData<?> createReview(@Valid @RequestBody Review review) {
        try {
            Long id = reviewService.createReview(review);
            return new ResponseData<>(HttpStatus.CREATED.value(), "Review created successfully", id);
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Create review fail");
        }
    }

    @PutMapping("{id}")
    public ResponseData<?> updateReview(@PathVariable Long id, @Valid @RequestBody Review review) {
        try {
            reviewService.updateReview(id, review);
            return new ResponseData<>(HttpStatus.OK.value(), "Review updated successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Update review fail");
        }
    }

    @DeleteMapping("{id}")
    public ResponseData<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return new ResponseData<>(HttpStatus.OK.value(), "Review deleted successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Delete review fail");
        }
    }

    @PatchMapping("{id}/status")
    public ResponseData<?> changeReviewStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            reviewService.changeReviewStatus(id, status);
            return new ResponseData<>(HttpStatus.OK.value(), "Status updated successfully");
        } catch (Exception e) {
            log.error("errorMessage = {}", e.getMessage(), e.getCause());
            return new ResponseFailure(HttpStatus.BAD_REQUEST.value(), "Change status fail");
        }
    }
}

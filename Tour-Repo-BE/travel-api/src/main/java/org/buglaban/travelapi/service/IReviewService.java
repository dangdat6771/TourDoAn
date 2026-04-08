package org.buglaban.travelapi.service;

import org.buglaban.travelapi.model.Review;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IReviewService {
    Page<Review> getAllReviews(int page, int pageSize);
    Review getReviewById(Long id);
    Long createReview(Review review);
    void updateReview(Long id, Review review);
    void deleteReview(Long id);
    void changeReviewStatus(Long id, String status);
}

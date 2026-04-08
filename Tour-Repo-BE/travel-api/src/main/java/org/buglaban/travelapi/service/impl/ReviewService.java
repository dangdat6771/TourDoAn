package org.buglaban.travelapi.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.buglaban.travelapi.model.Review;
import org.buglaban.travelapi.repository.IReviewRepository;
import org.buglaban.travelapi.service.IReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService implements IReviewService {
    private final IReviewRepository reviewRepository;

    @Override
    public Page<Review> getAllReviews(int page, int pageSize) {
        return reviewRepository.findAll(PageRequest.of(page, pageSize));
    }

    @Override
    public Review getReviewById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }

    @Override
    public Long createReview(Review review) {
        return reviewRepository.save(review).getId();
    }

    @Override
    public void updateReview(Long id, Review review) {
        Review existing = reviewRepository.findById(id).orElse(null);
        if (existing != null) {
            if (review.getTitle() != null) existing.setTitle(review.getTitle());
            if (review.getComment() != null) existing.setComment(review.getComment());
            if (review.getRating() != null) existing.setRating(review.getRating());
            reviewRepository.save(existing);
        }
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    @Override
    public void changeReviewStatus(Long id, String status) {
        // Review entity does not have a status field, so this method is a no-op
        // This method is kept for API compatibility but does nothing
    }
}

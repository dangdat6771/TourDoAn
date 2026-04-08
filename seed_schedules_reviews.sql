-- Insert Tour Schedules
INSERT INTO tour_schedules (tour_id, departure_date, return_date, available_seats, status, created_at, updated_at) VALUES
(12, '2026-05-01', '2026-05-03', 30, 'AVAILABLE', NOW(), NOW()),
(12, '2026-05-15', '2026-05-17', 30, 'AVAILABLE', NOW(), NOW()),
(13, '2026-04-20', '2026-04-23', 40, 'AVAILABLE', NOW(), NOW()),
(14, '2026-05-05', '2026-05-07', 50, 'AVAILABLE', NOW(), NOW()),
(15, '2026-04-25', '2026-04-28', 35, 'AVAILABLE', NOW(), NOW()),
(16, '2026-05-10', '2026-05-12', 25, 'AVAILABLE', NOW(), NOW()),
(17, '2026-05-20', '2026-05-24', 40, 'AVAILABLE', NOW(), NOW()),
(18, '2026-06-01', '2026-06-04', 30, 'AVAILABLE', NOW(), NOW()),
(19, '2026-05-25', '2026-05-31', 25, 'AVAILABLE', NOW(), NOW()),
(20, '2026-06-10', '2026-06-17', 20, 'AVAILABLE', NOW(), NOW()),
(21, '2026-06-05', '2026-06-09', 35, 'AVAILABLE', NOW(), NOW()),
(22, '2026-05-30', '2026-06-02', 30, 'AVAILABLE', NOW(), NOW());

-- Insert Reviews
INSERT INTO reviews (user_id, tour_id, rating, title, comment, created_at, updated_at) VALUES
(5, 12, 5, 'Tour tuyệt vời', 'Tour rất tuyệt vời, hướng dẫn viên thân thiện và chu đáo!', NOW(), NOW()),
(5, 12, 4, 'Hành trình thú vị', 'Hành trình thú vị, chỉ tiếc là mua sắm ít hơn như mong muốn', NOW(), NOW()),
(6, 13, 5, 'TPHCM quyến rũ', 'TPHCM thật sự quyến rũ, ẩm thực tuyệt hảo!', NOW(), NOW()),
(5, 14, 5, 'Hạ Long tuyệt diệu', 'Hạ Long – thiên đường trên mặt đất! Chuyến đi không thể quên', NOW(), NOW()),
(6, 15, 4, 'Đà Nẵng đẹp', 'Đà Nẵng đẹp lắm, mọi thứ tổ chức tốt', NOW(), NOW()),
(5, 16, 4, 'Sapa thơ mộng', 'Sapa thơ mộng, trekking vất vả nhưng đáng!', NOW(), NOW());

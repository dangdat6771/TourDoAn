-- Insert Roles
INSERT INTO roles (role_name, description, created_at, updated_at) VALUES
('ADMIN', 'Administrator role', NOW(), NOW()),
('USER', 'User role', NOW(), NOW()),
('STAFF', 'Staff role', NOW(), NOW());

-- Insert Categories
INSERT INTO categories (category_name, slug, description, status, display_order, created_at, updated_at) 
SELECT 'Trong Nước', 'trong-nuoc', 'Các tour du lịch trong nước', 'ACTIVE', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'trong-nuoc')
UNION ALL
SELECT 'Nước Ngoài', 'nuoc-ngoai', 'Các tour du lịch nước ngoài', 'ACTIVE', 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'nuoc-ngoai')
UNION ALL
SELECT 'Miền Bắc', 'mien-bac', 'Tour miền Bắc', 'ACTIVE', 3, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mien-bac')
UNION ALL
SELECT 'Miền Trung', 'mien-trung', 'Tour miền Trung', 'ACTIVE', 4, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mien-trung')
UNION ALL
SELECT 'Miền Nam', 'mien-nam', 'Tour miền Nam', 'ACTIVE', 5, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mien-nam')
UNION ALL
SELECT 'Châu Á', 'chau-a', 'Tour châu Á', 'ACTIVE', 6, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'chau-a')
UNION ALL
SELECT 'Châu Âu', 'chau-au', 'Tour châu Âu', 'ACTIVE', 7, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'chau-au')
UNION ALL
SELECT 'Châu Mỹ', 'chau-my', 'Tour châu Mỹ', 'ACTIVE', 8, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'chau-my');

-- Insert Users (after roles are created)
INSERT INTO users (email, password_hash, full_name, phone, address, status, role_id, created_at, updated_at)
SELECT 'admin@example.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy76uza', 'Admin User', '0123456789', 'Hà Nội', 'ACTIVE', (SELECT id FROM roles WHERE role_name = 'ADMIN' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com')
UNION ALL
SELECT 'user1@example.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy76uza', 'Nguyễn Văn A', '0987654321', 'TP Hồ Chí Minh', 'ACTIVE', (SELECT id FROM roles WHERE role_name = 'USER' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user1@example.com')
UNION ALL
SELECT 'user2@example.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy76uza', 'Trần Thị B', '0912345678', 'Đà Nẵng', 'ACTIVE', (SELECT id FROM roles WHERE role_name = 'USER' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user2@example.com');

-- Insert Tours (Trong Nước)
INSERT INTO tours (tour_name, tour_code, slug, description, short_description, adult_price, child_price, infant_price, base_price, status, duration_days, duration_nights, featured_image, departure_location, destination, category_id, created_at, updated_at)
SELECT 'Tour Hà Nội 3 Ngày', 'HN001', 'tour-ha-noi-3-ngay', 'Khám phá Hà Nội cổ kính với các danh lam thắng cảnh nổi tiếng như Hồ Gươm, Văn Miếu, Hoàng Thành Thăng Long', 'Khám phá Hà Nội cổ kính', 2500000, 1500000, 500000, 2500000, 'PUBLISHED', 3, 2, 'https://via.placeholder.com/400x300?text=Ha+Noi', 'Hà Nội', 'Hà Nội', (SELECT id FROM categories WHERE slug = 'mien-bac' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'HN001')
UNION ALL
SELECT 'Tour TP Hồ Chí Minh 4 Ngày', 'SGN001', 'tour-tphcm-4-ngay', 'Trải nghiệm thành phố hiện đại với ẩm thực tuyệt vời, mua sắm tại các trung tâm thương mại lớn', 'Thành phố hiện đại xinh đẹp', 3000000, 1800000, 600000, 3000000, 'PUBLISHED', 4, 3, 'https://via.placeholder.com/400x300?text=TPHCM', 'TP Hồ Chí Minh', 'TP Hồ Chí Minh', (SELECT id FROM categories WHERE slug = 'mien-nam' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'SGN001')
UNION ALL
SELECT 'Tour Hạ Long 3 Ngày 2 Đêm', 'HL001', 'tour-ha-long-3-ngay', 'Khám phá Vịnh Hạ Long - Di sản thế giới UNESCO, tham quan hang động và các đảo xinh đẹp', 'Vịnh Hạ Long - Di sản thế giới', 4000000, 2400000, 800000, 4000000, 'PUBLISHED', 3, 2, 'https://via.placeholder.com/400x300?text=Ha+Long', 'Hà Nội', 'Hạ Long', (SELECT id FROM categories WHERE slug = 'mien-bac' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'HL001')
UNION ALL
SELECT 'Tour Đà Nẵng - Hội An 4 Ngày', 'DN001', 'tour-da-nang-hoi-an-4-ngay', 'Ghé thăm cảng biển Đà Nẵng và phố cổ Hội An với những ngôi nhà cổ kính', 'Biển Đà Nẵng - Phố cổ Hội An', 3500000, 2100000, 700000, 3500000, 'PUBLISHED', 4, 3, 'https://via.placeholder.com/400x300?text=Da+Nang', 'TP Hồ Chí Minh', 'Đà Nẵng', (SELECT id FROM categories WHERE slug = 'mien-trung' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'DN001')
UNION ALL
SELECT 'Tour Sapa 3 Ngày 2 Đêm', 'SP001', 'tour-sapa-3-ngay', 'Trekking ở Sapa, thăm các bản dân tộc Mường và thưởng ngoạn những cảnh quan ngoạn mục', 'Sapa - Vùng đất huyền thoại', 2800000, 1700000, 550000, 2800000, 'PUBLISHED', 3, 2, 'https://via.placeholder.com/400x300?text=Sapa', 'Hà Nội', 'Sapa', (SELECT id FROM categories WHERE slug = 'mien-bac' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'SP001');

-- Insert Tours (Nước Ngoài)
INSERT INTO tours (tour_name, tour_code, slug, description, short_description, adult_price, child_price, infant_price, base_price, status, duration_days, duration_nights, featured_image, departure_location, destination, category_id, created_at, updated_at)
SELECT 'Tour Thái Lan Bangkok - Phuket 5 Ngày', 'TH001', 'tour-thai-lan-bangkok-phuket', 'Khám phá xứ sở chùa vàng với các bãi biển đẹp, thưởng ẩm thực đặc sắc Thái Lan', 'Thái Lan - Xứ sở chùa vàng', 15000000, 9000000, 3000000, 15000000, 'PUBLISHED', 5, 4, 'https://via.placeholder.com/400x300?text=Thailand', 'TP Hồ Chí Minh', 'Bangkok - Phuket', (SELECT id FROM categories WHERE slug = 'chau-a' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'TH001')
UNION ALL
SELECT 'Tour Campuchia Siem Reap 4 Ngày', 'CB001', 'tour-campuchia-siem-reap', 'Tham quan đền Angkor - kỳ quan thế giới, khám phá lịch sử Khmer cổ đại', 'Campuchia - Kỳ quan Angkor', 12000000, 7200000, 2400000, 12000000, 'PUBLISHED', 4, 3, 'https://via.placeholder.com/400x300?text=Cambodia', 'TP Hồ Chí Minh', 'Siem Reap', (SELECT id FROM categories WHERE slug = 'chau-a' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'CB001')
UNION ALL
SELECT 'Tour Nhật Bản Tokyo - Kyoto 7 Ngày', 'JP001', 'tour-nhat-ban-tokyo-kyoto', 'Du lịch xứ sở mặt trời mọc, trải nghiệm văn hóa Nhật, thưởng ẩm thực Nhật tinh tế', 'Nhật Bản - Xứ sở mặt trời mọc', 45000000, 27000000, 9000000, 45000000, 'PUBLISHED', 7, 6, 'https://via.placeholder.com/400x300?text=Japan', 'TP Hồ Chí Minh', 'Tokyo - Kyoto', (SELECT id FROM categories WHERE slug = 'chau-a' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'JP001')
UNION ALL
SELECT 'Tour Hàn Quốc Seoul 5 Ngày', 'KR001', 'tour-han-quoc-seoul', 'Khám phá Seoul hiện đại với ẩm thực tuyệt hảo, mua sắm tại các trung tâm thương mại', 'Hàn Quốc - Seoul hiện đại', 28000000, 16800000, 5600000, 28000000, 'PUBLISHED', 5, 4, 'https://via.placeholder.com/400x300?text=Korea', 'TP Hồ Chí Minh', 'Seoul', (SELECT id FROM categories WHERE slug = 'chau-a' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'KR001')
UNION ALL
SELECT 'Tour Pháp Paris 7 Ngày', 'FR001', 'tour-phap-paris', 'Thành phố ánh sáng - du lịch mơ ước, thăm tháp Eiffel, bảo tàng Louvre, cảnh đẹp sông Seine', 'Pháp - Thành phố ánh sáng', 60000000, 36000000, 12000000, 60000000, 'PUBLISHED', 7, 6, 'https://via.placeholder.com/400x300?text=France', 'TP Hồ Chí Minh', 'Paris', (SELECT id FROM categories WHERE slug = 'chau-au' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'FR001')
UNION ALL
SELECT 'Tour Singapore 4 Ngày', 'SG001', 'tour-singapore-4-ngay', 'Thành phố chòm sao xinh đẹp - công nghệ cao, khu vườn treo, cảng thương mại hiện đại', 'Singapore - Chòm sao xinh đẹp', 18000000, 10800000, 3600000, 18000000, 'PUBLISHED', 4, 3, 'https://via.placeholder.com/400x300?text=Singapore', 'TP Hồ Chí Minh', 'Singapore', (SELECT id FROM categories WHERE slug = 'chau-a' LIMIT 1), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE tour_code = 'SG001');

-- Insert Tour Schedules
INSERT INTO tour_schedules (tour_id, departure_date, return_date, available_seats, status, created_at, updated_at) VALUES
(1, '2026-05-01', '2026-05-03', 30, 'AVAILABLE', NOW(), NOW()),
(1, '2026-05-15', '2026-05-17', 30, 'AVAILABLE', NOW(), NOW()),
(2, '2026-04-20', '2026-04-23', 40, 'AVAILABLE', NOW(), NOW()),
(3, '2026-05-05', '2026-05-07', 50, 'AVAILABLE', NOW(), NOW()),
(4, '2026-04-25', '2026-04-28', 35, 'AVAILABLE', NOW(), NOW()),
(5, '2026-05-10', '2026-05-12', 25, 'AVAILABLE', NOW(), NOW()),
(6, '2026-05-20', '2026-05-24', 40, 'AVAILABLE', NOW(), NOW()),
(7, '2026-06-01', '2026-06-04', 30, 'AVAILABLE', NOW(), NOW()),
(8, '2026-05-25', '2026-05-31', 25, 'AVAILABLE', NOW(), NOW()),
(9, '2026-06-10', '2026-06-17', 20, 'AVAILABLE', NOW(), NOW()),
(10, '2026-06-05', '2026-06-09', 35, 'AVAILABLE', NOW(), NOW()),
(11, '2026-05-30', '2026-06-02', 30, 'AVAILABLE', NOW(), NOW());

-- Insert Reviews
INSERT INTO reviews (user_id, tour_id, rating, title, comment, created_at, updated_at) VALUES
(2, 1, 5, 'Tour tuyệt vời', 'Tour rất tuyệt vời, hướng dẫn viên thân thiện và chu đáo!', NOW(), NOW()),
(2, 1, 4, 'Hành trình thú vị', 'Hành trình thú vị, chỉ tiếc là mua sắm ít hơn như mong muốn', NOW(), NOW()),
(3, 2, 5, 'TPHCM quyến rũ', 'TPHCM thật sự quyến rũ, ẩm thực tuyệt hảo!', NOW(), NOW()),
(2, 3, 5, 'Hạ Long tuyệt diệu', 'Hạ Long – thiên đường trên mặt đất! Chuyến đi không thể quên', NOW(), NOW()),
(3, 4, 4, 'Đà Nẵng đẹp', 'Đà Nẵng đẹp lắm, mọi thứ tổ chức tốt', NOW(), NOW()),
(2, 5, 4, 'Sapa thơ mộng', 'Sapa thơ mộng, trekking vất vả nhưng đáng!', NOW(), NOW());

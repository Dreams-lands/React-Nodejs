-- ==============================================================================
-- WebQL Database Seed Data (PostgreSQL)
-- Dữ liệu mẫu ban đầu để kiểm thử hệ thống
-- ==============================================================================

-- 1. Nạp dữ liệu bảng `users`
INSERT INTO users (name, email, role, status) VALUES
('Nguyễn Văn An', 'an.nguyen@example.com', 'admin', 'active'),
('Trần Thị Bích', 'bich.tran@example.com', 'editor', 'active'),
('Lê Hoàng Cường', 'cuong.le@example.com', 'user', 'active'),
('Phạm Thị Dung', 'dung.pham@example.com', 'user', 'active'),
('Võ Minh Đức', 'duc.vo@example.com', 'user', 'inactive')
ON CONFLICT (email) DO NOTHING;

-- 2. Nạp dữ liệu bảng `categories`
INSERT INTO categories (name, slug, description) VALUES
('Công Nghệ & Điện Tử', 'cong-nghe-dien-tu', 'Thiết bị công nghệ số, phụ kiện máy tính, điện thoại'),
('Gia Dụng & Đời Sống', 'gia-dung-doi-song', 'Vật dụng gia đình, tiện ích nhà cửa'),
('Sách & Văn Phòng Phẩm', 'sach-van-phong-pham', 'Sách giáo trình, tài liệu chuyên ngành, đồ dùng học tập')
ON CONFLICT (slug) DO NOTHING;

-- 3. Nạp dữ liệu bảng `products`
INSERT INTO products (category_id, name, price, quantity, status, created_by) VALUES
(1, 'Bàn phím cơ không dây Keychron K2', 1850000.00, 25, 'in_stock', 1),
(1, 'Chuột công thái học Logitech MX Master 3S', 2250000.00, 15, 'in_stock', 1),
(1, 'Màn hình Dell UltraSharp 27 inch 4K', 12500000.00, 8, 'in_stock', 2),
(2, 'Đèn bàn thông minh LED bảo vệ thị lực', 450000.00, 50, 'in_stock', 2),
(3, 'Sách Clean Code: A Handbook of Agile Software Craftsmanship', 320000.00, 30, 'in_stock', 1);

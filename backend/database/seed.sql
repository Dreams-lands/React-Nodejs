-- ==============================================================================
-- PetHub Database Seed Data (PostgreSQL) - 16 BẢNG ĐỒNG BỘ
-- Mật khẩu mặc định cho các tài khoản test là: 123456
-- ==============================================================================

-- 1. Nạp roles (4 cấp quyền)
INSERT INTO roles (role_id, role_name) VALUES 
(1, 'Admin'), 
(2, 'Manager'), 
(3, 'Staff'), 
(4, 'Customer')
ON CONFLICT (role_id) DO NOTHING;

-- 2. Nạp tài khoản test (Mật khẩu chuẩn Bcrypt cho '123456')
-- Hash: $2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG
INSERT INTO users (role_id, full_name, email, password_hash, phone, address, is_active) VALUES
(1, 'Admin Khóa', 'admin@pethub.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0900000001', '128 Nguyễn Huệ, Quận 1, TP.HCM', TRUE),
(2, 'Quản Lý Cửa Hàng', 'manager@pethub.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0900000002', 'Bình Thạnh, TP.HCM', TRUE),
(3, 'Nhân Viên Bán Hàng', 'staff@pethub.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0900000003', 'Phú Nhuận, TP.HCM', TRUE),
(4, 'Trịnh Anh Khoa', 'khoa.trinh@pethub.vn', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0909 123 456', '128 Nguyễn Huệ, Quận 1, TP.HCM', TRUE),
(4, 'Dreams', 'dreams@gmail.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0354152753', 'Hà Nội', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Nạp danh mục
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Thức ăn', 'Các loại hạt khô, pate tươi nguyên miếng và bánh thưởng dinh dưỡng'),
(2, 'Phụ kiện', 'Balo phi hành gia, nệm mây, dây dắt và vòng cổ'),
(3, 'Chăm sóc & Y tế', 'Thuốc đặc trị nấm da, nhỏ gáy ve rận và sữa tắm dưỡng lông'),
(4, 'Thú cưng', 'Chó cảnh, mèo cảnh thuần chủng tiêm chủng bảo hành sức khỏe')
ON CONFLICT (category_id) DO NOTHING;

-- 4. Nạp dịch vụ Spa
INSERT INTO services (service_id, service_name, price) VALUES
(1, 'Gói Tắm Sấy Khử Mùi & Vệ Sinh Tai Móng', 180000.00),
(2, 'Gói Cắt Tỉa Tạo Kiểu Lông Thẩm Mỹ', 280000.00),
(3, 'Gói Spa Hoàng Gia Toàn Diện Premium', 450000.00),
(4, 'Gói Nhuộm Lông Điểm Xuyết Thời Trang', 300000.00)
ON CONFLICT (service_id) DO NOTHING;

-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ PETHUB - POSTGRESQL SEED DATA (DML)
-- ==============================================================================

-- 1. Phân quyền
INSERT INTO roles (role_id, role_name) VALUES 
(1, 'Admin'), 
(2, 'Staff'), 
(3, 'Customer')
ON CONFLICT (role_id) DO NOTHING;

-- 2. Tài khoản mẫu (Mật khẩu mặc định là: 123456)
INSERT INTO users (role_id, full_name, email, password_hash, phone, address, is_active) VALUES
(1, 'Trịnh Anh Khoa', 'admin@pethub.com', '$2b$10$w3.J./w/O5.4WnBq6g4h0.6r1W0VlG2m6m6g3u.Qh.Kq9O2jE/K', '0901234567', 'Q1, TP.HCM', TRUE),
(2, 'Linh Phạm', 'linh.staff@pethub.com', '$2b$10$w3.J./w/O5.4WnBq6g4h0.6r1W0VlG2m6m6g3u.Qh.Kq9O2jE/K', '0912345678', 'Q1, TP.HCM', TRUE),
(3, 'Khách Đăng Nhập', 'khach@gmail.com', '$2b$10$w3.J./w/O5.4WnBq6g4h0.6r1W0VlG2m6m6g3u.Qh.Kq9O2jE/K', '0934567890', 'Q2, TP.HCM', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Danh mục sản phẩm
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Dinh dưỡng & Pate', 'Các loại hạt cao cấp, pate và súp thưởng cho thú cưng'),
(2, 'Thuốc & Làm đẹp', 'Sản phẩm chăm sóc sức khỏe, xịt ve rận, kem bôi da'),
(3, 'Nệm & Lồng chuồng', 'Nệm lông cừu, chuồng biệt thự và balo vận chuyển')
ON CONFLICT (category_id) DO NOTHING;

-- 4. Sản phẩm (Khớp đúng tên, giá & SKU trên giao diện PetHub)
INSERT INTO products (product_id, category_id, sku, product_name, description, price, stock_quantity) VALUES
(1, 1, 'PROD-DS-MINI', 'Hạt dinh dưỡng cho chó giống nhỏ Mini Adult', 'Dành cho chó dưới 10kg', 389000.00, 22),
(2, 1, 'PROD-DS-KIT', 'Hạt dinh dưỡng cho mèo con Kitten', 'Dành cho mèo dưới 12 tháng', 465000.00, 34),
(3, 1, 'PROD-PTE-TGA', 'Pate tươi cho mèo thịt gà xé & cá ngừ hộp (Lon 160g)', 'Thơm ngon, bổ sung nước', 38000.00, 48),
(4, 2, 'PROD-MED-SKIN', 'Xịt đặc trị nấm da & viêm da cho chó (100ml)', 'Khử khuẩn, tái tạo lông da', 195000.00, 30),
(5, 2, 'PROD-MED-TICK', 'Thuốc nhỏ gáy phòng ve rận & bọ chét cho chó', 'Bảo vệ lên đến 30 ngày', 165000.00, 27),
(6, 3, 'PROD-CLOUD-BED', 'Nệm tròn lông cừu Cloud Comfort cho chó', 'Siêu êm, giữ ấm tốt', 590000.00, 15),
(7, 3, 'PROD-TRAVEL-BAG', 'Balo phi hành gia vận chuyển mèo chống sốc', 'Thoáng khí, tiện lợi di chuyển', 520000.00, 12)
ON CONFLICT (product_id) DO NOTHING;

-- 5. Hình ảnh sản phẩm mẫu
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119', TRUE),
(2, 'https://images.unsplash.com/photo-1548767797-d8c844163c4c', TRUE);

-- 6. Đơn hàng mẫu
INSERT INTO orders (order_id, customer_id, buyer_name, buyer_phone, buyer_email, shipping_address, total_amount, status, admin_notes) VALUES
(1, 3, 'Trịnh Anh Khoa', '0909123456', 'admin@pethub.com', 'Q1, TP.HCM', 594000.00, 'Shipping', 'Giao giờ hành chính'),
(2, NULL, 'Nguyễn Minh Anh', '0903456781', 'minhanh@gmail.com', 'Bình Thạnh, TP.HCM', 985000.00, 'Pending', 'Khách vãng lai - Đã gọi xác nhận'),
(3, NULL, 'Trần Hoàng Nam', '0918222445', 'hoangnam@gmail.com', 'Gò Vấp, TP.HCM', 790000.00, 'Pending', 'Chờ chuyển khoản')
ON CONFLICT (order_id) DO NOTHING;

-- 7. Chi tiết đơn hàng
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 389000.00),
(2, 6, 1, 590000.00),
(3, 7, 1, 520000.00);

-- 8. Lịch sử thanh toán & Hóa đơn
INSERT INTO transactions (order_id, payment_method, amount, status) VALUES
(1, 'COD', 594000.00, 'Success'),
(2, 'VNPay', 985000.00, 'Success'),
(3, 'Momo', 790000.00, 'Pending');

-- 9. Giỏ hàng mẫu cho Khách đăng nhập (User ID = 3)
INSERT INTO carts (user_id) VALUES (3) ON CONFLICT (user_id) DO NOTHING;
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (1, 1, 2) ON CONFLICT (cart_id, product_id) DO NOTHING;

-- Đặt lại giá trị SERIAL sequence cho các bảng để tránh lỗi trùng khóa chính khi tạo mới
SELECT setval('roles_role_id_seq', (SELECT MAX(role_id) FROM roles));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));
SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));

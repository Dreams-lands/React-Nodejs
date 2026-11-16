-- ==============================================================================
-- CƠ SỞ DỮ LIỆU PETHUB (POSTGRESQL) - FULL SCHEMA (16 BẢNG)
-- Bao gồm: Roles, Users, Categories, Products, Images, Inventory Logs,
-- Orders, Order Items, Services, Appointments, Transactions, Carts, Banners, Audit Logs
-- ==============================================================================

-- BƯỚC 1: XÓA CÁC BẢNG CŨ NẾU ĐÃ TỒN TẠI (Đảm bảo chạy lại script không bị xung đột)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ==========================================
-- PHẦN 1: TẠO CẤU TRÚC 16 BẢNG DỮ LIỆU
-- ==========================================

-- 1. Bảng Roles (Phân quyền 4 cấp: Admin, Manager, Staff, Customer)
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Bảng Users (Hội viên, Nhân viên, Quản lý, Admin)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(role_id),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    phone VARCHAR(20),
    address TEXT,
    avatar_url TEXT,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE 
);

-- 3. Bảng Categories (Danh mục sản phẩm)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Bảng Products (Sản phẩm & Tồn kho hiện tại)
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(category_id),
    sku VARCHAR(50) UNIQUE, 
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE 
);

-- 5. Bảng Product_Images (Hình ảnh sản phẩm)
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE 
);

-- 6. Bảng Inventory Logs (Quản lý chi tiết lịch sử xuất/nhập kho)
CREATE TABLE inventory_logs (
    log_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(product_id),
    user_id INT REFERENCES users(user_id),         -- Nhân viên nào thực hiện nhập/xuất kho
    change_quantity INT NOT NULL,                  -- Số dương: Nhập kho, Số âm: Xuất kho
    reason VARCHAR(255) NOT NULL,                  -- Lý do (VD: 'Nhập hàng từ NCC', 'Đơn hàng #123')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng Orders (Đơn hàng & Doanh thu)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(user_id), 
    buyer_name VARCHAR(100) NOT NULL,          
    buyer_phone VARCHAR(20) NOT NULL,          
    buyer_email VARCHAR(100),                  
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,           -- Tổng tiền hàng gốc
    discount_amount DECIMAL(10, 2) DEFAULT 0,       -- Tiền giảm giá
    final_amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Tiền khách thực trả
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending',      
    admin_notes TEXT                           
);

-- 8. Bảng Order_Items (Chi tiết từng món hàng trong đơn)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(product_id), 
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL
);

-- 9. Bảng Services (Danh mục dịch vụ Spa & Chăm sóc thú cưng)
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 10. Bảng Appointments (Lịch hẹn dịch vụ Spa)
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(user_id), 
    guest_name VARCHAR(100) NOT NULL,          
    guest_phone VARCHAR(20) NOT NULL,          
    staff_id INT REFERENCES users(user_id), 
    service_id INT NOT NULL REFERENCES services(service_id),
    appointment_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10, 2) DEFAULT 0, 
    payment_status VARCHAR(50) DEFAULT 'Unpaid',
    status VARCHAR(50) DEFAULT 'Scheduled' 
);

-- 11. Bảng Transactions (Giao dịch tài chính / Dòng tiền)
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    appointment_id INT REFERENCES appointments(appointment_id),
    payment_method VARCHAR(50) NOT NULL,       
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Success',
    CONSTRAINT chk_transaction_source CHECK (order_id IS NOT NULL OR appointment_id IS NOT NULL)
);

-- 12. Bảng Carts & Cart_Items (Giỏ hàng trực tuyến)
CREATE TABLE carts (
    cart_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    UNIQUE(cart_id, product_id) 
);

-- 13. Bảng Banners, Settings & Audit Logs (Cấu hình & Nhật ký hệ thống)
CREATE TABLE banners (
    banner_id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    target_link TEXT, 
    sort_order INT DEFAULT 0, 
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE site_settings (
    setting_key VARCHAR(100) PRIMARY KEY, 
    setting_value TEXT NOT NULL
);

CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id), 
    action VARCHAR(255) NOT NULL,          
    entity_name VARCHAR(100),              
    details TEXT,                          
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHẦN 2: DỮ LIỆU MẪU (SEED DATA ĐỒNG BỘ PETHUB)
-- ==========================================

-- 1. Insert Roles (1: Admin, 2: Manager, 3: Staff, 4: Customer)
INSERT INTO roles (role_id, role_name) VALUES 
(1, 'Admin'),
(2, 'Manager'),
(3, 'Staff'),
(4, 'Customer');

-- 2. Insert Users (Mật khẩu chuẩn Bcrypt cho '123456')
-- Hash: $2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG
INSERT INTO users (user_id, role_id, full_name, email, password_hash, phone, address) VALUES
(1, 1, 'Admin Khóa', 'admin@pethub.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0900000001', '128 Nguyễn Huệ, Quận 1, TP.HCM'),
(2, 2, 'Quản Lý Cửa Hàng', 'manager@pethub.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0900000002', 'Bình Thạnh, TP.HCM'),
(3, 3, 'Nhân Viên Bán Hàng', 'staff@pethub.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0900000003', 'Phú Nhuận, TP.HCM'),
(4, 4, 'Trịnh Anh Khoa', 'khoa.trinh@pethub.vn', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0909 123 456', 'Quận 7, TP.HCM'),
(5, 4, 'Dreams', 'dreams@gmail.com', '$2b$10$k3Re.Wyug3EIiASaz0h1o.GPpmeRzU6T7kGJRYptqrhKs7bnyLGaG', '0354152753', 'Hà Nội');

-- 3. Insert Categories
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Thức ăn', 'Hạt khô, pate tươi dinh dưỡng cho chó mèo đạt chuẩn AAFCO'),
(2, 'Phụ kiện', 'Nệm, chuồng, balo phi hành gia, đồ chơi và dây dắt'),
(3, 'Chăm sóc & Y tế', 'Sữa tắm khử mùi, thuốc trị nấm ve rận, vitamin bổ sung'),
(4, 'Thú cưng', 'Chó cảnh, mèo cảnh thuần chủng tiêm chủng bảo hành sức khỏe');

-- 4. Insert Products
INSERT INTO products (product_id, category_id, sku, product_name, description, price, stock_quantity) VALUES
(1, 1, 'SP001', 'Hạt Royal Canin Mini Adult 2kg', 'Công thức cân bằng năng lượng, hỗ trợ tiêu hóa và nuôi dưỡng lông óng mượt', 389000.00, 50),
(2, 1, 'SP002', 'Pate Monge Vị Cá Hồi & Lê 100g', 'Pate dinh dưỡng cao cấp dành riêng cho chó poodle và chó nhỏ', 35000.00, 200),
(3, 2, 'SP003', 'Nệm Tròn Lông Cừu Cao Cấp Size M', 'Nệm êm ái chống trượt, đệm bông PP siêu mềm mại cho thú cưng', 450000.00, 30),
(4, 2, 'SP004', 'Balo Phi Hành Gia Trong Suốt Cho Mèo', 'Balo vận chuyển thú cưng có lỗ thoáng khí và đai trợ lực', 320000.00, 45),
(5, 3, 'SP005', 'Sữa Tắm SOS Chuyên Dụng Lông Trắng 530ml', 'Sữa tắm khử mùi, giữ màu lông sáng bóng và ngăn ngừa ve rận', 185000.00, 80),
(6, 4, 'SP006', 'Chó Corgi Pembroke Thuần Chủng 2 Tháng', 'Chó Corgi vàng trắng thuần chủng, đã tiêm phòng 2 mũi, bảo hành sức khỏe', 12500000.00, 3),
(7, 4, 'SP007', 'Mèo Anh Lông Ngắn Màu Bicolor', 'Mèo ALN 2.5 tháng tuổi, mắt màu đồng, phàm ăn và quấn chủ', 8500000.00, 5);

-- 5. Insert Product Images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=85', TRUE),
(1, 'https://images.unsplash.com/photo-1764249453891-84799ed79e9e?auto=format&fit=crop&w=900&q=85', FALSE),
(2, '/images/prod-tuna-pate.jpg', TRUE),
(3, 'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?auto=format&fit=crop&w=700&q=85', TRUE),
(4, 'https://images.unsplash.com/photo-1527150602-a98f7a6f2746?auto=format&fit=crop&w=700&q=85', TRUE),
(5, '/images/prod-antifungal-cream.jpg', TRUE),
(6, 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85', TRUE),
(7, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=85', TRUE);

-- 6. Insert Inventory Logs (Lịch sử kho hàng)
INSERT INTO inventory_logs (product_id, user_id, change_quantity, reason) VALUES
(1, 1, 50, 'Nhập kho ban đầu từ Nhà Cung Cấp'),
(2, 1, 200, 'Nhập kho ban đầu từ Nhà Cung Cấp'),
(3, 1, 30, 'Nhập phụ kiện từ Nhà Phân Phối'),
(4, 1, 45, 'Nhập phụ kiện từ Nhà Phân Phối'),
(5, 1, 80, 'Nhập vật tư chăm sóc');

-- 7. Insert Services (Dịch vụ Spa)
INSERT INTO services (service_id, service_name, price) VALUES
(1, 'Gói Tắm Sấy Khử Mùi & Vệ Sinh Tai Móng', 180000.00),
(2, 'Gói Cắt Tỉa Tạo Kiểu Lông Thẩm Mỹ', 280000.00),
(3, 'Gói Spa Hoàng Gia Toàn Diện Premium', 450000.00),
(4, 'Gói Nhuộm Lông Điểm Xuyết Thời Trang', 300000.00);

-- 8. Insert Orders & Order Items
INSERT INTO orders (order_id, customer_id, buyer_name, buyer_phone, buyer_email, shipping_address, total_amount, discount_amount, final_amount, status, admin_notes) VALUES
(1, 4, 'Trịnh Anh Khoa', '0909 123 456', 'khoa.trinh@pethub.vn', '128 Nguyễn Huệ, Quận 1, TP.HCM', 778000.00, 0, 778000.00, 'Completed', 'Đã giao hàng và thanh toán COD thành công'),
(2, 5, 'Dreams', '0354152753', 'dreams@gmail.com', '123 Nguyễn Huệ, Quận 1, TP.HCM', 389000.00, 0, 389000.00, 'Pending', 'Khách hẹn giao hàng buổi chiều');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 2, 389000.00),
(2, 1, 1, 389000.00);

-- 9. Insert Transactions
INSERT INTO transactions (order_id, payment_method, amount, status) VALUES
(1, 'COD', 778000.00, 'Success'),
(2, 'COD', 389000.00, 'Pending');

-- 10. Insert Appointments (Lịch hẹn Spa)
INSERT INTO appointments (customer_id, guest_name, guest_phone, staff_id, service_id, appointment_date, total_amount, payment_status, status) VALUES
(4, 'Trịnh Anh Khoa', '0909 123 456', 3, 3, NOW() + INTERVAL '2 days', 450000.00, 'Paid', 'Scheduled');

-- 11. Insert Carts (Khởi tạo sẵn giỏ hàng)
INSERT INTO carts (user_id) VALUES (4), (5);

-- 12. Insert Banners & Site Settings
INSERT INTO banners (image_url, target_link, sort_order) VALUES
('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80', '/promotions', 1);

INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_name', 'PetHub Vietnam'),
('hotline', '1900 6868'),
('store_address', '128 Nguyễn Huệ, Quận 1, TP.HCM');

-- Đồng bộ sequence cho các cột SERIAL
SELECT setval('roles_role_id_seq', (SELECT MAX(role_id) FROM roles));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));
SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
SELECT setval('product_images_image_id_seq', (SELECT MAX(image_id) FROM product_images));
SELECT setval('inventory_logs_log_id_seq', (SELECT MAX(log_id) FROM inventory_logs));
SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));
SELECT setval('order_items_order_item_id_seq', (SELECT MAX(order_item_id) FROM order_items));
SELECT setval('services_service_id_seq', (SELECT MAX(service_id) FROM services));
SELECT setval('appointments_appointment_id_seq', (SELECT MAX(appointment_id) FROM appointments));
SELECT setval('transactions_transaction_id_seq', (SELECT MAX(transaction_id) FROM transactions));
SELECT setval('carts_cart_id_seq', (SELECT MAX(cart_id) FROM carts));
SELECT setval('banners_banner_id_seq', (SELECT MAX(banner_id) FROM banners));

-- 1. Bảng Phân quyền (Vai trò)
CREATE TABLE Roles (
    role_id INT PRIMARY KEY IDENTITY(1,1),
    role_name NVARCHAR(50) NOT NULL
);

-- 2. Bảng Người dùng
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    role_id INT NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    phone NVARCHAR(20) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    address NVARCHAR(MAX),
    reward_points INT DEFAULT 0,
    failed_login_attempts INT DEFAULT 0,
    is_locked BIT DEFAULT 0, -- Dùng BIT thay cho BOOLEAN (0 = FALSE, 1 = TRUE)
    reset_token NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(), -- Dùng GETDATE() thay cho CURRENT_TIMESTAMP
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- 3. Bảng Danh mục
CREATE TABLE Categories (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX)
);

-- 4. Bảng Sản phẩm
CREATE TABLE Products (
    product_id INT PRIMARY KEY IDENTITY(1,1),
    category_id INT,
    brand NVARCHAR(100),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 100, 
    expiry_date DATE,
    rating DECIMAL(2, 1),
    review_count INT,
    is_active BIT DEFAULT 1,
    image_url NVARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- 5. Bảng Dịch vụ Spa/Khách sạn
CREATE TABLE Services (
    service_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    duration NVARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    is_popular BIT DEFAULT 0
);

-- 6. Bảng Đặt lịch hẹn
CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NULL, 
    service_id INT NOT NULL,
    pet_type NVARCHAR(100),
    appointment_date DATE NOT NULL,
    appointment_time NVARCHAR(50) NOT NULL,
    customer_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    notes NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (service_id) REFERENCES Services(service_id)
);

-- 7. Bảng Giỏ hàng
CREATE TABLE Cart_Items (
    cart_item_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL, 
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- 8. Bảng Đơn hàng
CREATE TABLE Orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    order_code NVARCHAR(50) UNIQUE NOT NULL,
    user_id INT NULL, 
    customer_name NVARCHAR(100) NOT NULL,
    customer_email NVARCHAR(100) NOT NULL,
    customer_phone NVARCHAR(20) NOT NULL,
    shipping_address NVARCHAR(MAX) NOT NULL,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL CHECK (payment_method IN ('COD', 'E_WALLET')),
    payment_status NVARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
    order_status NVARCHAR(50) DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 9. Bảng Chi tiết Đơn hàng
CREATE TABLE Order_Items (
    order_item_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- 10. Bảng Liên hệ mua thú cưng
CREATE TABLE Pet_Inquiries (
    inquiry_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NOT NULL, 
    customer_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL, 
    email NVARCHAR(100), 
    message NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Closed')),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
-- 1. Nạp dữ liệu Bảng Roles
SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (role_id, role_name) VALUES 
(1, N'Admin'), 
(2, N'Customer');
SET IDENTITY_INSERT Roles OFF;

-- 2. Nạp dữ liệu Bảng Users
SET IDENTITY_INSERT Users ON;
INSERT INTO Users (user_id, role_id, full_name, email, phone, password_hash, is_locked) VALUES 
(1, 2, N'Trịnh Khoa', N'khoatrinh@gmail.com', N'0909686868', N'$2b$10$abcdefghijklmnopqrstuv', 0);
SET IDENTITY_INSERT Users OFF;

-- 3. Nạp dữ liệu Bảng Categories
SET IDENTITY_INSERT Categories ON;
INSERT INTO Categories (category_id, name, description) VALUES
(1, N'Dinh dưỡng & Pate', N'Hạt khô, pate tươi nguyên miếng và bánh thưởng.'),
(2, N'Thuốc & Làm đẹp', N'Thuốc trị nấm da, nhỏ gáy ve rận và sữa tắm.'),
(3, N'Nệm & Không gian nghỉ', N'Chất liệu tự nhiên, êm ái, thoáng khí.'),
(4, N'Balo & Phụ kiện', N'Gọn nhẹ, chống sốc trên mọi hành trình.');
SET IDENTITY_INSERT Categories OFF;

-- 4. Nạp dữ liệu Bảng Products
SET IDENTITY_INSERT Products ON;
INSERT INTO Products (product_id, category_id, brand, name, description, price, original_price, rating, review_count, is_active) VALUES
(1, 1, N'ROYAL CANIN', N'Hạt dinh dưỡng cho chó giống nhỏ Mini Adult', N'Chó trưởng thành • 2 kg', 389000, 489000, 4.9, 128, 1),
(2, 1, N'ROYAL CANIN', N'Hạt dinh dưỡng cho mèo con Kitten', N'Mèo con 4 - 12 tháng • 2 kg', 465000, NULL, 4.9, 86, 1),
(3, 1, N'NUTRISOURCE', N'Hạt cao cấp vị thịt gà tươi & gạo lứt', N'Mọi giống chó • 2,5 kg', 425000, 475000, 4.9, 64, 1),
(4, 1, N'FELINE FEAST', N'Pate tươi cho mèo thịt gà xé & cá ngừ hấp', N'Dành cho Mèo • Lon 160 g', 38000, 45000, 4.9, 105, 1),
(5, 1, N'ME-O', N'Hạt dinh dưỡng cho mèo trưởng thành vị cá biển', N'Mèo trưởng thành • 1,2 kg', 99000, 129000, 4.8, 96, 1),
(6, 1, N'PEDIGREE', N'Hạt dinh dưỡng cho chó lớn vị bò & rau củ', N'Chó trưởng thành • 3 kg', 335000, 419000, 4.8, 75, 1),
(7, 1, N'DENTASTIX', N'Thanh gặm sạch răng cho chó giống nhỏ', N'Combo 7 thanh • 110 g', 85000, 115000, 5.0, 142, 1),
(8, 1, N'WHISKAS', N'Pate mềm vị cá ngừ đại dương (Combo 24 gói)', N'24 gói x 85 g', 320000, 375000, 4.9, 74, 1),
(9, 2, N'VET CARE', N'Xịt đặc trị nấm da & viêm da cho chó (100ml)', N'Chai 100ml', 195000, 265000, 4.9, 114, 1),
(10, 2, N'VETDERM', N'Kem bôi trị nấm kẽ chân & vành tai cho mèo (20g)', N'Tuýp 20g', 145000, 175000, 4.9, 92, 1),
(11, 2, N'PETGUARD', N'Thuốc nhỏ gáy phòng ve rận & bọ chét cho chó', N'Hộp 3 tuýp', 185000, NULL, 4.8, 63, 1),
(12, 2, N'PU CARE', N'Sữa tắm thảo mộc dịu nhẹ dưỡng lông cho mèo', N'Chai 400ml', 265000, NULL, 4.9, 89, 1),
(13, 2, N'BOTANICAL PAW', N'Sữa tắm yến mạch & lô hội dịu nhẹ cho chó', N'Chai 500ml', 245000, NULL, 4.9, 74, 1),
(14, 3, N'PETHUB HOME', N'Nệm tròn lông cừu Cloud Comfort cho chó', N'Size M', 590000, NULL, 4.9, 52, 1),
(15, 3, N'PETHUB HOME', N'Ổ nệm mây kháng khuẩn đế chống trượt cho mèo', N'Size 45cm', 550000, NULL, 4.8, 38, 1),
(16, 3, N'PETHUB HOME', N'Lồng chuồng chó sơn tĩnh điện gấp gọn khay nhựa', N'Size M', 680000, NULL, 4.8, 53, 1),
(17, 3, N'PETHUB HOME', N'Chuồng mèo biệt thự nhiều tầng sơn tĩnh điện', N'78x54x115cm', 1250000, 1450000, 4.9, 44, 1),
(18, 3, N'PETHUB HOME', N'Giường nệm chữ nhật memory foam nâng đỡ', N'Size L', 790000, 890000, 4.9, 58, 1),
(19, 3, N'PETHUB HOME', N'Giường nệm tròn lông cừu ấm áp cho mèo', N'Đường kính 55cm', 420000, NULL, 4.8, 66, 1),
(20, 4, N'PETHUB HOME', N'Balo phi hành gia vận chuyển chó mèo', N'Dưới 7kg', 520000, 650000, 4.8, 92, 1),
(21, 4, N'PETHUB HOME', N'Túi xách vận chuyển chó mèo phối lưới thoáng khí', N'Dưới 5kg', 340000, NULL, 4.7, 56, 1),
(22, 4, N'PAW WALK', N'Dây xích & Vòng cổ dù bọc da êm cho chó', N'Dài 1.5m', 195000, NULL, 4.8, 62, 1),
(23, 4, N'PAW WALK', N'Vòng cổ đệm lưới & Dây dắt phản quang', N'Dài 1.2m', 135000, 185000, 4.9, 81, 1),
(24, 4, N'PETHUB HOME', N'Hộp cát vệ sinh cho mèo có nắp đậy', N'52x40x38cm', 440000, 550000, 4.8, 115, 1),
(25, 4, N'PETHUB HOME', N'Bát ăn đôi gốm sứ đế gỗ sồi chống trượt', N'2 bát x 400ml', 290000, NULL, 4.9, 48, 1),
(26, 4, N'PETHUB HOME', N'Bát ăn đôi sứ trắng nghiêng 15 độ', N'2 bát x 200ml', 255000, NULL, 4.9, 73, 1);
SET IDENTITY_INSERT Products OFF;

-- 5. Nạp dữ liệu Bảng Services
SET IDENTITY_INSERT Services ON;
INSERT INTO Services (service_id, name, description, duration, price, is_popular) VALUES
(1, N'Tắm thảo mộc & Thư giãn', N'Tắm sạch sâu 2 lần, sấy ấm, vệ sinh tuyến hôi.', N'45 phút', 180000, 0),
(2, N'Cắt tỉa & Tạo phom lông thẩm mỹ', N'Tỉa gọn khuôn mặt, tạo phom lông bồng bềnh.', N'60 phút', 280000, 0),
(3, N'Chăm sóc Toàn diện 7 Bước', N'Trọn gói tắm, massage, cắt tỉa, vệ sinh tai sâu.', N'90 phút', 390000, 1),
(4, N'Khách sạn thú cưng 5 sao', N'Phòng riêng, camera 24/7, 3 bữa dinh dưỡng.', N'24 giờ', 150000, 0);
SET IDENTITY_INSERT Services OFF;

-- 6. Nạp 1 Lịch hẹn mẫu
SET IDENTITY_INSERT Bookings ON;
INSERT INTO Bookings (booking_id, user_id, service_id, pet_type, appointment_date, appointment_time, customer_name, phone, status) VALUES
(1, 1, 3, N'Chó nhỏ (< 5kg)', '2026-11-16', N'10:30 Sáng', N'Trịnh Khoa', N'0909 686 868', N'Pending');
SET IDENTITY_INSERT Bookings OFF;
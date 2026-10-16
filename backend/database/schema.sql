-- ==============================================================================
-- WebQL Database Schema
-- Hệ quản trị cơ sở dữ liệu: MySQL 8.0+ / MariaDB 10.4+
-- Bộ mã ký tự chuẩn: utf8mb4 / Đối chiếu: utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Tạo Database nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS `webql_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `webql_db`;

-- Tạm thời tắt kiểm tra khóa ngoại khi khởi tạo/reset bảng
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 2. Bảng `users` (Quản lý tài khoản người dùng)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính tự tăng',
  `name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên người dùng',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Địa chỉ email (duy nhất)',
  `role` ENUM('admin', 'editor', 'user') NOT NULL DEFAULT 'user' COMMENT 'Phân quyền vai trò',
  `status` ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active' COMMENT 'Trạng thái tài khoản',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật cuối',
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý người dùng';

-- ------------------------------------------------------------------------------
-- 3. Bảng `categories` (Danh mục hệ thống)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT 'Tên danh mục',
  `slug` VARCHAR(120) NOT NULL UNIQUE COMMENT 'Đường dẫn tĩnh chuẩn SEO',
  `description` VARCHAR(255) NULL COMMENT 'Mô tả ngắn gọn danh mục',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng danh mục';

-- ------------------------------------------------------------------------------
-- 4. Bảng `products` (Quản lý sản phẩm / hàng hóa / tài nguyên)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NULL COMMENT 'Khóa ngoại liên kết danh mục',
  `name` VARCHAR(200) NOT NULL COMMENT 'Tên sản phẩm',
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Đơn giá',
  `quantity` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho',
  `status` ENUM('in_stock', 'out_of_stock', 'discontinued') NOT NULL DEFAULT 'in_stock' COMMENT 'Trạng thái hàng',
  `created_by` INT NULL COMMENT 'Người tạo (khóa ngoại users.id)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_products_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng sản phẩm / tài nguyên quản lý';

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;


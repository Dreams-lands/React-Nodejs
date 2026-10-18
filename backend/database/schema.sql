-- ==============================================================================
-- WebQL Database Schema (PostgreSQL)
-- Hệ quản trị cơ sở dữ liệu: PostgreSQL 12+ / 14+ / 16+ / 17+
-- Trình quản lý trực quan: DBeaver / pgAdmin / TablePlus
-- ==============================================================================

-- 1. Xóa các bảng cũ nếu đã tồn tại (theo thứ tự quan hệ phụ thuộc)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Tạo hàm kích hoạt tự động cập nhật thời gian (trigger update_updated_at_column)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. Bảng `users` (Quản lý tài khoản người dùng)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Gắn Trigger tự động cập nhật updated_at cho users
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Bảng quản lý tài khoản người dùng';
COMMENT ON COLUMN users.id IS 'Khóa chính tự tăng (SERIAL)';
COMMENT ON COLUMN users.role IS 'Phân quyền: admin, editor, user';
COMMENT ON COLUMN users.status IS 'Trạng thái: active, inactive, banned';

-- ------------------------------------------------------------------------------
-- 4. Bảng `categories` (Danh mục hệ thống)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

COMMENT ON TABLE categories IS 'Bảng phân loại danh mục sản phẩm/tài nguyên';

-- ------------------------------------------------------------------------------
-- 5. Bảng `products` (Sản phẩm / Hàng hóa quản lý)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  name VARCHAR(200) NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'out_of_stock', 'discontinued')),
  created_by INT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Gắn Trigger tự động cập nhật updated_at cho products
DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE products IS 'Bảng quản lý sản phẩm hàng hóa';

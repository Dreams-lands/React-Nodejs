# 🗄️ Quản Lý Cơ Sở Dữ Liệu PostgreSQL & DBeaver - PetHub (16 Bảng)

Thư mục này là **nơi tập trung toàn bộ cấu trúc 16 bảng, dữ liệu mẫu và scripts tự động hóa của PostgreSQL** cho dự án PetHub.

---

## 📁 Các Thành Phần Trong Thư Mục

| Tên File | Vai Trò & Chức Năng |
| :--- | :--- |
| [`schema.sql`](file:///d:/Project/WebQL/backend/database/schema.sql) | Chứa các câu lệnh **DDL** PostgreSQL tạo đầy đủ **16 bảng**: `roles`, `users`, `categories`, `products`, `product_images`, `inventory_logs`, `orders`, `order_items`, `services`, `appointments`, `transactions`, `carts`, `cart_items`, `banners`, `site_settings`, `audit_logs` cùng dữ liệu mẫu ban đầu. |
| [`seed.sql`](file:///d:/Project/WebQL/backend/database/seed.sql) | Dữ liệu mẫu bổ sung chuẩn PostgreSQL (`ON CONFLICT DO NOTHING`) cho các bảng. |
| [`init.js`](file:///d:/Project/WebQL/backend/database/init.js) | Script Node.js 1 chạm tự động đồng bộ 16 bảng và nạp dữ liệu trực tiếp vào database `postgres`. |
| [`DATA_DICTIONARY.md`](file:///d:/Project/WebQL/backend/database/DATA_DICTIONARY.md) | Từ điển dữ liệu chi tiết, giải thích ý nghĩa từng cột, sơ đồ quan hệ ERD (Mermaid) và hướng dẫn sử dụng DBeaver. |

---

## ⚙️ Cấu Hình Kết Nối PostgreSQL

File cấu hình:
- **[`backend/.env`](file:///d:/Project/WebQL/backend/.env)**:
  ```env
  PORT=5000
  NODE_ENV=development
  CLIENT_URL=http://localhost:5173

  # Cấu hình PostgreSQL
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=123456
  DB_NAME=postgres
  ```

---

## 🚀 Cách Khởi Tạo Lại Database

Chạy lệnh sau tại thư mục gốc:
```bash
npm run db:init
```
Script sẽ tự động:
1. Kết nối vào PostgreSQL Server qua cổng **5432**.
2. Đồng bộ trực tiếp vào database **`postgres`** (tự động xóa bỏ database thừa `webql_db` nếu có).
3. Tạo 16 bảng quan hệ và nạp dữ liệu mẫu ban đầu:
   - **4 Cấp vai trò**: Admin, Manager, Staff, Customer.
   - **Tài khoản test** (mật khẩu mặc định: `123456`).
   - **Danh mục & Sản phẩm** hoàn chỉnh của PetHub kèm ảnh hiển thị và kho hàng ban đầu.

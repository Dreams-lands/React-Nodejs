# 🗄️ Quản Lý Cơ Sở Dữ Liệu MySQL - WebQL

Thư mục này là **nơi tập trung toàn bộ thông tin, định nghĩa cấu trúc và dữ liệu mẫu của MySQL** trong dự án WebQL.

---

## 📁 Các Thành Phần Trong Thư Mục

| Tên File                                                                             | Vai Trò & Chức Năng                                                                                               |
| :----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| [`schema.sql`](file:///d:/Project/WebQL/backend/database/schema.sql)                 | Chứa các câu lệnh **DDL** (`CREATE DATABASE`, `CREATE TABLE`, `FOREIGN KEY`, `INDEXES`) định nghĩa cấu trúc bảng. |
| [`seed.sql`](file:///d:/Project/WebQL/backend/database/seed.sql)                     | Chứa các câu lệnh **DML** (`INSERT INTO`) nạp dữ liệu mẫu ban đầu bằng tiếng Việt.                                |
| [`init.js`](file:///d:/Project/WebQL/backend/database/init.js)                       | File script tự động kết nối MySQL Server, tạo database, chạy schema và nạp seed data chỉ bằng 1 câu lệnh.         |
| [`DATA_DICTIONARY.md`](file:///d:/Project/WebQL/backend/database/DATA_DICTIONARY.md) | Từ điển dữ liệu chi tiết (mô tả từng cột, kiểu dữ liệu, sơ đồ quan hệ ERD).                                       |

---

## ⚙️ Nơi Cấu Hình Kết Nối MySQL

Thông tin đăng nhập MySQL được quản lý tập trung và bảo mật tại:

- **[`backend/.env`](file:///d:/Project/WebQL/backend/.env)**:
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=123456
  DB_NAME=webql_db
  ```
- **[`backend/src/config/db.js`](file:///d:/Project/WebQL/backend/src/config/db.js)**: Chịu trách nhiệm thiết lập MySQL connection pool cho toàn bộ ứng dụng Express.

---

## 🚀 3 Cách Khởi Tạo & Nạp Dữ Liệu MySQL

### Cách 1: Sử dụng lệnh tự động (Khuyên Dùng - Nhanh Nhất)

Từ thư mục gốc của dự án hoặc thư mục `backend`:

```bash
# Chạy từ thư mục gốc:
npm run db:init

# Hoặc chạy trong thư mục backend:
cd backend
npm run db:init
```

Script sẽ tự động:

1. Kết nối tới MySQL máy chủ qua cổng 3306.
2. Tự tạo cơ sở dữ liệu `webql_db` nếu chưa có.
3. Tạo mới toàn bộ bảng: `users`, `categories`, `products`.
4. Nạp toàn bộ dữ liệu mẫu trong `seed.sql`.

---

### Cách 2: Sử Dụng phpMyAdmin (XAMPP / Laragon)

1. Mở trình duyệt vào `http://localhost/phpmyadmin`.
2. Tạo mới một Database có tên: `webql_db` (chọn Collation: `utf8mb4_unicode_ci`).
3. Chọn database `webql_db` vừa tạo -> Chọn tab **Import (Nhập)**.
4. Chọn file [`backend/database/schema.sql`](file:///d:/Project/WebQL/backend/database/schema.sql) và nhấn **Go / Thực hiện**.
5. Tiếp tục Import file [`backend/database/seed.sql`](file:///d:/Project/WebQL/backend/database/seed.sql) để có dữ liệu mẫu.

---

### Cách 3: Sử Dụng DBeaver / MySQL Workbench / Command Line

Mở terminal và chạy lệnh:

```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p webql_db < backend/database/seed.sql
```

_(Nhập mật khẩu MySQL khi được hỏi)_.

---

## 🛠️ Muốn Thêm Bảng Mới Vào Database?

1. Mở file [`backend/database/schema.sql`](file:///d:/Project/WebQL/backend/database/schema.sql), viết thêm câu lệnh `CREATE TABLE tên_bảng (...)`.
2. Mở file [`backend/database/seed.sql`](file:///d:/Project/WebQL/backend/database/seed.sql) nếu muốn bổ sung dữ liệu mẫu.
3. Chạy lại `npm run db:init`.
4. Tạo thêm file Model tương ứng trong thư mục [`backend/src/models/`](file:///d:/Project/WebQL/backend/src/models/) để tương tác từ Node.js.

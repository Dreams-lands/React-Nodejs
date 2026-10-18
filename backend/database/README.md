# 🗄️ Quản Lý Cơ Sở Dữ Liệu PostgreSQL & DBeaver - WebQL

Thư mục này là **nơi tập trung toàn bộ cấu trúc bảng, dữ liệu mẫu và scripts tự động hóa của PostgreSQL** trong dự án WebQL.

---

## 📁 Các Thành Phần Trong Thư Mục

| Tên File | Vai Trò & Chức Năng |
| :--- | :--- |
| [`schema.sql`](file:///d:/Project/WebQL/backend/database/schema.sql) | Chứa các câu lệnh **DDL** PostgreSQL (`CREATE TABLE`, `SERIAL`, `FOREIGN KEY`, `CHECK`, `TRIGGER`, `INDEXES`) định nghĩa cấu trúc dữ liệu. |
| [`seed.sql`](file:///d:/Project/WebQL/backend/database/seed.sql) | Chứa các câu lệnh **DML** (`INSERT INTO ... ON CONFLICT`) nạp dữ liệu mẫu ban đầu bằng tiếng Việt. |
| [`init.js`](file:///d:/Project/WebQL/backend/database/init.js) | Script Node.js tự động kết nối PostgreSQL Server, tạo database `webql_db`, chạy schema và nạp seed data chỉ bằng 1 câu lệnh. |
| [`DATA_DICTIONARY.md`](file:///d:/Project/WebQL/backend/database/DATA_DICTIONARY.md) | Từ điển dữ liệu chi tiết, các kiểu dữ liệu PostgreSQL, sơ đồ ERD và hướng dẫn kết nối DBeaver. |

---

## ⚙️ Cấu Hình Thông Tin Kết Nối PostgreSQL

Thông tin kết nối được lưu trữ tại file:
- **[`backend/.env`](file:///d:/Project/WebQL/backend/.env)**:
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=123456
  DB_NAME=webql_db
  ```
- **[`backend/src/config/db.js`](file:///d:/Project/WebQL/backend/src/config/db.js)**: Chịu trách nhiệm thiết lập PostgreSQL Connection Pool (`pg.Pool`) cho toàn bộ ứng dụng Express.

---

## 🚀 2 Cách Khởi Tạo & Quản Lý Dữ Liệu

### Cách 1: Sử Dụng Lệnh Tự Động (Khuyên Dùng)
Từ thư mục gốc của dự án hoặc thư mục `backend`:
```bash
# Chạy từ thư mục gốc WebQL:
npm run db:init

# Hoặc chạy trong thư mục backend:
cd backend
npm run db:init
```
Script sẽ tự động:
1. Kết nối tới PostgreSQL Server qua cổng **5432**.
2. Tự tạo database **`webql_db`** (nếu chưa có).
3. Tạo các bảng: **`users`**, **`categories`**, **`products`**, kèm chỉ mục và triggers.
4. Nạp dữ liệu mẫu tiếng Việt từ `seed.sql`.

---

### Cách 2: Quản Lý Trực Quan Bằng DBeaver
1. Mở **DBeaver**.
2. Chọn biểu tượng **New Database Connection** -> Chọn **PostgreSQL** -> Nhấn **Next**.
3. Điền thông tin:
   * **Host:** `localhost`
   * **Port:** `5432`
   * **Database:** `webql_db`
   * **Username:** `postgres`
   * **Password:** `123456`
4. Bấm **Test Connection ...** -> Bấm **Finish**.
5. Trong DBeaver:
   * **Mở SQL Editor:** Nhấn `F3` hoặc `Ctrl + ]` để mở trình soạn thảo SQL.
   * **Chạy file schema:** Mở file [`schema.sql`](file:///d:/Project/WebQL/backend/database/schema.sql) trong DBeaver và nhấn `Alt + X` để thực thi toàn bộ script.
   * **Xem sơ đồ ERD:** Nhấp đúp vào schema `public` -> chọn tab **ER Diagram**.
   * **Xem dữ liệu bảng:** Nhấp đúp vào bảng `users` -> chọn tab **Data**.

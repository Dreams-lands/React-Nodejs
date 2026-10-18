# 🚀 WebQL - Dự Án Fullstack React + Node.js (Mô Hình MVC Chuẩn Web)

Dự án mẫu Fullstack hiện đại kết hợp **React 19 (Vite)** ở phía Client và **Node.js (Express 5 & PostgreSQL)** ở phía Server, quản lý cơ sở dữ liệu trực quan bằng **DBeaver**, được tổ chức theo chuẩn kiến trúc **MVC (Model - View - Controller)** kết hợp **Service Layer (3-Layer Pattern)** mới nhất cho lập trình Web.

---

## 🏛️ 1. Mô Hình Kiến Trúc MVC & Luồng Hoạt Động

Trong kiến trúc Web hiện đại:
- **Model (M)**: Quản lý cấu trúc dữ liệu, kết nối và thực hiện các câu truy vấn PostgreSQL thông qua connection pool (`backend/src/models/`).
- **View (V)**: Ứng dụng Single Page App (SPA) bằng React 19 hiển thị dữ liệu và tiếp nhận tương tác từ người dùng (`frontend/src/`).
- **Controller (C)**: Tiếp nhận HTTP request từ Router, kiểm tra tính hợp lệ cơ bản, gọi tầng Service để xử lý và trả về phản hồi JSON chuẩn hóa cho View (`backend/src/controllers/`).
- **Service Layer (S)**: Nằm giữa Controller và Model, đóng vai trò chứa toàn bộ logic nghiệp vụ (Business Logic), giúp code không bị phình to (Fat Controller) và dễ dàng bảo trì, viết Unit Test.

### 🔄 Sơ đồ luồng dữ liệu (Data Flow):
```text
[ Người Dùng ] ──(Tương tác UI)──> [ React View (Frontend) ]
                                             │ (Axios HTTP Request)
                                             ▼
                                  [ Express Routes ]
                                             │
                                             ▼
                                     [ Controllers ]
                                             │ (Gọi hàm nghiệp vụ)
                                             ▼
                                      [ Services ]
                                             │ (Yêu cầu dữ liệu)
                                             ▼
                                       [ Models ]
                                             │ (SQL Query Parameterized)
                                             ▼
                                 [ PostgreSQL Database ]
                                             │
                                  [ Quản lý bằng DBeaver ]
```

---

## 📁 2. Cấu Trúc Thư Mục Dự Án Chi Tiết

```text
WebQL/
├── package.json                   # Quản lý scripts tổng (install:all, dev:..., db:init)
├── .gitignore                     # Bỏ qua node_modules, .env cho toàn bộ dự án
├── README.md                      # Hướng dẫn chi tiết
│
├── backend/                       # 🟢 BACKEND (Node.js + Express 5 + PostgreSQL pg)
│   ├── .env                       # Biến môi trường thực tế (PORT=5000, DB_PORT=5432, ...)
│   ├── .env.example               # Biến môi trường mẫu
│   ├── .gitignore                 # Bỏ qua node_modules, .env backend
│   ├── package.json               # Dependencies backend (pg, express, cors, dotenv)
│   ├── database/                  # 🗄️ NƠI QUẢN LÝ DỮ LIỆU & SCHEMA POSTGRESQL
│   │   ├── schema.sql             # Cấu trúc bảng PostgreSQL (users, categories, products)
│   │   ├── seed.sql               # Dữ liệu mẫu ban đầu bằng tiếng Việt (ON CONFLICT)
│   │   ├── init.js                # Script 1 chạm tự động tạo DB & nạp dữ liệu vào PostgreSQL
│   │   ├── DATA_DICTIONARY.md     # Từ điển dữ liệu, sơ đồ ERD & hướng dẫn DBeaver
│   │   └── README.md              # Hướng dẫn chi tiết về Database & DBeaver
│   └── src/
│       ├── config/                # Cấu hình Database pool & CORS
│       │   ├── db.js              # Kết nối PostgreSQL (pg.Pool) & auto create database
│       │   └── cors.js            # Cấu hình CORS Whitelist
│       ├── models/                # [M] MODEL: Tương tác trực tiếp DB qua pg.Pool
│       │   └── user.model.js      # Thực thi truy vấn parameterized ($1, $2, RETURNING)
│       ├── controllers/           # [C] CONTROLLER: Xử lý Request/Response
│       │   ├── home.controller.js # Endpoint trạng thái & healthcheck
│       │   └── user.controller.js # Endpoint CRUD Users
│       ├── services/              # [S] SERVICE: Xử lý Business Logic
│       │   └── user.service.js    # Kiểm tra ràng buộc email, role, sanitize
│       ├── routes/                # ROUTER: Định tuyến API
│       │   ├── index.js           # Router trung tâm (/api)
│       │   └── user.routes.js     # Route tài nguyên /api/users
│       ├── middlewares/           # MIDDLEWARES: Xử lý trung gian
│       │   ├── errorHandler.js    # Xử lý lỗi toàn cục (Global Error)
│       │   └── notFound.js        # Bắt lỗi 404 Not Found
│       ├── utils/                 # TIỆN ÍCH DÙNG CHUNG
│       │   └── response.js        # Chuẩn hóa format JSON (sendSuccess, sendError)
│       ├── app.js                 # Cấu hình Express app & middlewares
│       └── server.js              # Entry point: Khởi động server & kiểm tra kết nối DB
│
└── frontend/                      # 🔵 FRONTEND [V] VIEW (React 19 + Vite)
    ├── .env                       # Biến môi trường frontend (VITE_API_BASE_URL)
    ├── .env.example               # Mẫu biến môi trường
    ├── package.json               # Dependencies frontend (React 19, Axios, React Router)
    ├── vite.config.js             # Cấu hình Vite
    ├── index.html                 # File HTML gốc
    └── src/
        ├── assets/                # Hình ảnh, icons, logo
        ├── components/            # UI Components tái sử dụng
        │   ├── common/            # Header, Footer, LoadingSpinner
        │   └── users/             # UserCard, UserForm
        ├── layouts/               # Khung bố cục (MainLayout với Header + Footer)
        ├── pages/                 # Các màn hình Views (Pages)
        │   ├── HomePage.jsx       # Trang chủ giới thiệu & kiểm tra kết nối API
        │   ├── UsersPage.jsx      # Quản lý CRUD người dùng theo thời gian thực
        │   └── NotFoundPage.jsx   # Trang 404
        ├── services/              # Tầng gọi API từ Frontend
        │   ├── api.js             # Cấu hình Axios instance & interceptors
        │   └── userService.js     # Gọi các endpoint người dùng
        ├── context/               # Global state (AppContext: thông báo, alert)
        ├── routes/                # Định tuyến Frontend (React Router DOM)
        │   └── AppRoutes.jsx
        ├── utils/                 # Format ngày tháng, badge role, status
        │   └── formatters.js
        ├── App.css                # CSS giao diện người dùng
        ├── index.css              # Design tokens & Global reset
        ├── App.jsx                # Root Component
        └── main.jsx               # Entry point
```

---

## 🛠️ 3. Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu tiên quyết:
- **Node.js** >= 18 (Khuyên dùng v20 hoặc v24)
- **PostgreSQL Server** (Cổng mặc định `5432`)
- **DBeaver** (Trình quản trị trực quan)

### Bước 1: Cài đặt Dependencies
Mở terminal tại thư mục gốc `WebQL`:
```bash
npm run install:all
```

---

### Bước 2: Cấu hình biến môi trường (.env)
Kiểm tra thông tin tài khoản PostgreSQL trong `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Cấu hình PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=webql_db
```

---

### Bước 3: Khởi tạo Cơ sở dữ liệu PostgreSQL (1 chạm tự động)
Chạy lệnh sau tại thư mục gốc:
```bash
npm run db:init
```
Lệnh này sẽ tự động:
1. Kết nối tới máy chủ PostgreSQL (Port 5432).
2. Tự động tạo Database `webql_db` (nếu chưa có).
3. Tạo toàn bộ bảng (`users`, `categories`, `products`), triggers tự động cập nhật thời gian và chỉ mục.
4. Nạp dữ liệu mẫu ban đầu từ `seed.sql`.

---

### Bước 4: Kết nối và xem dữ liệu trên DBeaver
1. Mở phần mềm **DBeaver**.
2. Nhấn **New Database Connection** -> Chọn **PostgreSQL** -> Nhấn **Next**.
3. Điền thông tin:
   * **Host:** `localhost`
   * **Port:** `5432`
   * **Database:** `webql_db`
   * **Username:** `postgres`
   * **Password:** `123456`
4. Bấm **Test Connection...** -> Bấm **Finish**.
5. Bạn có thể xem bảng tại `Databases/webql_db/Schemas/public/Tables` hoặc xem sơ đồ quan hệ tại tab **ER Diagram**.

---

### Bước 5: Khởi chạy dự án

#### Chạy Backend:
```bash
cd backend
npm run dev
```
Server sẽ chạy tại: **`http://localhost:5000/api`** *(tự động reload khi sửa code với Node `--watch`)*.

#### Chạy Frontend:
Mở một tab terminal mới:
```bash
cd frontend
npm run dev
```
Ứng dụng sẽ chạy tại: **`http://localhost:5173`**.

---

## 📡 4. Danh Sách API Endpoints (Backend RESTful)

| Phương thức | Endpoint | Mô tả | Controller xử lý |
| :--- | :--- | :--- | :--- |
| `GET` | `/api` | Thông tin dự án và trạng thái | `HomeController.getStatus` |
| `GET` | `/api/health` | Kiểm tra tài nguyên và uptime hệ thống | `HomeController.getHealth` |
| `GET` | `/api/users` | Lấy danh sách toàn bộ người dùng | `UserController.getUsers` |
| `GET` | `/api/users/:id` | Lấy chi tiết người dùng theo ID | `UserController.getUserById` |
| `POST` | `/api/users` | Tạo một người dùng mới | `UserController.createUser` |
| `PUT` | `/api/users/:id` | Cập nhật thông tin người dùng | `UserController.updateUser` |
| `DELETE` | `/api/users/:id` | Xóa người dùng theo ID | `UserController.deleteUser` |

---

## ✨ 5. Các Điểm Nổi Bật Về Kỹ Thuật

1. **Chuẩn hóa MVC kết hợp Service Layer**: Tách biệt rõ ràng trách nhiệm từng tầng.
2. **PostgreSQL Parameterized Queries**: Chống tấn công SQL Injection tuyệt đối với tham số `$1, $2...` và tận dụng mệnh đề `RETURNING` để lấy dữ liệu bản ghi ngay khi thêm/sửa mà không cần truy vấn lần 2.
3. **Quản lý dữ liệu trực quan bằng DBeaver**: Cung cấp file từ điển dữ liệu ([`DATA_DICTIONARY.md`](file:///d:/Project/WebQL/backend/database/DATA_DICTIONARY.md)) chi tiết cùng hướng dẫn kết nối 1 bước vào DBeaver.
4. **Auto Database Creation & Migrations**: Tự động tạo cơ sở dữ liệu `webql_db` nếu chưa có trên PostgreSQL, nạp triggers tự động cập nhật `updated_at`.
5. **Chuẩn hóa phản hồi API**: Toàn bộ API trả về cấu trúc thống nhất: `{ success: boolean, message: string, data: any, timestamp: string }`.
6. **Frontend React 19 SPA hoàn chỉnh**: Đầy đủ Routing, Layout, State Context, Axios Interceptors, Modal Form CRUD và thông báo Notification thời gian thực.

# 🚀 WebQL - Dự Án Fullstack React + Node.js (Mô Hình MVC Chuẩn Web)

Dự án mẫu Fullstack hiện đại kết hợp **React 19 (Vite)** ở phía Client và **Node.js (Express 5 & MySQL)** ở phía Server, được tổ chức theo chuẩn kiến trúc **MVC (Model - View - Controller)** kết hợp **Service Layer (3-Layer Pattern)** mới nhất cho lập trình Web.

---

## 🏛️ 1. Mô Hình Kiến Trúc MVC & Luồng Hoạt Động

Trong kiến trúc Web hiện đại:

- **Model (M)**: Quản lý cấu trúc dữ liệu, kết nối và thực hiện các câu truy vấn MySQL thông qua connection pool (`backend/src/models/`).
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
                                             │ (SQL Query)
                                             ▼
                                  [ MySQL Database ]
```

---

## 📁 2. Cấu Trúc Thư Mục Dự Án Chi Tiết

```text
WebQL/
├── package.json                   # Quản lý scripts tổng (install:all, dev:...)
├── .gitignore                     # Bỏ qua node_modules, .env cho toàn bộ dự án
├── README.md                      # Hướng dẫn chi tiết
│
├── backend/                       # 🟢 BACKEND (Node.js + Express 5 + MySQL2)
│   ├── .env                       # Biến môi trường thực tế (PORT, DB_*)
│   ├── .env.example               # Biến môi trường mẫu
│   ├── .gitignore                 # Bỏ qua node_modules, .env backend
│   ├── package.json               # Dependencies backend
│   ├── database/                  # 🗄️ NƠI QUẢN LÝ DỮ LIỆU & SCHEMA MYSQL
│   │   ├── schema.sql             # Cấu trúc bảng (users, categories, products)
│   │   ├── seed.sql               # Dữ liệu mẫu ban đầu bằng tiếng Việt
│   │   ├── init.js                # Script 1 chạm tự động khởi tạo MySQL
│   │   ├── DATA_DICTIONARY.md     # Từ điển dữ liệu & sơ đồ ERD Mermaid
│   │   └── README.md              # Hướng dẫn chi tiết về Database
│   └── src/
│       ├── config/                # Cấu hình Database pool & CORS
│       │   ├── db.js              # Kết nối MySQL2 pool & auto create database
│       │   └── cors.js            # Cấu hình CORS Whitelist
│       ├── models/                # [M] MODEL: Tương tác trực tiếp DB
│       │   └── user.model.js      # Truy vấn dữ liệu bảng users
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
│       └── server.js              # Entry point: Khởi động server & kiểm tra kết nối
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
        ├── utils/                 # Format ngày tháng, badge role
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
- **MySQL Server** (XAMPP, Laragon, MySQL Community Server hoặc Docker)

### Bước 1: Cài đặt Dependencies

Mở terminal tại thư mục gốc `WebQL`:

```bash
npm run install:all
```

_(Hoặc vào từng thư mục `cd backend && npm install` và `cd frontend && npm install`)_

---

### Bước 2: Cấu hình biến môi trường (.env)
Kiểm tra thông tin tài khoản MySQL trong `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=webql_db
```

---

### Bước 3: Khởi tạo Cơ sở dữ liệu MySQL (1 câu lệnh duy nhất)
Chạy lệnh sau tại thư mục gốc:
```bash
npm run db:init
```
Lệnh này sẽ tự động kết nối MySQL Server, tạo Database `webql_db`, tạo toàn bộ bảng (`users`, `categories`, `products`) và nạp dữ liệu mẫu từ `seed.sql`.

---

### Bước 4: Khởi chạy dự án

#### Chạy Backend:

```bash
cd backend
npm run dev
```

Server sẽ chạy tại: **`http://localhost:5000/api`** _(tự động reload khi sửa code với Node `--watch`)_.

#### Chạy Frontend:

Mở một tab terminal mới:

```bash
cd frontend
npm run dev
```

Ứng dụng sẽ chạy tại: **`http://localhost:5173`**.

---

## 📡 4. Danh Sách API Endpoints (Backend RESTful)

| Phương thức | Endpoint         | Mô tả                                  | Controller xử lý             |
| :---------- | :--------------- | :------------------------------------- | :--------------------------- |
| `GET`       | `/api`           | Thông tin dự án và trạng thái          | `HomeController.getStatus`   |
| `GET`       | `/api/health`    | Kiểm tra tài nguyên và uptime hệ thống | `HomeController.getHealth`   |
| `GET`       | `/api/users`     | Lấy danh sách toàn bộ người dùng       | `UserController.getUsers`    |
| `GET`       | `/api/users/:id` | Lấy chi tiết người dùng theo ID        | `UserController.getUserById` |
| `POST`      | `/api/users`     | Tạo một người dùng mới                 | `UserController.createUser`  |
| `PUT`       | `/api/users/:id` | Cập nhật thông tin người dùng          | `UserController.updateUser`  |
| `DELETE`    | `/api/users/:id` | Xóa người dùng theo ID                 | `UserController.deleteUser`  |

---

## ✨ 5. Các Điểm Nổi Bật Về Kỹ Thuật

1. **Chuẩn hóa MVC kết hợp Service Layer**: Tách biệt rõ ràng trách nhiệm từng tầng.
2. **Tách biệt `app.js` và `server.js`**: Hỗ trợ viết integration testing (Supertest) dễ dàng mà không bị dính cổng mạng.
3. **Graceful Shutdown**: Tự động đóng kết nối cơ sở dữ liệu và dừng server an toàn khi nhận tín hiệu `SIGINT` / `SIGTERM`.
4. **Auto Table Migration & In-memory Fallback**: Tự động tạo bảng `users` khi kết nối MySQL thành công; tự động dự phòng nếu MySQL chưa bật để phục vụ phát triển nhanh.
5. **Chuẩn hóa phản hồi API**: Toàn bộ API trả về cấu trúc thống nhất: `{ success: boolean, message: string, data: any, timestamp: string }`.
6. **Frontend React 19 SPA hoàn chỉnh**: Đầy đủ Routing, Layout, State Context, Axios Interceptors, Modal Form CRUD và thông báo Notification thời gian thực.

# 🐾 PetHub — Dự Án Fullstack E-Commerce & Pet Services (React 19 + Node.js MVC + PostgreSQL)

Hệ thống Website Bán Hàng & Dịch Vụ Chăm Sóc Thú Cưng Cao Cấp **PetHub**, kết hợp **React 19 (TypeScript, Vite, TailwindCSS)** ở phía Client và **Node.js (Express 5 & PostgreSQL `pg`)** ở phía Server, quản lý cơ sở dữ liệu trực quan bằng **DBeaver**, được tổ chức theo chuẩn kiến trúc **MVC (Model - View - Controller)** kết hợp **Service Layer (3-Layer Pattern)**.

---

## 🏛️ 1. Mô Hình Kiến Trúc MVC & Luồng Hoạt Động

- **Model (M)**: Quản lý cấu trúc dữ liệu, kết nối và thực hiện truy vấn PostgreSQL parameterized (`$1, $2...`) thông qua connection pool (`backend/src/models/`):
  - `UserModel`, `CategoryModel`, `ProductModel`, `CartModel`, `OrderModel`.
- **View (V)**: Ứng dụng Single Page App (SPA) hiện đại bằng React 19 + TypeScript + Framer Motion (`frontend/src/`):
  - Đăng nhập/Đăng ký, Catalog sản phẩm, Giỏ hàng, Đặt hàng (Thành viên & Khách vãng lai), Tra cứu đơn hàng thời gian thực.
- **Controller (C)**: Tiếp nhận HTTP request từ Router, kiểm tra tính hợp lệ cơ bản, gọi tầng Service để xử lý và trả về phản hồi JSON chuẩn hóa cho View (`backend/src/controllers/`):
  - `AuthController`, `UserController`, `CategoryController`, `ProductController`, `CartController`, `OrderController`.
- **Service Layer (S)**: Nằm giữa Controller và Model, chứa toàn bộ logic nghiệp vụ (mã hóa mật khẩu Bcrypt, phát hành JWT token, chốt giá và trừ tồn kho với DB Transaction):
  - `AuthService`, `UserService`, `CategoryService`, `ProductService`, `CartService`, `OrderService`.

### 🔄 Sơ đồ luồng dữ liệu (Data Flow):
```text
[ Người Dùng / Khách Hàng ]
            │ (Tương tác UI: Xem hàng, Thêm giỏ, Đặt hàng, Tra cứu đơn)
            ▼
[ React 19 Client (Frontend) ] ──(Axios Interceptor + JWT Bearer)──> [ Express Router ]
                                                                             │
                                                                             ▼
                                                                     [ Controllers ]
                                                                             │ (Gọi nghiệp vụ)
                                                                             ▼
                                                                     [ Service Layer ]
                                                                             │ (Chốt giá / Validate)
                                                                             ▼
                                                                        [ Models ]
                                                                             │ (SQL Parameterized)
                                                                             ▼
                                                                [ PostgreSQL Database ]
                                                                (Quản lý bằng DBeaver)
```

---

## 📁 2. Cấu Trúc Thư Mục Dự Án Chi Tiết

```text
WebQL/
├── package.json                   # Quản lý scripts tổng (install:all, dev:..., db:init)
├── .gitignore                     # Bỏ qua node_modules, .env cho toàn bộ dự án
├── README.md                      # Hướng dẫn chi tiết
│
├── backend/                       # 🟢 BACKEND (Node.js + Express 5 + PostgreSQL pg + Bcrypt + JWT)
│   ├── .env                       # Biến môi trường thực tế (PORT=5000, DB_PORT=5432, ...)
│   ├── .env.example               # Mẫu biến môi trường
│   ├── .gitignore                 # Bỏ qua node_modules, .env backend
│   ├── package.json               # Dependencies backend (pg, bcryptjs, jsonwebtoken, express, cors)
│   ├── database/                  # 🗄️ NƠI QUẢN LÝ DỮ LIỆU & SCHEMA POSTGRESQL (10 BẢNG)
│   │   ├── schema.sql             # 10 Bảng: roles, users, categories, products, images, orders, items, transactions, carts...
│   │   ├── seed.sql               # Dữ liệu mẫu ban đầu tiếng Việt (ON CONFLICT)
│   │   ├── init.js                # Script 1 chạm tự động tạo DB & nạp dữ liệu vào PostgreSQL
│   │   ├── DATA_DICTIONARY.md     # Từ điển dữ liệu, sơ đồ ERD & hướng dẫn DBeaver
│   │   └── README.md              # Hướng dẫn chi tiết về Database & DBeaver
│   └── src/
│       ├── config/                # Cấu hình Database pool, CORS & JWT
│       │   ├── db.js              # Kết nối PostgreSQL (pg.Pool) & auto create database
│       │   ├── cors.js            # Cấu hình CORS Whitelist
│       │   └── jwt.js             # Cấu hình Secret & Token Expiration
│       ├── models/                # [M] MODEL: Tương tác DB qua pg.Pool
│       │   ├── user.model.js      # Users & Roles (hội viên, nhân viên, admin)
│       │   ├── category.model.js  # Danh mục sản phẩm
│       │   ├── product.model.js   # Sản phẩm & Gallery ảnh (product_images)
│       │   ├── cart.model.js      # Carts & Cart_Items
│       │   └── order.model.js     # Orders, Order_Items & Transactions (DB Transaction)
│       ├── controllers/           # [C] CONTROLLER: Xử lý Request/Response
│       │   ├── auth.controller.js # Đăng ký, đăng nhập, hồ sơ, đổi mật khẩu
│       │   ├── user.controller.js # CRUD người dùng (Admin)
│       │   ├── category.controller.js # CRUD danh mục
│       │   ├── product.controller.js  # Tìm kiếm, lọc, CRUD sản phẩm & ảnh
│       │   ├── cart.controller.js     # Thêm/sửa/xóa giỏ hàng
│       │   ├── order.controller.js    # Đặt hàng, tra cứu mã đơn, đổi trạng thái
│       │   └── home.controller.js     # Trạng thái máy chủ & Healthcheck
│       ├── services/              # [S] SERVICE: Business Logic & Security
│       │   ├── auth.service.js    # Mã hóa Bcrypt & phát hành JWT token
│       │   ├── user.service.js    # Kiểm tra ràng buộc tài khoản
│       │   ├── category.service.js# Logic danh mục
│       │   ├── product.service.js # Logic sản phẩm, SKU và ảnh
│       │   ├── cart.service.js    # Logic giỏ hàng
│       │   └── order.service.js   # Chốt giá sản phẩm, trừ tồn kho, transaction
│       ├── routes/                # ROUTER: Định tuyến API
│       │   ├── index.js           # Router trung tâm (/api)
│       │   ├── auth.routes.js     # /api/auth
│       │   ├── user.routes.js     # /api/users
│       │   ├── category.routes.js # /api/categories
│       │   ├── product.routes.js  # /api/products
│       │   ├── cart.routes.js     # /api/cart
│       │   └── order.routes.js    # /api/orders
│       ├── middlewares/           # MIDDLEWARES: Bảo mật & Xử lý trung gian
│       │   ├── auth.js            # JWT authenticate, optionalAuth, requireRole
│       │   ├── errorHandler.js    # Xử lý lỗi toàn cục
│       │   └── notFound.js        # Bắt lỗi 404 Not Found
│       ├── utils/                 # TIỆN ÍCH DÙNG CHUNG
│       │   ├── jwt.js             # Ký & xác thực JWT
│       │   ├── password.js        # Bcrypt hash & compare
│       │   └── response.js        # Chuẩn hóa format JSON (sendSuccess, sendError)
│       ├── app.js                 # Cấu hình Express app & middlewares
│       └── server.js              # Entry point: Khởi động HTTP server
│
└── frontend/                      # 🔵 FRONTEND [V] VIEW (React 19 + TypeScript + Vite + TailwindCSS)
    ├── .env                       # Biến môi trường (VITE_API_BASE_URL=http://localhost:5000/api)
    ├── package.json               # Dependencies: React 19, TypeScript, Axios, Lucide, Framer Motion
    ├── vite.config.js             # Cấu hình Vite
    ├── index.html                 # Template HTML (PetHub)
    └── src/
        ├── App.tsx                # Giao diện chính PetHub (Catalog, Cart, Auth, Checkout, Lookup)
        ├── main.tsx               # Entry point
        ├── index.css              # TailwindCSS & Styling
        ├── components/            # UI Components (AccountPage, Headers, Footers, Dialogs, TiltCard)
        ├── data/                  # Mock data dự phòng (categories, mockData)
        ├── services/              # Tầng gọi Backend API
        │   ├── api.ts             # Axios Client & Bearer JWT Interceptor
        │   ├── authService.ts     # Đăng ký, đăng nhập, hồ sơ cá nhân
        │   ├── productService.ts  # Lấy danh sách sản phẩm & danh mục
        │   ├── orderService.ts    # Đặt hàng & Tra cứu đơn hàng theo mã/SĐT
        │   └── cartService.ts     # Thao tác giỏ hàng
        └── lib/                   # Utility functions
```

---

## 🛠️ 3. Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu tiên quyết:
- **Node.js** >= 18 (Khuyên dùng v20 hoặc v24)
- **PostgreSQL Server** (Cổng mặc định `5432`)
- **DBeaver** (Quản trị cơ sở dữ liệu trực quan)

---

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
DB_NAME=postgres

# JWT
JWT_ACCESS_SECRET=pethub_access_super_secret_key_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=pethub_refresh_super_secret_key_2026
JWT_REFRESH_EXPIRES_IN=7d
```

---

### Bước 3: Khởi tạo & Đồng bộ Cơ sở dữ liệu PostgreSQL (1 chạm tự động)
Chạy lệnh sau tại thư mục gốc:
```bash
npm run db:init
```
Lệnh này sẽ tự động:
1. Kết nối vào PostgreSQL Server qua cổng **5432**.
2. Đồng bộ trực tiếp vào Database mặc định **`postgres`** (tự động xóa bỏ database thừa `webql_db` nếu có).
3. Tạo đầy đủ **16 bảng quan hệ**: `roles`, `users`, `categories`, `products`, `product_images`, `inventory_logs`, `orders`, `order_items`, `services`, `appointments`, `transactions`, `carts`, `cart_items`, `banners`, `site_settings`, `audit_logs`.
4. Nạp sẵn các tài khoản kiểm thử (mật khẩu chung: `123456`):
   - **Admin:** `admin@pethub.com`
   - **Manager:** `manager@pethub.com`
   - **Staff:** `staff@pethub.com`
   - **Khách hàng:** `khoa.trinh@pethub.vn` hoặc `dreams@gmail.com`
5. Nạp danh mục, sản phẩm, ảnh bìa, dịch vụ Spa mẫu khớp với giao diện Frontend.

---

### Bước 4: Kết nối bằng DBeaver
1. Mở phần mềm **DBeaver** -> Nhấn **New Database Connection** -> Chọn **PostgreSQL** -> Bấm **Next**.
2. Nhập thông số: Host `localhost`, Port `5432`, Database `postgres`, Username `postgres`, Password `123456`.
3. Bấm **Test Connection...** -> Bấm **Finish**.
4. Truy cập `Databases/postgres/Schemas/public/Tables` để xem toàn bộ 16 bảng dữ liệu.

---

### Bước 5: Khởi chạy dự án

#### Khởi động Backend (Port 5000):
```bash
cd backend
npm run dev
```

#### Khởi động Frontend (Port 5173):
Mở một tab terminal mới:
```bash
cd frontend
npm run dev
```
Truy cập trình duyệt: **`http://localhost:5173`**.

---

## 📡 4. Danh Sách API Endpoints (Backend RESTful)

| Phương thức | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản hội viên mới | Public |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản | Public |
| `GET` | `/api/auth/profile` | Lấy thông tin cá nhân | Đã đăng nhập |
| `PUT` | `/api/auth/profile` | Cập nhật hồ sơ cá nhân | Đã đăng nhập |
| `PUT` | `/api/auth/change-password`| Đổi mật khẩu | Đã đăng nhập |
| `GET` | `/api/products` | Lấy danh sách sản phẩm (tìm kiếm, lọc giá, danh mục) | Public |
| `GET` | `/api/products/:id` | Lấy chi tiết sản phẩm kèm gallery ảnh | Public |
| `POST` | `/api/products` | Tạo sản phẩm mới | Admin, Staff |
| `PUT` | `/api/products/:id` | Sửa thông tin sản phẩm | Admin, Staff |
| `DELETE`| `/api/products/:id`| Ẩn sản phẩm | Admin |
| `GET` | `/api/categories` | Lấy danh sách danh mục sản phẩm | Public |
| `POST` | `/api/categories` | Tạo danh mục | Admin, Staff |
| `POST` | `/api/orders` | Đặt hàng mới (Guest & Thành viên) | Public / Optional Auth |
| `GET` | `/api/orders` | Danh sách đơn hàng (User xem đơn mình, Admin xem tất cả) | Đã đăng nhập |
| `GET` | `/api/orders/lookup` | Tra cứu đơn hàng theo Mã đơn và Số điện thoại | Public |
| `GET` | `/api/orders/stats` | Thống kê doanh thu & đơn hàng | Admin, Staff |
| `PUT` | `/api/orders/:id/status`| Cập nhật trạng thái đơn (Pending, Shipping, Completed...)| Admin, Staff |
| `GET` | `/api/cart` | Lấy giỏ hàng của thành viên | Đã đăng nhập |
| `POST` | `/api/cart/items` | Thêm sản phẩm vào giỏ hàng | Đã đăng nhập |
| `PUT` | `/api/cart/items/:id` | Cập nhật số lượng sản phẩm trong giỏ | Đã đăng nhập |
| `DELETE`| `/api/cart/items/:id`| Xóa sản phẩm khỏi giỏ hàng | Đã đăng nhập |
| `GET` | `/api/users` | Quản lý danh sách người dùng | Admin, Staff |

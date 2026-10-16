import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userService from "../services/userService";

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    const checkServer = async () => {
      try {
        const data = await userService.checkHealth();
        setBackendStatus({
          loading: false,
          connected: true,
          data,
          error: null,
        });
      } catch (err) {
        setBackendStatus({
          loading: false,
          connected: false,
          data: null,
          error: err.message,
        });
      }
    };

    checkServer();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">⚡ Fullstack Architecture 2026</span>
          <h1 className="hero-title">
            Dự Án Web Chuẩn{" "}
            <span className="text-gradient">React + Node.js (MVC)</span>
          </h1>
          <p className="hero-description">
            Cấu trúc phân tầng rõ ràng, tách biệt hoàn toàn giữa{" "}
            <strong>Model</strong> (Dữ liệu MySQL), <strong>View</strong> (Giao
            diện React), và <strong>Controller</strong> (Bộ điều phối Express
            API).
          </p>

          <div className="hero-buttons">
            <Link to="/users" className="btn btn-primary btn-lg">
              🚀 Trải Nghiệm Quản Lý Người Dùng
            </Link>
            <a
              href="http://localhost:5000/api"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-lg"
            >
              📡 Xem Backend API (Port 5000)
            </a>
          </div>
        </div>

        {/* Server Status Box */}
        <div className="server-status-card">
          <div className="status-header">
            <span className="card-icon">🖥️</span>
            <h3>Trạng Thái Kết Nối Backend</h3>
          </div>
          <div className="status-body">
            {backendStatus.loading ? (
              <p className="status-loading">⏳ Đang kiểm tra kết nối API...</p>
            ) : backendStatus.connected ? (
              <div className="status-connected">
                <div className="status-indicator online">
                  <span className="dot"></span>
                  <strong>Backend Đang Hoạt Động (Online)</strong>
                </div>
                <ul className="status-details">
                  <li>
                    <strong>Endpoint:</strong>{" "}
                    <code>http://localhost:5000/api</code>
                  </li>
                  <li>
                    <strong>Uptime:</strong>{" "}
                    {Math.round(backendStatus.data?.uptime || 0)} giây
                  </li>
                  <li>
                    <strong>Kiến trúc:</strong> Express 5 + MySQL2 Pool
                  </li>
                </ul>
              </div>
            ) : (
              <div className="status-disconnected">
                <div className="status-indicator offline">
                  <span className="dot"></span>
                  <strong>Chưa kết nối được Backend</strong>
                </div>
                <p className="status-hint">
                  👉 Hãy mở terminal và chạy:{" "}
                  <code>cd backend && npm run dev</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Architecture Overview Section */}
      <section className="architecture-section">
        <h2 className="section-title">📐 Mô Hình MVC Trong Dự Án Web</h2>
        <p className="section-subtitle">
          Giải thích cách các thành phần trong dự án tương tác với nhau theo
          tiêu chuẩn web hiện đại
        </p>

        <div className="architecture-grid">
          <div className="arch-card">
            <div className="arch-badge model">M - Model</div>
            <h3>Tầng Dữ Liệu</h3>
            <p>
              <strong>Thư mục:</strong> <code>backend/src/models/</code>
            </p>
            <p>
              Trực tiếp tương tác với cơ sở dữ liệu MySQL thông qua{" "}
              <code>mysql2/promise</code> pool. Thực hiện truy vấn CRUD dữ liệu
              bảng <code>users</code>.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-badge view">V - View</div>
            <h3>Tầng Giao Diện</h3>
            <p>
              <strong>Thư mục:</strong> <code>frontend/src/</code>
            </p>
            <p>
              Ứng dụng Single Page App xây dựng bằng React 19 + Vite. Đóng vai
              trò là View, hiển thị dữ liệu và tiếp nhận thao tác của người
              dùng.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-badge controller">C - Controller</div>
            <h3>Tầng Điều Phối</h3>
            <p>
              <strong>Thư mục:</strong> <code>backend/src/controllers/</code>
            </p>
            <p>
              Nhận request từ Router, kiểm tra tính hợp lệ cơ bản, gọi
              Service/Model xử lý và định dạng response JSON trả về cho
              Frontend.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-badge service">S - Service Layer</div>
            <h3>Tầng Nghiệp Vụ</h3>
            <p>
              <strong>Thư mục:</strong> <code>backend/src/services/</code>
            </p>
            <p>
              Tách biệt hoàn toàn Business Logic ra khỏi Controller. Đảm bảo mã
              nguồn dễ bảo trì, dễ viết Unit Test và chuẩn thiết kế Clean
              Architecture.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

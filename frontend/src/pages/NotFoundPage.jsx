import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2>Trang Không Tồn Tại</h2>
        <p>Đường dẫn bạn vừa truy cập không hợp lệ hoặc đã bị thay đổi.</p>
        <Link to="/" className="btn btn-primary">
          🏠 Quay Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <NavLink to="/" className="brand-logo">
          <span className="brand-badge">MVC</span>
          <span className="brand-name">WebQL</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            🏠 Trang Chủ
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            👥 Quản Lý Người Dùng
          </NavLink>
        </nav>

        <div className="header-status">
          <span className="status-dot"></span>
          <span className="status-text">React 19 + Node.js MVC</span>
        </div>
      </div>
    </header>
  );
}

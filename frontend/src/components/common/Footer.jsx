export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p className="footer-copyright">
          © {currentYear} <strong>WebQL</strong> — Dự án Mẫu Chuẩn MVC Web
          (React 19 & Node.js Express & MySQL).
        </p>
        <div className="footer-badges">
          <span className="badge">Model (MySQL)</span>
          <span className="badge">View (React)</span>
          <span className="badge">Controller (Express)</span>
          <span className="badge">Service Layer</span>
        </div>
      </div>
    </footer>
  );
}

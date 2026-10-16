export default function LoadingSpinner({ text = "Đang tải dữ liệu..." }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
}

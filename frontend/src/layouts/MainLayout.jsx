import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useApp } from "../context/AppContext";

export default function MainLayout() {
  const { notification, clearNotification } = useApp();

  return (
    <div className="layout-wrapper">
      <Header />

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <div className="notification-content">
            <span>{notification.message}</span>
            <button className="notification-close" onClick={clearNotification}>
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

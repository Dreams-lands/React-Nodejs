import { useState, useEffect } from "react";
import userService from "../services/userService";
import UserCard from "../components/users/UserCard";
import UserForm from "../components/users/UserForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useApp } from "../context/AppContext";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useApp();

  // Tải danh sách người dùng từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      showNotification(
        error.message || "Không thể tải danh sách người dùng",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý thêm mới hoặc cập nhật
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingUser) {
        // Cập nhật
        const updated = await userService.update(editingUser.id, formData);
        setUsers(users.map((u) => (u.id === editingUser.id ? updated : u)));
        showNotification(
          "Cập nhật thông tin người dùng thành công!",
          "success",
        );
      } else {
        // Thêm mới
        const created = await userService.create(formData);
        setUsers([created, ...users]);
        showNotification("Thêm người dùng mới thành công!", "success");
      }
      setShowForm(false);
      setEditingUser(null);
    } catch (error) {
      showNotification(error.message || "Lỗi khi lưu người dùng", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý xóa
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?"))
      return;

    try {
      await userService.delete(id);
      setUsers(users.filter((u) => u.id !== id));
      showNotification("Đã xóa người dùng thành công!", "success");
    } catch (error) {
      showNotification(error.message || "Không thể xóa người dùng", "error");
    }
  };

  // Bắt đầu chỉnh sửa
  const handleStartEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="users-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Quản Lý Người Dùng</h1>
          <p className="page-subtitle">
            Minh họa toàn bộ luồng hoạt động MVC (View React ↔ Controller API ↔
            Service ↔ Model ↔ MySQL)
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "✕ Đóng Biểu Mẫu" : "➕ Thêm Người Dùng"}
        </button>
      </div>

      {/* Form thêm/sửa người dùng */}
      {showForm && (
        <div className="form-card-wrapper">
          <UserForm
            initialData={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Thanh tìm kiếm và thống kê */}
      <div className="toolbar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>
        <div className="stats-badge">
          Tổng số: <strong>{filteredUsers.length}</strong> người dùng
        </div>
      </div>

      {/* Danh sách người dùng */}
      {loading ? (
        <LoadingSpinner text="Đang đồng bộ dữ liệu từ Backend..." />
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>Không tìm thấy người dùng nào</h3>
          <p>
            {searchTerm
              ? "Không có kết quả phù hợp với từ khóa tìm kiếm của bạn."
              : 'Chưa có người dùng nào trong cơ sở dữ liệu. Nhấn "Thêm Người Dùng" để tạo mới!'}
          </p>
          {!searchTerm && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingUser(null);
                setShowForm(true);
              }}
            >
              ➕ Thêm Người Dùng Ngay
            </button>
          )}
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onDelete={handleDeleteUser}
              onEdit={handleStartEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

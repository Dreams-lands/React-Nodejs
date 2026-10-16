import { formatDate, getRoleBadgeClass, getStatusBadge } from '../../utils/formatters'

export default function UserCard({ user, onDelete, onEdit }) {
  const statusInfo = getStatusBadge(user.status)

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <div className="user-name-row">
            <h3 className="user-name">{user.name}</h3>
            <span className={`status-pill ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="user-email">{user.email}</p>
        </div>
        <span className={`user-role-badge ${getRoleBadgeClass(user.role)}`}>
          {user.role}
        </span>
      </div>

      <div className="user-card-footer">
        <span className="user-date">
          🕒 {formatDate(user.createdAt || user.created_at)}
        </span>
        <div className="user-actions">
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="btn btn-sm btn-secondary"
              title="Chỉnh sửa"
            >
              ✏️ Sửa
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(user.id)}
              className="btn btn-sm btn-danger"
              title="Xóa người dùng"
            >
              🗑️ Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Các hàm tiện ích định dạng dữ liệu hiển thị trên giao diện (Frontend Utils)
 */

export const formatDate = (dateString) => {
  if (!dateString) return '---'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch (error) {
    return String(dateString)
  }
}

export const getRoleBadgeClass = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'badge-admin'
    case 'editor':
      return 'badge-editor'
    case 'user':
    default:
      return 'badge-user'
  }
}

export const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { label: 'Hoạt động', className: 'status-tag-active' }
    case 'inactive':
      return { label: 'Tạm khóa', className: 'status-tag-inactive' }
    case 'banned':
      return { label: 'Bị cấm', className: 'status-tag-banned' }
    default:
      return { label: 'Hoạt động', className: 'status-tag-active' }
  }
}

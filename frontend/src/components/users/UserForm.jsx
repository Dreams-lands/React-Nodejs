import { useState, useEffect } from 'react'

export default function UserForm({ onSubmit, initialData = null, onCancel, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || 'user',
        status: initialData.status || 'active',
      })
    } else {
      setFormData({ name: '', email: '', role: 'user', status: 'active' })
    }
  }, [initialData])

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData)
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3 className="form-title">
        {initialData ? '✏️ Cập Nhật Người Dùng' : '➕ Thêm Người Dùng Mới'}
      </h3>

      <div className="form-group">
        <label htmlFor="name">Họ và Tên <span className="required">*</span></label>
        <input
          id="name"
          type="text"
          placeholder="Ví dụ: Nguyễn Văn A"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'input-error' : ''}
          disabled={isSubmitting}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Địa Chỉ Email <span className="required">*</span></label>
        <input
          id="email"
          type="email"
          placeholder="Ví dụ: user@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? 'input-error' : ''}
          disabled={isSubmitting}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="role">Vai Trò (Role)</label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            disabled={isSubmitting}
          >
            <option value="user">User (Người dùng thường)</option>
            <option value="editor">Editor (Biên tập viên)</option>
            <option value="admin">Admin (Quản trị viên)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Trạng Thái (Status)</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            disabled={isSubmitting}
          >
            <option value="active">Active (Đang hoạt động)</option>
            <option value="inactive">Inactive (Tạm khóa)</option>
            <option value="banned">Banned (Bị cấm)</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : initialData ? 'Lưu Thay Đổi' : 'Thêm Mới'}
        </button>
      </div>
    </form>
  )
}

import React, { useState } from 'react';
import {
  User,
  MapPin,
  Package,
  CalendarCheck,
  Heart,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Search,
  Sparkles,
} from 'lucide-react';
import type { ConfirmDialogState } from './ConfirmDialog';
import type {
  PageId,
  ProductItem,
  AddressRecord,
  OrderRecord,
  OrderStatus,
  ServiceBookingRecord,
} from '../data/mockData';
import { formatCurrency, ORDER_STATUS_META } from '../data/mockData';

export type AccountTab =
  | 'profile'
  | 'address'
  | 'orders'
  | 'bookings'
  | 'wishlist'
  | 'password';

interface AccountPageProps {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  userPhone: string;
  userGender: string;
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  onUpdateProfile: (data: {
    name: string;
    email: string;
    phone: string;
    gender: string;
  }) => void;
  addresses: AddressRecord[];
  onAddAddress: (addr: Omit<AddressRecord, 'id'>) => void;
  onUpdateAddress: (addr: AddressRecord) => void;
  onSetDefaultAddress: (id: string) => void;
  onDeleteAddress: (id: string) => void;
  onRequestConfirm: (dialog: ConfirmDialogState) => void;
  orders: OrderRecord[];
  bookings: ServiceBookingRecord[];
  likedProducts: ProductItem[];
  onToggleLike: (id: string) => void;
  onAddToCart: (product: ProductItem, qty?: number) => void;
  onBuyAgain: (order: OrderRecord) => void;
  onOpenProduct: (id: string) => void;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  isLoggedIn,
  userName,
  userEmail,
  userPhone,
  userGender,
  activeTab,
  onTabChange,
  onUpdateProfile,
  addresses,
  onAddAddress,
  onUpdateAddress,
  onSetDefaultAddress,
  onDeleteAddress,
  onRequestConfirm,
  orders,
  bookings,
  likedProducts,
  onToggleLike,
  onAddToCart,
  onBuyAgain,
  onOpenProduct,
  onNavigate,
  onLogout,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [phoneInput, setPhoneInput] = useState(userPhone);
  const [genderInput, setGenderInput] = useState(userGender);
  const [profileSaved, setProfileSaved] = useState(false);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Nhà riêng');
  const [addrRecipient, setAddrRecipient] = useState(userName);
  const [addrPhone, setAddrPhone] = useState(userPhone);
  const [addrDetail, setAddrDetail] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'all' | OrderStatus
  >('all');
  const [orderSearch, setOrderSearch] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#dfe6f0] shadow-[0_8px_24px_rgba(23,50,77,0.06)] p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#eff5ff] text-[#0667d0] flex items-center justify-center mb-5">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#17324d] mb-2">
            Đăng nhập để quản lý tài khoản
          </h1>
          <p className="text-sm text-[#52657a] max-w-md mx-auto mb-7">
            Theo dõi đơn hàng, quản lý địa chỉ giao hàng, xem lại lịch hẹn spa và danh sách sản phẩm yêu thích của bạn tại PetsFriend.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="px-6 py-3 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white font-semibold text-sm transition cursor-pointer"
            >
              Đăng nhập ngay
            </button>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-6 py-3 rounded-xl border border-[#dfe6f0] bg-white hover:bg-[#f6f8fb] text-[#17324d] font-semibold text-sm transition cursor-pointer"
            >
              Tạo tài khoản mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: {
    id: AccountTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'profile', label: 'Hồ sơ của tôi', icon: User },
    { id: 'address', label: 'Địa chỉ nhận hàng', icon: MapPin },
    {
      id: 'orders',
      label: 'Đơn mua',
      icon: Package,
      badge: orders.length || undefined,
    },
    {
      id: 'bookings',
      label: 'Lịch hẹn chăm sóc',
      icon: CalendarCheck,
      badge: bookings.length || undefined,
    },
    {
      id: 'wishlist',
      label: 'Sản phẩm yêu thích',
      icon: Heart,
      badge: likedProducts.length || undefined,
    },
    { id: 'password', label: 'Đổi mật khẩu', icon: ShieldCheck },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: nameInput.trim() || userName,
      email: emailInput.trim() || userEmail,
      phone: phoneInput.trim() || userPhone,
      gender: genderInput,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2600);
  };

  const openAddAddressForm = () => {
    if (showAddAddress && editingAddressId === null) {
      setShowAddAddress(false);
      return;
    }
    setEditingAddressId(null);
    setAddrLabel('Nhà riêng');
    setAddrRecipient(userName);
    setAddrPhone(userPhone);
    setAddrDetail('');
    setAddrDefault(false);
    setShowAddAddress(true);
  };

  const openEditAddressForm = (addr: AddressRecord) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label);
    setAddrRecipient(addr.recipient);
    setAddrPhone(addr.phone);
    setAddrDetail(addr.address);
    setAddrDefault(addr.isDefault);
    setShowAddAddress(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient.trim() || !addrPhone.trim() || !addrDetail.trim()) {
      return;
    }
    const payload = {
      label: addrLabel.trim() || 'Địa chỉ khác',
      recipient: addrRecipient.trim(),
      phone: addrPhone.trim(),
      address: addrDetail.trim(),
      isDefault: addrDefault || addresses.length === 0,
    };
    if (editingAddressId) {
      onUpdateAddress({ id: editingAddressId, ...payload });
    } else {
      onAddAddress(payload);
    }
    setEditingAddressId(null);
    setAddrDetail('');
    setAddrDefault(false);
    setShowAddAddress(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'Vui lòng điền đầy đủ thông tin mật khẩu.',
      });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'Mật khẩu mới cần tối thiểu 6 ký tự.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'Mật khẩu xác nhận không khớp.',
      });
      return;
    }
    onRequestConfirm({
      title: 'Xác nhận đổi mật khẩu',
      message: 'Bạn chắc chắn muốn cập nhật mật khẩu mới cho tài khoản PetsFriend ngay bây giờ?',
      confirmLabel: 'Xác nhận đổi',
      tone: 'primary',
      onConfirm: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordFeedback({
          type: 'success',
          text: 'Cập nhật mật khẩu tài khoản thành công.',
        });
      },
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
      return false;
    }
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      order.id.toLowerCase().includes(q) ||
      order.items.some((item) => item.name.toLowerCase().includes(q))
    );
  });

  const avatarInitial = (userName.trim().charAt(0) || 'K').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#52657a] mb-5">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="hover:text-[#0667d0] transition cursor-pointer"
        >
          Trang chủ
        </button>
        <span>/</span>
        <span className="font-semibold text-[#17324d]">Tài khoản của tôi</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Shopee-style Left Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-[#dfe6f0] p-4 sm:p-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#eef2f7]">
              <div className="w-12 h-12 rounded-full bg-[#0667d0] text-white font-bold text-lg flex items-center justify-center shrink-0">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-bold text-[#17324d] truncate">
                  {userName}
                </div>
                <div className="text-xs text-[#52657a] flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0667d0]" />
                  <span>Hội viên PetsFriend</span>
                </div>
              </div>
            </div>

            <nav
              aria-label="Menu tài khoản"
              className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-[13.5px] font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-[#eff5ff] text-[#0667d0] font-semibold'
                        : 'text-[#334155] hover:bg-[#f6f8fb] hover:text-[#17324d]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#0667d0]' : 'text-[#52657a]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isActive
                            ? 'bg-[#0667d0] text-white'
                            : 'bg-[#eef2f7] text-[#52657a]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[13.5px] font-medium text-[#dc2626] hover:bg-red-50 transition cursor-pointer col-span-2 sm:col-span-3 lg:col-span-1 mt-1 lg:border-t lg:border-[#eef2f7] lg:pt-3"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Panel */}
        <section className="lg:col-span-9 min-w-0">
          {/* 1. Hồ sơ của tôi */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#dfe6f0] p-5 sm:p-7">
              <div className="border-b border-[#eef2f7] pb-4 mb-6">
                <h1 className="text-xl font-bold text-[#17324d]">
                  Hồ sơ của tôi
                </h1>
                <p className="text-sm text-[#52657a] mt-1">
                  Quản lý thông tin liên hệ để đặt hàng & đặt lịch chăm sóc nhanh hơn.
                </p>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#17324d] mb-1.5">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] text-sm text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#17324d] mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] text-sm text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#17324d] mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] text-sm text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                        placeholder="09xx xxx xxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#17324d] mb-2">
                      Giới tính
                    </label>
                    <div className="flex flex-wrap gap-4 text-sm text-[#17324d]">
                      {['Nam', 'Nữ', 'Khác'].map((g) => (
                        <label
                          key={g}
                          className="inline-flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={genderInput === g}
                            onChange={() => setGenderInput(g)}
                            className="accent-[#0667d0]"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-sm font-semibold transition cursor-pointer"
                    >
                      Lưu thay đổi
                    </button>
                    {profileSaved && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã cập nhật hồ sơ
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4 md:border-l md:border-[#eef2f7] md:pl-8 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full bg-[#eff5ff] border-4 border-white shadow-[0_6px_18px_rgba(6,103,208,0.16)] text-[#0667d0] text-3xl font-bold flex items-center justify-center mb-3">
                    {avatarInitial}
                  </div>
                  <div className="text-sm font-bold text-[#17324d]">
                    {nameInput || userName}
                  </div>
                  <div className="text-xs text-[#52657a] mt-1">
                    {orders.length} đơn hàng • {bookings.length} lịch hẹn Spa
                  </div>
                  <span className="mt-3 px-3 py-1 rounded-full bg-[#eff5ff] text-[#0667d0] text-xs font-semibold">
                    Thành viên thân thiết
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* 2. Địa chỉ nhận hàng */}
          {activeTab === 'address' && (
            <div className="bg-white rounded-2xl border border-[#dfe6f0] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] pb-4 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-[#17324d]">
                    Địa chỉ nhận hàng
                  </h1>
                  <p className="text-sm text-[#52657a] mt-1">
                    Địa chỉ mặc định sẽ được điền sẵn khi bạn thanh toán đơn hàng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddAddressForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-sm font-semibold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm địa chỉ mới</span>
                </button>
              </div>

              {showAddAddress && (
                <form
                  onSubmit={handleSaveAddress}
                  className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#f8fafd] border border-[#dfe6f0] space-y-4"
                >
                  <div className="text-sm font-bold text-[#17324d]">
                    {editingAddressId
                      ? 'Chỉnh sửa địa chỉ giao hàng'
                      : 'Thêm địa chỉ giao hàng mới'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="Loại (Nhà riêng / Văn phòng)"
                      className="px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] bg-white text-sm focus:outline-none focus:border-[#0667d0]"
                    />
                    <input
                      type="text"
                      required
                      value={addrRecipient}
                      onChange={(e) => setAddrRecipient(e.target.value)}
                      placeholder="Tên người nhận"
                      className="px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] bg-white text-sm focus:outline-none focus:border-[#0667d0]"
                    />
                    <input
                      type="tel"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="Số điện thoại"
                      className="px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] bg-white text-sm focus:outline-none focus:border-[#0667d0]"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={addrDetail}
                    onChange={(e) => setAddrDetail(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] bg-white text-sm focus:outline-none focus:border-[#0667d0]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-[#17324d] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addrDefault}
                        onChange={(e) => setAddrDefault(e.target.checked)}
                        className="accent-[#0667d0] rounded"
                      />
                      <span>Đặt làm địa chỉ mặc định</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAddress(false);
                          setEditingAddressId(null);
                        }}
                        className="px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-sm font-medium text-[#52657a] hover:bg-[#f6f8fb] cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-sm font-semibold cursor-pointer"
                      >
                        {editingAddressId ? 'Lưu thay đổi' : 'Lưu địa chỉ'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      addr.isDefault
                        ? 'border-[#9ec5f8] bg-[#f8fbff]'
                        : 'border-[#dfe6f0] bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[15px] text-[#17324d]">
                          {addr.recipient}
                        </span>
                        <span className="text-[#cbd5e1]">|</span>
                        <span className="text-sm text-[#52657a]">
                          {addr.phone}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#eef2f7] text-[#334155] text-[11px] font-semibold">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#eff5ff] border border-[#b9d7ff] text-[#0667d0] text-[11px] font-semibold">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#334155]">{addr.address}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditAddressForm(addr)}
                        aria-label="Sửa địa chỉ"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dfe6f0] bg-white hover:border-[#0667d0] hover:text-[#0667d0] text-xs font-semibold text-[#17324d] transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => onSetDefaultAddress(addr.id)}
                          className="px-3 py-1.5 rounded-xl border border-[#dfe6f0] bg-white hover:border-[#0667d0] hover:text-[#0667d0] text-xs font-semibold text-[#17324d] transition cursor-pointer"
                        >
                          Thiết lập mặc định
                        </button>
                      )}
                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onRequestConfirm({
                              title: 'Xóa địa chỉ giao hàng',
                              message: `Bạn có chắc chắn muốn xóa địa chỉ "${addr.address}" khỏi sổ địa chỉ không?`,
                              confirmLabel: 'Xóa địa chỉ',
                              tone: 'danger',
                              onConfirm: () => onDeleteAddress(addr.id),
                            })
                          }
                          aria-label="Xóa địa chỉ"
                          className="p-2 rounded-xl border border-[#dfe6f0] bg-white hover:bg-red-50 hover:border-red-200 text-[#52657a] hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Đơn mua (Shopee status tabs) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#dfe6f0] overflow-hidden">
                <div className="flex overflow-x-auto border-b border-[#eef2f7]">
                  {(
                    [
                      { id: 'all', label: 'Tất cả' },
                      { id: 'pending', label: 'Chờ xác nhận' },
                      { id: 'shipping', label: 'Đang giao' },
                      { id: 'completed', label: 'Hoàn thành' },
                      { id: 'cancelled', label: 'Đã hủy' },
                    ] as { id: 'all' | OrderStatus; label: string }[]
                  ).map((tab) => {
                    const isActive = orderStatusFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setOrderStatusFilter(tab.id)}
                        className={`flex-1 min-w-[115px] px-4 py-3.5 text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'border-[#0667d0] text-[#0667d0] bg-[#f8fbff]'
                            : 'border-transparent text-[#52657a] hover:text-[#17324d]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-[#f8fafd] border-b border-[#eef2f7]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#52657a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dfe6f0] bg-white text-sm text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                    />
                  </div>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#dfe6f0] p-10 text-center">
                  <Package className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                  <h2 className="text-base font-bold text-[#17324d] mb-1">
                    Chưa có đơn hàng phù hợp
                  </h2>
                  <p className="text-sm text-[#52657a] mb-5">
                    Không tìm thấy đơn hàng nào trong mục này.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('search')}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-sm font-semibold transition cursor-pointer"
                  >
                    <span>Mua sắm ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusMeta = ORDER_STATUS_META[order.status];
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#dfe6f0] p-4 sm:p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#eef2f7]">
                        <div className="flex flex-wrap items-center gap-2.5 text-sm">
                          <span className="font-bold text-[#17324d]">
                            Mã đơn: #{order.id}
                          </span>
                          <span className="text-[#cbd5e1]">•</span>
                          <span className="text-xs sm:text-sm text-[#52657a]">
                            {order.createdAt}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="divide-y divide-[#eef2f7]">
                        {order.items.map((item) => (
                          <div
                            key={`${order.id}-${item.id}`}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-xl object-cover border border-[#dfe6f0] shrink-0 bg-[#f6f8fb]"
                              />
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => onOpenProduct(item.id)}
                                  className="text-sm font-semibold text-[#17324d] hover:text-[#0667d0] text-left line-clamp-2 cursor-pointer"
                                >
                                  {item.name}
                                </button>
                                <div className="text-xs text-[#52657a] mt-1">
                                  {item.variant
                                    ? `${item.variant} • `
                                    : ''}
                                  Số lượng: x{item.quantity}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-bold text-[#17324d] shrink-0">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#eef2f7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-[#52657a]">
                          Giao đến: <span className="text-[#17324d] font-medium">{order.shippingAddress}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4">
                          <div className="text-sm text-[#52657a]">
                            Thành tiền:{' '}
                            <span className="text-base font-extrabold text-[#0667d0]">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onBuyAgain(order)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#eff5ff] hover:bg-[#0667d0] text-[#0667d0] hover:text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Mua lại</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. Lịch hẹn chăm sóc */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl border border-[#dfe6f0] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] pb-4 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-[#17324d]">
                    Lịch hẹn chăm sóc Spa & Hotel
                  </h1>
                  <p className="text-sm text-[#52657a] mt-1">
                    Theo dõi các lịch cắt tỉa, tắm thư giãn và lưu trú cho thú cưng của bạn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('service')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-sm font-semibold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đặt lịch mới</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="py-10 text-center">
                  <CalendarCheck className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                  <p className="text-sm text-[#52657a]">
                    Bạn chưa có lịch hẹn chăm sóc nào.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((bk) => (
                    <div
                      key={bk.id}
                      className="p-4 sm:p-5 rounded-2xl border border-[#dfe6f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[15px] text-[#17324d]">
                            {bk.serviceName}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              bk.status === 'upcoming'
                                ? 'bg-[#eff5ff] text-[#0667d0] border border-[#c7dcff]'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {bk.status === 'upcoming'
                              ? 'Sắp tới'
                              : 'Đã hoàn thành'}
                          </span>
                        </div>
                        <div className="text-sm text-[#52657a]">
                          Thú cưng:{' '}
                          <span className="font-medium text-[#17324d]">
                            {bk.petName}
                          </span>{' '}
                          • Thời gian:{' '}
                          <span className="font-medium text-[#17324d]">
                            {bk.date} ({bk.timeSlot})
                          </span>
                        </div>
                        {bk.note && (
                          <div className="text-xs text-[#64748b]">
                            Ghi chú: {bk.note}
                          </div>
                        )}
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-xs text-[#52657a]">
                          Mã lịch: #{bk.id}
                        </div>
                        <div className="text-base font-bold text-[#0667d0] mt-0.5">
                          {formatCurrency(bk.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Sản phẩm yêu thích */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-2xl border border-[#dfe6f0] p-5 sm:p-7">
              <div className="border-b border-[#eef2f7] pb-4 mb-6">
                <h1 className="text-xl font-bold text-[#17324d]">
                  Sản phẩm yêu thích ({likedProducts.length})
                </h1>
                <p className="text-sm text-[#52657a] mt-1">
                  Các sản phẩm bạn đã lưu để mua lại cho thú cưng.
                </p>
              </div>

              {likedProducts.length === 0 ? (
                <div className="py-10 text-center">
                  <Heart className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                  <p className="text-sm text-[#52657a] mb-5">
                    Chưa có sản phẩm nào trong danh sách yêu thích.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('search')}
                    className="px-5 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-sm font-semibold transition cursor-pointer"
                  >
                    Khám phá sản phẩm
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {likedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-[#dfe6f0] overflow-hidden flex flex-col bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenProduct(product.id)}
                        className="aspect-square bg-[#f6f8fb] overflow-hidden cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </button>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="text-[11px] font-bold text-[#0667d0] uppercase tracking-wide mb-1">
                          {product.brand}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenProduct(product.id)}
                          className="text-sm font-bold text-[#17324d] hover:text-[#0667d0] text-left line-clamp-2 mb-2 cursor-pointer"
                        >
                          {product.name}
                        </button>
                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                          <span className="text-base font-extrabold text-[#17324d]">
                            {formatCurrency(product.priceNum)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onToggleLike(product.id)}
                              aria-label="Bỏ thích"
                              className="p-2 rounded-xl border border-[#dfe6f0] text-red-500 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Heart className="w-4 h-4 fill-red-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddToCart(product, 1)}
                              className="px-3 py-2 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-xs font-semibold transition cursor-pointer"
                            >
                              Thêm giỏ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Đổi mật khẩu */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl border border-[#dfe6f0] p-5 sm:p-7">
              <div className="border-b border-[#eef2f7] pb-4 mb-6">
                <h1 className="text-xl font-bold text-[#17324d]">
                  Đổi mật khẩu
                </h1>
                <p className="text-sm text-[#52657a] mt-1">
                  Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.
                </p>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="max-w-md space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[#17324d] mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] text-sm focus:outline-none focus:border-[#0667d0]"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#17324d] mb-1.5">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] text-sm focus:outline-none focus:border-[#0667d0]"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#17324d] mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] text-sm focus:outline-none focus:border-[#0667d0]"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-3 rounded-xl text-sm font-medium ${
                      passwordFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {passwordFeedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0557b3] text-white text-sm font-semibold transition cursor-pointer"
                >
                  Xác nhận đổi mật khẩu
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

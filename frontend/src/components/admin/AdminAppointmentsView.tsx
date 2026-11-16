import React, { useMemo, useState } from 'react';
import {
  Plus,
  X,
  Phone,
  Sparkles,
} from 'lucide-react';
import type { ServiceBookingRecord } from '../../data/mockData';
import { SPA_PACKAGES, formatCurrency } from '../../data/mockData';
import { STAFF_MEMBERS, type WorkspaceUserRole } from '../../data/adminData';

interface AdminAppointmentsViewProps {
  bookings: ServiceBookingRecord[];
  userRole?: WorkspaceUserRole;
  onAddBooking: (booking: ServiceBookingRecord) => void;
  onUpdateBookingStatus: (id: string, status: ServiceBookingRecord['status']) => void;
  onAssignStaff: (id: string, staffName: string) => void;
  onNotify: (msg: string) => void;
}

const WEEK_DAYS = [
  { date: '2026-11-14', label: 'Thứ 7 · 14/11' },
  { date: '2026-11-15', label: 'CN · 15/11' },
  { date: '2026-11-16', label: 'Thứ 2 · 16/11' },
  { date: '2026-11-17', label: 'Thứ 3 · 17/11' },
  { date: '2026-11-18', label: 'Thứ 4 · 18/11' },
  { date: '2026-11-19', label: 'Thứ 5 · 19/11' },
  { date: '2026-11-20', label: 'Thứ 6 · 20/11' },
];

const TIME_SLOTS = ['09:00 Sáng', '10:30 Sáng', '14:00 Chiều', '16:00 Chiều'];

const BOOKING_STATUS_META: Record<
  ServiceBookingRecord['status'],
  { label: string; cardCls: string; pillCls: string }
> = {
  upcoming: {
    label: 'Đã xác nhận',
    cardCls: 'border-[#93c5fd] bg-[#f8fbff]',
    pillCls: 'bg-[#eff5ff] text-[#0667d0]',
  },
  completed: {
    label: 'Hoàn thành',
    cardCls: 'border-[#dfe6f0] bg-[#f8fafc]',
    pillCls: 'bg-emerald-50 text-emerald-700',
  },
  cancelled: {
    label: 'Đã hủy',
    cardCls: 'border-rose-200 bg-rose-50/40',
    pillCls: 'bg-rose-50 text-rose-700',
  },
};

export const AdminAppointmentsView: React.FC<AdminAppointmentsViewProps> = ({
  bookings,
  userRole = 'admin',
  onAddBooking,
  onUpdateBookingStatus,
  onAssignStaff,
  onNotify,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<ServiceBookingRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Booking Form State
  const [newPetName, setNewPetName] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState(SPA_PACKAGES[0].id);
  const [newDate, setNewDate] = useState('2026-11-18');
  const [newTimeSlot, setNewTimeSlot] = useState(TIME_SLOTS[0]);
  const [newStaff, setNewStaff] = useState(STAFF_MEMBERS[0]);
  const [newNote, setNewNote] = useState('');

  const upcomingCount = useMemo(
    () => bookings.filter((b) => b.status === 'upcoming').length,
    [bookings]
  );
  const completedCount = useMemo(
    () => bookings.filter((b) => b.status === 'completed').length,
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStaff = staffFilter === 'all' || (b.staffName || 'Linh Phạm') === staffFilter;
      const matchService = serviceFilter === 'all' || b.serviceName === serviceFilter;
      return matchStaff && matchService;
    });
  }, [bookings, staffFilter, serviceFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim() || !newCustomerName.trim() || !newCustomerPhone.trim()) {
      onNotify('Vui lòng điền tên thú cưng, tên khách hàng và số điện thoại.');
      return;
    }
    const pkg = SPA_PACKAGES.find((p) => p.id === newServiceId) || SPA_PACKAGES[0];
    const created: ServiceBookingRecord = {
      id: `BK${Math.floor(100000 + Math.random() * 899999)}`,
      serviceName: pkg.name,
      petName: newPetName.trim(),
      date: newDate,
      timeSlot: newTimeSlot,
      price: pkg.price,
      status: 'upcoming',
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim(),
      staffName: newStaff,
      note: newNote.trim() || undefined,
    };
    onAddBooking(created);
    setShowCreateModal(false);
    setNewPetName('');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewNote('');
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
            Lịch hẹn Dịch vụ Chăm sóc
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1 tabular-nums">
            <strong className="text-[#17324d]">{bookings.length}</strong> lịch tuần này (14/11 – 20/11) ·{' '}
            <strong className="text-[#c2410c]">{upcomingCount}</strong> sắp tới ·{' '}
            <strong className="text-emerald-700">{completedCount}</strong> hoàn thành ·{' '}
            <span>{STAFF_MEMBERS.length} chuyên viên</span>
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#a93608] text-white text-[13px] font-bold cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lịch hẹn mới</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl bg-white border border-[#dfe6f0] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[#dfe6f0] bg-[#f8faff] p-1">
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
              viewMode === 'week'
                ? 'bg-[#fff2e9] text-[#c2410c]'
                : 'text-[#52657a] hover:text-[#17324d]'
            }`}
          >
            Lịch theo tuần
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
              viewMode === 'list'
                ? 'bg-[#fff2e9] text-[#c2410c]'
                : 'text-[#52657a] hover:text-[#17324d]'
            }`}
          >
            Danh sách ({filteredBookings.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={staffFilter}
            aria-label="Lọc theo chuyên viên"
            onChange={(e) => setStaffFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[12px] font-semibold text-[#17324d] cursor-pointer"
          >
            <option value="all">Tất cả chuyên viên</option>
            {STAFF_MEMBERS.map((s) => (
              <option key={s} value={s}>
                NV: {s}
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            aria-label="Lọc theo gói dịch vụ"
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[12px] font-semibold text-[#17324d] cursor-pointer"
          >
            <option value="all">Tất cả gói dịch vụ</option>
            {SPA_PACKAGES.map((pkg) => (
              <option key={pkg.id} value={pkg.name}>
                {pkg.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar or List */}
      {viewMode === 'week' ? (
        <div className="w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[920px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-[#eef2f7] bg-[#f8faff] text-[12px]">
                <div className="p-3 font-bold text-[#52657a] border-r border-[#eef2f7]">
                  Khung giờ
                </div>
                {WEEK_DAYS.map((day) => {
                  const dayCount = filteredBookings.filter((b) => b.date === day.date).length;
                  return (
                    <div
                      key={day.date}
                      className={`p-3 border-r last:border-r-0 border-[#eef2f7] ${
                        day.date === '2026-11-18' ? 'bg-[#fff7f0]' : ''
                      }`}
                    >
                      <div className="font-extrabold text-[#17324d]">{day.label}</div>
                      <div className="text-[11px] text-[#52657a]">{dayCount} lịch hẹn</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Rows */}
              {TIME_SLOTS.map((slot) => (
                <div key={slot} className="grid grid-cols-8 border-b last:border-b-0 border-[#eef2f7] min-h-[120px]">
                  <div className="p-3 text-[11px] font-bold text-[#52657a] border-r border-[#eef2f7] bg-[#fcfdff]">
                    {slot}
                  </div>
                  {WEEK_DAYS.map((day) => {
                    const cellBookings = filteredBookings.filter(
                      (b) => b.date === day.date && b.timeSlot === slot
                    );
                    return (
                      <div
                        key={`${day.date}-${slot}`}
                        className="p-2 border-r last:border-r-0 border-[#eef2f7] space-y-2"
                      >
                        {cellBookings.map((bk) => {
                          const meta = BOOKING_STATUS_META[bk.status];
                          return (
                            <button
                              key={bk.id}
                              type="button"
                              onClick={() => setSelectedBooking(bk)}
                              className={`w-full text-left p-2.5 rounded-xl border ${meta.cardCls} hover:shadow-sm transition cursor-pointer space-y-1`}
                            >
                              <div className="text-[10px] font-bold text-[#52657a]">
                                #{bk.id}
                              </div>
                              <div className="text-[12px] font-extrabold text-[#17324d] line-clamp-1">
                                {bk.petName}
                              </div>
                              <div className="text-[11px] font-semibold text-[#52657a] line-clamp-2">
                                {bk.serviceName}
                              </div>
                              <div className="text-[10px] text-[#52657a]">
                                NV: {bk.staffName || 'Linh Phạm'}
                              </div>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.pillCls}`}>
                                {meta.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 bg-[#f8faff] border-t border-[#eef2f7] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#52657a]">
            <span>Giờ mở cửa: 08:00 – 21:00 · Bấm vào thẻ lịch hẹn để cập nhật trạng thái hoặc phân công chuyên viên.</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#eff5ff] text-[#0667d0] font-bold">
                Đã xác nhận
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                Hoàn thành
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((bk) => {
            const meta = BOOKING_STATUS_META[bk.status];
            return (
              <div
                key={bk.id}
                onClick={() => setSelectedBooking(bk)}
                className="rounded-2xl bg-white border border-[#dfe6f0] hover:border-[#0667d0] p-4 space-y-2.5 cursor-pointer transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-extrabold text-[#0667d0]">#{bk.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${meta.pillCls}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="text-[15px] font-extrabold text-[#17324d]">{bk.petName}</div>
                <div className="text-[13px] font-semibold text-[#52657a]">{bk.serviceName}</div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eef2f7] text-[12px]">
                  <span className="text-[#52657a]">
                    {bk.date} · {bk.timeSlot} · NV: <strong>{bk.staffName || 'Linh Phạm'}</strong>
                  </span>
                  <strong className="text-[#0667d0] tabular-nums">{formatCurrency(bk.price)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Update Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_24px_60px_rgba(23,50,77,0.2)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eef2f7] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#17324d]">
                  Chi tiết lịch hẹn #{selectedBooking.id}
                </h2>
                <div className="text-[12px] text-[#52657a]">
                  {selectedBooking.date} · {selectedBooking.timeSlot}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-lg hover:bg-[#eff5ff] flex items-center justify-center text-[#52657a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[13px]">
              <div className="rounded-xl bg-[#f8faff] border border-[#dfe6f0] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-extrabold text-[#17324d] text-[15px]">
                  <Sparkles className="w-4 h-4 text-[#0667d0]" />
                  <span>{selectedBooking.petName}</span>
                </div>
                <div className="font-semibold text-[#0667d0]">{selectedBooking.serviceName}</div>
                <div className="text-[12px] text-[#52657a] flex items-center gap-3 pt-1">
                  <span>Khách: {selectedBooking.customerName || 'Khách PetsFriend'}</span>
                  {selectedBooking.customerPhone && (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Phone className="w-3 h-3" />
                      {selectedBooking.customerPhone}
                    </span>
                  )}
                </div>
                {selectedBooking.note && (
                  <div className="text-[12px] text-[#52657a] pt-1">
                    Ghi chú: <em>{selectedBooking.note}</em>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Chuyên viên phụ trách
                  </label>
                  {userRole === 'staff' ? (
                    <div className="h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-semibold flex items-center text-[#17324d]">
                      {selectedBooking.staffName || STAFF_MEMBERS[0]}
                    </div>
                  ) : (
                    <select
                      value={selectedBooking.staffName || STAFF_MEMBERS[0]}
                      onChange={(e) => {
                        const staff = e.target.value;
                        onAssignStaff(selectedBooking.id, staff);
                        setSelectedBooking((prev) => (prev ? { ...prev, staffName: staff } : null));
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold"
                    >
                      {STAFF_MEMBERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Trạng thái lịch hẹn
                  </label>
                  {userRole === 'staff' ? (
                    <div className="h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-bold flex items-center text-[#17324d]">
                      {BOOKING_STATUS_META[selectedBooking.status].label}
                    </div>
                  ) : (
                    <select
                      value={selectedBooking.status}
                      onChange={(e) => {
                        const next = e.target.value as ServiceBookingRecord['status'];
                        onUpdateBookingStatus(selectedBooking.id, next);
                        setSelectedBooking((prev) => (prev ? { ...prev, status: next } : null));
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold"
                    >
                      <option value="upcoming">Đã xác nhận</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8faff] border-t border-[#eef2f7] flex items-center justify-end gap-2">
              {selectedBooking.status === 'upcoming' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateBookingStatus(selectedBooking.id, 'completed');
                    setSelectedBooking((prev) => (prev ? { ...prev, status: 'completed' } : null));
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold cursor-pointer"
                >
                  Xác nhận hoàn thành nhiệm vụ
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-[#0667d0] text-white text-[13px] font-bold cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-[500px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_24px_60px_rgba(23,50,77,0.2)] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#eef2f7] flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold text-[#17324d]">
                Tạo lịch hẹn dịch vụ mới
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-lg hover:bg-[#eff5ff] flex items-center justify-center text-[#52657a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Tên thú cưng &amp; giống
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Mít (Corgi 1 tuổi)"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Gói dịch vụ chăm sóc
                  </label>
                  <select
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  >
                    {SPA_PACKAGES.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.priceStr})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Tên chủ nuôi
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">Ngày hẹn</label>
                  <select
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  >
                    {WEEK_DAYS.map((d) => (
                      <option key={d.date} value={d.date}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">Khung giờ</label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">Chuyên viên</label>
                  <select
                    value={newStaff}
                    onChange={(e) => setNewStaff(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  >
                    {STAFF_MEMBERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                  Ghi chú tình trạng thú cưng
                </label>
                <input
                  type="text"
                  placeholder="Lưu ý dị ứng, thói quen..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8faff] border-t border-[#eef2f7] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#c2410c] text-white text-[13px] font-bold cursor-pointer"
              >
                Xác nhận đặt lịch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

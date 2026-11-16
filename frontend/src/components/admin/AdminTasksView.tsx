import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  ShoppingBag,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import type {
  LookupOrderEntry,
  OrderStatus,
  ServiceBookingRecord,
} from '../../data/mockData';
import { formatCurrency } from '../../data/mockData';
import {
  STAFF_MEMBERS,
  type AdminNavOptions,
  type AdminSectionId,
  type StaffShiftTask,
  type WorkspaceUserRole,
} from '../../data/adminData';

interface AdminTasksViewProps {
  userRole: WorkspaceUserRole;
  currentUserName: string;
  onShift: boolean;
  onToggleShift: () => void;
  tasks: StaffShiftTask[];
  doneTaskIds: Record<string, boolean>;
  onToggleTaskDone: (taskId: string) => void;
  onAddTask: (task: StaffShiftTask) => void;
  orders: LookupOrderEntry[];
  bookings: ServiceBookingRecord[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onUpdateBookingStatus: (id: string, status: ServiceBookingRecord['status']) => void;
  onNavigateSection: (section: AdminSectionId, options?: AdminNavOptions) => void;
}

export const AdminTasksView: React.FC<AdminTasksViewProps> = ({
  userRole,
  currentUserName,
  onShift,
  onToggleShift,
  tasks,
  doneTaskIds,
  onToggleTaskDone,
  onAddTask,
  orders,
  bookings,
  onUpdateOrderStatus,
  onUpdateBookingStatus,
  onNavigateSection,
}) => {
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<StaffShiftTask['phase']>('Trong ca');
  const [newTaskAssignee, setNewTaskAssignee] = useState(STAFF_MEMBERS[0]);

  const completedCount = useMemo(
    () => tasks.filter((t) => doneTaskIds[t.id]).length,
    [tasks, doneTaskIds]
  );

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'pending'),
    [orders]
  );

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'upcoming'),
    [bookings]
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newTaskLabel.trim();
    if (!label) return;
    onAddTask({
      id: `task-${Date.now().toString().slice(-5)}`,
      phase: newTaskPhase,
      label,
      assignee: newTaskAssignee,
    });
    setNewTaskLabel('');
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
            {userRole === 'admin'
              ? 'Quản lý Nhiệm vụ Ca trực'
              : `Nhiệm vụ được giao — ${currentUserName}`}
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1 tabular-nums">
            Hoàn thành{' '}
            <strong className="text-[#17324d]">
              {completedCount}/{tasks.length}
            </strong>{' '}
            đầu việc · <strong className="text-[#c2410c]">{pendingOrders.length}</strong> đơn chờ xác nhận ·{' '}
            <strong className="text-[#0667d0]">{upcomingBookings.length}</strong> lịch chăm sóc sắp tới
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleShift}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold border cursor-pointer transition-colors press-tactile ${
            onShift
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-[#fff2e9] border-[#ffddc7] text-[#c2410c]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{onShift ? 'Đang trong ca (Bấm tan ca)' : 'Chưa chấm công (Bấm vào ca)'}</span>
        </button>
      </div>

      {/* Admin Task Assignment Bar */}
      {userRole === 'admin' && (
        <form
          onSubmit={handleCreateTask}
          className="rounded-2xl bg-white border border-[#dfe6f0] p-4 flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52657a] mb-1">
              Giao nhiệm vụ mới cho nhân viên
            </label>
            <input
              type="text"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              placeholder="Ví dụ: Kiểm tra hạn sử dụng kệ hạt khô Royal Canin..."
              className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
            />
          </div>

          <div className="w-[140px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52657a] mb-1">
              Giai đoạn
            </label>
            <select
              value={newTaskPhase}
              onChange={(e) => setNewTaskPhase(e.target.value as StaffShiftTask['phase'])}
              className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d]"
            >
              <option value="Đầu ca">Đầu ca</option>
              <option value="Trong ca">Trong ca</option>
              <option value="Cuối ca">Cuối ca</option>
            </select>
          </div>

          <div className="w-[160px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52657a] mb-1">
              Phụ trách
            </label>
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d]"
            >
              {STAFF_MEMBERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Giao việc</span>
          </button>
        </form>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Assigned Tasks Checklist */}
        <div className="xl:col-span-7 rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#f8faff] flex items-center justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Danh sách nhiệm vụ được giao
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Nhấn xác nhận hoàn thành sau khi thực hiện xong từng đầu việc
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#eff5ff] text-[#0667d0] text-[12px] font-extrabold tabular-nums">
              {completedCount}/{tasks.length} xong
            </span>
          </div>

          <div className="divide-y divide-[#eef2f7]">
            {tasks.map((task) => {
              const done = Boolean(doneTaskIds[task.id]);
              return (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[#f8faff] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#94a3b8] shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div
                        className={`text-[13.5px] font-bold ${
                          done ? 'line-through text-[#64748b]' : 'text-[#17324d]'
                        }`}
                      >
                        {task.label}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#52657a]">
                        <span className="px-2 py-0.5 rounded bg-[#f1f5f9] font-semibold">
                          {task.phase}
                        </span>
                        {task.assignee && <span>Phụ trách: {task.assignee}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleTaskDone(task.id)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold shrink-0 cursor-pointer transition-colors press-tactile ${
                      done
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#0667d0] hover:bg-[#0558b5] text-white'
                    }`}
                  >
                    {done ? 'Đã hoàn thành' : 'Xác nhận xong'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Queues (Orders & Spa Tasks) */}
        <div className="xl:col-span-5 space-y-5">
          {/* Pending Orders to Confirm */}
          <div className="rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
            <div className="p-4 border-b border-[#eef2f7] bg-[#f8faff] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#c2410c]" />
                <h2 className="text-[15px] font-extrabold text-[#17324d]">
                  Đơn chờ xác nhận ({pendingOrders.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSection('orders')}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0667d0] hover:underline cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#eef2f7]">
              {pendingOrders.length === 0 ? (
                <div className="p-5 text-center text-[13px] text-[#52657a]">
                  Không có đơn hàng nào đang chờ xác nhận.
                </div>
              ) : (
                pendingOrders.slice(0, 4).map((o) => (
                  <div key={o.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-extrabold text-[#17324d]">
                        <span className="text-[#0667d0]">#{o.id}</span> · {o.customerName}
                      </div>
                      <div className="text-[12px] text-[#52657a] tabular-nums">
                        {o.items.length} món · {formatCurrency(o.totalAmount)} · {o.paymentMethod}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(o.id, 'shipping')}
                      className="px-3 py-1.5 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white text-[12px] font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      Xác nhận đơn
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Spa Tasks */}
          <div className="rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
            <div className="p-4 border-b border-[#eef2f7] bg-[#f8faff] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#0667d0]" />
                <h2 className="text-[15px] font-extrabold text-[#17324d]">
                  Lịch chăm sóc cần hoàn thành ({upcomingBookings.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSection('appointments')}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0667d0] hover:underline cursor-pointer"
              >
                <span>Mở lịch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#eef2f7]">
              {upcomingBookings.length === 0 ? (
                <div className="p-5 text-center text-[13px] text-[#52657a]">
                  Đã hoàn thành toàn bộ lịch chăm sóc sắp tới.
                </div>
              ) : (
                upcomingBookings.slice(0, 4).map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-extrabold text-[#17324d] truncate">
                        {b.petName} — {b.serviceName}
                      </div>
                      <div className="text-[12px] text-[#52657a]">
                        {b.date} · {b.timeSlot} · NV: {b.staffName || 'Linh Phạm'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      Hoàn thành
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

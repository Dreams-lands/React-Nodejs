import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  ShoppingBag,
  CalendarClock,
  ArrowRight,
  Trash2,
  AlertCircle,
  Check,
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
  onDeleteTask?: (taskId: string) => void;
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
  onDeleteTask,
  orders,
  bookings,
  onUpdateOrderStatus,
  onUpdateBookingStatus,
  onNavigateSection,
}) => {
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<StaffShiftTask['phase']>('Trong ca');
  const [newTaskAssignee, setNewTaskAssignee] = useState(STAFF_MEMBERS[0] || 'Linh Phạm');
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'done'>('all');

  const completedCount = useMemo(
    () => tasks.filter((t) => doneTaskIds[t.id]).length,
    [tasks, doneTaskIds]
  );

  const pendingCount = tasks.length - completedCount;

  const filteredTasks = useMemo(() => {
    if (filterTab === 'pending') {
      return tasks.filter((t) => !doneTaskIds[t.id]);
    }
    if (filterTab === 'done') {
      return tasks.filter((t) => Boolean(doneTaskIds[t.id]));
    }
    return tasks;
  }, [tasks, doneTaskIds, filterTab]);

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
    if (!label) {
      setTaskError('Vui lòng nhập nội dung công việc trước khi nhấn Giao việc!');
      return;
    }
    setTaskError(null);
    const createdTask: StaffShiftTask = {
      id: `task-${Date.now().toString().slice(-6)}`,
      phase: newTaskPhase,
      label,
      assignee: newTaskAssignee,
    };
    onAddTask(createdTask);
    setNewTaskLabel('');
    setTaskSuccess(`Đã giao việc thành công cho ${newTaskAssignee}: "${label}"`);
    setTimeout(() => {
      setTaskSuccess(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
            {userRole === 'admin'
              ? 'Quản lý Ca trực & Giao việc'
              : `Nhiệm vụ Ca trực — ${currentUserName}`}
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

      {/* Task Assignment Bar (Accessible to Admin & Staff Shift Leaders) */}
      <div className="rounded-2xl bg-white border border-[#dfe6f0] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-extrabold text-[#17324d] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#0667d0]" />
            <span>Giao việc mới cho nhân viên trong ca</span>
          </h3>
          <span className="text-[11px] font-semibold text-[#52657a] bg-[#eff5ff] text-[#0667d0] px-2.5 py-1 rounded-full">
            {userRole === 'admin' ? 'Quyền Quản Trị' : 'Ghi chú ca trực'}
          </span>
        </div>

        {taskError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[12.5px] font-bold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{taskError}</span>
          </div>
        )}

        {taskSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[12.5px] font-bold text-emerald-700">
            <Check className="w-4 h-4 shrink-0" />
            <span>{taskSuccess}</span>
          </div>
        )}

        <form
          onSubmit={handleCreateTask}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[240px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52657a] mb-1">
              Nội dung công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newTaskLabel}
              onChange={(e) => {
                setNewTaskLabel(e.target.value);
                if (taskError) setTaskError(null);
              }}
              placeholder="Ví dụ: Kiểm tra hạn sử dụng kệ hạt khô Royal Canin, vệ sinh lồng lưu trú..."
              className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0] focus:bg-white transition"
            />
          </div>

          <div className="w-[140px]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52657a] mb-1">
              Giai đoạn
            </label>
            <select
              value={newTaskPhase}
              onChange={(e) => setNewTaskPhase(e.target.value as StaffShiftTask['phase'])}
              className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0]"
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
              className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0]"
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
            className="h-10 px-5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Giao việc</span>
          </button>
        </form>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Assigned Tasks Checklist */}
        <div className="xl:col-span-7 rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#f8faff] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Danh sách nhiệm vụ ca trực
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Nhấn xác nhận sau khi hoàn thành từng đầu việc
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#e9edf5] p-1 rounded-xl text-[12px] font-bold">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white text-[#0667d0] shadow-2xs'
                    : 'text-[#52657a] hover:text-[#17324d]'
                }`}
              >
                Tất cả ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('pending')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterTab === 'pending'
                    ? 'bg-white text-[#c2410c] shadow-2xs'
                    : 'text-[#52657a] hover:text-[#17324d]'
                }`}
              >
                Chưa xong ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('done')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterTab === 'done'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-[#52657a] hover:text-[#17324d]'
                }`}
              >
                Đã xong ({completedCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#eef2f7]">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#52657a]">
                Không có nhiệm vụ nào trong mục này.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const done = Boolean(doneTaskIds[task.id]);
                return (
                  <div
                    key={task.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-[#f8faff] transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleTaskDone(task.id)}
                        className="cursor-pointer mt-0.5 shrink-0"
                        title={done ? 'Mở lại nhiệm vụ' : 'Đánh dấu hoàn thành'}
                      >
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#94a3b8] hover:text-[#0667d0]" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div
                          className={`text-[13.5px] font-bold ${
                            done ? 'line-through text-[#64748b]' : 'text-[#17324d]'
                          }`}
                        >
                          {task.label}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#52657a]">
                          <span className="px-2 py-0.5 rounded bg-[#f1f5f9] font-semibold text-[#17324d]">
                            {task.phase}
                          </span>
                          {task.assignee && (
                            <span className="text-[#0667d0] font-semibold">
                              Phụ trách: {task.assignee}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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

                      {onDeleteTask && (
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa công việc này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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

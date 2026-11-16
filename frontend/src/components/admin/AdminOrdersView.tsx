import React, { useMemo, useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  legacyCreateColumnHelper as createColumnHelper,
  type LegacyColumnDef,
} from '@tanstack/react-table/legacy';
import {
  Download,
  Search,
  Eye,
  Printer,
  X,
  Truck,
  Store,
  CheckCircle2,
  Landmark,
  Banknote,
} from 'lucide-react';
import type { LookupOrderEntry, OrderStatus } from '../../data/mockData';
import { ORDER_STATUS_META, formatCurrency } from '../../data/mockData';
import {
  downloadCsvFile,
  isBankTransferPayment,
  type OrdersMode,
  type WorkspaceUserRole,
} from '../../data/adminData';
import type { ConfirmDialogState } from '../ConfirmDialog';
import { AdminPagination } from './AdminUiPrimitives';

interface AdminOrdersViewProps {
  orders: LookupOrderEntry[];
  mode?: OrdersMode;
  userRole?: WorkspaceUserRole;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onRequestConfirm: (dialog: ConfirmDialogState) => void;
  onNotify: (msg: string) => void;
}

const columnHelper = createColumnHelper<LookupOrderEntry>();

const parseOrderTimestampMs = (createdAt: string): number | null => {
  const dm = /(\d{2})\/(\d{2})\/(\d{4})/.exec(createdAt);
  if (!dm) return null;
  const tm = /(\d{2}):(\d{2})/.exec(createdAt);
  const year = Number(dm[3]);
  const month = Number(dm[2]) - 1;
  const day = Number(dm[1]);
  const hour = tm ? Number(tm[1]) : 12;
  const minute = tm ? Number(tm[2]) : 0;
  return new Date(year, month, day, hour, minute, 0, 0).getTime();
};

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  orders,
  mode = 'manage',
  userRole = 'admin',
  onUpdateOrderStatus,
  onRequestConfirm,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'vnpay' | 'momo' | 'cod'>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [timeFrom, setTimeFrom] = useState<string>('');
  const [timeTo, setTimeTo] = useState<string>('');
  const [viewingOrder, setViewingOrder] = useState<LookupOrderEntry | null>(null);

  const staffOptions = useMemo(() => {
    const names = new Set<string>();
    for (const o of orders) {
      if (o.staffName) names.add(o.staffName);
    }
    return Array.from(names);
  }, [orders]);

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'completed');
    const pendingOrShipping = orders.filter(
      (o) => o.status === 'pending' || o.status === 'shipping'
    );
    const cancelled = orders.filter((o) => o.status === 'cancelled');
    return {
      total: orders.length,
      completedCount: completed.length,
      completedAmount: completed.reduce((s, o) => s + o.totalAmount, 0),
      pendingCount: pendingOrShipping.length,
      cancelledCount: cancelled.length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const fromMs = timeFrom ? new Date(timeFrom).getTime() : null;
    const toMs = timeTo ? new Date(timeTo).getTime() : null;

    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        (o.staffName || '').toLowerCase().includes(q);
      const matchStatus = mode === 'invoices' ? true : statusFilter === 'all' || o.status === statusFilter;
      const pmLower = o.paymentMethod.toLowerCase();
      const matchPayment =
        mode === 'manage'
          ? true
          : paymentFilter === 'all' ||
            (paymentFilter === 'vnpay' && pmLower.includes('vnpay')) ||
            (paymentFilter === 'momo' && pmLower.includes('momo')) ||
            (paymentFilter === 'cod' && (pmLower.includes('cod') || pmLower.includes('nhận hàng') || pmLower.includes('napas')));
      const matchStaff =
        mode === 'manage' ? true : staffFilter === 'all' || (o.staffName || 'Nhân viên trực') === staffFilter;

      let matchTime = true;
      if (mode === 'invoices' && (fromMs !== null || toMs !== null)) {
        const orderMs = parseOrderTimestampMs(o.createdAt);
        if (orderMs === null) {
          matchTime = false;
        } else {
          if (fromMs !== null && !Number.isNaN(fromMs) && orderMs < fromMs) matchTime = false;
          if (toMs !== null && !Number.isNaN(toMs) && orderMs > toMs) matchTime = false;
        }
      }

      return matchSearch && matchStatus && matchPayment && matchStaff && matchTime;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, staffFilter, timeFrom, timeTo, mode]);

  // Columns for "Quản lý đơn hàng": Mã đơn, Khách hàng, Sản phẩm & Giao nhận, Trạng thái (+ Xác nhận thành công), Xem chi tiết
  const manageColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Mã đơn',
        cell: (info) => (
          <button
            type="button"
            onClick={() => setViewingOrder(info.row.original)}
            className="text-[13px] font-extrabold text-[#0667d0] hover:underline cursor-pointer tabular-nums"
          >
            #{info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor('customerName', {
        header: 'Khách hàng',
        cell: (info) => {
          const o = info.row.original;
          return (
            <div className="min-w-[160px]">
              <div className="text-[13px] font-bold text-[#17324d]">{info.getValue()}</div>
              <div className="text-[11px] text-[#52657a] tabular-nums">{o.customerPhone}</div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'summary',
        header: 'Sản phẩm & Giao nhận',
        cell: ({ row }) => {
          const o = row.original;
          const first = o.items[0];
          const extra = o.items.length > 1 ? ` +${o.items.length - 1} sp` : '';
          return (
            <div className="min-w-[220px] max-w-[300px]">
              <div className="text-[13px] font-semibold text-[#17324d] truncate">
                {first ? `${first.name}${extra}` : 'Đơn hàng PetsFriend'}
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] text-[#52657a] mt-0.5">
                {o.deliveryMethod === 'pickup' ? (
                  <Store className="w-3 h-3 text-[#0667d0]" />
                ) : (
                  <Truck className="w-3 h-3 text-[#52657a]" />
                )}
                <span className="truncate">
                  {o.deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng Q.1' : 'Giao tận nơi'}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái đơn hàng',
        cell: (info) => {
          const row = info.row.original;
          const status = info.getValue();
          const canConfirmSuccess = status === 'pending' || status === 'shipping';

          return (
            <div className="flex flex-wrap items-center gap-2">
              {userRole === 'staff' ? (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ORDER_STATUS_META[status].badgeClass}`}>
                  {ORDER_STATUS_META[status].label}
                </span>
              ) : (
                <select
                  aria-label={`Trạng thái đơn ${row.id}`}
                  value={status}
                  onChange={(e) => {
                    const next = e.target.value as OrderStatus;
                    if (next === 'cancelled') {
                      onRequestConfirm({
                        title: 'Xác nhận hủy đơn hàng',
                        message: `Bạn có chắc muốn chuyển đơn #${row.id} sang trạng thái Đã hủy?`,
                        confirmLabel: 'Hủy đơn hàng',
                        tone: 'danger',
                        onConfirm: () => onUpdateOrderStatus(row.id, 'cancelled'),
                      });
                    } else {
                      onUpdateOrderStatus(row.id, next);
                    }
                  }}
                  className={`h-8 px-2.5 rounded-full text-[11px] font-bold cursor-pointer focus:outline-none ${ORDER_STATUS_META[status].badgeClass}`}
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              )}

              {userRole === 'staff' && status === 'pending' && (
                <button
                  type="button"
                  onClick={() => onUpdateOrderStatus(row.id, 'shipping')}
                  className="px-2.5 py-1 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Xác nhận đơn
                </button>
              )}

              {canConfirmSuccess && (
                <button
                  type="button"
                  onClick={() => onUpdateOrderStatus(row.id, 'completed')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Xác nhận thành công</span>
                </button>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Chi tiết',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setViewingOrder(row.original)}
            title="Xem chi tiết đơn hàng"
            aria-label={`Xem chi tiết đơn hàng ${row.original.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dfe6f0] hover:border-[#0667d0] hover:bg-[#eff5ff] text-[#0667d0] text-[12px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </button>
        ),
      }),
    ],
    [onRequestConfirm, onUpdateOrderStatus, userRole]
  ) as unknown as LegacyColumnDef<LookupOrderEntry>[];

  // Columns for "Hóa đơn": Mã đơn hàng, Tên khách, Nhân viên bán (trực), Thời gian, Tổng tiền, Phương thức thanh toán
  const invoiceColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Mã đơn hàng',
        cell: (info) => (
          <button
            type="button"
            onClick={() => setViewingOrder(info.row.original)}
            className="text-[13px] font-extrabold text-[#0667d0] hover:underline cursor-pointer tabular-nums"
          >
            #{info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor('customerName', {
        header: 'Tên khách',
        cell: (info) => {
          const o = info.row.original;
          return (
            <div className="flex items-center gap-2 min-w-[155px]">
              <span className="text-[13px] font-bold text-[#17324d]">
                {info.getValue() || 'Khách vãng lai'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  o.isGuest ? 'bg-slate-100 text-[#52657a]' : 'bg-[#eff5ff] text-[#0667d0]'
                }`}
              >
                {o.isGuest ? 'Vãng lai' : 'Hội viên'}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('staffName', {
        header: 'Nhân viên bán (trực)',
        cell: (info) => (
          <span className="text-[12.5px] font-bold text-[#17324d] whitespace-nowrap">
            {info.getValue() || 'Nhân viên trực'}
          </span>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Thời gian',
        cell: (info) => (
          <span className="text-[12px] text-[#52657a] tabular-nums whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Tổng tiền',
        cell: (info) => (
          <span className="text-[13px] font-extrabold text-[#17324d] tabular-nums whitespace-nowrap">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('paymentMethod', {
        header: 'Phương thức thanh toán',
        cell: (info) => {
          const method = info.getValue();
          const isTransfer = isBankTransferPayment(method);
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                isTransfer
                  ? 'bg-[#eff5ff] text-[#0667d0]'
                  : 'bg-[#fff2e9] text-[#c2410c]'
              }`}
            >
              {isTransfer ? <Landmark className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
              <span>{method}</span>
            </span>
          );
        },
      }),
    ],
    []
  ) as unknown as LegacyColumnDef<LookupOrderEntry>[];

  const activeColumns = mode === 'invoices' ? invoiceColumns : manageColumns;

  const table = useReactTable({
    data: filteredOrders,
    columns: activeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 6 } },
  });

  const handleExportCsv = () => {
    downloadCsvFile(
      'pethub-hoa-don.csv',
      ['Mã đơn hàng', 'Tên khách', 'Nhân viên bán (trực)', 'Thời gian', 'Tổng tiền (VND)', 'Phương thức thanh toán'],
      filteredOrders.map((o) => [
        o.id,
        o.customerName || 'Khách vãng lai',
        o.staffName || 'Nhân viên trực',
        o.createdAt,
        o.totalAmount,
        o.paymentMethod,
      ])
    );
    onNotify(`Đã xuất ${filteredOrders.length} hóa đơn ra file CSV.`);
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
            {mode === 'invoices' ? 'Hóa đơn' : 'Quản lý đơn hàng'}
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1 tabular-nums">
            {mode === 'invoices' ? (
              <>
                <strong className="text-[#17324d]">{filteredOrders.length}</strong> hóa đơn theo đơn hàng · Tổng đã hoàn thành{' '}
                <strong className="text-[#0667d0]">{formatCurrency(stats.completedAmount)}</strong>
              </>
            ) : (
              <>
                <strong className="text-[#17324d]">{stats.total}</strong> đơn ghi nhận ·{' '}
                <strong className="text-[#c2410c]">{stats.pendingCount}</strong> đang chờ/giao ·{' '}
                <strong className="text-emerald-700">{stats.completedCount}</strong> hoàn thành ·{' '}
                <span>{stats.cancelledCount} đã hủy</span>
              </>
            )}
          </p>
        </div>

        {mode === 'invoices' && userRole === 'admin' && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất hóa đơn CSV</span>
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#f8faff] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-[400px]">
            <Search className="w-4 h-4 text-[#52657a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                mode === 'invoices'
                  ? 'Tìm mã đơn hàng (#PH...), tên khách...'
                  : 'Tìm mã đơn (#PH...), tên khách hoặc SĐT...'
              }
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#dfe6f0] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {mode === 'manage' ? (
              <select
                value={statusFilter}
                aria-label="Lọc trạng thái đơn"
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            ) : (
              <>
                <select
                  value={staffFilter}
                  aria-label="Lọc nhân viên bán (trực)"
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] cursor-pointer"
                >
                  <option value="all">Tất cả nhân viên</option>
                  {staffOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="datetime-local"
                    aria-label="Thời gian từ"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="h-10 px-2.5 rounded-xl border border-[#dfe6f0] bg-white text-[12px] font-semibold text-[#17324d]"
                    title="Từ ngày giờ"
                  />
                  <span className="text-[12px] font-semibold text-[#52657a]">–</span>
                  <input
                    type="datetime-local"
                    aria-label="Thời gian đến"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="h-10 px-2.5 rounded-xl border border-[#dfe6f0] bg-white text-[12px] font-semibold text-[#17324d]"
                    title="Đến ngày giờ"
                  />
                  {(timeFrom || timeTo) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFrom('');
                        setTimeTo('');
                      }}
                      className="h-10 px-2.5 rounded-xl border border-[#dfe6f0] bg-white hover:bg-[#eff5ff] text-[12px] font-bold text-[#0667d0] cursor-pointer"
                    >
                      Xóa lọc giờ
                    </button>
                  )}
                </div>

                <select
                  value={paymentFilter}
                  aria-label="Lọc phương thức thanh toán"
                  onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
                  className="h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] cursor-pointer"
                >
                  <option value="all">Mọi phương thức</option>
                  <option value="vnpay">VNPay</option>
                  <option value="momo">MoMo</option>
                  <option value="cod">COD / Napas</option>
                </select>
              </>
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8faff] border-b border-[#eef2f7] text-[11px] font-bold uppercase tracking-wide text-[#52657a]">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#eef2f7]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length} className="py-12 text-center text-[13px] text-[#52657a]">
                    {mode === 'invoices'
                      ? 'Không có hóa đơn nào phù hợp bộ lọc.'
                      : 'Không có đơn hàng nào phù hợp bộ lọc.'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#f8faff] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          totalRows={filteredOrders.length}
          pageSize={table.getState().pagination.pageSize}
          itemLabel={mode === 'invoices' ? 'hóa đơn' : 'đơn hàng'}
          onPageChange={(idx) => table.setPageIndex(idx)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </div>

      {/* Order / Invoice Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[540px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_24px_60px_rgba(23,50,77,0.2)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eef2f7] flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-extrabold text-[#17324d]">
                  {mode === 'invoices'
                    ? `Chi tiết hóa đơn #${viewingOrder.id}`
                    : `Chi tiết đơn hàng #${viewingOrder.id}`}
                </h2>
                <div className="text-[12px] text-[#52657a]">{viewingOrder.createdAt}</div>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-lg hover:bg-[#eff5ff] flex items-center justify-center text-[#52657a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
              <div className="rounded-xl bg-[#f8faff] border border-[#dfe6f0] p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                <div>
                  <span className="text-[#52657a]">Khách hàng: </span>
                  <strong className="text-[#17324d]">{viewingOrder.customerName}</strong>
                </div>
                <div>
                  <span className="text-[#52657a]">SĐT: </span>
                  <strong className="text-[#17324d] tabular-nums">{viewingOrder.customerPhone}</strong>
                </div>
                <div>
                  <span className="text-[#52657a]">Thanh toán: </span>
                  <strong className="text-[#17324d]">{viewingOrder.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-[#52657a]">Nhân viên bán (trực): </span>
                  <strong className="text-[#0667d0]">
                    {viewingOrder.staffName || 'Nhân viên trực'}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#52657a]">Địa chỉ / Nhận hàng: </span>
                  <strong className="text-[#17324d]">{viewingOrder.shippingAddress}</strong>
                </div>
              </div>

              <div className="divide-y divide-[#eef2f7] border border-[#eef2f7] rounded-xl px-4">
                {viewingOrder.items.map((item) => (
                  <div key={`${viewingOrder.id}-${item.id}`} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover border border-[#dfe6f0] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#17324d] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#52657a]">
                          SL: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                    <div className="text-[13px] font-extrabold text-[#17324d] tabular-nums shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#eef2f7] tabular-nums">
                <span className="text-[13px] font-bold text-[#17324d]">Tổng thanh toán:</span>
                <span className="text-[19px] font-extrabold text-[#0667d0]">
                  {formatCurrency(viewingOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8faff] border-t border-[#eef2f7] flex items-center justify-between gap-3">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${ORDER_STATUS_META[viewingOrder.status].badgeClass}`}>
                {ORDER_STATUS_META[viewingOrder.status].label}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {mode === 'manage' && userRole === 'staff' && viewingOrder.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus(viewingOrder.id, 'shipping');
                      setViewingOrder((prev) => (prev ? { ...prev, status: 'shipping' } : null));
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Xác nhận đơn
                  </button>
                )}
                {mode === 'manage' &&
                  (viewingOrder.status === 'pending' || viewingOrder.status === 'shipping') && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateOrderStatus(viewingOrder.id, 'completed');
                        setViewingOrder((prev) => (prev ? { ...prev, status: 'completed' } : null));
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold cursor-pointer"
                    >
                      Xác nhận thành công
                    </button>
                  )}
                {mode === 'invoices' && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In hóa đơn</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[#17324d] text-[13px] font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

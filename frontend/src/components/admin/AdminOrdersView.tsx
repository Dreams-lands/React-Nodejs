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
} from 'lucide-react';
import type { LookupOrderEntry, OrderStatus } from '../../data/mockData';
import { ORDER_STATUS_META, formatCurrency } from '../../data/mockData';
import { downloadCsvFile, type WorkspaceUserRole } from '../../data/adminData';
import type { ConfirmDialogState } from '../ConfirmDialog';
import { AdminPagination } from './AdminUiPrimitives';

interface AdminOrdersViewProps {
  orders: LookupOrderEntry[];
  userRole?: WorkspaceUserRole;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onRequestConfirm: (dialog: ConfirmDialogState) => void;
  onNotify: (msg: string) => void;
}

const columnHelper = createColumnHelper<LookupOrderEntry>();

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  orders,
  userRole = 'admin',
  onUpdateOrderStatus,
  onRequestConfirm,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'vnpay' | 'momo' | 'cod'>('all');
  const [viewingOrder, setViewingOrder] = useState<LookupOrderEntry | null>(null);

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
      pendingAmount: pendingOrShipping.reduce((s, o) => s + o.totalAmount, 0),
      cancelledCount: cancelled.length,
      cancelledAmount: cancelled.reduce((s, o) => s + o.totalAmount, 0),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const pmLower = o.paymentMethod.toLowerCase();
      const matchPayment =
        paymentFilter === 'all' ||
        (paymentFilter === 'vnpay' && pmLower.includes('vnpay')) ||
        (paymentFilter === 'momo' && pmLower.includes('momo')) ||
        (paymentFilter === 'cod' && (pmLower.includes('cod') || pmLower.includes('nhận hàng') || pmLower.includes('napas')));
      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const columns = useMemo(
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
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-[#17324d]">{info.getValue()}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    o.isGuest
                      ? 'bg-slate-100 text-[#52657a]'
                      : 'bg-[#eff5ff] text-[#0667d0]'
                  }`}
                >
                  {o.isGuest ? 'Vãng lai' : 'Hội viên'}
                </span>
              </div>
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
            <div className="min-w-[220px] max-w-[280px]">
              <div className="text-[13px] font-semibold text-[#17324d] truncate">
                {first ? `${first.name}${extra}` : 'Đơn hàng PetHub'}
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
      columnHelper.accessor('totalAmount', {
        header: 'Tổng tiền',
        cell: (info) => (
          <span className="text-[13px] font-extrabold text-[#17324d] tabular-nums whitespace-nowrap">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('paymentMethod', {
        header: 'Thanh toán',
        cell: (info) => (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#17324d] whitespace-nowrap">
            <span
              className={`w-1.5 h-3.5 rounded-full ${
                info.getValue().toLowerCase().includes('cod')
                  ? 'bg-[#c2410c]'
                  : 'bg-[#0667d0]'
              }`}
            />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (info) => {
          const row = info.row.original;
          const status = info.getValue();
          if (userRole === 'staff') {
            return (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ORDER_STATUS_META[status].badgeClass}`}>
                  {ORDER_STATUS_META[status].label}
                </span>
                {status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(row.id, 'shipping')}
                    className="px-2.5 py-1 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Xác nhận đơn
                  </button>
                )}
                {status === 'shipping' && (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(row.id, 'completed')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Hoàn thành
                  </button>
                )}
              </div>
            );
          }
          return (
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
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewingOrder(row.original)}
              title="Xem chi tiết hóa đơn"
              aria-label={`Xem hóa đơn ${row.original.id}`}
              className="p-2 rounded-lg border border-[#dfe6f0] hover:border-[#0667d0] hover:bg-[#eff5ff] text-[#0667d0] cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setViewingOrder(row.original);
                window.setTimeout(() => window.print(), 150);
              }}
              title="In hóa đơn"
              aria-label={`In hóa đơn ${row.original.id}`}
              className="p-2 rounded-lg border border-[#dfe6f0] hover:border-[#17324d] text-[#52657a] hover:text-[#17324d] cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      }),
    ],
    [onRequestConfirm, onUpdateOrderStatus, userRole]
  ) as unknown as LegacyColumnDef<LookupOrderEntry>[];

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 6 } },
  });

  const handleExportCsv = () => {
    downloadCsvFile(
      'pethub-orders.csv',
      ['Mã đơn', 'Khách hàng', 'Số điện thoại', 'Hình thức nhận', 'Thanh toán', 'Tổng tiền (VND)', 'Trạng thái', 'Thời gian'],
      filteredOrders.map((o) => [
        o.id,
        o.customerName,
        o.customerPhone,
        o.deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao tận nơi',
        o.paymentMethod,
        o.totalAmount,
        ORDER_STATUS_META[o.status].label,
        o.createdAt,
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
            Quản lý Đơn hàng &amp; Hóa đơn
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1 tabular-nums">
            <strong className="text-[#17324d]">{stats.total}</strong> đơn ghi nhận ·{' '}
            <strong className="text-[#c2410c]">{stats.pendingCount}</strong> đang chờ/giao ·{' '}
            <strong className="text-emerald-700">{stats.completedCount}</strong> hoàn thành ({formatCurrency(stats.completedAmount)}) ·{' '}
            <span>{stats.cancelledCount} đã hủy</span>
          </p>
        </div>

        {userRole === 'admin' && (
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

      {/* Orders Table Card */}
      <div className="w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#f8faff] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-[400px]">
            <Search className="w-4 h-4 text-[#52657a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn (#PH...), tên khách hoặc SĐT..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#dfe6f0] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
                  <td colSpan={7} className="py-12 text-center text-[13px] text-[#52657a]">
                    Không có đơn hàng nào phù hợp bộ lọc.
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
          itemLabel="hóa đơn"
          onPageChange={(idx) => table.setPageIndex(idx)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </div>

      {/* Invoice Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[540px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_24px_60px_rgba(23,50,77,0.2)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eef2f7] flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-extrabold text-[#17324d]">
                  Chi tiết hóa đơn #{viewingOrder.id}
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
                  <span className="text-[#52657a]">Loại khách: </span>
                  <strong className="text-[#17324d]">
                    {viewingOrder.isGuest ? 'Khách không đăng nhập' : 'Thành viên PetHub'}
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
                {viewingOrder.status === 'pending' && (
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
                {viewingOrder.status === 'shipping' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus(viewingOrder.id, 'completed');
                      setViewingOrder((prev) => (prev ? { ...prev, status: 'completed' } : null));
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold cursor-pointer"
                  >
                    Xác nhận hoàn thành
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In phiếu</span>
                </button>
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

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  Package,
} from 'lucide-react';
import type {
  LookupOrderEntry,
  OrderStatus,
  ProductItem,
  ServiceBookingRecord,
} from '../../data/mockData';
import { ORDER_STATUS_META, formatCurrency } from '../../data/mockData';
import {
  REVENUE_PERIOD_DATASETS,
  type AdminNavOptions,
  type AdminSectionId,
} from '../../data/adminData';
import { AdminMetricStrip } from './AdminUiPrimitives';

interface AdminOverviewViewProps {
  products: ProductItem[];
  orders: LookupOrderEntry[];
  bookings: ServiceBookingRecord[];
  onNavigateSection: (section: AdminSectionId, options?: AdminNavOptions) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  products,
  orders,
  bookings,
  onNavigateSection,
  onUpdateOrderStatus,
}) => {
  const dataset = REVENUE_PERIOD_DATASETS['past-months'];

  const totalCollectedRevenue = useMemo(() => {
    const completedOrderSum = orders
      .filter((o) => o.status === 'completed')
      .reduce((acc, o) => acc + o.totalAmount, 0);
    return 250000000 + completedOrderSum;
  }, [orders]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'pending'),
    [orders]
  );

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'upcoming'),
    [bookings]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockCount <= 15).sort((a, b) => a.stockCount - b.stockCount),
    [products]
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
            Tổng quan vận hành cửa hàng
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1">
            Theo dõi doanh thu, đơn hàng, lịch chăm sóc và cảnh báo tồn kho theo thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateSection('orders')}
            className="px-4 py-2.5 rounded-xl border border-[#dfe6f0] bg-white hover:bg-[#f8faff] text-[13px] font-bold text-[#17324d] cursor-pointer transition-colors"
          >
            Xem đơn hàng ({pendingOrders.length} chờ duyệt)
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('inventory', { inventoryMode: 'catalog' })}
            className="px-4 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors"
          >
            Quản lý kho ({products.length} SP)
          </button>
        </div>
      </div>

      {/* Unified Hairline Metric Strip */}
      <AdminMetricStrip
        columns={4}
        items={[
          {
            label: 'Doanh thu tháng 11',
            value: formatCurrency(totalCollectedRevenue),
            note: dataset.growthLabel,
            tone: 'accent',
          },
          {
            label: 'Đơn chờ xác nhận',
            value: pendingOrders.length,
            note: `${orders.length} đơn đang ghi nhận`,
            tone: pendingOrders.length > 0 ? 'warn' : 'positive',
          },
          {
            label: 'Lịch dịch vụ sắp tới',
            value: upcomingBookings.length,
            note: `Tổng ${bookings.length} lịch hẹn`,
            tone: 'positive',
          },
          {
            label: 'Sản phẩm sắp hết hàng',
            value: lowStockProducts.length,
            note: 'Ngưỡng cảnh báo ≤ 15 sp',
            tone: lowStockProducts.length > 0 ? 'warn' : 'default',
          },
        ]}
      />

      {/* Main Grid: Revenue Trend + Pending Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Xu hướng doanh thu năm 2026
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Tổng hợp từ đơn hàng cửa hàng và lịch dịch vụ chăm sóc đã hoàn tất
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('analytics')}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0667d0] hover:underline cursor-pointer"
            >
              <span>Báo cáo chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataset.trend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0667d0" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0667d0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: '#52657a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#52657a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000000)}tr`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #dfe6f0',
                    boxShadow: '0 8px 24px rgba(23,50,77,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => [formatCurrency(Number(value || 0)), 'Doanh thu']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0667d0"
                  strokeWidth={2.5}
                  fill="url(#overviewRevFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Orders Action Queue */}
        <div className="xl:col-span-5 rounded-2xl bg-white border border-[#dfe6f0] p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Đơn hàng cần xác nhận
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Đồng bộ trực tiếp với giỏ hàng khách vãng lai &amp; hội viên
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('orders')}
              className="text-[12px] font-bold text-[#0667d0] hover:underline cursor-pointer"
            >
              Tất cả
            </button>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 bg-[#f8faff] rounded-xl border border-[#eef2f7]">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
              <div className="text-[13px] font-bold text-[#17324d]">
                Không còn đơn chờ duyệt
              </div>
              <div className="text-[12px] text-[#52657a] mt-0.5">
                Mọi đơn hàng hiện tại đã được xử lý.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {pendingOrders.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-extrabold text-[#0667d0]">
                        #{ord.id}
                      </span>
                      <span className="text-[12px] font-bold text-[#17324d] truncate">
                        {ord.customerName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ORDER_STATUS_META[ord.status].cls}`}>
                        {ord.paymentMethod}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#52657a] mt-1 tabular-nums">
                      {ord.items.length} món · <strong className="text-[#17324d]">{formatCurrency(ord.totalAmount)}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(ord.id, 'shipping')}
                    className="px-3 py-1.5 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white text-[12px] font-bold shrink-0 cursor-pointer transition-colors"
                  >
                    Duyệt đơn
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Low Stock + Upcoming Care Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Alert */}
        <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#c2410c]" />
              <h2 className="text-[15px] font-extrabold text-[#17324d]">
                Cảnh báo tồn kho thấp
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('inventory', { inventoryMode: 'stock' })}
              className="text-[12px] font-bold text-[#0667d0] hover:underline cursor-pointer"
            >
              Nhập thêm hàng →
            </button>
          </div>

          <div className="divide-y divide-[#eef2f7]">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover border border-[#dfe6f0] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[#17324d] truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-[#52657a]">
                      {p.brand} · {formatCurrency(p.priceNum)}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#fff2e9] text-[#c2410c] text-[11px] font-bold shrink-0 tabular-nums">
                  Còn {p.stockCount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Care Appointments */}
        <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[#0667d0]" />
              <h2 className="text-[15px] font-extrabold text-[#17324d]">
                Lịch dịch vụ chăm sóc sắp tới
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('appointments')}
              className="text-[12px] font-bold text-[#0667d0] hover:underline cursor-pointer"
            >
              Xem lịch tuần →
            </button>
          </div>

          <div className="divide-y divide-[#eef2f7]">
            {upcomingBookings.slice(0, 4).map((b) => (
              <div key={b.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#17324d] truncate">
                    {b.petName} — {b.serviceName}
                  </div>
                  <div className="text-[11px] text-[#52657a] mt-0.5">
                    {b.date} · {b.timeSlot} {b.staffName ? `· NV: ${b.staffName}` : ''}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#eff5ff] text-[#0667d0] text-[11px] font-bold shrink-0 tabular-nums">
                  {formatCurrency(b.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

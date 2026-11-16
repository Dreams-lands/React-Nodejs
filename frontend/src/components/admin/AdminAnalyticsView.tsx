import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Download,
  Calendar,
  Clock,
  Landmark,
  Banknote,
  Search,
  Eye,
  Printer,
  X,
  ArrowRight,
  FileBarChart2,
  Loader2,
} from 'lucide-react';
import type { LookupOrderEntry, ProductItem } from '../../data/mockData';
import { formatCurrency } from '../../data/mockData';
import {
  DAILY_REVENUE_SERIES,
  REVENUE_PERIOD_DATASETS,
  downloadCsvFile,
  isBankTransferPayment,
  type AnalyticsMode,
  type RevenuePeriodId,
} from '../../data/adminData';
import { AdminMetricStrip } from './AdminUiPrimitives';

interface AdminAnalyticsViewProps {
  products: ProductItem[];
  orders: LookupOrderEntry[];
  mode?: AnalyticsMode;
  onModeChange?: (mode: AnalyticsMode) => void;
  onNotify: (msg: string) => void;
}

const getDefaultTodayIso = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatIsoToVnDate = (isoDate: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : isoDate;
};

const formatIsoToShortDay = (isoDate: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  return match ? `${match[3]}/${match[2]}` : isoDate;
};

const parseOrderCreatedAt = (createdAt: string): { isoDate: string | null; time: string } => {
  const dateMatch = /(\d{2})\/(\d{2})\/(\d{4})/.exec(createdAt);
  const timeMatch = /(\d{2}):(\d{2})/.exec(createdAt);
  const isoDate = dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : null;
  // Orders created right away in checkout carry "Vừa đặt" instead of HH:mm
  const now = new Date();
  const fallbackTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : fallbackTime;
  return { isoDate, time };
};

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  orders,
  mode = 'period',
  onModeChange,
  onNotify,
}) => {
  const todayIso = useMemo(() => getDefaultTodayIso(), []);
  const [period, setPeriod] = useState<RevenuePeriodId>('past-months');

  // Single-day + time window filter state for "Theo ngày & Hóa đơn"
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endTime, setEndTime] = useState<string>('23:59');
  const [reportVisible, setReportVisible] = useState<boolean>(false);
  const [isReportLoading, setIsReportLoading] = useState<boolean>(false);
  const [reportSnapshot, setReportSnapshot] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  }>({
    date: todayIso,
    startTime: '00:00',
    endTime: '23:59',
  });
  const loadTimerRef = useRef<number | null>(null);

  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'transfer' | 'cash'>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<LookupOrderEntry | null>(null);

  useEffect(() => {
    return () => {
      if (loadTimerRef.current !== null) {
        window.clearTimeout(loadTimerRef.current);
      }
    };
  }, []);

  const [normalizedStart, normalizedEnd] =
    startTime <= endTime ? [startTime, endTime] : [endTime, startTime];

  // Invoices strictly matching selected date + time window
  const dateTimeMatchingOrders = useMemo(() => {
    return orders.filter((o) => {
      const parsed = parseOrderCreatedAt(o.createdAt);
      if (parsed.isoDate !== selectedDate) return false;
      return parsed.time >= normalizedStart && parsed.time <= normalizedEnd;
    });
  }, [orders, selectedDate, normalizedStart, normalizedEnd]);

  const filteredInvoices = useMemo(() => {
    const q = invoiceSearch.trim().toLowerCase();
    return dateTimeMatchingOrders.filter((o) => {
      const isTransfer = isBankTransferPayment(o.paymentMethod);
      const matchMethod =
        invoiceFilter === 'all' ||
        (invoiceFilter === 'transfer' && isTransfer) ||
        (invoiceFilter === 'cash' && !isTransfer);
      const matchQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q);
      return matchMethod && matchQuery;
    });
  }, [dateTimeMatchingOrders, invoiceFilter, invoiceSearch]);

  const computeDayBreakdown = (targetDate: string, fromT: string, toT: string) => {
    const lo = fromT <= toT ? fromT : toT;
    const hi = fromT <= toT ? toT : fromT;
    const dayOrders = orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const parsed = parseOrderCreatedAt(o.createdAt);
      return parsed.isoDate === targetDate && parsed.time >= lo && parsed.time <= hi;
    });

    let liveTransfer = 0;
    let liveCash = 0;
    for (const o of dayOrders) {
      if (isBankTransferPayment(o.paymentMethod)) {
        liveTransfer += o.totalAmount;
      } else {
        liveCash += o.totalAmount;
      }
    }

    const isFullDay = lo === '00:00' && hi === '23:59';
    const shortKey = formatIsoToShortDay(targetDate);
    const baseline = isFullDay ? DAILY_REVENUE_SERIES.find((d) => d.day === shortKey) : undefined;

    const transfer = (baseline?.transfer ?? 0) + liveTransfer;
    const cash = (baseline?.cash ?? 0) + liveCash;
    const orderCount = (baseline?.orders ?? 0) + dayOrders.length;

    return {
      day: shortKey,
      dateLabel:
        targetDate === todayIso
          ? `Hôm nay · ${formatIsoToVnDate(targetDate)}`
          : formatIsoToVnDate(targetDate),
      transfer,
      cash,
      total: transfer + cash,
      orders: orderCount,
    };
  };

  // Single-day chart defaults to today (1 day only, never multi-day range)
  const todayChartSummary = useMemo(
    () => computeDayBreakdown(todayIso, '00:00', '23:59'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, todayIso]
  );

  const singleDayHorizontalSeries = useMemo(
    () => [
      {
        method: 'Chuyển khoản',
        amount: todayChartSummary.transfer,
        fill: '#0667d0',
      },
      {
        method: 'Tiền mặt (COD)',
        amount: todayChartSummary.cash,
        fill: '#c2410c',
      },
    ],
    [todayChartSummary]
  );

  // Triggered report table summary for the chosen date + time range
  const selectedDayReport = useMemo(
    () => computeDayBreakdown(reportSnapshot.date, reportSnapshot.startTime, reportSnapshot.endTime),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, reportSnapshot]
  );

  const handleViewDailyReport = () => {
    if (loadTimerRef.current !== null) {
      window.clearTimeout(loadTimerRef.current);
    }
    setIsReportLoading(true);
    const nextSnap = {
      date: selectedDate,
      startTime: normalizedStart,
      endTime: normalizedEnd,
    };
    loadTimerRef.current = window.setTimeout(() => {
      setReportSnapshot(nextSnap);
      setReportVisible(true);
      setIsReportLoading(false);
      onNotify(
        `Đã tải báo cáo doanh thu ngày ${formatIsoToVnDate(nextSnap.date)} (${nextSnap.startTime} – ${nextSnap.endTime}).`
      );
    }, 220);
  };

  // Period / Year analytics (T1-T12 or Years)
  const dataset = REVENUE_PERIOD_DATASETS[period];

  const totalRevenue = useMemo(
    () => dataset.trend.reduce((s, row) => s + row.revenue, 0),
    [dataset]
  );

  const totalOrdersCount = useMemo(
    () => dataset.trend.reduce((s, row) => s + row.orders, 0),
    [dataset]
  );

  const avgOrderValue = useMemo(
    () => (totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0),
    [totalRevenue, totalOrdersCount]
  );

  const handleExportReport = () => {
    if (mode === 'daily') {
      downloadCsvFile(
        `pethub-hoa-don-${selectedDate}.csv`,
        ['Mã hóa đơn', 'Mã đơn', 'Thời gian', 'Khách hàng', 'Hình thức', 'Kênh thanh toán', 'Số tiền (VND)', 'Trạng thái'],
        filteredInvoices.map((o) => [
          `HD-${o.id}`,
          o.id,
          o.createdAt,
          o.customerName || 'Khách vãng lai',
          isBankTransferPayment(o.paymentMethod) ? 'Chuyển khoản' : 'Tiền mặt',
          o.paymentMethod,
          o.totalAmount,
          o.status === 'completed' ? 'Đã thu tiền' : o.status === 'cancelled' ? 'Đã hủy' : 'Chờ thu tiền',
        ])
      );
      onNotify(`Đã xuất ${filteredInvoices.length} hóa đơn ngày ${formatIsoToVnDate(selectedDate)} ra file CSV.`);
      return;
    }

    downloadCsvFile(
      `pethub-doanh-thu-${period}.csv`,
      ['Kỳ báo cáo', 'Số đơn', 'Thu Chuyển khoản (VND)', 'Thu Tiền mặt (VND)', 'Tổng doanh thu (VND)'],
      dataset.trend.map((t) => [t.fullLabel, t.orders, t.transfer, t.cash, t.revenue])
    );
    onNotify(`Đã xuất báo cáo ${dataset.label} ra file CSV.`);
  };

  if (mode === 'daily') {
    return (
      <div className="space-y-6 w-full min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
              Doanh thu Theo ngày &amp; Hóa đơn thanh toán
            </h1>
            <p className="text-[13px] text-[#52657a] mt-1">
              Chọn ngày giờ để lọc hóa đơn và bấm Xem báo cáo để kiểm tra số liệu trong ngày.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#dfe6f0] hover:border-[#0667d0] text-[#17324d] hover:text-[#0667d0] text-[13px] font-bold cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV hóa đơn</span>
          </button>
        </div>

        {/* Date-Time Picker + View Report Button */}
        <div className="rounded-2xl bg-white border border-[#dfe6f0] p-4 sm:p-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3.5">
            <div>
              <label
                htmlFor="analytics-day-input"
                className="block text-[11px] font-bold uppercase text-[#52657a] mb-1.5"
              >
                Chọn ngày
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-[#0667d0] absolute left-3 pointer-events-none" />
                <input
                  id="analytics-day-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value || todayIso)}
                  className="h-10 pl-9 pr-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="analytics-time-start"
                className="block text-[11px] font-bold uppercase text-[#52657a] mb-1.5"
              >
                Khung giờ (Từ – Đến)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Clock className="w-3.5 h-3.5 text-[#52657a] absolute left-3 pointer-events-none" />
                  <input
                    id="analytics-time-start"
                    type="time"
                    aria-label="Từ giờ"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value || '00:00')}
                    className="h-10 pl-8 pr-2.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                  />
                </div>
                <span className="text-[12px] font-semibold text-[#52657a]">–</span>
                <input
                  id="analytics-time-end"
                  type="time"
                  aria-label="Đến giờ"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value || '23:59')}
                  className="h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleViewDailyReport}
            disabled={isReportLoading}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] disabled:opacity-70 text-white text-[13px] font-bold cursor-pointer transition-colors"
          >
            {isReportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileBarChart2 className="w-4 h-4" />
            )}
            <span>{isReportLoading ? 'Đang tải...' : 'Xem báo cáo'}</span>
          </button>
        </div>

        {/* Single-Day Bar Chart (Today Only) */}
        <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Doanh thu ngày hôm nay ({formatIsoToVnDate(todayIso)})
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Hiển thị riêng khoản thu Chuyển khoản và Tiền mặt trong ngày hôm nay
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[#0667d0]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0667d0]" />
                Chuyển khoản
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#c2410c]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#c2410c]" />
                Tiền mặt (COD)
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={singleDayHorizontalSeries}
                layout="vertical"
                margin={{ top: 10, right: 28, left: 8, bottom: 4 }}
                barCategoryGap="22%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#52657a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000000)}tr`}
                />
                <YAxis
                  type="category"
                  dataKey="method"
                  width={130}
                  tick={{ fontSize: 13, fontWeight: 700, fill: '#17324d' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #dfe6f0',
                    boxShadow: '0 8px 24px rgba(23,50,77,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => [formatCurrency(Number(value || 0)), 'Doanh thu hôm nay']}
                />
                <Bar dataKey="amount" barSize={48} radius={[0, 10, 10, 0]} isAnimationActive={false}>
                  {singleDayHorizontalSeries.map((entry) => (
                    <Cell key={entry.method} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Table — Appears ONLY when user clicks "Xem báo cáo" */}
        {reportVisible && (
          <div className="w-full max-w-full rounded-2xl bg-white border border-[#0667d0]/35 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#f8faff] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#17324d]">
                  Bảng báo cáo doanh thu ngày {formatIsoToVnDate(reportSnapshot.date)}
                </h2>
                <p className="text-[12px] text-[#52657a]">
                  Khung giờ áp dụng: {reportSnapshot.startTime} – {reportSnapshot.endTime}
                </p>
              </div>
              <span className="text-[13px] font-extrabold text-[#0667d0] tabular-nums">
                Tổng thu: {formatCurrency(selectedDayReport.total)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-[#eef2f7] bg-[#f8fafc] text-[11px] font-bold uppercase text-[#52657a]">
                  <tr>
                    <th className="py-3 px-4">Ngày báo cáo</th>
                    <th className="py-3 px-4">Khung giờ</th>
                    <th className="py-3 px-4 text-right">Số đơn</th>
                    <th className="py-3 px-4 text-right">Thu Chuyển khoản</th>
                    <th className="py-3 px-4 text-right">Thu Tiền mặt (COD)</th>
                    <th className="py-3 px-4 text-right">Tổng doanh thu</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] tabular-nums">
                  <tr className="hover:bg-[#f8faff]/70">
                    <td className="py-3.5 px-4 font-bold text-[#17324d] whitespace-nowrap">
                      {selectedDayReport.dateLabel}
                    </td>
                    <td className="py-3.5 px-4 text-[#52657a] whitespace-nowrap">
                      {reportSnapshot.startTime} – {reportSnapshot.endTime}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#52657a]">
                      {selectedDayReport.orders} đơn
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#0667d0]">
                      {formatCurrency(selectedDayReport.transfer)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#c2410c]">
                      {formatCurrency(selectedDayReport.cash)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#17324d]">
                      {formatCurrency(selectedDayReport.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices Table Card — Filtered strictly by selected Date + Time */}
        <div
          className={`w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden transition-opacity ${
            isReportLoading ? 'opacity-60' : 'opacity-100'
          }`}
        >
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] bg-[#f8faff]">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Hóa đơn thanh toán ({filteredInvoices.length})
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Đang lọc theo ngày {formatIsoToVnDate(selectedDate)} · {normalizedStart} – {normalizedEnd}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[210px]">
                <Search className="w-4 h-4 text-[#52657a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Tìm mã hóa đơn, tên khách..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#dfe6f0] text-[12px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                />
              </div>

              <div className="inline-flex rounded-xl border border-[#dfe6f0] bg-white p-1">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'transfer', label: 'Chuyển khoản' },
                  { id: 'cash', label: 'Tiền mặt' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInvoiceFilter(tab.id as 'all' | 'transfer' | 'cash')}
                    className={`px-3 py-1 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                      invoiceFilter === tab.id
                        ? 'bg-[#eff5ff] text-[#0667d0]'
                        : 'text-[#52657a] hover:text-[#17324d]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-[#eef2f7] bg-[#f8fafc] text-[11px] font-bold uppercase text-[#52657a]">
                <tr>
                  <th className="py-3 px-4">Mã hóa đơn</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Hình thức thanh toán</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4">Trạng thái thu</th>
                  <th className="py-3 px-4 text-right">Hóa đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f7] text-[13px]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[13px] text-[#52657a]">
                      Không có hóa đơn nào trong ngày {formatIsoToVnDate(selectedDate)} ({normalizedStart} – {normalizedEnd}).
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isTransfer = isBankTransferPayment(inv.paymentMethod);
                    const paidLabel =
                      inv.status === 'completed'
                        ? 'Đã thu tiền'
                        : inv.status === 'cancelled'
                          ? 'Đã hủy'
                          : isTransfer
                            ? 'Chờ đối soát'
                            : 'Thu khi giao';
                    const paidTone =
                      inv.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : inv.status === 'cancelled'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700';

                    return (
                      <tr key={inv.id} className="hover:bg-[#f8faff]/70">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-extrabold text-[#17324d]">HD-{inv.id}</div>
                          <div className="text-[11px] text-[#52657a]">Đơn #{inv.id}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[12px] text-[#52657a] whitespace-nowrap">
                          {inv.createdAt}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#17324d]">
                            {inv.customerName || 'Khách vãng lai'}
                          </div>
                          <div className="text-[11px] text-[#52657a]">
                            {inv.customerPhone || 'Mua tại quầy'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isTransfer
                                ? 'bg-[#eff5ff] text-[#0667d0]'
                                : 'bg-[#fff2e9] text-[#c2410c]'
                            }`}
                          >
                            {isTransfer ? (
                              <Landmark className="w-3 h-3" />
                            ) : (
                              <Banknote className="w-3 h-3" />
                            )}
                            <span>
                              {isTransfer ? `Chuyển khoản · ${inv.paymentMethod}` : 'Tiền mặt (COD)'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#17324d] tabular-nums whitespace-nowrap">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${paidTone}`}>
                            {paidLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#dfe6f0] hover:border-[#0667d0] hover:bg-[#eff5ff] text-[12px] font-semibold text-[#17324d] hover:text-[#0667d0] cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-[#dfe6f0] shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#eef2f7] flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#17324d]">
                    Hóa đơn thanh toán #HD-{selectedInvoice.id}
                  </h3>
                  <p className="text-[12px] text-[#52657a]">
                    Đơn #{selectedInvoice.id} · {selectedInvoice.createdAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  aria-label="Đóng hóa đơn"
                  className="p-1.5 rounded-lg hover:bg-[#f8faff] text-[#52657a] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-[13px]">
                <div className="rounded-xl bg-[#f8faff] border border-[#dfe6f0] p-3.5 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-[#52657a] uppercase">Khách hàng</div>
                    <div className="font-bold text-[#17324d] mt-0.5">
                      {selectedInvoice.customerName || 'Khách vãng lai'}
                    </div>
                    <div className="text-[12px] text-[#52657a]">{selectedInvoice.customerPhone}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#52657a] uppercase">Hình thức thu</div>
                    <div className="font-bold text-[#0667d0] mt-0.5">
                      {isBankTransferPayment(selectedInvoice.paymentMethod)
                        ? `Chuyển khoản (${selectedInvoice.paymentMethod})`
                        : 'Tiền mặt (COD)'}
                    </div>
                    <div className="text-[12px] text-[#52657a]">
                      {selectedInvoice.deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao tận nơi'}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#eef2f7] border border-[#eef2f7] rounded-xl overflow-hidden">
                  {selectedInvoice.items.map((item) => (
                    <div key={`${item.id}-${item.variant}`} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-[#17324d]">{item.name}</div>
                        <div className="text-[11px] text-[#52657a]">
                          {item.variant} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-extrabold text-[#17324d] tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#eef2f7]">
                  <span className="font-bold text-[#17324d]">Tổng thanh toán</span>
                  <span className="text-[18px] font-extrabold text-[#0667d0] tabular-nums">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-[#eef2f7] bg-[#f8fafc] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    onNotify(`Đã gửi lệnh in hóa đơn #HD-${selectedInvoice.id}.`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[12px] font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In hóa đơn</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
            Doanh thu Theo tháng &amp; Năm
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1">
            Biểu đồ Chuyển khoản / Tiền mặt từ Tháng 1 – Tháng 12 và tổng doanh thu cả năm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onModeChange && (
            <button
              type="button"
              onClick={() => onModeChange('daily')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#dfe6f0] bg-white hover:border-[#0667d0] hover:text-[#0667d0] text-[#17324d] text-[13px] font-bold cursor-pointer transition-colors"
            >
              <span>Xem doanh thu ngày &amp; hóa đơn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo CSV</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex rounded-xl border border-[#dfe6f0] bg-white p-1">
          {[
            { id: 'past-months', label: 'Theo 12 tháng (T1 – T12)' },
            { id: 'past-years', label: 'Theo năm (2024 – 2026)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id as RevenuePeriodId)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                period === item.id
                  ? 'bg-[#eff5ff] text-[#0667d0]'
                  : 'text-[#52657a] hover:text-[#17324d]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[12px] font-semibold text-[#17324d]">
          <Calendar className="w-3.5 h-3.5 text-[#0667d0]" />
          {dataset.dateRange}
        </span>
      </div>

      {/* Adapted Grouped Bar Chart (Blue Chuyển khoản vs Orange Tiền mặt COD across T1–T12 / Years) */}
      <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#17324d]">
              Doanh thu {dataset.label}
            </h2>
            <p className="text-[12px] text-[#52657a]">
              Tách riêng khoản thu Chuyển khoản và Tiền mặt theo từng {period === 'past-months' ? 'tháng (T1 – T12)' : 'năm'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-[#0667d0]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0667d0]" />
              Chuyển khoản
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#c2410c]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#c2410c]" />
              Tiền mặt (COD)
            </span>
          </div>
        </div>

        <div className={period === 'past-years' ? 'h-[310px] w-full' : 'h-[280px] w-full'}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataset.trend}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              barGap={period === 'past-years' ? 14 : 6}
              barCategoryGap={period === 'past-years' ? '22%' : '18%'}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fontWeight: period === 'past-years' ? 700 : 500, fill: '#52657a' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#52657a' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000000000 ? `${(v / 1000000000).toFixed(1)}tỷ` : `${Math.round(v / 1000000)}tr`
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #dfe6f0',
                  boxShadow: '0 8px 24px rgba(23,50,77,0.08)',
                  fontSize: '12px',
                }}
                formatter={(value: unknown, name: unknown) => [
                  formatCurrency(Number(value || 0)),
                  name === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt (COD)',
                ]}
              />
              <Bar
                dataKey="transfer"
                name="transfer"
                fill="#0667d0"
                radius={period === 'past-years' ? [8, 8, 0, 0] : [6, 6, 0, 0]}
                barSize={period === 'past-years' ? 58 : undefined}
                maxBarSize={period === 'past-years' ? 68 : 26}
                isAnimationActive={false}
              />
              <Bar
                dataKey="cash"
                name="cash"
                fill="#c2410c"
                radius={period === 'past-years' ? [8, 8, 0, 0] : [6, 6, 0, 0]}
                barSize={period === 'past-years' ? 58 : undefined}
                maxBarSize={period === 'past-years' ? 68 : 26}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Adapted Breakdown Table (Same clean table structure from Daily Breakdown) */}
      <div className="w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#f8faff] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#17324d]">
              {period === 'past-months'
                ? 'Bảng báo cáo Doanh thu từng tháng (T1 – T12/2026)'
                : 'Bảng báo cáo Doanh thu từng năm (2024 – 2026)'}
            </h2>
            <p className="text-[12px] text-[#52657a]">
              Chi tiết số đơn, thu Chuyển khoản và Tiền mặt theo từng {period === 'past-months' ? 'tháng' : 'năm'}
            </p>
          </div>
          <span className="text-[12px] font-bold text-[#0667d0] tabular-nums">
            Tổng {period === 'past-months' ? 'cả năm 2026' : 'giai đoạn'}: {formatCurrency(totalRevenue)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-[#eef2f7] bg-[#f8fafc] text-[11px] font-bold uppercase text-[#52657a]">
              <tr>
                <th className="py-3 px-4">{period === 'past-months' ? 'Tháng' : 'Năm'}</th>
                <th className="py-3 px-4 text-right">Số đơn</th>
                <th className="py-3 px-4 text-right">Thu Chuyển khoản</th>
                <th className="py-3 px-4 text-right">Thu Tiền mặt (COD)</th>
                <th className="py-3 px-4 text-right">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f7] text-[13px] tabular-nums">
              {dataset.trend.map((row) => (
                <tr key={row.period} className="hover:bg-[#f8faff]/70">
                  <td className="py-3 px-4 font-bold text-[#17324d] whitespace-nowrap">
                    {row.fullLabel}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#52657a]">
                    {row.orders} đơn
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#0667d0]">
                    {formatCurrency(row.transfer)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#c2410c]">
                    {formatCurrency(row.cash)}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-[#17324d]">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 3-Column KPI Strip (Replaces Top 5 Products + Cash/Transfer Cards) */}
      <AdminMetricStrip
        columns={3}
        items={[
          {
            label: period === 'past-months' ? 'Tổng doanh thu cả năm' : 'Tổng doanh thu',
            value: formatCurrency(totalRevenue),
            note: dataset.growthLabel,
            tone: 'accent',
          },
          {
            label: 'Tổng đơn hoàn thành',
            value: totalOrdersCount,
            note: 'Không tính đơn đã hủy',
          },
          {
            label: 'Giá trị đơn trung bình',
            value: formatCurrency(avgOrderValue),
            note: dataset.avgOrderGrowth,
            tone: 'positive',
          },
        ]}
      />
    </div>
  );
};

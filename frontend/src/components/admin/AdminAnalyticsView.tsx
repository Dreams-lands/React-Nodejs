import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Download,
  Calendar,
  Landmark,
  Banknote,
  Search,
  Eye,
  Printer,
  X,
  ArrowRight,
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

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  products,
  orders,
  mode = 'period',
  onModeChange,
  onNotify,
}) => {
  const [period, setPeriod] = useState<RevenuePeriodId>('past-months');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'transfer' | 'cash'>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<LookupOrderEntry | null>(null);

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

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.soldCount ?? 30) * b.priceNum - (a.soldCount ?? 30) * a.priceNum)
      .slice(0, 5)
      .map((p, idx) => {
        const units = p.soldCount ?? 90 - idx * 14;
        return {
          ...p,
          unitsSold: units,
          revenue: units * p.priceNum,
        };
      });
  }, [products]);

  const liveMethodStats = useMemo(() => {
    let transferAmount = 0;
    let cashAmount = 0;
    let transferCount = 0;
    let cashCount = 0;

    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      if (isBankTransferPayment(o.paymentMethod)) {
        transferAmount += o.totalAmount;
        transferCount += 1;
      } else {
        cashAmount += o.totalAmount;
        cashCount += 1;
      }
    }
    return {
      transferAmount,
      cashAmount,
      transferCount,
      cashCount,
      totalLiveAmount: transferAmount + cashAmount,
    };
  }, [orders]);

  const dailySummary = useMemo(() => {
    const baseTransfer = DAILY_REVENUE_SERIES.reduce((s, d) => s + d.transfer, 0);
    const baseCash = DAILY_REVENUE_SERIES.reduce((s, d) => s + d.cash, 0);
    const totalTransfer = baseTransfer + liveMethodStats.transferAmount;
    const totalCash = baseCash + liveMethodStats.cashAmount;
    const totalWeek = totalTransfer + totalCash;
    const todayPoint = DAILY_REVENUE_SERIES[DAILY_REVENUE_SERIES.length - 1];
    const todayTotal = todayPoint.transfer + todayPoint.cash + liveMethodStats.totalLiveAmount;
    return {
      totalTransfer,
      totalCash,
      totalWeek,
      todayTotal,
      transferPct: totalWeek > 0 ? Math.round((totalTransfer / totalWeek) * 100) : 0,
      cashPct: totalWeek > 0 ? Math.round((totalCash / totalWeek) * 100) : 0,
    };
  }, [liveMethodStats]);

  const filteredInvoices = useMemo(() => {
    const q = invoiceSearch.trim().toLowerCase();
    return orders.filter((o) => {
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
  }, [orders, invoiceFilter, invoiceSearch]);

  const handleExportReport = () => {
    if (mode === 'daily') {
      downloadCsvFile(
        'pethub-hoa-don-thanh-toan.csv',
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
      onNotify(`Đã xuất ${filteredInvoices.length} hóa đơn thanh toán ra file CSV.`);
      return;
    }

    downloadCsvFile(
      `pethub-revenue-${period}.csv`,
      ['Kỳ báo cáo', 'Doanh thu (VND)', 'Số đơn hàng'],
      dataset.trend.map((t) => [t.period, t.revenue, t.orders])
    );
    onNotify(`Đã xuất báo cáo doanh thu (${dataset.label}) ra file CSV.`);
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
              Theo dõi thu từng ngày và đối soát hóa đơn Tiền mặt (COD) / Chuyển khoản.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV hóa đơn</span>
          </button>
        </div>

        {/* Clean 3-column Metric Strip */}
        <AdminMetricStrip
          columns={3}
          items={[
            {
              label: 'Doanh thu 7 ngày gần nhất',
              value: formatCurrency(dailySummary.totalWeek),
              note: `Hôm nay 16/11: ${formatCurrency(dailySummary.todayTotal)}`,
              tone: 'accent',
            },
            {
              label: 'Thu Chuyển khoản (VNPay / MoMo)',
              value: formatCurrency(dailySummary.totalTransfer),
              note: `${dailySummary.transferPct}% tổng thu · ${liveMethodStats.transferCount} hóa đơn`,
              tone: 'positive',
            },
            {
              label: 'Thu Tiền mặt (COD)',
              value: formatCurrency(dailySummary.totalCash),
              note: `${dailySummary.cashPct}% tổng thu · ${liveMethodStats.cashCount} hóa đơn`,
              tone: 'warn',
            },
          ]}
        />

        {/* Daily Revenue Bar Chart: Chuyển khoản vs Tiền mặt */}
        <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Doanh thu từng ngày (10/11 – 16/11/2026)
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Tách riêng khoản thu Chuyển khoản và Tiền mặt theo từng ngày
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

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_REVENUE_SERIES} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#52657a' }} axisLine={false} tickLine={false} />
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
                  formatter={(value: unknown, name: unknown) => [
                    formatCurrency(Number(value || 0)),
                    name === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt (COD)',
                  ]}
                />
                <Bar dataKey="transfer" name="transfer" fill="#0667d0" radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={false} />
                <Bar dataKey="cash" name="cash" fill="#c2410c" radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Breakdown Report Table */}
        <div className="w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#f8faff] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Bảng báo cáo Doanh thu từng ngày
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Chi tiết số đơn và doanh thu Tiền mặt / Chuyển khoản theo từng ngày gần nhất
              </p>
            </div>
            <span className="text-[12px] font-bold text-[#0667d0] tabular-nums">
              7 ngày: {formatCurrency(dailySummary.totalWeek)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-[#eef2f7] bg-[#f8fafc] text-[11px] font-bold uppercase text-[#52657a]">
                <tr>
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4 text-right">Số đơn</th>
                  <th className="py-3 px-4 text-right">Thu Chuyển khoản</th>
                  <th className="py-3 px-4 text-right">Thu Tiền mặt (COD)</th>
                  <th className="py-3 px-4 text-right">Tổng doanh thu ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f7] text-[13px] tabular-nums">
                {[...DAILY_REVENUE_SERIES].reverse().map((row, idx) => {
                  const isToday = idx === 0;
                  const transferVal = row.transfer + (isToday ? liveMethodStats.transferAmount : 0);
                  const cashVal = row.cash + (isToday ? liveMethodStats.cashAmount : 0);
                  const ordersVal = row.orders + (isToday ? liveMethodStats.transferCount + liveMethodStats.cashCount : 0);
                  return (
                    <tr key={row.day} className="hover:bg-[#f8faff]/70">
                      <td className="py-3 px-4 font-bold text-[#17324d] whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#52657a]">
                        {ordersVal} đơn
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#0667d0]">
                        {formatCurrency(transferVal)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#c2410c]">
                        {formatCurrency(cashVal)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#17324d]">
                        {formatCurrency(transferVal + cashVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoices Table Card */}
        <div className="w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] bg-[#f8faff]">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Hóa đơn thanh toán ({filteredInvoices.length})
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Đồng bộ tự động từ đơn đặt hàng Storefront và bán hàng tại quầy
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
                      Không có hóa đơn phù hợp với bộ lọc hiện tại.
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
            Tổng doanh thu Theo tháng &amp; Năm đã qua
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1">
            Tổng hợp doanh thu tích lũy các tháng đã qua trong năm và đối chiếu tăng trưởng theo năm.
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
            { id: 'past-months', label: 'Theo tháng đã qua (2026)' },
            { id: 'past-years', label: 'Theo năm đã qua (2024 – 2026)' },
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

      {/* Clean 3-column Metric Strip */}
      <AdminMetricStrip
        columns={3}
        items={[
          {
            label: 'Tổng doanh thu',
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Xu hướng doanh thu ({dataset.label})
              </h2>
              <p className="text-[12px] text-[#52657a]">{dataset.growthLabel}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0667d0]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0667d0]" />
              Doanh thu (VND)
            </span>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataset.trend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0667d0" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0667d0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#52657a' }} axisLine={false} tickLine={false} />
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
                  formatter={(value: unknown) => [formatCurrency(Number(value || 0)), 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0667d0" strokeWidth={2.5} fill="url(#analyticsAreaGrad)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-5 rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="mb-4">
            <h2 className="text-[16px] font-extrabold text-[#17324d]">
              Sản phẩm vs Dịch vụ chăm sóc
            </h2>
            <p className="text-[12px] text-[#52657a]">
              So sánh tỷ trọng đóng góp doanh thu ({dataset.label})
            </p>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataset.split} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#52657a' }} axisLine={false} tickLine={false} />
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
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => [formatCurrency(Number(value || 0)), 'Doanh thu']}
                />
                <Bar dataKey="amount" radius={[10, 10, 0, 0]} maxBarSize={68} isAnimationActive={false}>
                  {dataset.split.map((_, idx) => (
                    <Cell key={idx} fill={idx === 0 ? '#0667d0' : '#c2410c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top 5 Products + Cash vs Transfer Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 rounded-2xl bg-white border border-[#dfe6f0] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Top 5 sản phẩm đóng góp doanh thu
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Theo số lượng bán ra từ danh mục PetHub
              </p>
            </div>
            <span className="text-[11px] text-[#52657a]">Đơn vị: VND (₫)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-[#eef2f7] text-[11px] font-bold uppercase text-[#52657a]">
                <tr>
                  <th className="py-2.5 pr-3">Sản phẩm</th>
                  <th className="py-2.5 px-3 text-right">Đã bán</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 pl-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f7] text-[13px]">
                {topProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-3 font-bold text-[#17324d] max-w-[300px] truncate">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#17324d] tabular-nums">
                      {p.unitsSold}
                    </td>
                    <td className="py-3 px-3 text-right text-[#52657a] tabular-nums">
                      {formatCurrency(p.priceNum)}
                    </td>
                    <td className="py-3 pl-3 text-right font-extrabold text-[#17324d] tabular-nums">
                      {formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl bg-white border border-[#dfe6f0] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Tiền mặt vs Chuyển khoản
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Tỷ trọng thanh toán thực tế trên hệ thống ({dataset.label})
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: 'Chuyển khoản (VNPay QR & MoMo)',
                  amount: Math.round(totalRevenue * 0.69) + liveMethodStats.transferAmount,
                  pct: 69,
                  color: 'bg-[#0667d0]',
                },
                {
                  label: 'Tiền mặt (COD / Tại quầy)',
                  amount: Math.round(totalRevenue * 0.31) + liveMethodStats.cashAmount,
                  pct: 31,
                  color: 'bg-[#c2410c]',
                },
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] tabular-nums">
                    <span className="font-bold text-[#17324d]">{row.label}</span>
                    <span className="font-extrabold text-[#17324d]">
                      {formatCurrency(row.amount)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] font-semibold text-[#52657a] tabular-nums">
                    {row.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#eef2f7] flex items-center justify-between tabular-nums">
            <span className="text-[13px] font-bold text-[#17324d]">Tổng theo kỳ</span>
            <span className="text-[17px] font-extrabold text-[#0667d0]">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

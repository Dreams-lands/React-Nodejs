import React, { useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Banknote,
  Landmark,
  CheckCircle2,
  ScanBarcode,
  Printer,
  RotateCcw,
  UserCheck,
  X,
  Phone,
} from 'lucide-react';
import type { LookupOrderEntry, ProductCategory, ProductItem } from '../../data/mockData';
import { formatCurrency } from '../../data/mockData';
import type { StoreSettings } from '../../data/adminData';

interface AdminPosViewProps {
  products: ProductItem[];
  storeSettings: StoreSettings;
  staffMembers: string[];
  defaultStaffName: string;
  onCreatePosOrder: (
    entry: LookupOrderEntry,
    soldItems: Array<{ id: string; quantity: number }>
  ) => void;
  onNotify: (msg: string) => void;
}

interface PrintedReceiptSnapshot {
  entry: LookupOrderEntry;
  cashGiven: number | null;
  changeDue: number;
}

const POS_CATEGORIES: Array<{ id: 'all' | Exclude<ProductCategory, 'spa'>; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'food', label: 'Dinh dưỡng & Pate' },
  { id: 'hygiene', label: 'Thuốc & Làm đẹp' },
  { id: 'bed', label: 'Nệm & Chuồng' },
  { id: 'backpack', label: 'Balo & Phụ kiện' },
];

const QUICK_CASH_NOTES = [100000, 200000, 500000, 1000000];

const KNOWN_MEMBER_PHONES: Record<string, string> = {
  '0909123456': 'Trịnh Anh Khoa',
  '0914882390': 'Nguyễn Quỳnh Như',
  '0935678920': 'Lê Thảo Vy',
  '0987123456': 'Phạm Đức Huy',
};

export const AdminPosView: React.FC<AdminPosViewProps> = ({
  products,
  storeSettings,
  staffMembers,
  defaultStaffName,
  onCreatePosOrder,
  onNotify,
}) => {
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState<'all' | Exclude<ProductCategory, 'spa'>>('all');
  const [posCart, setPosCart] = useState<Array<{ product: ProductItem; quantity: number }>>([]);
  const [selectedCashier, setSelectedCashier] = useState<string>(defaultStaffName);
  const [posCustomerName, setPosCustomerName] = useState('Khách lẻ tại quầy');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [recognizedMember, setRecognizedMember] = useState(false);
  const [posPaymentMethod, setPosPaymentMethod] = useState<
    'Thanh toán khi nhận hàng (COD)' | 'VNPay' | 'MoMo'
  >('Thanh toán khi nhận hàng (COD)');
  const [cashGivenInput, setCashGivenInput] = useState<string>('');
  const [printedReceipt, setPrintedReceipt] = useState<PrintedReceiptSnapshot | null>(null);

  const cashierOptions = useMemo(() => {
    const list = staffMembers.includes(defaultStaffName)
      ? staffMembers
      : [defaultStaffName, ...staffMembers];
    return Array.from(new Set(list));
  }, [staffMembers, defaultStaffName]);

  const filteredProducts = useMemo(() => {
    const q = posSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = posCategory === 'all' || p.category === posCategory;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, posCategory, posSearch]);

  const posTotal = useMemo(
    () => posCart.reduce((sum, line) => sum + line.product.priceNum * line.quantity, 0),
    [posCart]
  );

  const posTotalQty = useMemo(
    () => posCart.reduce((sum, line) => sum + line.quantity, 0),
    [posCart]
  );

  const isCashPayment = posPaymentMethod === 'Thanh toán khi nhận hàng (COD)';
  const parsedCashGiven = Number(cashGivenInput.replace(/\D/g, '')) || 0;
  const changeDue = parsedCashGiven - posTotal;

  const addToPosCart = (product: ProductItem) => {
    if (product.stockCount <= 0) {
      onNotify(`"${product.name}" đã hết hàng trong kho.`);
      return;
    }
    setPosCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockCount) {
          onNotify(`Số lượng tối đa còn lại là ${product.stockCount} sp.`);
          return prev;
        }
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleQuickBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = posSearch.trim().toLowerCase();
    if (!raw) return;

    const exactSku = products.find((p) => p.id.toLowerCase() === raw);
    const firstMatch = exactSku || filteredProducts.find((p) => p.stockCount > 0);
    if (!firstMatch) {
      onNotify(`Không tìm thấy sản phẩm còn hàng khớp với "${posSearch.trim()}".`);
      return;
    }
    addToPosCart(firstMatch);
    setPosSearch('');
    scanInputRef.current?.focus();
    onNotify(`+1 ${firstMatch.name}`);
  };

  const updatePosQty = (productId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((line) => {
          if (line.product.id !== productId) return line;
          const next = line.quantity + delta;
          if (next <= 0) return null;
          if (next > line.product.stockCount) {
            onNotify(`Chỉ còn ${line.product.stockCount} sản phẩm trong kho.`);
            return line;
          }
          return { ...line, quantity: next };
        })
        .filter((x): x is { product: ProductItem; quantity: number } => x !== null)
    );
  };

  const handlePhoneChange = (val: string) => {
    setPosCustomerPhone(val);
    const digits = val.replace(/\D/g, '');
    const matched = KNOWN_MEMBER_PHONES[digits];
    if (matched) {
      setPosCustomerName(matched);
      setRecognizedMember(true);
    } else {
      setRecognizedMember(false);
    }
  };

  const handleClearBill = () => {
    setPosCart([]);
    setPosCustomerName('Khách lẻ tại quầy');
    setPosCustomerPhone('');
    setRecognizedMember(false);
    setCashGivenInput('');
    scanInputRef.current?.focus();
  };

  const handleCheckoutPos = () => {
    if (posCart.length === 0) {
      onNotify('Vui lòng quét hoặc chọn ít nhất 1 sản phẩm trước khi thanh toán.');
      return;
    }

    if (isCashPayment && parsedCashGiven > 0 && parsedCashGiven < posTotal) {
      onNotify(
        `Tiền khách đưa chưa đủ (còn thiếu ${formatCurrency(posTotal - parsedCashGiven)}).`
      );
      return;
    }

    const orderId = `PH${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');

    const effectiveCash = isCashPayment ? (parsedCashGiven > 0 ? parsedCashGiven : posTotal) : null;
    const effectiveChange = effectiveCash !== null ? Math.max(0, effectiveCash - posTotal) : 0;

    const newEntry: LookupOrderEntry = {
      id: orderId,
      createdAt: `${dd}/${mm}/2026 • ${hh}:${mi}`,
      status: 'completed',
      totalAmount: posTotal,
      shippingAddress: `Mua tại quầy: ${storeSettings.streetAddress}, ${storeSettings.district}, ${storeSettings.city}`,
      paymentMethod: posPaymentMethod,
      deliveryMethod: 'pickup',
      customerName: posCustomerName.trim() || 'Khách lẻ tại quầy',
      customerPhone: posCustomerPhone.trim() || '0909 000 000',
      staffName: selectedCashier,
      isGuest: !recognizedMember,
      items: posCart.map((line) => ({
        id: line.product.id,
        name: line.product.name,
        image: line.product.image,
        price: line.product.priceNum,
        quantity: line.quantity,
        variant: line.product.sizes[0] || 'Tiêu chuẩn',
      })),
    };

    onCreatePosOrder(
      newEntry,
      posCart.map((l) => ({ id: l.product.id, quantity: l.quantity }))
    );

    setPrintedReceipt({
      entry: newEntry,
      cashGiven: effectiveCash,
      changeDue: effectiveChange,
    });
    handleClearBill();
  };

  return (
    <div className="space-y-5 w-full min-w-0">
      {/* POS Top Counter Bar (Bách Hóa Xanh Cashier Style) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
              Bán tại quầy (POS)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              Quầy Thu Ngân #01
            </span>
          </div>
          <p className="text-[13px] text-[#52657a] mt-1">
            Quét mã SKU / bấm chọn nhanh sản phẩm, tính tiền thừa khách đưa và in hóa đơn tại quầy.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white border border-[#dfe6f0] px-3 py-1.5">
          <UserCheck className="w-4 h-4 text-[#0667d0]" />
          <label htmlFor="pos-cashier-select" className="text-[12px] font-bold text-[#52657a]">
            Nhân viên bán (trực):
          </label>
          <select
            id="pos-cashier-select"
            value={selectedCashier}
            onChange={(e) => setSelectedCashier(e.target.value)}
            className="text-[13px] font-extrabold text-[#17324d] bg-transparent focus:outline-none cursor-pointer"
          >
            {cashierOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Barcode Scan + Category Tabs + 1-Tap Dense Product Grid */}
        <div className="xl:col-span-7 rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
          <div className="p-4 border-b border-[#eef2f7] bg-[#f8faff] space-y-3">
            <form onSubmit={handleQuickBarcodeScan} className="flex items-center gap-2">
              <div className="relative flex-1">
                <ScanBarcode className="w-4 h-4 text-[#0667d0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={scanInputRef}
                  type="text"
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  placeholder="Quét mã SKU (VD: prod-rc-mini) hoặc gõ tên sản phẩm rồi bấm Enter..."
                  aria-label="Quét mã SKU hoặc tìm sản phẩm POS"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#dfe6f0] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[12.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Thêm nhanh</span>
              </button>
            </form>

            {/* Fast Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {POS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPosCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                    posCategory === cat.id
                      ? 'bg-[#0667d0] text-white'
                      : 'bg-white border border-[#dfe6f0] text-[#52657a] hover:text-[#17324d]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[580px] overflow-y-auto">
            {filteredProducts.map((p) => {
              const inCart = posCart.find((line) => line.product.id === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToPosCart(p)}
                  disabled={p.stockCount <= 0}
                  className={`relative flex flex-col justify-between gap-2 p-3 rounded-xl border text-left cursor-pointer disabled:opacity-45 transition-colors ${
                    inCart
                      ? 'border-[#0667d0] bg-[#eff5ff]/55'
                      : 'border-[#dfe6f0] bg-white hover:border-[#0667d0] hover:bg-[#f8faff]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-11 h-11 rounded-lg object-cover border border-[#dfe6f0] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono text-[#52657a] truncate">{p.id}</div>
                      <div className="text-[12.5px] font-bold text-[#17324d] line-clamp-2 leading-snug mt-0.5">
                        {p.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#eef2f7] text-[12px] tabular-nums">
                    <strong className="text-[#0667d0] text-[13px]">{formatCurrency(p.priceNum)}</strong>
                    <div className="flex items-center gap-1.5">
                      {inCart && (
                        <span className="px-1.5 py-0.5 rounded bg-[#0667d0] text-white text-[10px] font-extrabold">
                          ×{inCart.quantity}
                        </span>
                      )}
                      <span className={p.stockCount <= 15 ? 'text-[#c2410c] font-bold text-[11px]' : 'text-[#52657a] text-[11px]'}>
                        Còn {p.stockCount}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Bách Hóa Xanh Style Cashier Bill & Change Calculator */}
        <div className="xl:col-span-5 rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden flex flex-col">
          {/* Bill Header */}
          <div className="px-5 py-3.5 border-b border-[#eef2f7] bg-[#f8faff] flex items-center justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Phiếu tính tiền tại quầy
              </h2>
              <div className="text-[11.5px] text-[#52657a] tabular-nums">
                {posCart.length} mặt hàng · Tổng {posTotalQty} sản phẩm
              </div>
            </div>
            {posCart.length > 0 && (
              <button
                type="button"
                onClick={handleClearBill}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#dfe6f0] bg-white hover:border-rose-300 text-[#52657a] hover:text-rose-600 text-[12px] font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hủy bill</span>
              </button>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Quick Member Lookup by Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[#52657a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={posCustomerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="SĐT khách (tìm hội viên)..."
                  aria-label="SĐT khách hàng"
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12.5px] font-semibold text-[#17324d]"
                />
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  placeholder="Tên khách hàng"
                  aria-label="Tên khách hàng"
                  className="w-full h-9 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12.5px] font-semibold text-[#17324d]"
                />
                {recognizedMember && (
                  <span className="absolute right-2 px-1.5 py-0.5 rounded bg-[#eff5ff] text-[#0667d0] text-[10px] font-bold">
                    Hội viên
                  </span>
                )}
              </div>
            </div>

            {/* Numbered Itemized Bill Table */}
            <div className="border border-[#eef2f7] rounded-xl overflow-hidden">
              <div className="max-h-[220px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead className="bg-[#f8fafc] border-b border-[#eef2f7] text-[10.5px] font-bold uppercase text-[#52657a] sticky top-0">
                    <tr>
                      <th className="py-2 px-2.5 w-8">#</th>
                      <th className="py-2 px-2">Hàng hóa</th>
                      <th className="py-2 px-2 text-center">SL</th>
                      <th className="py-2 px-2.5 text-right">T.Tiền</th>
                      <th className="py-2 px-1.5 w-7" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f7]">
                    {posCart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[12.5px] text-[#52657a]">
                          Chưa có sản phẩm. Quét mã SKU hoặc bấm chọn sản phẩm bên trái.
                        </td>
                      </tr>
                    ) : (
                      posCart.map((line, index) => (
                        <tr key={line.product.id} className="hover:bg-[#f8faff]/60">
                          <td className="py-2.5 px-2.5 text-[#52657a] font-bold tabular-nums">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-2 min-w-[120px]">
                            <div className="font-bold text-[#17324d] line-clamp-1">
                              {line.product.name}
                            </div>
                            <div className="text-[11px] text-[#52657a] tabular-nums">
                              {formatCurrency(line.product.priceNum)}
                            </div>
                          </td>
                          <td className="py-2.5 px-1.5">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updatePosQty(line.product.id, -1)}
                                className="w-6 h-6 rounded-md border border-[#dfe6f0] flex items-center justify-center text-[#17324d] cursor-pointer"
                                aria-label="Giảm số lượng"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-bold tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updatePosQty(line.product.id, 1)}
                                className="w-6 h-6 rounded-md border border-[#dfe6f0] flex items-center justify-center text-[#17324d] cursor-pointer"
                                aria-label="Tăng số lượng"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-extrabold text-[#17324d] tabular-nums whitespace-nowrap">
                            {formatCurrency(line.product.priceNum * line.quantity)}
                          </td>
                          <td className="py-2.5 px-1.5 text-right">
                            <button
                              type="button"
                              onClick={() => updatePosQty(line.product.id, -line.quantity)}
                              className="w-6 h-6 rounded-md hover:bg-rose-50 text-rose-600 inline-flex items-center justify-center cursor-pointer"
                              aria-label="Xóa dòng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="text-[12px] font-bold text-[#52657a] mb-2">Hình thức thanh toán</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Thanh toán khi nhận hàng (COD)' as const, label: 'Tiền mặt', icon: Banknote },
                  { id: 'VNPay' as const, label: 'VNPay QR', icon: Landmark },
                  { id: 'MoMo' as const, label: 'Ví MoMo', icon: Landmark },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = posPaymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPosPaymentMethod(m.id)}
                      className={`py-2 px-2 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#eff5ff] border-[#0667d0] text-[#0667d0]'
                          : 'bg-white border-[#dfe6f0] text-[#52657a]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Received + Change Calculation (Bách Hóa Xanh style) */}
            {isCashPayment ? (
              <div className="rounded-xl bg-[#f8faff] border border-[#dfe6f0] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="pos-cash-given" className="text-[12px] font-bold text-[#17324d]">
                    Tiền khách đưa
                  </label>
                  <input
                    id="pos-cash-given"
                    type="text"
                    inputMode="numeric"
                    value={cashGivenInput}
                    onChange={(e) => setCashGivenInput(e.target.value)}
                    placeholder={posTotal > 0 ? String(posTotal) : '0'}
                    className="w-40 h-9 px-3 rounded-lg border border-[#dfe6f0] bg-white text-right text-[13.5px] font-extrabold text-[#17324d] tabular-nums focus:outline-none focus:border-[#0667d0]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={posTotal <= 0}
                    onClick={() => setCashGivenInput(String(posTotal))}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#c8ddf8] hover:border-[#0667d0] text-[11px] font-bold text-[#0667d0] cursor-pointer disabled:opacity-45"
                  >
                    Vừa đủ
                  </button>
                  {QUICK_CASH_NOTES.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setCashGivenInput(String(note))}
                      className="px-2.5 py-1 rounded-md bg-white border border-[#dfe6f0] hover:border-[#0667d0] text-[11px] font-bold text-[#17324d] cursor-pointer tabular-nums"
                    >
                      {note >= 1000000 ? '1tr' : `${note / 1000}k`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#dfe6f0] tabular-nums">
                  <span className="text-[12.5px] font-bold text-[#52657a]">Tiền thối lại</span>
                  {parsedCashGiven === 0 ? (
                    <span className="text-[13px] font-bold text-[#52657a]">0₫</span>
                  ) : changeDue >= 0 ? (
                    <span className="text-[15px] font-extrabold text-emerald-700">
                      {formatCurrency(changeDue)}
                    </span>
                  ) : (
                    <span className="text-[12.5px] font-bold text-[#c2410c]">
                      Thiếu {formatCurrency(Math.abs(changeDue))}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#eff5ff] border border-[#c8ddf8] p-3 text-[12px] font-semibold text-[#0667d0]">
                Khách quét mã {posPaymentMethod} tại quầy — tự động thu đủ {formatCurrency(posTotal)}.
              </div>
            )}

            {/* Total & Pay Button */}
            <div className="pt-3 border-t border-[#eef2f7] space-y-3">
              <div className="flex items-center justify-between tabular-nums">
                <span className="text-[13px] font-bold text-[#52657a]">Khách phải trả</span>
                <span className="text-[22px] font-extrabold text-[#0667d0]">
                  {formatCurrency(posTotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutPos}
                className="w-full py-3 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13.5px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Thanh toán &amp; In hóa đơn</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bách Hóa Xanh Style K80 Thermal Receipt Preview Modal */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#dfe6f0] shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#eef2f7] flex items-center justify-between bg-[#f8faff]">
              <div className="text-[14px] font-extrabold text-[#17324d]">
                Phiếu hóa đơn bán lẻ (K80)
              </div>
              <button
                type="button"
                onClick={() => setPrintedReceipt(null)}
                aria-label="Đóng phiếu in"
                className="p-1.5 rounded-lg hover:bg-white text-[#52657a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-[12.5px] text-[#17324d]">
              <div className="text-center border-b border-dashed border-[#dfe6f0] pb-3">
                <div className="text-[15px] font-extrabold text-[#0667d0]">
                  {storeSettings.storeName}
                </div>
                <div className="text-[11px] text-[#52657a]">
                  {storeSettings.streetAddress}, {storeSettings.district}, {storeSettings.city}
                </div>
                <div className="text-[11px] text-[#52657a]">Hotline: {storeSettings.hotline}</div>
              </div>

              <div className="grid grid-cols-2 gap-y-1 text-[12px]">
                <span className="text-[#52657a]">Số hóa đơn:</span>
                <strong className="text-right tabular-nums">#{printedReceipt.entry.id}</strong>
                <span className="text-[#52657a]">Thời gian:</span>
                <span className="text-right tabular-nums">{printedReceipt.entry.createdAt}</span>
                <span className="text-[#52657a]">Thu ngân (trực):</span>
                <strong className="text-right text-[#0667d0]">
                  {printedReceipt.entry.staffName || selectedCashier}
                </strong>
                <span className="text-[#52657a]">Khách hàng:</span>
                <strong className="text-right">{printedReceipt.entry.customerName}</strong>
              </div>

              <div className="border-y border-dashed border-[#dfe6f0] py-2.5 space-y-2">
                {printedReceipt.entry.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{item.name}</div>
                      <div className="text-[11px] text-[#52657a] tabular-nums">
                        {item.quantity} × {formatCurrency(item.price)}
                      </div>
                    </div>
                    <strong className="tabular-nums shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="space-y-1 tabular-nums">
                <div className="flex justify-between text-[14px] font-extrabold">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-[#0667d0]">
                    {formatCurrency(printedReceipt.entry.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] text-[#52657a]">
                  <span>Hình thức:</span>
                  <span className="font-semibold text-[#17324d]">
                    {printedReceipt.entry.paymentMethod}
                  </span>
                </div>
                {printedReceipt.cashGiven !== null && (
                  <>
                    <div className="flex justify-between text-[12px] text-[#52657a]">
                      <span>Tiền khách đưa:</span>
                      <span className="font-semibold text-[#17324d]">
                        {formatCurrency(printedReceipt.cashGiven)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[12.5px] font-bold text-emerald-700">
                      <span>Tiền thối lại:</span>
                      <span>{formatCurrency(printedReceipt.changeDue)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-[11px] text-[#52657a] pt-2 border-t border-dashed border-[#dfe6f0]">
                Cảm ơn Quý khách đã mua sắm tại PetsFriend!
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[#eef2f7] bg-[#f8faff] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  onNotify(`Đã gửi lệnh in bill #${printedReceipt.entry.id}.`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[12.5px] font-bold text-[#17324d] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In bill</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[12.5px] font-bold cursor-pointer"
              >
                Tạo bill mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Banknote,
  Landmark,
  CheckCircle2,
} from 'lucide-react';
import type { LookupOrderEntry, ProductItem } from '../../data/mockData';
import { formatCurrency } from '../../data/mockData';
import type { StoreSettings } from '../../data/adminData';

interface AdminPosViewProps {
  products: ProductItem[];
  storeSettings: StoreSettings;
  onCreatePosOrder: (
    entry: LookupOrderEntry,
    soldItems: Array<{ id: string; quantity: number }>
  ) => void;
  onNotify: (msg: string) => void;
}

export const AdminPosView: React.FC<AdminPosViewProps> = ({
  products,
  storeSettings,
  onCreatePosOrder,
  onNotify,
}) => {
  const [posSearch, setPosSearch] = useState('');
  const [posCart, setPosCart] = useState<Array<{ product: ProductItem; quantity: number }>>([]);
  const [posCustomerName, setPosCustomerName] = useState('Khách lẻ tại quầy');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<
    'Thanh toán khi nhận hàng (COD)' | 'VNPay' | 'MoMo'
  >('Thanh toán khi nhận hàng (COD)');

  const filteredProducts = useMemo(() => {
    const q = posSearch.trim().toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }, [products, posSearch]);

  const posTotal = useMemo(
    () => posCart.reduce((sum, line) => sum + line.product.priceNum * line.quantity, 0),
    [posCart]
  );

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

  const handleCheckoutPos = () => {
    if (posCart.length === 0) {
      onNotify('Vui lòng chọn ít nhất 1 sản phẩm trước khi lập hóa đơn.');
      return;
    }

    const orderId = `PH${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');

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
      isGuest: true,
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

    setPosCart([]);
    setPosCustomerName('Khách lẻ tại quầy');
    setPosCustomerPhone('');
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
          Bán hàng nhanh tại quầy (POS)
        </h1>
        <p className="text-[13px] text-[#52657a] mt-1">
          Lập phiếu bán trực tiếp cho khách, tự động trừ tồn kho và ghi nhận hóa đơn tức thì.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Product picker */}
        <div className="xl:col-span-7 rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
          <div className="p-4 border-b border-[#eef2f7] bg-[#f8faff]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#52657a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                placeholder="Tìm tên sản phẩm, mã SKU hoặc thương hiệu..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#dfe6f0] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
              />
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto">
            {filteredProducts.slice(0, 12).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToPosCart(p)}
                disabled={p.stockCount <= 0}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#dfe6f0] hover:border-[#0667d0] hover:bg-[#f8faff] text-left cursor-pointer disabled:opacity-50 transition-colors"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#dfe6f0] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-[#17324d] line-clamp-1">{p.name}</div>
                  <div className="flex items-center justify-between gap-2 mt-1 text-[12px] tabular-nums">
                    <strong className="text-[#0667d0]">{formatCurrency(p.priceNum)}</strong>
                    <span className={p.stockCount <= 15 ? 'text-[#c2410c] font-bold' : 'text-[#52657a]'}>
                      Còn {p.stockCount}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket & Checkout */}
        <div className="xl:col-span-5 rounded-2xl bg-white border border-[#dfe6f0] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <h2 className="text-[16px] font-extrabold text-[#17324d]">Phiếu thanh toán tại quầy</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={posCustomerName}
                onChange={(e) => setPosCustomerName(e.target.value)}
                placeholder="Tên khách hàng"
                className="h-9 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12.5px] font-semibold text-[#17324d]"
              />
              <input
                type="text"
                value={posCustomerPhone}
                onChange={(e) => setPosCustomerPhone(e.target.value)}
                placeholder="SĐT khách (tùy chọn)"
                className="h-9 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12.5px] font-semibold text-[#17324d]"
              />
            </div>

            <div className="divide-y divide-[#eef2f7] border border-[#eef2f7] rounded-xl max-h-[240px] overflow-y-auto">
              {posCart.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-[#52657a]">
                  Chọn sản phẩm bên trái để thêm vào phiếu bán hàng.
                </div>
              ) : (
                posCart.map((line) => (
                  <div key={line.product.id} className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-[#17324d] truncate">
                        {line.product.name}
                      </div>
                      <div className="text-[11px] text-[#52657a] tabular-nums">
                        {formatCurrency(line.product.priceNum)} × {line.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updatePosQty(line.product.id, -1)}
                        className="w-7 h-7 rounded-lg border border-[#dfe6f0] flex items-center justify-center text-[#17324d] cursor-pointer"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-[12px] font-bold tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePosQty(line.product.id, 1)}
                        className="w-7 h-7 rounded-lg border border-[#dfe6f0] flex items-center justify-center text-[#17324d] cursor-pointer"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePosQty(line.product.id, -line.quantity)}
                        className="w-7 h-7 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer"
                        aria-label="Xóa khỏi giỏ POS"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <div className="text-[12px] font-bold text-[#52657a] mb-2">Hình thức thu tiền</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Thanh toán khi nhận hàng (COD)' as const, label: 'Tiền mặt', icon: Banknote },
                  { id: 'VNPay' as const, label: 'VNPay', icon: Landmark },
                  { id: 'MoMo' as const, label: 'MoMo', icon: Landmark },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = posPaymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPosPaymentMethod(m.id)}
                      className={`py-2 px-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
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
          </div>

          <div className="pt-4 border-t border-[#eef2f7] space-y-3">
            <div className="flex items-center justify-between tabular-nums">
              <span className="text-[13px] font-bold text-[#52657a]">Tổng cộng hóa đơn</span>
              <span className="text-[20px] font-extrabold text-[#0667d0]">
                {formatCurrency(posTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckoutPos}
              className="w-full py-3 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13.5px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors press-tactile"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hoàn tất &amp; Xuất hóa đơn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

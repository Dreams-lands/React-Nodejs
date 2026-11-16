import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Check,
  Lock,
  RefreshCw,
  Info,
  Users,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  SHARED_STAFF_PERMISSION_ROWS,
  type PaymentGatewayConfig,
  type SettingsTabId,
  type SharedStaffPermissions,
  type StoreSettings,
} from '../../data/adminData';

interface AdminSettingsViewProps {
  activeTab?: SettingsTabId;
  storeSettings: StoreSettings;
  paymentGateways: PaymentGatewayConfig;
  staffRoster: string[];
  staffPermissions: SharedStaffPermissions;
  onSaveStoreSettings: (next: StoreSettings) => void;
  onSavePaymentGateways: (next: PaymentGatewayConfig) => void;
  onSaveStaffRoster: (nextRoster: string[]) => void;
  onSaveStaffPermissions: (nextPerms: SharedStaffPermissions) => void;
  onNotify: (msg: string) => void;
}

const SETTINGS_HEADER_META: Record<
  SettingsTabId,
  { breadcrumb: string; title: string; subtitle: string }
> = {
  general: {
    breadcrumb: 'Quản trị / Cài đặt / Cửa hàng',
    title: 'Thông tin Cửa hàng',
    subtitle: 'Quản lý địa chỉ, hotline và thông tin hiển thị trên hóa đơn & Storefront.',
  },
  payments: {
    breadcrumb: 'Quản trị / Cài đặt / Thanh toán',
    title: 'Cổng Thanh toán',
    subtitle: 'Cấu hình VNPay QR, ví điện tử MoMo và thanh toán khi nhận hàng (COD).',
  },
  permissions: {
    breadcrumb: 'Quản trị / Cài đặt / Phân quyền',
    title: 'Phân quyền Nhân viên',
    subtitle: 'Thiết lập quyền truy cập từng phân hệ quản trị theo vai trò nhân sự.',
  },
};

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  activeTab = 'general',
  storeSettings,
  paymentGateways,
  staffRoster,
  staffPermissions,
  onSaveStoreSettings,
  onSavePaymentGateways,
  onSaveStaffRoster,
  onSaveStaffPermissions,
  onNotify,
}) => {
  const [draftStore, setDraftStore] = useState<StoreSettings>(storeSettings);
  const [draftGateways, setDraftGateways] = useState<PaymentGatewayConfig>(paymentGateways);
  const [draftPermissions, setDraftPermissions] = useState<SharedStaffPermissions>(staffPermissions);
  const [newStaffName, setNewStaffName] = useState('');
  const headerMeta = SETTINGS_HEADER_META[activeTab];

  const toggleStaffPermission = (key: keyof SharedStaffPermissions) => {
    setDraftPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newStaffName.trim();
    if (!cleaned) return;
    if (staffRoster.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
      onNotify(`Nhân viên "${cleaned}" đã có trong danh sách dùng chung tài khoản staff.`);
      return;
    }
    onSaveStaffRoster([...staffRoster, cleaned]);
    setNewStaffName('');
  };

  const handleRemoveStaffMember = (name: string) => {
    if (staffRoster.length <= 1) {
      onNotify('Cần giữ ít nhất 1 nhân viên sử dụng tài khoản staff.');
      return;
    }
    onSaveStaffRoster(staffRoster.filter((s) => s !== name));
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
          {headerMeta.title}
        </h1>
        <p className="text-[13px] text-[#52657a] mt-1">
          {headerMeta.subtitle}
        </p>
      </div>

      {/* Tab 1: General Store Info */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveStoreSettings(draftStore);
            }}
            className="xl:col-span-8 rounded-2xl bg-white border border-[#dfe6f0] p-5 sm:p-6 space-y-5"
          >
            <div>
              <h2 className="text-[16px] font-extrabold text-[#17324d]">
                Thông tin cửa hàng chính thức
              </h2>
              <p className="text-[12px] text-[#52657a]">
                Hiển thị trên hóa đơn đặt hàng, điểm nhận tại cửa hàng và footer trang khách.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                  Tên cửa hàng
                </label>
                <input
                  type="text"
                  value={draftStore.storeName}
                  onChange={(e) => setDraftStore({ ...draftStore, storeName: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-medium"
                />
              </div>

              <div className="pt-2 border-t border-[#eef2f7] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Địa chỉ đường / Phường
                  </label>
                  <input
                    type="text"
                    value={draftStore.streetAddress}
                    onChange={(e) =>
                      setDraftStore({ ...draftStore, streetAddress: e.target.value })
                    }
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    value={draftStore.district}
                    onChange={(e) => setDraftStore({ ...draftStore, district: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Thành phố / Tỉnh
                  </label>
                  <input
                    type="text"
                    value={draftStore.city}
                    onChange={(e) => setDraftStore({ ...draftStore, city: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#eef2f7] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Hotline tổng đài
                  </label>
                  <input
                    type="text"
                    value={draftStore.hotline}
                    onChange={(e) => setDraftStore({ ...draftStore, hotline: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Email chăm sóc khách hàng
                  </label>
                  <input
                    type="email"
                    value={draftStore.email}
                    onChange={(e) => setDraftStore({ ...draftStore, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Link Zalo cá nhân / OA
                  </label>
                  <input
                    type="url"
                    value={draftStore.zaloUrl}
                    onChange={(e) => setDraftStore({ ...draftStore, zaloUrl: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Link Fanpage / Facebook
                  </label>
                  <input
                    type="url"
                    value={draftStore.facebookUrl}
                    onChange={(e) => setDraftStore({ ...draftStore, facebookUrl: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eef2f7] flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDraftStore(storeSettings)}
                className="px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
              >
                Khôi phục
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#c2410c] hover:bg-[#a93608] text-white text-[13px] font-bold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>

          {/* Right Live Preview Card */}
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-extrabold text-[#17324d]">
                  Hiển thị phía khách hàng
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#f8faff] border border-[#dfe6f0] text-[10px] font-bold text-[#52657a]">
                  Xem trước
                </span>
              </div>

              <div className="pb-3 border-b border-[#eef2f7] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#0667d0] flex items-center justify-center font-extrabold">
                  P
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-extrabold text-[#17324d] truncate">
                    {draftStore.storeName}
                  </div>
                  <div className="text-[11px] text-[#52657a]">{draftStore.hours}</div>
                </div>
              </div>

              <div className="space-y-2.5 text-[12px] text-[#52657a]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#0667d0] shrink-0 mt-0.5" />
                  <span>
                    {draftStore.streetAddress}, {draftStore.district}, {draftStore.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0667d0] shrink-0" />
                  <span className="tabular-nums">
                    {draftStore.hotline} · {draftStore.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0667d0] shrink-0" />
                  <span>{draftStore.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0667d0] shrink-0" />
                  <span className="truncate">{draftStore.zaloUrl}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#eff5ff] border border-[#c8ddf8] p-4 flex items-start gap-2.5 text-[12px] text-[#17324d]">
              <Info className="w-4 h-4 text-[#0667d0] shrink-0 mt-0.5" />
              <span>
                Thay đổi tại đây sẽ cập nhật đồng bộ ngay sang mục <strong>Nhận tại cửa hàng</strong> và thông tin liên hệ trên Storefront.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payment Gateways */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 space-y-4">
            <div className="rounded-2xl bg-[#eff5ff] border border-[#c8ddf8] px-4 py-3 text-[12px] text-[#0667d0] font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Chế độ mô phỏng Sandbox đang bật cho đồ án — các cổng hoạt động khớp 100% với trang Giỏ hàng khách hàng.</span>
            </div>

            {/* COD Card */}
            <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-extrabold text-[#17324d]">
                      Thanh toán khi nhận hàng (COD)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#eff5ff] text-[#0667d0] text-[10px] font-bold">
                      Tiền mặt / Nhận tại quầy
                    </span>
                  </div>
                  <p className="text-[12px] text-[#52657a] mt-0.5">
                    Khách hàng kiểm tra sản phẩm và thanh toán khi nhận hàng.
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label="Bật COD"
                  checked={draftGateways.codEnabled}
                  onChange={(e) =>
                    setDraftGateways({ ...draftGateways, codEnabled: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#0667d0] cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={draftGateways.codNote}
                onChange={(e) => setDraftGateways({ ...draftGateways, codNote: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12px]"
              />
            </div>

            {/* VNPay Card */}
            <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-extrabold text-[#17324d]">VNPay QR / ATM</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Sandbox đang bật
                    </span>
                  </div>
                  <p className="text-[12px] text-[#52657a] mt-0.5">
                    Thanh toán quét mã QR ngân hàng nội địa &amp; thẻ quốc tế.
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label="Bật VNPay"
                  checked={draftGateways.vnpayEnabled}
                  onChange={(e) =>
                    setDraftGateways({ ...draftGateways, vnpayEnabled: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#0667d0] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#52657a] mb-1">
                    Terminal ID / Mã TMN
                  </label>
                  <input
                    type="text"
                    value={draftGateways.vnpayTmnCode}
                    onChange={(e) =>
                      setDraftGateways({ ...draftGateways, vnpayTmnCode: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#52657a] mb-1">
                    Môi trường kết nối
                  </label>
                  <select
                    value={draftGateways.vnpayEnvironment}
                    onChange={(e) =>
                      setDraftGateways({
                        ...draftGateways,
                        vnpayEnvironment: e.target.value as 'sandbox' | 'production',
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12px]"
                  >
                    <option value="sandbox">Sandbox / Kiểm thử</option>
                    <option value="production">Production / Thực tế</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#52657a] font-mono">
                  Secret: {draftGateways.vnpayHashSecret}
                </span>
                <button
                  type="button"
                  onClick={() => onNotify('Kết nối thử cổng VNPay Sandbox thành công (200 OK).')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dfe6f0] hover:border-[#0667d0] text-[12px] font-bold text-[#17324d] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kiểm tra kết nối</span>
                </button>
              </div>
            </div>

            {/* MoMo Card */}
            <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-extrabold text-[#17324d]">Ví điện tử MoMo</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Sandbox đang bật
                    </span>
                  </div>
                  <p className="text-[12px] text-[#52657a] mt-0.5">
                    Quét mã MoMo hoặc chuyển hướng ứng dụng thanh toán nhanh.
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label="Bật MoMo"
                  checked={draftGateways.momoEnabled}
                  onChange={(e) =>
                    setDraftGateways({ ...draftGateways, momoEnabled: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#0667d0] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#52657a] mb-1">
                    Partner Code
                  </label>
                  <input
                    type="text"
                    value={draftGateways.momoPartnerCode}
                    onChange={(e) =>
                      setDraftGateways({ ...draftGateways, momoPartnerCode: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12px] font-mono"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => onNotify('Kết nối thử cổng MoMo Sandbox thành công (200 OK).')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#dfe6f0] hover:border-[#0667d0] text-[12px] font-bold text-[#17324d] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Kiểm tra kết nối</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDraftGateways(paymentGateways)}
                className="px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
              >
                Hủy thay đổi
              </button>
              <button
                type="button"
                onClick={() => onSavePaymentGateways(draftGateways)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#c2410c] hover:bg-[#a93608] text-white text-[13px] font-bold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu cấu hình thanh toán</span>
              </button>
            </div>
          </div>

          <div className="xl:col-span-4 rounded-2xl bg-white border border-[#dfe6f0] p-5 space-y-3">
            <h3 className="text-[14px] font-extrabold text-[#17324d]">
              Trạng thái cổng thanh toán
            </h3>
            <div className="space-y-2.5 text-[12px]">
              {[
                { label: 'VNPay QR / ATM', enabled: draftGateways.vnpayEnabled },
                { label: 'Ví điện tử MoMo', enabled: draftGateways.momoEnabled },
                { label: 'Thanh toán khi nhận hàng (COD)', enabled: draftGateways.codEnabled },
              ].map((g) => (
                <div
                  key={g.label}
                  className="flex items-center justify-between py-2 border-b last:border-b-0 border-[#eef2f7]"
                >
                  <span className="font-semibold text-[#17324d]">{g.label}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      g.enabled
                        ? 'bg-[#eff5ff] text-[#0667d0]'
                        : 'bg-slate-100 text-[#52657a]'
                    }`}
                  >
                    {g.enabled ? 'Đang bật' : 'Đang tắt'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Shared Staff Account Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-5">
          {/* Shared-Staff Model Explainer */}
          <div className="rounded-2xl bg-[#eff5ff] border border-[#c8ddf8] p-4 flex items-start gap-3 text-[12.5px] text-[#17324d]">
            <Info className="w-4 h-4 text-[#0667d0] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0667d0]">Mô hình phân quyền dùng chung tài khoản Staff:</strong> Tất cả nhân viên trực ca sử dụng chung 1 tài khoản{' '}
              <code className="px-1.5 py-0.5 rounded bg-white border border-[#c8ddf8] text-[12px] font-mono">
                staff@pethub.vn
              </code>
              . Sau khi đăng nhập, nhân viên chọn tên ca trực của mình ở thanh trên cùng hoặc quầy POS để tự động ghi nhận vào Hóa đơn bán hàng, đồng thời chịu ràng buộc chung theo bảng phân quyền bên dưới.
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
            <div className="p-5 border-b border-[#eef2f7] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#17324d]">
                  Ma trận phân quyền theo tài khoản hệ thống
                </h2>
                <p className="text-[12px] text-[#52657a]">
                  Bật/tắt quyền thao tác chung cho tất cả nhân viên khi đăng nhập bằng tài khoản staff. Tài khoản Quản trị viên được khóa toàn quyền.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#f8faff] border border-[#dfe6f0] text-[11px] font-bold text-[#17324d]">
                2 tài khoản (Admin &amp; Staff dùng chung)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8faff] border-b border-[#eef2f7] text-[12px] text-[#17324d]">
                  <tr>
                    <th className="px-5 py-3 font-extrabold">Phân hệ / Quyền thao tác</th>
                    <th className="px-5 py-3 text-center font-extrabold">Quản trị viên (admin)</th>
                    <th className="px-5 py-3 text-center font-extrabold">Tài khoản Staff dùng chung ({staffRoster.length} NV)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f7] text-[13px]">
                  {SHARED_STAFF_PERMISSION_ROWS.map((row) => (
                    <tr key={row.key} className="hover:bg-[#f8faff]">
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-bold text-[#52657a] mr-2">
                          [{row.module}]
                        </span>
                        <span className="font-semibold text-[#17324d]">{row.label}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          title="Toàn quyền cố định"
                          className="inline-flex w-6 h-6 rounded-md bg-slate-100 text-[#52657a] items-center justify-center"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {row.lockedAdminOnly ? (
                          <span className="text-[11px] font-bold text-[#52657a]">Chỉ Admin</span>
                        ) : (
                          <input
                            type="checkbox"
                            aria-label={`${row.label} - Tài khoản staff`}
                            checked={draftPermissions[row.key]}
                            onChange={() => toggleStaffPermission(row.key)}
                            className="w-4 h-4 accent-[#0667d0] rounded cursor-pointer"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-4 bg-[#f8faff] border-t border-[#eef2f7] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDraftPermissions(staffPermissions)}
                className="px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
              >
                Khôi phục
              </button>
              <button
                type="button"
                onClick={() => onSaveStaffPermissions(draftPermissions)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu &amp; áp dụng phân quyền</span>
              </button>
            </div>
          </div>

          {/* Shared Staff Roster Card */}
          <div className="rounded-2xl bg-white border border-[#dfe6f0] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eff5ff] text-[#0667d0] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#17324d]">
                    Danh sách nhân viên dùng chung tài khoản staff ({staffRoster.length})
                  </h3>
                  <p className="text-[12px] text-[#52657a]">
                    Nhân viên trong danh sách được chọn tên mình làm nhân viên bán/trực trên POS và Hóa đơn.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddStaffMember} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Tên nhân viên mới..."
                  className="h-9 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12.5px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 h-9 px-3.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[12px] font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {staffRoster.map((memberName) => (
                <div
                  key={memberName}
                  className="rounded-xl border border-[#dfe6f0] bg-[#f8faff] px-3.5 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[#17324d] truncate">{memberName}</div>
                    <div className="text-[11px] text-[#52657a]">Dùng chung · staff@pethub.vn</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStaffMember(memberName)}
                    title={`Xóa ${memberName}`}
                    aria-label={`Xóa nhân viên ${memberName}`}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-[#52657a] hover:text-rose-600 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

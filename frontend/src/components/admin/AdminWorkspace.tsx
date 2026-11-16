import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  BarChart3,
  Settings,
  PawPrint,
  Search,
  Bell,
  ArrowLeft,
  Menu,
  X,
  Store,
  ChevronDown,
  ClipboardCheck,
  LogOut,
  Lock,
} from 'lucide-react';
import type {
  LookupOrderEntry,
  OrderStatus,
  ProductItem,
  ServiceBookingRecord,
} from '../../data/mockData';
import type {
  AdminNavOptions,
  AdminSectionId,
  AnalyticsMode,
  InventoryMode,
  OrdersMode,
  PaymentGatewayConfig,
  SettingsTabId,
  SharedStaffPermissions,
  StoreSettings,
  WorkspaceUserRole,
} from '../../data/adminData';
import type { ConfirmDialogState } from '../ConfirmDialog';
import { AdminOverviewView } from './AdminOverviewView';
import { AdminInventoryView } from './AdminInventoryView';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminAnalyticsView } from './AdminAnalyticsView';
import { AdminAppointmentsView } from './AdminAppointmentsView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminPosView } from './AdminPosView';
import { ThemeToggleButton } from '../ThemeToggleButton';
import type { ThemeMode } from '../../lib/useThemeDroplet';

type SidebarGroupKey = 'orders' | 'sales' | 'inventory' | 'analytics' | 'settings';

interface SidebarChildItem {
  key: string;
  label: string;
  section: AdminSectionId;
  options?: AdminNavOptions;
  badge?: number;
  badgeTone?: 'orange' | 'blue';
  isActive: boolean;
}

type SidebarEntry =
  | {
      kind: 'leaf';
      key: string;
      label: string;
      icon: typeof LayoutDashboard;
      section: AdminSectionId;
      isActive: boolean;
    }
  | {
      kind: 'group';
      key: SidebarGroupKey;
      label: string;
      icon: typeof LayoutDashboard;
      children: SidebarChildItem[];
    };

const SECTION_PARENT_GROUP: Partial<Record<AdminSectionId, SidebarGroupKey>> = {
  orders: 'orders',
  appointments: 'sales',
  pos: 'sales',
  inventory: 'inventory',
  analytics: 'analytics',
  settings: 'settings',
};

interface AdminWorkspaceProps {
  userRole: WorkspaceUserRole;
  currentUserName: string;
  staffRoster: string[];
  activeShiftStaff: string;
  onChangeShiftStaff: (name: string) => void;
  onSaveStaffRoster: (nextRoster: string[]) => void;
  staffPermissions: SharedStaffPermissions;
  onSaveStaffPermissions: (nextPerms: SharedStaffPermissions) => void;
  products: ProductItem[];
  orders: LookupOrderEntry[];
  bookings: ServiceBookingRecord[];
  storeSettings: StoreSettings;
  paymentGateways: PaymentGatewayConfig;
  onSaveProduct: (item: ProductItem, isNew: boolean) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onCreatePosOrder: (
    entry: LookupOrderEntry,
    soldItems: Array<{ id: string; quantity: number }>
  ) => void;
  onAddBooking: (booking: ServiceBookingRecord) => void;
  onUpdateBookingStatus: (id: string, status: ServiceBookingRecord['status']) => void;
  onAssignStaff: (id: string, staffName: string) => void;
  onSaveStoreSettings: (next: StoreSettings) => void;
  onSavePaymentGateways: (next: PaymentGatewayConfig) => void;
  onExitToStorefront: () => void;
  onLogout: () => void;
  onRequestConfirm: (dialog: ConfirmDialogState) => void;
  onNotify: (msg: string) => void;
  theme?: ThemeMode;
  onToggleTheme?: (el: HTMLElement) => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  userRole,
  currentUserName,
  staffRoster,
  activeShiftStaff,
  onChangeShiftStaff,
  onSaveStaffRoster,
  staffPermissions,
  onSaveStaffPermissions,
  products,
  orders,
  bookings,
  storeSettings,
  paymentGateways,
  onSaveProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onCreatePosOrder,
  onAddBooking,
  onUpdateBookingStatus,
  onAssignStaff,
  onSaveStoreSettings,
  onSavePaymentGateways,
  onExitToStorefront,
  onLogout,
  onRequestConfirm,
  onNotify,
  theme = 'light',
  onToggleTheme,
}) => {
  const staffAllowedSections = useMemo<AdminSectionId[]>(() => {
    const allowed: AdminSectionId[] = [];
    if (staffPermissions.ordersManage || staffPermissions.ordersInvoices) allowed.push('orders');
    if (staffPermissions.appointments) allowed.push('appointments');
    if (staffPermissions.pos) allowed.push('pos');
    if (staffPermissions.inventoryView || staffPermissions.inventoryEdit) allowed.push('inventory');
    if (staffPermissions.analytics) allowed.push('analytics');
    return allowed;
  }, [staffPermissions]);

  const [activeSection, setActiveSection] = useState<AdminSectionId>(() =>
    userRole === 'staff' ? staffAllowedSections[0] || 'orders' : 'overview'
  );
  const [ordersMode, setOrdersMode] = useState<OrdersMode>(() =>
    userRole === 'staff' && !staffPermissions.ordersManage && staffPermissions.ordersInvoices
      ? 'invoices'
      : 'manage'
  );
  const [inventoryMode, setInventoryMode] = useState<InventoryMode>('catalog');
  const [analyticsMode, setAnalyticsMode] = useState<AnalyticsMode>('period');
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>('general');
  const [expandedGroups, setExpandedGroups] = useState<Record<SidebarGroupKey, boolean>>({
    orders: true,
    sales: true,
    inventory: true,
    analytics: true,
    settings: false,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const effectiveSection: AdminSectionId =
    userRole === 'staff' && !staffAllowedSections.includes(activeSection)
      ? staffAllowedSections[0] || 'orders'
      : activeSection;

  const effectiveOrdersMode: OrdersMode =
    userRole === 'staff'
      ? ordersMode === 'invoices' && staffPermissions.ordersInvoices
        ? 'invoices'
        : staffPermissions.ordersManage
          ? 'manage'
          : 'invoices'
      : ordersMode;

  useEffect(() => {
    if (!mobileMenuOpen && !showNotifPanel) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setShowNotifPanel(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, showNotifPanel]);

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stockCount <= 15).length,
    [products]
  );
  const navigateTo = (section: AdminSectionId, options?: AdminNavOptions) => {
    if (userRole === 'staff' && !staffAllowedSections.includes(section)) {
      onNotify('Tài khoản nhân viên hiện chưa được cấp quyền truy cập mục này.');
      return;
    }
    if (
      userRole === 'staff' &&
      section === 'orders' &&
      options?.ordersMode === 'invoices' &&
      !staffPermissions.ordersInvoices
    ) {
      onNotify('Tài khoản nhân viên hiện chưa được cấp quyền xem Hóa đơn.');
      return;
    }
    setActiveSection(section);
    if (section === 'orders') {
      setOrdersMode(options?.ordersMode ?? 'manage');
    } else if (options?.ordersMode) {
      setOrdersMode(options.ordersMode);
    }
    if (options?.inventoryMode) {
      setInventoryMode(options.inventoryMode);
    }
    if (options?.analyticsMode && (userRole === 'admin' || staffPermissions.analytics)) {
      setAnalyticsMode(options.analyticsMode);
    }
    if (options?.settingsTab && userRole === 'admin') {
      setSettingsTab(options.settingsTab);
    }
    const parentGroup = SECTION_PARENT_GROUP[section];
    if (parentGroup) {
      setExpandedGroups((prev) => (prev[parentGroup] ? prev : { ...prev, [parentGroup]: true }));
    }
    setMobileMenuOpen(false);
    setShowNotifPanel(false);
  };

  const toggleGroup = (key: SidebarGroupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const upcomingBookingsCount = useMemo(
    () => bookings.filter((b) => b.status === 'upcoming').length,
    [bookings]
  );

  const staffNavEntries: SidebarEntry[] = [];
  if (staffPermissions.ordersManage || staffPermissions.ordersInvoices) {
    const orderChildren: SidebarChildItem[] = [];
    if (staffPermissions.ordersManage) {
      orderChildren.push({
        key: 'orders-manage',
        label: 'Quản lý đơn hàng',
        section: 'orders',
        options: { ordersMode: 'manage' },
        badge: pendingOrdersCount || undefined,
        badgeTone: 'orange',
        isActive: effectiveSection === 'orders' && effectiveOrdersMode === 'manage',
      });
    }
    if (staffPermissions.ordersInvoices) {
      orderChildren.push({
        key: 'orders-invoices',
        label: 'Hóa đơn',
        section: 'orders',
        options: { ordersMode: 'invoices' },
        isActive: effectiveSection === 'orders' && effectiveOrdersMode === 'invoices',
      });
    }
    staffNavEntries.push({
      kind: 'group',
      key: 'orders',
      label: 'Đơn hàng',
      icon: ShoppingBag,
      children: orderChildren,
    });
  }
  if (staffPermissions.appointments || staffPermissions.pos) {
    const salesChildren: SidebarChildItem[] = [];
    if (staffPermissions.appointments) {
      salesChildren.push({
        key: 'appointments',
        label: 'Lịch chăm sóc',
        section: 'appointments',
        badge: upcomingBookingsCount || undefined,
        badgeTone: 'blue',
        isActive: effectiveSection === 'appointments',
      });
    }
    if (staffPermissions.pos) {
      salesChildren.push({
        key: 'pos',
        label: 'Bán tại quầy (POS)',
        section: 'pos',
        isActive: effectiveSection === 'pos',
      });
    }
    staffNavEntries.push({
      kind: 'group',
      key: 'sales',
      label: 'Dịch vụ & Quầy',
      icon: ClipboardCheck,
      children: salesChildren,
    });
  }
  if (staffPermissions.inventoryView || staffPermissions.inventoryEdit) {
    staffNavEntries.push({
      kind: 'leaf',
      key: 'inventory-staff',
      label: staffPermissions.inventoryEdit ? 'Sản phẩm & Kho' : 'Sản phẩm & Kho (Chỉ xem)',
      icon: Boxes,
      section: 'inventory',
      isActive: effectiveSection === 'inventory',
    });
  }
  if (staffPermissions.analytics) {
    staffNavEntries.push({
      kind: 'group',
      key: 'analytics',
      label: 'Doanh thu',
      icon: BarChart3,
      children: [
        {
          key: 'analytics-period',
          label: 'Theo tháng / năm',
          section: 'analytics',
          options: { analyticsMode: 'period' },
          isActive: effectiveSection === 'analytics' && analyticsMode === 'period',
        },
        {
          key: 'analytics-daily',
          label: 'Theo ngày & Hóa đơn',
          section: 'analytics',
          options: { analyticsMode: 'daily' },
          isActive: effectiveSection === 'analytics' && analyticsMode === 'daily',
        },
      ],
    });
  }

  const navEntries: SidebarEntry[] =
    userRole === 'staff'
      ? staffNavEntries
      : [
          {
            kind: 'leaf',
            key: 'overview',
            label: 'Tổng quan',
            icon: LayoutDashboard,
            section: 'overview',
            isActive: activeSection === 'overview',
          },
          {
            kind: 'group',
            key: 'orders',
            label: 'Đơn hàng',
            icon: ShoppingBag,
            children: [
              {
                key: 'orders-manage',
                label: 'Quản lý đơn hàng',
                section: 'orders',
                options: { ordersMode: 'manage' },
                badge: pendingOrdersCount || undefined,
                badgeTone: 'orange',
                isActive: activeSection === 'orders' && ordersMode === 'manage',
              },
              {
                key: 'orders-invoices',
                label: 'Hóa đơn',
                section: 'orders',
                options: { ordersMode: 'invoices' },
                isActive: activeSection === 'orders' && ordersMode === 'invoices',
              },
            ],
          },
          {
            kind: 'group',
            key: 'sales',
            label: 'Dịch vụ & Quầy',
            icon: ClipboardCheck,
            children: [
              {
                key: 'appointments',
                label: 'Dịch vụ chăm sóc',
                section: 'appointments',
                badge: upcomingBookingsCount || undefined,
                badgeTone: 'blue',
                isActive: activeSection === 'appointments',
              },
              {
                key: 'pos',
                label: 'Bán tại quầy (POS)',
                section: 'pos',
                isActive: activeSection === 'pos',
              },
            ],
          },
          {
            kind: 'group',
            key: 'inventory',
            label: 'Kho hàng',
            icon: Boxes,
            children: [
              {
                key: 'inventory-catalog',
                label: 'Các mặt hàng',
                section: 'inventory',
                options: { inventoryMode: 'catalog' },
                isActive: activeSection === 'inventory' && inventoryMode === 'catalog',
              },
              {
                key: 'inventory-stock',
                label: 'Tồn kho',
                section: 'inventory',
                options: { inventoryMode: 'stock' },
                badge: lowStockCount || undefined,
                badgeTone: 'orange',
                isActive: activeSection === 'inventory' && inventoryMode === 'stock',
              },
            ],
          },
          {
            kind: 'group',
            key: 'analytics',
            label: 'Doanh thu',
            icon: BarChart3,
            children: [
              {
                key: 'analytics-period',
                label: 'Theo tháng / năm',
                section: 'analytics',
                options: { analyticsMode: 'period' },
                isActive: activeSection === 'analytics' && analyticsMode === 'period',
              },
              {
                key: 'analytics-daily',
                label: 'Theo ngày & Hóa đơn',
                section: 'analytics',
                options: { analyticsMode: 'daily' },
                isActive: activeSection === 'analytics' && analyticsMode === 'daily',
              },
            ],
          },
          {
            kind: 'group',
            key: 'settings',
            label: 'Cài đặt',
            icon: Settings,
            children: [
              {
                key: 'settings-general',
                label: 'Cửa hàng',
                section: 'settings',
                options: { settingsTab: 'general' },
                isActive: activeSection === 'settings' && settingsTab === 'general',
              },
              {
                key: 'settings-payments',
                label: 'Thanh toán',
                section: 'settings',
                options: { settingsTab: 'payments' },
                isActive: activeSection === 'settings' && settingsTab === 'payments',
              },
              {
                key: 'settings-permissions',
                label: 'Phân quyền',
                section: 'settings',
                options: { settingsTab: 'permissions' },
                isActive: activeSection === 'settings' && settingsTab === 'permissions',
              },
            ],
          },
        ];

  const storeTitle = storeSettings.storeName.split('—')[0].trim() || storeSettings.storeName;
  const storeLocation = `${storeSettings.district} · ${storeSettings.city.replace(
    'TP. Hồ Chí Minh',
    'TP.HCM'
  )}`;

  const handleQuickJumpSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearch.trim().toUpperCase();
    if (!q) return;
    if (q.startsWith('PH')) {
      navigateTo('orders');
    } else if (q.startsWith('BK')) {
      navigateTo('appointments');
    } else {
      navigateTo('inventory', { inventoryMode: 'catalog' });
    }
    onNotify(`Đang mở mục phù hợp với "${globalSearch.trim()}".`);
  };

  const renderSidebarBody = () => (
    <div className="flex flex-col h-full justify-between p-4 bg-white">
      <div className="space-y-5">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0667d0] text-white flex items-center justify-center shrink-0">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[19px] font-extrabold text-[#17324d] leading-none">
                PetsFriend
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#52657a] mt-1">
                {userRole === 'staff' ? 'Nhân viên · Quyền hạn chế' : 'Cổng Quản Trị'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#eff5ff] text-[#52657a] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tree */}
        <nav aria-label="Điều hướng quản trị" className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#52657a]">
            Không gian làm việc
          </div>

          {navEntries.map((entry) => {
            const Icon = entry.icon;

            if (entry.kind === 'leaf') {
              return (
                <button
                  key={entry.key}
                  type="button"
                  aria-current={entry.isActive ? 'page' : undefined}
                  onClick={() => navigateTo(entry.section)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-[13px] cursor-pointer transition-colors ${
                    entry.isActive
                      ? 'bg-[#eff5ff] text-[#0667d0] font-bold'
                      : 'text-[#52657a] font-semibold hover:bg-[#f8faff] hover:text-[#17324d]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{entry.label}</span>
                </button>
              );
            }

            const isExpanded = expandedGroups[entry.key];
            const hasActiveChild = entry.children.some((c) => c.isActive);
            const aggregateBadge = entry.children.reduce((sum, c) => sum + (c.badge ?? 0), 0);
            const hasOrangeAlert = entry.children.some(
              (c) => (c.badge ?? 0) > 0 && c.badgeTone === 'orange'
            );
            const groupPanelId = `sidebar-group-${entry.key}`;

            return (
              <div key={entry.key} className="pt-0.5">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={groupPanelId}
                  onClick={() => toggleGroup(entry.key)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-[13px] font-bold cursor-pointer transition-colors ${
                    !isExpanded && hasActiveChild
                      ? 'bg-[#f8faff] text-[#17324d]'
                      : hasActiveChild
                        ? 'text-[#17324d] hover:bg-[#f8faff]'
                        : 'text-[#52657a] hover:bg-[#f8faff] hover:text-[#17324d]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{entry.label}</span>
                  </span>

                  <span className="flex items-center gap-1.5 shrink-0">
                    {!isExpanded && aggregateBadge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums ${
                          hasOrangeAlert
                            ? 'bg-[#fff2e9] text-[#c2410c]'
                            : 'bg-[#eff5ff] text-[#0667d0]'
                        }`}
                      >
                        {aggregateBadge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#52657a] transition-transform duration-150 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </span>
                </button>

                {isExpanded && (
                  <div
                    id={groupPanelId}
                    className="ml-4 pl-3 border-l border-[#dfe6f0] space-y-0.5 mt-1"
                  >
                    {entry.children.map((child) => (
                      <button
                        key={child.key}
                        type="button"
                        aria-current={child.isActive ? 'page' : undefined}
                        onClick={() => navigateTo(child.section, child.options)}
                        className={`relative w-full px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 text-[13px] cursor-pointer transition-colors ${
                          child.isActive
                            ? 'bg-[#eff5ff] text-[#0667d0] font-bold'
                            : 'text-[#52657a] font-semibold hover:bg-[#f8faff] hover:text-[#17324d]'
                        }`}
                      >
                        {child.isActive && (
                          <span
                            aria-hidden="true"
                            className="w-[2px] h-4 rounded-full bg-[#0667d0] absolute -left-[13px] top-1/2 -translate-y-1/2"
                          />
                        )}
                        <span className="truncate">{child.label}</span>
                        {child.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums ${
                              child.badgeTone === 'orange'
                                ? 'bg-[#fff2e9] text-[#c2410c]'
                                : child.isActive
                                  ? 'bg-[#0667d0] text-white'
                                  : 'bg-[#eff5ff] text-[#0667d0]'
                            }`}
                          >
                            {child.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Store Card + Exit to Storefront */}
      <div className="space-y-2.5 pt-4 border-t border-[#eef2f7]">
        <div className="rounded-xl bg-[#f8faff] border border-[#dfe6f0] p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#eff5ff] text-[#0667d0] flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-extrabold text-[#17324d] leading-snug">
              {storeTitle}
            </div>
            <div className="text-[11px] font-medium text-[#52657a] leading-snug">
              {storeLocation}
            </div>
          </div>
        </div>

        {userRole === 'staff' && (
          <div className="rounded-xl bg-[#f8faff] border border-[#dfe6f0] p-3 flex items-start gap-2 text-[11px] text-[#52657a] leading-snug">
            <Lock className="w-3.5 h-3.5 text-[#c2410c] shrink-0 mt-0.5" />
            <span>Chỉ xem sản phẩm, xem &amp; xác nhận đơn hàng, và xác nhận hoàn thành nhiệm vụ.</span>
          </div>
        )}

        <button
          type="button"
          onClick={onExitToStorefront}
          className="w-full py-2.5 px-3 rounded-xl border border-[#dfe6f0] hover:border-[#0667d0] bg-white hover:bg-[#eff5ff] text-[#17324d] hover:text-[#0667d0] text-[12px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Xem cửa hàng (Storefront)</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-[12px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full bg-[#f8fafc] text-[#17324d] flex overflow-x-hidden">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[264px] shrink-0 border-r border-[#dfe6f0] bg-white sticky top-0 h-screen overflow-y-auto">
        {renderSidebarBody()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng quản trị"
        >
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[276px] max-w-[85vw] h-full bg-white border-r border-[#dfe6f0] z-10 overflow-y-auto">
            {renderSidebarBody()}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 min-w-0 max-w-full flex flex-col">
        {/* Topbar */}
        <header className="h-16 backdrop-surface border-b border-[#dfe6f0] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30 w-full max-w-full">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu quản trị"
              className="lg:hidden p-2 rounded-xl border border-[#dfe6f0] hover:bg-[#eff5ff] text-[#17324d] cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <form
              onSubmit={handleQuickJumpSearch}
              className="relative flex-1 min-w-0 max-w-[440px]"
            >
              <Search className="w-4 h-4 text-[#52657a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Tìm nhanh sản phẩm, mã đơn (PH...), lịch hẹn (BK...)..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:bg-white focus:border-[#0667d0] text-[13px] text-[#17324d] focus:outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 relative">
            <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={() => setShowNotifPanel((prev) => !prev)}
              aria-label="Thông báo vận hành"
              aria-expanded={showNotifPanel}
              className="relative w-9 h-9 rounded-xl border border-[#dfe6f0] bg-[#f8faff] hover:border-[#0667d0] flex items-center justify-center text-[#17324d] cursor-pointer press-tactile"
            >
              <Bell className="w-4 h-4" />
              {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c2410c]" />
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 top-12 w-[300px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_16px_40px_rgba(23,50,77,0.14)] p-4 space-y-2.5 z-40">
                <div className="text-[13px] font-extrabold text-[#17324d]">
                  Thông báo cửa hàng
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('orders')}
                  className="w-full text-left p-2.5 rounded-xl bg-[#fff7f0] text-[12px] text-[#9a3412] font-semibold cursor-pointer"
                >
                  Có <strong>{pendingOrdersCount}</strong> đơn hàng mới đang chờ xác nhận.
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('inventory', { inventoryMode: 'stock' })}
                  className="w-full text-left p-2.5 rounded-xl bg-[#eff5ff] text-[12px] text-[#0667d0] font-semibold cursor-pointer"
                >
                  Có <strong>{lowStockCount}</strong> sản phẩm tồn kho thấp (≤ 15).
                </button>
              </div>
            )}

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#eef2f7]">
              {userRole === 'staff' ? (
                <div className="flex items-center gap-2 rounded-xl border border-[#c8ddf8] bg-[#eff5ff] px-2.5 py-1.5">
                  <span className="hidden md:inline text-[11px] font-bold text-[#52657a]">
                    NV trực:
                  </span>
                  <select
                    aria-label="Chọn nhân viên đang trực ca"
                    value={activeShiftStaff}
                    onChange={(e) => onChangeShiftStaff(e.target.value)}
                    className="text-[12.5px] font-extrabold text-[#0667d0] bg-transparent focus:outline-none cursor-pointer"
                  >
                    {staffRoster.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#eff5ff] text-[#0667d0] text-[12px] font-extrabold flex items-center justify-center">
                    {currentUserName
                      .split(' ')
                      .slice(-2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-[12px] font-extrabold text-[#17324d] leading-tight">
                      {currentUserName}
                    </div>
                    <div className="text-[11px] text-[#52657a]">Quản trị viên</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Active View Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {effectiveSection === 'overview' && userRole === 'admin' && (
            <AdminOverviewView
              products={products}
              orders={orders}
              bookings={bookings}
              onNavigateSection={navigateTo}
              onUpdateOrderStatus={onUpdateOrderStatus}
            />
          )}

          {effectiveSection === 'pos' && (
            <AdminPosView
              products={products}
              storeSettings={storeSettings}
              staffMembers={staffRoster}
              defaultStaffName={userRole === 'staff' ? activeShiftStaff : currentUserName}
              onCreatePosOrder={onCreatePosOrder}
              onNotify={onNotify}
            />
          )}

          {effectiveSection === 'inventory' && (
            <AdminInventoryView
              key={`${inventoryMode}-${userRole}-${staffPermissions.inventoryEdit}`}
              products={products}
              mode={inventoryMode}
              readOnly={userRole === 'staff' && !staffPermissions.inventoryEdit}
              onSaveProduct={onSaveProduct}
              onDeleteProduct={onDeleteProduct}
              onRequestConfirm={onRequestConfirm}
              onNotify={onNotify}
            />
          )}

          {effectiveSection === 'orders' && (
            <AdminOrdersView
              key={effectiveOrdersMode}
              orders={orders}
              mode={effectiveOrdersMode}
              userRole={userRole}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onRequestConfirm={onRequestConfirm}
              onNotify={onNotify}
            />
          )}

          {effectiveSection === 'analytics' && (userRole === 'admin' || staffPermissions.analytics) && (
            <AdminAnalyticsView
              products={products}
              orders={orders}
              mode={analyticsMode}
              onModeChange={(next) => navigateTo('analytics', { analyticsMode: next })}
              onNotify={onNotify}
            />
          )}

          {effectiveSection === 'appointments' && (
            <AdminAppointmentsView
              bookings={bookings}
              userRole={userRole}
              onAddBooking={onAddBooking}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onAssignStaff={onAssignStaff}
              onNotify={onNotify}
            />
          )}

          {effectiveSection === 'settings' && userRole === 'admin' && (
            <AdminSettingsView
              activeTab={settingsTab}
              storeSettings={storeSettings}
              paymentGateways={paymentGateways}
              staffRoster={staffRoster}
              staffPermissions={staffPermissions}
              onSaveStoreSettings={onSaveStoreSettings}
              onSavePaymentGateways={onSavePaymentGateways}
              onSaveStaffRoster={onSaveStaffRoster}
              onSaveStaffPermissions={onSaveStaffPermissions}
              onNotify={onNotify}
            />
          )}
        </main>
      </div>
    </div>
  );
};

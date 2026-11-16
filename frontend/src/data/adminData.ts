import type { LookupOrderEntry, ProductCategory, ServiceBookingRecord } from './mockData';

export type AdminSectionId =
  | 'overview'
  | 'tasks'
  | 'orders'
  | 'pos'
  | 'appointments'
  | 'inventory'
  | 'analytics'
  | 'settings';

export type WorkspaceUserRole = 'admin' | 'staff';

export interface DefaultAccountCredential {
  role: WorkspaceUserRole;
  username: string;
  email: string;
  password: string;
  displayName: string;
  title: string;
}

export const DEFAULT_WORKSPACE_ACCOUNTS: DefaultAccountCredential[] = [
  {
    role: 'admin',
    username: 'admin',
    email: 'admin@pethub.vn',
    password: 'Admin@123',
    displayName: 'Trịnh Anh Khoa',
    title: 'Quản trị viên',
  },
  {
    role: 'staff',
    username: 'staff',
    email: 'staff@pethub.vn',
    password: 'Staff@123',
    displayName: 'Linh Phạm',
    title: 'Nhân viên cửa hàng',
  },
];

export type SettingsTabId = 'general' | 'payments' | 'permissions';
export type InventoryMode = 'catalog' | 'stock';
export type AnalyticsMode = 'period' | 'daily';
export type RevenuePeriodId = 'past-months' | 'past-years';

export interface AdminNavOptions {
  inventoryMode?: InventoryMode;
  analyticsMode?: AnalyticsMode;
  settingsTab?: SettingsTabId;
}

export interface StoreSettings {
  storeName: string;
  streetAddress: string;
  district: string;
  city: string;
  hotline: string;
  phone: string;
  email: string;
  zaloUrl: string;
  facebookUrl: string;
  hours: string;
  timezone: string;
  currency: string;
}

export interface PaymentGatewayConfig {
  codEnabled: boolean;
  codNote: string;
  vnpayEnabled: boolean;
  vnpayTmnCode: string;
  vnpayEnvironment: 'sandbox' | 'production';
  vnpayHashSecret: string;
  momoEnabled: boolean;
  momoPartnerCode: string;
  momoEnvironment: 'sandbox' | 'production';
  momoAccessKey: string;
  momoSecretKey: string;
}

export type StaffRoleKey = 'admin' | 'manager' | 'cashier' | 'groomer';

export interface PermissionMatrixRow {
  id: string;
  module: string;
  label: string;
  manager: boolean;
  cashier: boolean;
  groomer: boolean;
}

export interface StaffAssignmentSummary {
  role: StaffRoleKey;
  title: string;
  subtitle: string;
  membersText: string;
  count: number;
}

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'PetHub Flagship — Chi nhánh Quận 1',
  streetAddress: '128 Nguyễn Trãi, P. Bến Thành',
  district: 'Quận 1',
  city: 'TP. Hồ Chí Minh',
  hotline: '1900 6868',
  phone: '0909 686 868',
  email: 'chamsoc@pethub.vn',
  zaloUrl: 'https://zalo.me/0909686868',
  facebookUrl: 'https://www.facebook.com/pethub.vn',
  hours: '08:00 – 21:00 mỗi ngày',
  timezone: 'Asia/Ho_Chi_Minh (UTC+07:00)',
  currency: 'VND (₫)',
};

export const INITIAL_PAYMENT_GATEWAYS: PaymentGatewayConfig = {
  codEnabled: true,
  codNote: 'Khách kiểm tra hàng trước khi thanh toán trực tiếp cho shipper hoặc tại quầy PetHub.',
  vnpayEnabled: true,
  vnpayTmnCode: 'PETHUB_VNPAY_DEMO',
  vnpayEnvironment: 'sandbox',
  vnpayHashSecret: '•••• •••• •••• •••• DEMO',
  momoEnabled: true,
  momoPartnerCode: 'MOMO_PETHUB_DEMO',
  momoEnvironment: 'sandbox',
  momoAccessKey: '•••• •••• DEMO',
  momoSecretKey: '•••• •••• •••• DEMO',
};

export const ADMIN_CATEGORY_LABELS: Record<'all' | Exclude<ProductCategory, 'spa'>, string> = {
  all: 'Tất cả danh mục',
  food: 'Dinh dưỡng & Pate',
  hygiene: 'Thuốc & Làm đẹp',
  bed: 'Nệm & Lồng chuồng',
  backpack: 'Balo & Phụ kiện',
};

export const ADMIN_EXTRA_ORDERS: LookupOrderEntry[] = [
  {
    id: 'PH261116',
    createdAt: '16/11/2026 • 09:30',
    status: 'completed',
    totalAmount: 489000,
    shippingAddress: 'Thanh toán tại quầy: 128 Nguyễn Trãi, P. Bến Thành, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    deliveryMethod: 'pickup',
    customerName: 'Hồ Minh Tuấn',
    customerPhone: '0907 345 112',
    isGuest: true,
    items: [
      {
        id: 'prod-rc-mini-adult',
        name: 'Hạt dinh dưỡng cho chó giống nhỏ Mini Adult (2 kg)',
        image: '/images/prod-rc-mini.jpg',
        price: 389000,
        quantity: 1,
        variant: 'Túi 2 kg',
      },
      {
        id: 'prod-ceramic-bowl',
        name: 'Bát ăn gốm sứ chân gỗ chống trượt cho chó mèo',
        image: '/images/prod-ceramic-bowl.jpg',
        price: 100000,
        quantity: 1,
        variant: 'Trắng kem',
      },
    ],
  },
  {
    id: 'PH261116B',
    createdAt: '16/11/2026 • 10:15',
    status: 'completed',
    totalAmount: 695000,
    shippingAddress: '102 Cách Mạng Tháng 8, P. Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    paymentMethod: 'VNPay',
    deliveryMethod: 'delivery',
    customerName: 'Nguyễn Quỳnh Như',
    customerPhone: '0914 882 390',
    isGuest: false,
    items: [
      {
        id: 'prod-cat-plush-bed',
        name: 'Nệm tròn lông cừu Cloud Comfort siêu êm cho thú cưng',
        image: '/images/prod-cat-plush-bed.jpg',
        price: 695000,
        quantity: 1,
        variant: 'Size L',
      },
    ],
  },
  {
    id: 'PH261115',
    createdAt: '15/11/2026 • 16:45',
    status: 'pending',
    totalAmount: 985000,
    shippingAddress: 'Nhận tại cửa hàng: 128 Nguyễn Trãi, P. Bến Thành, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'VNPay',
    deliveryMethod: 'pickup',
    customerName: 'Nguyễn Minh Anh',
    customerPhone: '0903 456 781',
    customerEmail: 'minhanh.nguyen@gmail.com',
    isGuest: true,
    items: [
      {
        id: 'prod-cat-litter-box',
        name: 'Hộp cát vệ sinh khử mùi có nắp & xẻng xúc cho mèo',
        image: '/images/prod-cat-litter-box.jpg',
        price: 440000,
        quantity: 1,
        variant: 'Size Tiêu chuẩn',
      },
      {
        id: 'prod-yu-shampoo',
        name: 'Sữa tắm thảo mộc dịu nhẹ dưỡng lông cho mèo (400ml)',
        image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=85',
        price: 265000,
        quantity: 1,
        variant: 'Chai 400ml',
      },
      {
        id: 'prod-collar-cat',
        name: 'Vòng cổ lục lạc & Dây dắt mềm an toàn cho mèo',
        image: '/images/prod-collar-leash.jpg',
        price: 135000,
        quantity: 2,
        variant: 'Size S',
      },
    ],
  },
  {
    id: 'PH261114',
    createdAt: '15/11/2026 • 11:20',
    status: 'pending',
    totalAmount: 790000,
    shippingAddress: '45 Lê Lợi, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'MoMo',
    deliveryMethod: 'delivery',
    customerName: 'Trần Hoàng Nam',
    customerPhone: '0918 222 645',
    customerEmail: 'hoangnam.tran@gmail.com',
    isGuest: true,
    items: [
      {
        id: 'prod-dog-orthopedic-bed',
        name: 'Giường nệm chữ nhật memory foam nâng đỡ xương cho chó',
        image: '/images/prod-dog-bed.jpg',
        price: 790000,
        quantity: 1,
        variant: 'Size M',
      },
    ],
  },
  {
    id: 'PH261112',
    createdAt: '14/11/2026 • 19:05',
    status: 'completed',
    totalAmount: 1250000,
    shippingAddress: '215 Hai Bà Trưng, P. Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    paymentMethod: 'VNPay',
    deliveryMethod: 'delivery',
    customerName: 'Lê Thảo Vy',
    customerPhone: '0935 678 920',
    customerEmail: 'thaovy.le@gmail.com',
    isGuest: false,
    items: [
      {
        id: 'prod-cat-cage',
        name: 'Chuồng mèo biệt thự nhiều tầng sơn tĩnh điện kèm võng',
        image: '/images/prod-cat-cage.jpg',
        price: 1250000,
        quantity: 1,
        variant: 'Biệt thự 3 tầng',
      },
    ],
  },
  {
    id: 'PH261110',
    createdAt: '13/11/2026 • 15:30',
    status: 'completed',
    totalAmount: 440000,
    shippingAddress: '88 Phan Xích Long, P. 2, Q. Phú Nhuận, TP. Hồ Chí Minh',
    paymentMethod: 'MoMo',
    deliveryMethod: 'delivery',
    customerName: 'Phạm Đức Huy',
    customerPhone: '0987 123 456',
    isGuest: false,
    items: [
      {
        id: 'prod-vet-antifungal-spray',
        name: 'Xịt đặc trị nấm da & viêm da cho chó (100ml)',
        image: '/images/prod-antifungal-spray.jpg',
        price: 195000,
        quantity: 1,
        variant: 'Chai 100ml',
      },
      {
        id: 'prod-dog-shampoo',
        name: 'Sữa tắm yến mạch & lô hội dịu nhẹ cho chó (500ml)',
        image: '/images/prod-dog-shampoo.jpg',
        price: 245000,
        quantity: 1,
        variant: 'Chai 500ml',
      },
    ],
  },
  {
    id: 'PH261105',
    createdAt: '10/11/2026 • 10:15',
    status: 'cancelled',
    totalAmount: 520000,
    shippingAddress: '19 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    deliveryMethod: 'delivery',
    customerName: 'Đặng Gia Bảo',
    customerPhone: '0973 345 890',
    isGuest: true,
    items: [
      {
        id: 'prod-travel-bag',
        name: 'Balo phi hành gia vận chuyển mèo chống sốc',
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=85',
        price: 520000,
        quantity: 1,
        variant: 'Cam đất',
      },
    ],
  },
];

export const ADMIN_EXTRA_BOOKINGS: ServiceBookingRecord[] = [
  {
    id: 'BK261116',
    serviceName: 'Tắm thảo mộc & Thư giãn',
    petName: 'Coco (Pomeranian)',
    date: '2026-11-16',
    timeSlot: '09:00 Sáng',
    price: 180000,
    status: 'upcoming',
    customerName: 'Lê Thảo Vy',
    customerPhone: '0935 678 920',
    staffName: 'Linh Phạm',
    note: 'Bé hơi nhát máy sấy, sấy nhẹ gió ấm.',
  },
  {
    id: 'BK261117',
    serviceName: 'Cắt tỉa & Tạo phom lông thẩm mỹ',
    petName: 'Teddy (Poodle nâu)',
    date: '2026-11-17',
    timeSlot: '14:00 Chiều',
    price: 280000,
    status: 'upcoming',
    customerName: 'Võ Ngọc Linh',
    customerPhone: '0908 765 421',
    staffName: 'Mai Nguyễn',
    note: 'Tỉa kiểu gấu bông tròn mặt.',
  },
  {
    id: 'BK261114',
    serviceName: 'Khách sạn thú cưng 5 sao',
    petName: 'Mochi (Samoyed)',
    date: '2026-11-14',
    timeSlot: '10:30 Sáng',
    price: 150000,
    status: 'completed',
    customerName: 'Đặng Gia Bảo',
    customerPhone: '0973 345 890',
    staffName: 'An Trần',
    note: 'Lưu trú 2 ngày kèm khẩu phần hạt riêng.',
  },
  {
    id: 'BK261113',
    serviceName: 'Chăm sóc Toàn diện 7 Bước',
    petName: 'Bông (Mèo Anh lông ngắn)',
    date: '2026-11-13',
    timeSlot: '16:00 Chiều',
    price: 390000,
    status: 'completed',
    customerName: 'Trịnh Anh Khoa',
    customerPhone: '0909 123 456',
    staffName: 'Linh Phạm',
    note: 'Vệ sinh tai & cắt móng định kỳ.',
  },
  {
    id: 'BK261119',
    serviceName: 'Cắt tỉa & Tạo phom lông thẩm mỹ',
    petName: 'Choco (Poodle đen)',
    date: '2026-11-19',
    timeSlot: '16:00 Chiều',
    price: 280000,
    status: 'upcoming',
    customerName: 'Ngô Bảo Ngọc',
    customerPhone: '0987 555 013',
    staffName: 'Mai Nguyễn',
  },
];

export const STAFF_MEMBERS = ['Linh Phạm', 'Mai Nguyễn', 'An Trần'];

export const INITIAL_PERMISSION_MATRIX: PermissionMatrixRow[] = [
  { id: 'perm-overview', module: 'Tổng quan', label: 'Xem bảng điều khiển & chỉ số vận hành', manager: true, cashier: true, groomer: true },
  { id: 'perm-inv-view', module: 'Kho hàng', label: 'Xem danh sách sản phẩm & tồn kho', manager: true, cashier: true, groomer: false },
  { id: 'perm-inv-edit', module: 'Kho hàng', label: 'Thêm / sửa sản phẩm, giá khuyến mãi & tồn kho', manager: true, cashier: false, groomer: false },
  { id: 'perm-ord-view', module: 'Đơn hàng', label: 'Xem, xác nhận & in hóa đơn bán hàng', manager: true, cashier: true, groomer: false },
  { id: 'perm-ord-refund', module: 'Đơn hàng', label: 'Đối soát VNPay / MoMo & hủy đơn hoàn tiền', manager: true, cashier: false, groomer: false },
  { id: 'perm-rev-view', module: 'Doanh thu', label: 'Xem & xuất báo cáo tài chính CSV/Excel', manager: true, cashier: false, groomer: false },
  { id: 'perm-spa-view', module: 'Dịch vụ chăm sóc', label: 'Xem lịch hẹn chăm sóc thú cưng', manager: true, cashier: true, groomer: true },
  { id: 'perm-spa-edit', module: 'Dịch vụ chăm sóc', label: 'Tạo lịch, phân công nhân viên & đổi khung giờ', manager: true, cashier: true, groomer: false },
  { id: 'perm-spa-done', module: 'Dịch vụ chăm sóc', label: 'Cập nhật hoàn thành quy trình chăm sóc', manager: true, cashier: false, groomer: true },
  { id: 'perm-set-store', module: 'Cài đặt', label: 'Chỉnh thông tin cửa hàng & cổng thanh toán', manager: false, cashier: false, groomer: false },
  { id: 'perm-set-role', module: 'Cài đặt', label: 'Quản lý vai trò & phân quyền nhân sự', manager: false, cashier: false, groomer: false },
];

export const STAFF_ROLE_SUMMARIES: StaffAssignmentSummary[] = [
  { role: 'admin', title: 'Quản trị viên', subtitle: 'Toàn quyền hệ thống (Khóa)', membersText: 'Trịnh Anh Khoa', count: 1 },
  { role: 'manager', title: 'Quản lý cửa hàng', subtitle: 'Vận hành & báo cáo', membersText: 'Mai Nguyễn', count: 1 },
  { role: 'cashier', title: 'Thu ngân & CSKH', subtitle: 'Đơn hàng & lịch hẹn', membersText: 'Hà Lê', count: 1 },
  { role: 'groomer', title: 'Chuyên viên chăm sóc', subtitle: 'Thực hiện gói dịch vụ', membersText: 'Linh Phạm, An Trần', count: 2 },
];

export interface DailyRevenuePoint {
  day: string;
  date: string;
  transfer: number;
  cash: number;
  orders: number;
}

export interface StaffProfile {
  id: string;
  name: string;
  roleTitle: string;
  roleKey: Exclude<StaffRoleKey, 'admin'>;
  shiftLabel: string;
  station: string;
}

export interface StaffShiftTask {
  id: string;
  phase: 'Đầu ca' | 'Trong ca' | 'Cuối ca';
  label: string;
  assignee?: string;
  defaultDone?: boolean;
}

export function isBankTransferPayment(paymentMethod: string): boolean {
  const normalized = paymentMethod.toLowerCase();
  return (
    normalized.includes('vnpay') ||
    normalized.includes('momo') ||
    normalized.includes('chuyển khoản')
  );
}

export const STAFF_PROFILES: StaffProfile[] = [
  {
    id: 'staff-linh',
    name: 'Linh Phạm',
    roleTitle: 'Chuyên viên chăm sóc',
    roleKey: 'groomer',
    shiftLabel: '08:00 – 17:00',
    station: 'Phòng Spa & Grooming 1',
  },
  {
    id: 'staff-ha',
    name: 'Hà Lê',
    roleTitle: 'Thu ngân & CSKH',
    roleKey: 'cashier',
    shiftLabel: '08:00 – 17:00',
    station: 'Quầy Thu ngân POS',
  },
  {
    id: 'staff-mai',
    name: 'Mai Nguyễn',
    roleTitle: 'Quản lý ca',
    roleKey: 'manager',
    shiftLabel: '09:00 – 18:00',
    station: 'Điều phối Cửa hàng Q.1',
  },
  {
    id: 'staff-an',
    name: 'An Trần',
    roleTitle: 'Chuyên viên chăm sóc',
    roleKey: 'groomer',
    shiftLabel: '13:00 – 21:00',
    station: 'Phòng Spa & Khách sạn',
  },
];

export const STAFF_SHIFT_TASKS: StaffShiftTask[] = [
  { id: 'task-1', phase: 'Đầu ca', label: 'Kiểm tra máy POS, đầu quét QR VNPay/MoMo & tiền lẻ đầu ca', defaultDone: true },
  { id: 'task-2', phase: 'Đầu ca', label: 'Vệ sinh bàn chải lông, máy sấy & khử khuẩn khu vực Spa', defaultDone: true },
  { id: 'task-3', phase: 'Trong ca', label: 'Xác nhận và đóng gói các đơn hàng giao nhanh 2h', defaultDone: false },
  { id: 'task-4', phase: 'Cuối ca', label: 'Đối soát hóa đơn Tiền mặt (COD) & Chuyển khoản cuối ngày', defaultDone: false },
];

export const DAILY_REVENUE_SERIES: DailyRevenuePoint[] = [
  { day: '10/11', date: 'Thứ 3 · 10/11', transfer: 14200000, cash: 6800000, orders: 26 },
  { day: '11/11', date: 'Thứ 4 · 11/11', transfer: 18600000, cash: 8400000, orders: 34 },
  { day: '12/11', date: 'Thứ 5 · 12/11', transfer: 15900000, cash: 7100000, orders: 29 },
  { day: '13/11', date: 'Thứ 6 · 13/11', transfer: 17400000, cash: 7900000, orders: 31 },
  { day: '14/11', date: 'Thứ 7 · 14/11', transfer: 21500000, cash: 9600000, orders: 39 },
  { day: '15/11', date: 'CN · 15/11', transfer: 23800000, cash: 10200000, orders: 43 },
  { day: '16/11', date: 'Hôm nay · 16/11', transfer: 16400000, cash: 7300000, orders: 28 },
];

export const REVENUE_PERIOD_DATASETS: Record<
  RevenuePeriodId,
  {
    label: string;
    dateRange: string;
    growthLabel: string;
    avgOrderGrowth: string;
    trend: Array<{ period: string; revenue: number; orders: number }>;
    split: Array<{ channel: string; amount: number }>;
  }
> = {
  'past-months': {
    label: 'Các tháng đã qua (2026)',
    dateRange: 'Tháng 01 – Tháng 11/2026',
    growthLabel: '+16.8% so với tháng trước',
    avgOrderGrowth: '+12.4% giá trị trung bình',
    trend: [
      { period: 'Th1', revenue: 168400000, orders: 320 },
      { period: 'Th2', revenue: 174200000, orders: 332 },
      { period: 'Th3', revenue: 185900000, orders: 356 },
      { period: 'Th4', revenue: 192400000, orders: 368 },
      { period: 'Th5', revenue: 201800000, orders: 384 },
      { period: 'Th6', revenue: 208500000, orders: 398 },
      { period: 'Th7', revenue: 214300000, orders: 410 },
      { period: 'Th8', revenue: 221900000, orders: 422 },
      { period: 'Th9', revenue: 216500000, orders: 415 },
      { period: 'Th10', revenue: 232400000, orders: 446 },
      { period: 'Th11', revenue: 256600000, orders: 480 },
    ],
    split: [
      { channel: 'Sản phẩm cửa hàng', amount: 1818300000 },
      { channel: 'Dịch vụ chăm sóc', amount: 454600000 },
    ],
  },
  'past-years': {
    label: 'Các năm đã qua (2024 – 2026)',
    dateRange: 'Năm 2024 – 2026 (lũy kế)',
    growthLabel: '+28.4% tăng trưởng theo năm',
    avgOrderGrowth: '+15.6% giá trị trung bình',
    trend: [
      { period: 'Năm 2024', revenue: 1420500000, orders: 2890 },
      { period: 'Năm 2025', revenue: 1864200000, orders: 3610 },
      { period: 'Năm 2026 (đến T11)', revenue: 2272900000, orders: 4331 },
    ],
    split: [
      { channel: 'Sản phẩm cửa hàng', amount: 4446100000 },
      { channel: 'Dịch vụ chăm sóc', amount: 1111500000 },
    ],
  },
};

export function downloadCsvFile(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  };
  const csvContent = [
    '\uFEFF' + headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

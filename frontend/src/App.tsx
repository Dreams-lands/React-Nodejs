import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Phone,
  PawPrint,
  Star,
  Headphones,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Trash2,
  Calendar,
  Clock,
  Truck,
  RotateCcw,
  ShoppingBag,
  Zap,
  MessageSquare,
  MapPin,
  Send,
  SlidersHorizontal,
  Tag,
  X,
  QrCode,
  Wallet,
  Banknote,
  Store,
  PackageSearch,
} from 'lucide-react';
import type {
  PageId,
  ProductCategory,
  ProductItem,
  ProductReview,
  CartItem,
  AddressRecord,
  OrderRecord,
  OrderStatus,
  LookupOrderEntry,
  PaymentMethodId,
  DeliveryMethodId,
  ServiceBookingRecord,
} from './data/mockData';
import {
  CATALOG_PRODUCTS,
  SPA_PACKAGES,
  STOREFRONT_SUPPLIES,
  INITIAL_ADDRESSES,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
  ORDER_STATUS_META,
} from './data/mockData';
import {
  ADMIN_EXTRA_BOOKINGS,
  ADMIN_EXTRA_ORDERS,
  DEFAULT_SHARED_STAFF_PERMISSIONS,
  DEFAULT_WORKSPACE_ACCOUNTS,
  INITIAL_PAYMENT_GATEWAYS,
  INITIAL_STORE_SETTINGS,
  STAFF_MEMBERS,
  type PaymentGatewayConfig,
  type SharedStaffPermissions,
  type StoreSettings,
  type WorkspaceUserRole,
} from './data/adminData';
const AdminWorkspace = lazy(() =>
  import('./components/admin/AdminWorkspace').then((m) => ({ default: m.AdminWorkspace }))
);
const AccountPage = lazy(() =>
  import('./components/AccountPage').then((m) => ({ default: m.AccountPage }))
);
import {
  PRODUCT_CATEGORIES,
  PET_AUDIENCES,
  PRODUCT_SUBTYPES,
  PRICE_RANGES,
  type ProductSubType,
  type PriceRangeId,
} from './data/categories';
import {
  PetHubHeader,
  PetHubFooter,
  CompactHeader,
  CompactFooter,
} from './components/HeadersAndFooters';
import type { AccountTab } from './components/AccountPage';
import { TiltCard } from './components/TiltCard';
import { FloatingContact } from './components/FloatingContact';
import { ConfirmDialog, type ConfirmDialogState } from './components/ConfirmDialog';
import { useModalFocusTrap } from './lib/useModalFocusTrap';
import { useThemeDroplet } from './lib/useThemeDroplet';

interface OrderSnapshot {
  code: string;
  date: string;
  items: CartItem[];
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  deliveryMethod?: DeliveryMethodId;
  paymentMethod?: string;
  failReason?: string;
  isGuest?: boolean;
}

const STORE_PICKUP_INFO = {
  name: 'PetsFriend Flagship — Chi nhánh Quận 1',
  address: '128 Nguyễn Trãi, P. Bến Thành, Quận 1, TP. Hồ Chí Minh',
  hours: '08:00 – 21:00 mỗi ngày',
};

const PAYMENT_TIMEOUT_SECONDS = 45;

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethodId;
  label: string;
  desc: string;
  badge: string;
}> = [
  {
    id: 'vnpay',
    label: 'VNPay',
    desc: 'Thanh toán qua cổng VNPay QR / thẻ ngân hàng nội địa',
    badge: 'QR / ATM',
  },
  {
    id: 'momo',
    label: 'MoMo',
    desc: 'Thanh toán nhanh qua ví điện tử MoMo',
    badge: 'Ví điện tử',
  },
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng',
    desc: 'Kiểm tra hàng và thanh toán trực tiếp khi giao nhận',
    badge: 'COD',
  },
];

const CATEGORY_LABELS: Record<'all' | ProductCategory, string> = {
  all: 'Sản phẩm',
  food: 'Dinh dưỡng & Pate',
  bed: 'Nệm & Không gian nghỉ',
  backpack: 'Balo & Phụ kiện',
  hygiene: 'Thuốc & Làm đẹp',
  spa: 'Dịch vụ chăm sóc',
};

const HERO_BANNERS: Array<{
  id: string;
  titleTop: string;
  titleAccent: string;
  desc: string;
  ctaLabel: string;
  ctaCategory?: 'hygiene' | 'food';
  ctaPage?: PageId;
  image: string;
  imageAlt: string;
}> = [
  {
    id: 'vet-care',
    titleTop: 'THUỐC & LÀM ĐẸP',
    titleAccent: 'Dịu lành & An tâm.',
    desc: 'Thuốc đặc trị nấm da, nhỏ gáy phòng ve rận và sữa tắm dưỡng lông dịu nhẹ cho chó mèo.',
    ctaLabel: 'Xem thuốc & làm đẹp',
    ctaCategory: 'hygiene',
    image: '/images/hero-vet-banner.jpg',
    imageAlt: 'Bộ sản phẩm thuốc trị nấm và sữa tắm chăm sóc da lông cho thú cưng',
  },
  {
    id: 'gourmet-food',
    titleTop: 'DINH DƯỠNG TỐI ƯU',
    titleAccent: 'Bé khỏe mỗi ngày.',
    desc: 'Pate tươi nguyên miếng, hạt khô cân bằng dưỡng chất nhập khẩu chính ngạch.',
    ctaLabel: 'Khám phá dinh dưỡng & pate',
    ctaCategory: 'food',
    image: '/images/hero-pate-banner.jpg',
    imageAlt: 'Pate tươi và hạt dinh dưỡng cao cấp cho chó mèo',
  },
  {
    id: 'spa-hotel',
    titleTop: 'DỊCH VỤ CHĂM SÓC 5 SAO',
    titleAccent: 'Thư giãn & Tỏa sáng.',
    desc: 'Quy trình tắm thảo mộc 7 bước chuẩn y khoa, cắt tỉa tạo kiểu và khách sạn giám sát 24/7.',
    ctaLabel: 'Khám phá dịch vụ chăm sóc',
    ctaPage: 'service',
    image: '/images/hero-spa-banner.jpg',
    imageAlt: 'Dịch vụ chăm sóc tắm gội và tạo kiểu chuẩn y khoa cho thú cưng',
  },
];

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const getInitialPage = (): PageId => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const query = new URLSearchParams(window.location.search).get('page')?.toLowerCase();
  if (hash === 'admin' || query === 'admin' || hash === 'staff' || query === 'staff') {
    return 'login';
  }
  return 'home';
};

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(getInitialPage);
  const [returnPage, setReturnPage] = useState<PageId>(() => {
    if (typeof window === 'undefined') return 'home';
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    return hash === 'admin' || hash === 'staff' ? 'admin' : 'home';
  });
  const [heroSlide, setHeroSlide] = useState(0);
  const { theme, toggleWithDroplet } = useThemeDroplet();

  // Admin & Shared Storefront State
  const [products, setProducts] = useState<ProductItem[]>(CATALOG_PRODUCTS);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig>(INITIAL_PAYMENT_GATEWAYS);
  const [sharedStaffRoster, setSharedStaffRoster] = useState<string[]>(STAFF_MEMBERS);
  const [activeShiftStaff, setActiveShiftStaff] = useState<string>(STAFF_MEMBERS[0]);
  const [staffPermissions, setStaffPermissions] = useState<SharedStaffPermissions>(
    DEFAULT_SHARED_STAFF_PERMISSIONS
  );

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authRole, setAuthRole] = useState<'guest' | 'customer' | WorkspaceUserRole>('guest');
  const [userName, setUserName] = useState('Trịnh Anh Khoa');
  const [userEmail, setUserEmail] = useState('khoa.trinh@pethub.vn');
  const [userPhone, setUserPhone] = useState('0909 123 456');
  const [userGender, setUserGender] = useState('Nam');
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [addresses, setAddresses] = useState<AddressRecord[]>(INITIAL_ADDRESSES);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [lookupEntries, setLookupEntries] = useState<LookupOrderEntry[]>(() => [
    ...INITIAL_ORDERS.map((o) => ({
      ...o,
      deliveryMethod: 'delivery' as DeliveryMethodId,
      customerName: 'Trịnh Anh Khoa',
      customerPhone: '0909 123 456',
      customerEmail: 'khoa.trinh@pethub.vn',
      staffName: 'Hà Lê',
    })),
    ...ADMIN_EXTRA_ORDERS,
  ]);
  const [bookings, setBookings] = useState<ServiceBookingRecord[]>(() => [
    ...INITIAL_BOOKINGS,
    ...ADMIN_EXTRA_BOOKINGS,
  ]);

  // Catalog, Promotions & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [petScope, setPetScope] = useState<'all' | 'dog' | 'cat'>('all');
  const [selectedSubTypes, setSelectedSubTypes] = useState<ProductSubType[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRangeId[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [homeCategoryTab, setHomeCategoryTab] = useState<'all' | 'food' | 'hygiene' | 'bed' | 'backpack'>('all');
  const [promoCatFilter, setPromoCatFilter] = useState<'all' | 'food' | 'hygiene' | 'bed' | 'backpack'>('all');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Product Detail & Reviews State
  const [selectedProductId, setSelectedProductId] = useState<string>(CATALOG_PRODUCTS[0].id);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productSelectedSize, setProductSelectedSize] = useState(CATALOG_PRODUCTS[0].sizes[0]);
  const [customReviews, setCustomReviews] = useState<Record<string, ProductReview[]>>({});
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewPetTag, setReviewPetTag] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Wishlist & Toast
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cart & Order State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState(
    INITIAL_ADDRESSES.find((a) => a.isDefault)?.address || '128 Nguyễn Huệ, Quận 1, TP.HCM'
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('vnpay');
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentSecondsLeft, setPaymentSecondsLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [lookupOpen, setLookupOpen] = useState(false);
  const lookupModalRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(lookupOpen, () => setLookupOpen(false), lookupModalRef);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupOrderEntry | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderSnapshot | null>(null);

  // Service Booking State
  const [bookingPetType, setBookingPetType] = useState('Chó nhỏ (< 5kg)');
  const [selectedPackageId, setSelectedPackageId] = useState('pkg-3');
  const [bookingDate, setBookingDate] = useState(TODAY_ISO);
  const [bookingTime, setBookingTime] = useState('10:30 Sáng');
  const [ownerName, setOwnerName] = useState('Trịnh Khoa');
  const [ownerPhone, setOwnerPhone] = useState('0909 686 868');
  const [petNote, setPetNote] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const formatBookingDate = (val: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : val;
  };

  // Auth Form State
  const [showPass, setShowPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [regName, setRegName] = useState('Trịnh Khoa');
  const [regPhone, setRegPhone] = useState('0909 686 868');
  const [regEmail, setRegEmail] = useState('khoa.trinh@pethub.vn');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // Contact Page Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactTopic, setContactTopic] = useState('Tư vấn sản phẩm & dinh dưỡng');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const navigateTo = (page: PageId, overrideRole?: 'admin' | 'staff' | 'customer' | 'guest') => {
    const activeRole = overrideRole ?? authRole;
    if (page === 'admin' && activeRole !== 'admin' && activeRole !== 'staff') {
      setReturnPage('admin');
      setCurrentPage('login');
      triggerToast('Vui lòng đăng nhập tài khoản để tiếp tục.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'cart') {
      setPaymentSecondsLeft(PAYMENT_TIMEOUT_SECONDS);
      setCheckoutError(null);
    }
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      if (page === 'admin') {
        if (window.location.hash !== '#/admin') {
          window.history.replaceState(null, '', '#/admin');
        }
      } else if (window.location.hash === '#/admin' || window.location.hash === '#/staff') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (hash === 'admin' || hash === 'staff') {
        if (authRole === 'admin' || authRole === 'staff') {
          setCurrentPage('admin');
          if (hash === 'staff') {
            window.history.replaceState(null, '', '#/admin');
          }
        } else {
          setReturnPage('admin');
          setCurrentPage('login');
          triggerToast('Vui lòng đăng nhập tài khoản để tiếp tục.');
        }
      }
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [authRole]);

  // Admin Operations Synced Live to Storefront
  const handleSaveAdminProduct = (item: ProductItem, isNew: boolean) => {
    setProducts((prev) =>
      isNew ? [item, ...prev] : prev.map((p) => (p.id === item.id ? item : p))
    );
    triggerToast(
      isNew
        ? `Đã thêm sản phẩm "${item.name}" vào kho và trang chủ.`
        : `Đã cập nhật thông tin "${item.name}".`
    );
  };

  const handleDeleteAdminProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    triggerToast('Đã xóa sản phẩm khỏi danh mục cửa hàng.');
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const actorName = authRole === 'staff' ? activeShiftStaff : userName;
    setLookupEntries((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus, staffName: o.staffName || actorName } : o
      )
    );
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    triggerToast(`Đơn #${orderId} đã chuyển sang "${ORDER_STATUS_META[nextStatus].label}".`);
  };

  const handleAddAdminBooking = (booking: ServiceBookingRecord) => {
    setBookings((prev) => [booking, ...prev]);
    triggerToast(`Đã tạo lịch hẹn chăm sóc ${booking.id}.`);
  };

  const handleUpdateBookingStatus = (
    id: string,
    status: ServiceBookingRecord['status']
  ) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    triggerToast(`Đã cập nhật trạng thái lịch hẹn ${id}.`);
  };

  const handleAssignBookingStaff = (id: string, staffName: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, staffName } : b))
    );
    triggerToast(`Đã phân công ${staffName} cho lịch hẹn ${id}.`);
  };

  const handleCreatePosOrder = (
    entry: LookupOrderEntry,
    soldItems: Array<{ id: string; quantity: number }>
  ) => {
    setLookupEntries((prev) => [entry, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        const sold = soldItems.find((s) => s.id === p.id);
        return sold ? { ...p, stockCount: Math.max(0, p.stockCount - sold.quantity) } : p;
      })
    );
  };

  const activePaymentOptions = useMemo(() => {
    const enabled = PAYMENT_OPTIONS.filter((opt) => {
      if (opt.id === 'vnpay') return paymentGateways.vnpayEnabled;
      if (opt.id === 'momo') return paymentGateways.momoEnabled;
      return paymentGateways.codEnabled;
    });
    return enabled.length > 0 ? enabled : PAYMENT_OPTIONS;
  }, [paymentGateways]);

  const effectivePaymentMethod: PaymentMethodId = activePaymentOptions.some(
    (opt) => opt.id === paymentMethod
  )
    ? paymentMethod
    : activePaymentOptions[0].id;

  const requireLoginFor = (targetPage: PageId, message: string) => {
    setReturnPage(targetPage);
    setCurrentPage('login');
    triggerToast(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: 'all' | ProductCategory) => {
    setSelectedCategoryFilter(cat);
    setPetScope('all');
    setSelectedSubTypes([]);
    navigateTo('search');
  };

  const handleSelectPetAudience = (pet: 'dog' | 'cat') => {
    setSelectedCategoryFilter('all');
    setPetScope(pet);
    setSelectedSubTypes([]);
    navigateTo('search');
  };

  const toggleSubTypeFilter = (subType: ProductSubType) => {
    setSelectedSubTypes((prev) =>
      prev.includes(subType) ? prev.filter((item) => item !== subType) : [...prev, subType]
    );
  };

  const togglePriceRangeFilter = (rangeId: PriceRangeId) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId) ? prev.filter((item) => item !== rangeId) : [...prev, rangeId]
    );
  };

  const resetCatalogFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setPetScope('all');
    setSelectedSubTypes([]);
    setSelectedPriceRanges([]);
    setSortBy('popular');
  };

  const openProductDetail = (item: ProductItem) => {
    setSelectedProductId(item.id);
    setActiveGalleryIdx(0);
    setProductQuantity(1);
    setProductSelectedSize(item.sizes[0] || item.packSize);
    navigateTo('product');
  };

  const handleLogout = () => {
    setConfirmDialog({
      title: 'Xác nhận đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản PetsFriend không?',
      confirmLabel: 'Đăng xuất',
      tone: 'danger',
      onConfirm: () => {
        setIsLoggedIn(false);
        setAuthRole('guest');
        setLoginPassword('');
        setLoginError(null);
        setCartItems([]);
        setCheckoutName('');
        setCheckoutPhone('');
        setCheckoutEmail('');
        setCheckoutAddress('');
        setDeliveryMethod('delivery');
        setCheckoutError(null);
        setBookingConfirmed(false);
        if (typeof window !== 'undefined' && (window.location.hash === '#/admin' || window.location.hash === '#/staff')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        setCurrentPage('home');
        triggerToast('Đã đăng xuất khỏi tài khoản.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = !prev[id];
      triggerToast(next ? 'Đã lưu vào danh sách quan tâm.' : 'Đã bỏ khỏi danh sách quan tâm.');
      return { ...prev, [id]: next };
    });
  };

  // Selected Product & Combined Reviews
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || CATALOG_PRODUCTS[0];
  }, [products, selectedProductId]);

  const productReviews = useMemo(() => {
    const extra = customReviews[selectedProduct.id] || [];
    return [...extra, ...selectedProduct.reviews];
  }, [customReviews, selectedProduct]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const cartFinalTotal = cartSubtotal;
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const addProductToCart = (item: ProductItem, qty = 1, sizeLabel?: string) => {
    const chosenSize = sizeLabel || item.sizes[0] || item.packSize;
    const itemName = `${item.name} (${chosenSize})`;

    setCartItems((prev) => {
      const existing = prev.find((c) => c.productId === item.id && c.name === itemName);
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      const nextItem: CartItem = {
        id: `cart-${item.id}-${Date.now()}`,
        productId: item.id,
        name: itemName,
        desc: `${item.brand} · ${chosenSize}`,
        price: item.priceNum,
        priceStr: item.price,
        quantity: qty,
        image: item.image,
        category: CATEGORY_LABELS[item.category],
      };
      return [nextItem, ...prev];
    });

    triggerToast(`Đã thêm "${item.name}" vào giỏ hàng.`);
    return true;
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeCartItem = (id: string) => {
    const targetItem = cartItems.find((item) => item.id === id);
    setConfirmDialog({
      title: 'Xóa sản phẩm khỏi giỏ hàng',
      message: `Bạn có chắc chắn muốn xóa "${targetItem?.name || 'sản phẩm này'}" khỏi giỏ hàng không?`,
      confirmLabel: 'Xóa sản phẩm',
      tone: 'danger',
      onConfirm: () => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        triggerToast('Đã xóa sản phẩm khỏi giỏ hàng.');
      },
    });
  };

  const timeoutHandlerRef = useRef<() => void>(() => {});
  useEffect(() => {
    timeoutHandlerRef.current = () => {
      if (currentPage !== 'cart' || cartItems.length === 0) return;
      const orderNum = `PH${Math.floor(100000 + Math.random() * 899999)}`;
      const nowLabel = new Date().toLocaleDateString('vi-VN');
      const selectedPaymentLabel =
        PAYMENT_OPTIONS.find((opt) => opt.id === effectivePaymentMethod)?.label || 'VNPay';
      const resolvedAddress =
        deliveryMethod === 'pickup'
          ? `Nhận tại cửa hàng: ${STORE_PICKUP_INFO.address}`
          : (isLoggedIn ? shippingAddress : checkoutAddress).trim();

      setLastOrder({
        code: `#${orderNum}`,
        date: nowLabel,
        items: [...cartItems],
        total: cartFinalTotal,
        customerName: checkoutName.trim() || (isLoggedIn ? userName : 'Quý khách'),
        customerPhone: checkoutPhone.trim() || (isLoggedIn ? userPhone : ''),
        customerEmail: checkoutEmail.trim() || (isLoggedIn ? userEmail : ''),
        shippingAddress: resolvedAddress,
        deliveryMethod,
        paymentMethod: selectedPaymentLabel,
        failReason: 'Hết thời gian thanh toán',
        isGuest: !isLoggedIn,
      });
      navigateTo('checkout-fail');
    };
  });

  useEffect(() => {
    if (currentPage !== 'cart' || cartItems.length === 0) return;
    const intervalId = window.setInterval(() => {
      setPaymentSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          window.setTimeout(() => timeoutHandlerRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [currentPage, cartItems.length]);

  const openOrderLookupModal = () => {
    setLookupError(null);
    setLookupResult(null);
    setLookupOpen(true);
  };

  const handleOrderLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = lookupPhone.replace(/\D/g, '');
    const cleanCode = lookupCode.trim().replace(/^#/, '').toUpperCase();
    if (!cleanPhone || !cleanCode) {
      setLookupError('Vui lòng nhập đầy đủ số điện thoại và mã đơn hàng để tra cứu.');
      setLookupResult(null);
      return;
    }
    const matched = lookupEntries.find(
      (entry) =>
        entry.customerPhone.replace(/\D/g, '') === cleanPhone &&
        entry.id.replace(/^#/, '').toUpperCase() === cleanCode
    );
    if (!matched) {
      setLookupError('Không tìm thấy đơn hàng khớp với Số điện thoại và Mã đơn hàng này.');
      setLookupResult(null);
      return;
    }
    setLookupError(null);
    setLookupResult(matched);
  };

  const handleCheckout = () => {
    const activeName = checkoutName.trim();
    const activePhone = checkoutPhone.trim();
    const activeEmail = checkoutEmail.trim();
    const activeAddress = (isLoggedIn ? shippingAddress : checkoutAddress).trim();

    if (!isLoggedIn && !activeName) {
      const msg = 'Vui lòng nhập đầy đủ họ tên, số điện thoại, Gmail và địa chỉ nhận hàng để thanh toán.';
      setCheckoutError(msg);
      triggerToast('Vui lòng điền họ và tên để tiếp tục thanh toán.');
      return;
    }
    if (!activePhone) {
      const msg =
        deliveryMethod === 'delivery'
          ? 'Vui lòng nhập đầy đủ số điện thoại liên hệ và địa chỉ giao hàng trước khi thanh toán.'
          : 'Vui lòng nhập số điện thoại liên hệ trước khi xác nhận đơn hàng.';
      setCheckoutError(msg);
      triggerToast('Thiếu số điện thoại liên hệ! Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!isLoggedIn && !activeEmail) {
      const msg = 'Vui lòng nhập địa chỉ Gmail để nhận thông tin xác nhận đơn hàng.';
      setCheckoutError(msg);
      triggerToast('Vui lòng nhập Gmail để hoàn tất thanh toán.');
      return;
    }
    if (deliveryMethod === 'delivery' && !activeAddress) {
      const msg = 'Vui lòng nhập đầy đủ địa chỉ giao hàng và số điện thoại liên hệ trước khi thanh toán.';
      setCheckoutError(msg);
      triggerToast('Thiếu địa chỉ giao hàng! Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setCheckoutError(null);
    const orderNum = `PH${Math.floor(100000 + Math.random() * 899999)}`;
    const nowLabel = new Date().toLocaleDateString('vi-VN');
    const selectedPaymentLabel =
      PAYMENT_OPTIONS.find((opt) => opt.id === effectivePaymentMethod)?.label || 'VNPay';
    const resolvedAddress =
      deliveryMethod === 'pickup'
        ? `Nhận tại cửa hàng: ${STORE_PICKUP_INFO.address}`
        : activeAddress;
    const customerLabel = activeName || (isLoggedIn ? userName : 'Quý khách');

    const snapshot: OrderSnapshot = {
      code: `#${orderNum}`,
      date: nowLabel,
      items: [...cartItems],
      total: cartFinalTotal,
      customerName: customerLabel,
      customerPhone: activePhone,
      customerEmail: activeEmail || (isLoggedIn ? userEmail : ''),
      shippingAddress: resolvedAddress,
      deliveryMethod,
      paymentMethod: selectedPaymentLabel,
      isGuest: !isLoggedIn,
    };
    setLastOrder(snapshot);

    if (cartItems.length > 0) {
      const mappedItems = cartItems.map((c) => ({
        id: c.productId,
        name: c.name,
        image: c.image,
        price: c.price,
        quantity: c.quantity,
        variant: c.desc,
      }));
      const newOrder: OrderRecord = {
        id: orderNum,
        createdAt: `${nowLabel} • Vừa đặt`,
        status: 'pending',
        totalAmount: cartFinalTotal,
        shippingAddress: resolvedAddress,
        paymentMethod: selectedPaymentLabel,
        items: mappedItems,
      };
      setOrders((prev) => [newOrder, ...prev]);
      setLookupEntries((prev) => [
        {
          ...newOrder,
          deliveryMethod,
          customerName: customerLabel,
          customerPhone: activePhone,
          customerEmail: activeEmail || (isLoggedIn ? userEmail : ''),
        },
        ...prev,
      ]);
    }
    setCartItems([]);
    navigateTo('checkout-success');
  };

  // Catalog Filters & Sorting
  const filteredSearchList = useMemo(() => {
    const filtered = products.filter((item) => {
      const matchesCat =
        selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
      const matchesPet =
        petScope === 'all' || item.petType === petScope;
      const matchesSubType =
        selectedSubTypes.length === 0 || selectedSubTypes.includes(item.subType);
      const matchesPrice =
        selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some((rangeId) => {
          const range = PRICE_RANGES.find((r) => r.id === rangeId);
          return range ? item.priceNum >= range.min && item.priceNum <= range.max : true;
        });
      const q = searchQuery.trim().toLowerCase();
      const matchesQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.subType.toLowerCase().includes(q) ||
        item.packSize.toLowerCase().includes(q);
      return matchesCat && matchesPet && matchesSubType && matchesPrice && matchesQ;
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => a.priceNum - b.priceNum);
    }
    if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => b.priceNum - a.priceNum);
    }
    if (sortBy === 'rating') {
      return [...filtered].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }
    return filtered;
  }, [products, searchQuery, selectedCategoryFilter, petScope, selectedSubTypes, selectedPriceRanges, sortBy]);

  // Featured Products: ONLY normal (non-discounted) items on Home
  const featuredProducts = useMemo(() => {
    const nonDiscounted = products.filter(
      (p) => !p.discountBadge && !p.originalPrice
    );
    if (homeCategoryTab === 'all') {
      const highlighted = nonDiscounted.filter((p) => p.isFeatured);
      return (highlighted.length >= 4 ? highlighted : nonDiscounted).slice(0, 4);
    }
    return nonDiscounted.filter((p) => p.category === homeCategoryTab).slice(0, 4);
  }, [products, homeCategoryTab]);

  // Discounted Products: ALL items with % discount / originalPrice
  const allDiscountedProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.discountBadge || p.originalPrice));
  }, [products]);

  const flashSaleProducts = useMemo(() => {
    return allDiscountedProducts.slice(0, 8);
  }, [allDiscountedProducts]);

  const filteredPromotionsList = useMemo(() => {
    return allDiscountedProducts.filter((item) => {
      return promoCatFilter === 'all' || item.category === promoCatFilter;
    });
  }, [allDiscountedProducts, promoCatFilter]);

  const selectedSpaPackage = useMemo(() => {
    return SPA_PACKAGES.find((p) => p.id === selectedPackageId) || SPA_PACKAGES[0];
  }, [selectedPackageId]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      requireLoginFor('product', 'Vui lòng đăng nhập để gửi đánh giá sản phẩm.');
      return;
    }
    if (!reviewComment.trim()) {
      triggerToast('Vui lòng nhập nội dung nhận xét trước khi gửi.');
      return;
    }
    const newRev: ProductReview = {
      id: `rev-user-${Date.now()}`,
      author: userName,
      petTag: reviewPetTag.trim() || 'Thành viên PetsFriend',
      rating: reviewRating,
      date: 'Hôm nay',
      verified: true,
      comment: reviewComment.trim(),
    };
    setCustomReviews((prev) => ({
      ...prev,
      [selectedProduct.id]: [newRev, ...(prev[selectedProduct.id] || [])],
    }));
    setReviewComment('');
    setReviewPetTag('');
    setReviewRating(5);
    triggerToast('Cảm ơn bạn đã chia sẻ đánh giá sản phẩm.');
  };

  const isCompactLayout =
    currentPage === 'login' ||
    currentPage === 'register' ||
    currentPage === 'checkout-success' ||
    currentPage === 'checkout-fail';

  const workspaceFallback = (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faff] text-[#17324d] text-sm font-semibold">
      Đang tải không gian làm việc...
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col bg-white text-[#17324d] overflow-x-clip selection:bg-[#0667d0] selection:text-white ph-theme-scope">
      {currentPage !== 'admin' && (
        <a href="#main-content" className="skip-link">
          Bỏ qua tới nội dung chính
        </a>
      )}
      {currentPage === 'admin' && (authRole === 'admin' || authRole === 'staff') ? (
        <Suspense fallback={workspaceFallback}>
          <AdminWorkspace
            key={authRole}
            userRole={authRole}
            currentUserName={userName}
            staffRoster={sharedStaffRoster}
            activeShiftStaff={activeShiftStaff}
            onChangeShiftStaff={(nextName) => {
              setActiveShiftStaff(nextName);
              triggerToast(`Đã chuyển ca trực sang nhân viên ${nextName}.`);
            }}
            onSaveStaffRoster={(nextRoster) => {
              setSharedStaffRoster(nextRoster);
              if (!nextRoster.includes(activeShiftStaff)) {
                setActiveShiftStaff(nextRoster[0] || STAFF_MEMBERS[0]);
              }
              triggerToast('Đã cập nhật danh sách nhân viên dùng chung tài khoản staff.');
            }}
            staffPermissions={staffPermissions}
            onSaveStaffPermissions={(nextPerms) => {
              setStaffPermissions(nextPerms);
              triggerToast('Đã lưu và áp dụng phân quyền cho tài khoản staff dùng chung.');
            }}
            products={products}
            orders={lookupEntries}
            bookings={bookings}
            storeSettings={storeSettings}
            paymentGateways={paymentGateways}
            onSaveProduct={handleSaveAdminProduct}
            onDeleteProduct={handleDeleteAdminProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCreatePosOrder={(entry, soldItems) => {
              handleCreatePosOrder(entry, soldItems);
              triggerToast(`Đã xuất hóa đơn #${entry.id} và tự động cập nhật tồn kho.`);
            }}
            onAddBooking={handleAddAdminBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAssignStaff={handleAssignBookingStaff}
            onSaveStoreSettings={(next) => {
              setStoreSettings(next);
              triggerToast('Đã lưu và đồng bộ thông tin cửa hàng.');
            }}
            onSavePaymentGateways={(next) => {
              setPaymentGateways(next);
              triggerToast('Đã cập nhật trạng thái các cổng thanh toán.');
            }}
            onExitToStorefront={() => navigateTo('home')}
            onLogout={handleLogout}
            onRequestConfirm={(dialog) => setConfirmDialog(dialog)}
            onNotify={triggerToast}
            theme={theme}
            onToggleTheme={toggleWithDroplet}
          />
        </Suspense>
      ) : (
        <>
          {/* Header */}
          {isCompactLayout ? (
            <CompactHeader
              onNavigate={navigateTo}
              isLoggedIn={isLoggedIn}
              theme={theme}
              onToggleTheme={toggleWithDroplet}
            />
          ) : (
            <PetHubHeader
              currentPage={currentPage}
              activeCatalogCategory={selectedCategoryFilter}
              activePetAudience={petScope}
              onNavigate={navigateTo}
              onSelectCategory={handleSelectCategory}
              onSelectPetAudience={handleSelectPetAudience}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoggedIn={isLoggedIn}
              userName={userName}
              workspaceRole={authRole === 'admin' || authRole === 'staff' ? authRole : null}
              onLogout={handleLogout}
              onOpenOrderLookup={openOrderLookupModal}
              cartCount={totalCartCount}
              cartTotal={cartFinalTotal.toLocaleString('vi-VN') + '₫'}
              theme={theme}
              onToggleTheme={toggleWithDroplet}
            />
          )}

          {/* Main Content */}
          <main id="main-content" tabIndex={-1} className="flex-1 relative focus:outline-none">
            <AnimatePresence mode="wait">
          {/* ===================================================================
           * 1. STOREFRONT HOMEPAGE (Minimalist Luxury Copy - Nói ít hiểu nhiều)
           * =================================================================== */}
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full pb-12"
            >
              {/* Full-background Hero Banner Slider (3 Slides) */}
              {(() => {
                const activeBanner = HERO_BANNERS[heroSlide];
                return (
                  <section className="relative w-full overflow-hidden ph-hero-surface border-b border-[#dfe6f0]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeBanner.id}
                        src={activeBanner.image}
                        alt={activeBanner.imageAlt}
                        fetchPriority={heroSlide === 0 ? 'high' : 'auto'}
                        decoding="async"
                        initial={{ opacity: 0.35, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0.35 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.42 }}
                        className="absolute inset-0 w-full h-full object-cover object-[76%_center] sm:object-right"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 ph-hero-scrim" />

                    <div className="relative z-10 max-w-[1320px] mx-auto px-3 sm:px-8 lg:px-12 flex items-center min-h-[380px] sm:min-h-[440px] lg:min-h-[480px]">
                      {/* Hero Content Column with internal Arrows & Dots */}
                      <div className="flex-1 min-w-0 relative flex flex-col justify-center min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] pt-10 pb-16 sm:py-16 px-3 sm:px-14 lg:px-16">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeBanner.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
                            className="max-w-[520px] space-y-5"
                          >
                            <h1 className="text-[28px] sm:text-[40px] lg:text-[46px] font-extrabold text-[#17324d] leading-[1.08] tracking-[-0.03em]">
                              {activeBanner.titleTop}
                              <br />
                              <span className="text-[#0667d0]">{activeBanner.titleAccent}</span>
                            </h1>

                            <p className="text-[14px] sm:text-[15.5px] text-[#354c63] max-w-[46ch] leading-relaxed font-medium">
                              {activeBanner.desc}
                            </p>

                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  activeBanner.ctaPage
                                    ? navigateTo(activeBanner.ctaPage)
                                    : handleSelectCategory(activeBanner.ctaCategory ?? 'all')
                                }
                                className="py-3 px-6 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white font-bold text-[14px] inline-flex items-center gap-2 shadow-[0_10px_24px_rgba(6,103,208,0.24)] cursor-pointer transition-colors press-tactile"
                              >
                                <span>{activeBanner.ctaLabel}</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        </AnimatePresence>

                        {/* Slide Arrows */}
                        <button
                          type="button"
                          aria-label="Banner trước"
                          onClick={() =>
                            setHeroSlide((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)
                          }
                          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full ph-hero-arrow items-center justify-center shadow-xs cursor-pointer transition press-tactile"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Banner tiếp theo"
                          onClick={() => setHeroSlide((prev) => (prev + 1) % HERO_BANNERS.length)}
                          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full ph-hero-arrow items-center justify-center shadow-xs cursor-pointer transition press-tactile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Slide Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                          {HERO_BANNERS.map((b, idx) => (
                            <button
                              key={b.id}
                              type="button"
                              aria-label={`Chuyển đến banner ${idx + 1}`}
                              onClick={() => setHeroSlide(idx)}
                              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                                heroSlide === idx
                                  ? 'w-7 bg-[#0667d0]'
                                  : 'w-2.5 bg-[#17324d]/40 hover:bg-[#17324d]/65'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })()}

              {/* 4 Commitments Bar */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pt-6 pb-2">
                <div className="rounded-2xl bg-white border border-[#dfe6f0] px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      icon: ShieldCheck,
                      color: 'text-[#0667d0]',
                      title: 'Chính hãng 100%',
                      sub: 'Kiểm định nguồn gốc rõ ràng',
                    },
                    {
                      icon: Truck,
                      color: 'text-[#c2410c]',
                      title: 'Giao nhanh 2 giờ',
                      sub: 'Miễn phí đơn từ 499.000₫',
                    },
                    {
                      icon: Headphones,
                      color: 'text-[#0667d0]',
                      title: 'Tư vấn thú y',
                      sub: 'Đồng hành chuyên môn mỗi ngày',
                    },
                    {
                      icon: RotateCcw,
                      color: 'text-[#17324d]',
                      title: 'Đổi trả 7 ngày',
                      sub: 'Thủ tục nhanh gọn, minh bạch',
                    },
                  ].map((pillar) => {
                    const IconComp = pillar.icon;
                    return (
                      <div key={pillar.title} className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl bg-[#f8faff] border border-[#dfe6f0] flex items-center justify-center shrink-0 ${pillar.color}`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-[#17324d]">{pillar.title}</div>
                          <div className="text-[13px] text-[#52657a]">{pillar.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Brand Statement */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-10 border-b border-[#dfe6f0]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-[58ch]">
                    <h2 className="text-[26px] lg:text-[32px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                      Tin chọn bởi hơn 50.000 gia đình Việt.
                    </h2>
                    <p className="text-[14px] text-[#52657a] leading-relaxed max-w-[58ch]">
                      Mỗi sản phẩm tại PetsFriend đều được chọn lọc kỹ lưỡng về thành phần, chất liệu và độ an toàn.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="py-2 px-1 text-[13px] font-bold text-[#0667d0] hover:underline flex items-center gap-1.5 cursor-pointer self-start lg:self-auto shrink-0"
                  >
                    <span>Xem toàn bộ sản phẩm</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>

              {/* Core Supplies Categories */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <h2 className="text-[26px] lg:text-[30px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                    Danh mục thiết yếu
                  </h2>
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="py-2 px-1 text-[13px] font-bold text-[#0667d0] hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Tất cả danh mục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {STOREFRONT_SUPPLIES.map((sup) => (
                    <motion.button
                      key={sup.id}
                      type="button"
                      whileHover={{ y: -4 }}
                      onClick={() => handleSelectCategory(sup.filterCategory)}
                      className="group card-elevate text-left rounded-2xl bg-white border border-[#dfe6f0] hover:border-[#0667d0]/50 p-5 cursor-pointer transition-colors duration-300 flex flex-col justify-between press-tactile"
                    >
                      <div className="w-full">
                        <div className="h-48 w-full rounded-xl overflow-hidden mb-5 bg-[#f8faff]">
                          <img
                            src={sup.image}
                            alt={sup.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="text-[19px] font-bold text-[#17324d] group-hover:text-[#0667d0] transition-colors">
                          {sup.title}
                        </h3>
                        <p className="text-[13px] text-[#52657a] mt-1.5 leading-relaxed">
                          {sup.desc}
                        </p>
                      </div>
                      <div className="w-full pt-4 mt-5 border-t border-[#dfe6f0] flex items-center justify-between gap-2">
                        <span className="text-[13px] text-[#52657a] font-medium">{sup.meta}</span>
                        <span className="text-[13px] font-bold text-[#0667d0] flex items-center gap-1 shrink-0">
                          <span>Khám phá</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Featured Products */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-12 border-t border-[#dfe6f0]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
                  <div>
                    <h2 className="text-[26px] lg:text-[30px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                      Sản phẩm nổi bật
                    </h2>
                    <p className="text-[14px] text-[#52657a] mt-1">
                      Được khách hàng đánh giá cao và tin dùng mỗi ngày.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#f3f7ff] border border-[#dfe6f0] overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'food', label: 'Dinh dưỡng & Pate' },
                      { id: 'hygiene', label: 'Thuốc & Làm đẹp' },
                      { id: 'bed', label: 'Nệm ngủ' },
                      { id: 'backpack', label: 'Balo & Phụ kiện' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setHomeCategoryTab(tab.id as typeof homeCategoryTab)}
                        className={`px-4 py-2 rounded-lg text-[13px] font-bold transition cursor-pointer whitespace-nowrap ${
                          homeCategoryTab === tab.id
                            ? 'bg-[#0667d0] text-white shadow-xs'
                            : 'text-[#52657a] hover:text-[#17324d]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((item) => (
                    <div
                      key={item.id}
                      className="group card-elevate rounded-2xl bg-white border border-[#dfe6f0] hover:border-[#0667d0]/40 p-4 flex flex-col justify-between transition-colors"
                    >
                      <div>
                        <div className="relative aspect-square w-full rounded-xl bg-[#f8faff] overflow-hidden mb-3.5">
                          {item.discountBadge && (
                            <span className="pointer-events-none absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#c2410c] text-white text-[12px] font-bold z-10">
                              {item.discountBadge}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => openProductDetail(item)}
                            aria-label={`Xem chi tiết ${item.name}`}
                            className="w-full h-full block cursor-pointer"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[12px] font-bold text-[#0667d0] uppercase tracking-wider">
                            {item.brand}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#52657a] tabular-nums">
                            <Star className="w-3.5 h-3.5 fill-[#ffb547] text-[#ffb547]" aria-hidden="true" />
                            {item.rating.toFixed(1)} ({item.reviewCount})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openProductDetail(item)}
                          className="w-full text-left cursor-pointer"
                        >
                          <h3 className="text-[15px] font-bold text-[#17324d] leading-snug line-clamp-2 hover:text-[#0667d0]">
                            {item.name}
                          </h3>
                        </button>
                        <div className="text-[13px] text-[#52657a] mt-1">{item.packSize}</div>
                      </div>

                      <div className="pt-3.5 mt-3.5 border-t border-[#dfe6f0] flex items-center justify-between gap-2">
                        <div className="tabular-nums">
                          <div className="text-[16px] font-extrabold text-[#17324d]">{item.price}</div>
                          {item.originalPrice && (
                            <div className="text-[12px] text-[#52657a] line-through">
                              {item.originalPrice}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => addProductToCart(item)}
                          className="py-2 px-3.5 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white font-semibold text-[13px] flex items-center gap-1.5 cursor-pointer transition-colors press-tactile"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Thêm vào giỏ</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Limited Flash Sale — unboxed full-width subtle band so cards are NOT nested */}
              <section className="w-full bg-[#f8faff] border-y border-[#dfe6f0] py-12">
                <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dfe6f0]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#c2410c] text-white flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-[22px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                          Ưu đãi hôm nay
                        </h2>
                        <p className="text-[13px] text-[#52657a]">
                          Tổng hợp sản phẩm đang giảm giá đặc quyền trong hôm nay.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => navigateTo('promotions')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#dfe6f0] hover:border-[#0667d0] text-[13px] font-bold text-[#0667d0] cursor-pointer transition"
                      >
                        <span>Xem tất cả khuyến mãi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    {flashSaleProducts.map((item) => (
                      <div
                        key={item.id}
                        className="group card-elevate rounded-2xl bg-white border border-[#dfe6f0] hover:border-[#0667d0]/40 p-4 flex flex-col justify-between transition-colors"
                      >
                        <div>
                          <div className="relative aspect-square w-full rounded-xl bg-[#f8faff] overflow-hidden mb-3">
                            {item.discountBadge && (
                              <span className="pointer-events-none absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#c2410c] text-white text-[12px] font-bold z-10">
                                {item.discountBadge}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => openProductDetail(item)}
                              aria-label={`Xem chi tiết ${item.name}`}
                              className="w-full h-full block cursor-pointer"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </button>
                          </div>

                          <div className="text-[12px] font-bold text-[#0667d0] uppercase tracking-wider">
                            {item.brand}
                          </div>
                          <button
                            type="button"
                            onClick={() => openProductDetail(item)}
                            className="w-full text-left cursor-pointer"
                          >
                            <h3 className="text-[14px] font-bold text-[#17324d] leading-snug line-clamp-2 mt-1 hover:text-[#0667d0]">
                              {item.name}
                            </h3>
                          </button>
                          <div className="text-[13px] text-[#52657a] mt-1">{item.packSize}</div>
                          <div className="inline-flex items-center gap-1 text-[12px] text-[#52657a] mt-1 tabular-nums">
                            <Star className="w-3.5 h-3.5 fill-[#ffb547] text-[#ffb547]" aria-hidden="true" />
                            <span>{item.rating.toFixed(1)} ({item.reviewCount})</span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#dfe6f0] space-y-2.5">
                          <div className="flex items-baseline gap-2 tabular-nums">
                            <span className="text-[17px] font-extrabold text-[#c2410c]">
                              {item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-[12px] text-[#52657a] line-through">
                                {item.originalPrice}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => addProductToCart(item)}
                            className="w-full py-2.5 px-4 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white font-semibold text-[13px] cursor-pointer transition-colors"
                          >
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-12">
                <div className="max-w-[54ch] mb-9 space-y-2">
                  <h2 className="text-[28px] lg:text-[32px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                    Chăm sóc chuẩn y khoa.
                  </h2>
                  <p className="text-[14px] text-[#52657a]">
                    Không gian thư giãn riêng biệt, nhẹ nhàng và an toàn tuyệt đối.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-8 flex flex-col justify-between min-h-[270px]">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#dfe6f0] text-[#0667d0] flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-[22px] font-bold text-[#17324d]">
                          Dịch vụ chăm sóc &amp; Làm đẹp
                        </h3>
                      </div>
                      <p className="text-[14px] text-[#52657a] leading-relaxed max-w-[46ch]">
                        Tắm thảo mộc, cắt tỉa tạo phom và vệ sinh toàn diện theo quy trình 7 bước dịu nhẹ.
                      </p>
                    </div>

                    <div className="pt-5 mt-6 border-t border-[#dfe6f0] flex items-center justify-between gap-4">
                      <div className="tabular-nums">
                        <div className="text-[13px] text-[#52657a]">Chỉ từ</div>
                        <div className="text-[20px] font-extrabold text-[#0667d0]">180.000₫</div>
                      </div>
                      <button
                        onClick={() => navigateTo('service')}
                        className="py-2.5 px-5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white font-semibold text-[13px] cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <span>Đặt lịch chăm sóc</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#fff8f5] border border-[#ffe4d6] p-8 flex flex-col justify-between min-h-[270px]">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#ffe4d6] text-[#c2410c] flex items-center justify-center shrink-0">
                          <PawPrint className="w-5 h-5" />
                        </div>
                        <h3 className="text-[22px] font-bold text-[#17324d]">
                          Khách sạn thú cưng 5 sao
                        </h3>
                      </div>
                      <p className="text-[14px] text-[#52657a] leading-relaxed max-w-[46ch]">
                        Phòng điều hòa riêng biệt, camera theo dõi 24/7 và chế độ dinh dưỡng theo yêu cầu.
                      </p>
                    </div>

                    <div className="pt-5 mt-6 border-t border-[#ffe4d6] flex items-center justify-between gap-4">
                      <div className="tabular-nums">
                        <div className="text-[13px] text-[#52657a]">Chỉ từ</div>
                        <div className="text-[20px] font-extrabold text-[#c2410c]">150.000₫ / ngày</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPackageId('pkg-4');
                          navigateTo('service');
                        }}
                        className="py-2.5 px-5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-semibold text-[13px] cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <span>Đặt phòng ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ===================================================================
           * 2. PRODUCT CATALOG & SEARCH PAGE (Viewable by All Visitors)
           * =================================================================== */}
          {currentPage === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pb-16"
            >
              {/* Breadcrumb */}
              <div className="h-14 flex items-center gap-2.5 text-[13px] flex-wrap">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#52657a] hover:text-[#0667d0] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#52657a]" />
                {petScope !== 'all' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`cursor-pointer ${
                        selectedCategoryFilter === 'all'
                          ? 'font-semibold text-[#0667d0]'
                          : 'text-[#52657a] hover:text-[#0667d0]'
                      }`}
                    >
                      {petScope === 'dog' ? 'Đồ dùng cho Chó' : 'Đồ dùng cho Mèo'}
                    </button>
                    {selectedCategoryFilter !== 'all' && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-[#52657a]" />
                        <span className="font-semibold text-[#0667d0]">
                          {CATEGORY_LABELS[selectedCategoryFilter]}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="font-semibold text-[#0667d0]">
                    {CATEGORY_LABELS[selectedCategoryFilter]}
                  </span>
                )}
              </div>

              {/* Two-Column Catalog Sidebar + Grid (No Brand Filter) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* Mobile Filter Trigger */}
                <div className="lg:hidden flex items-center justify-between gap-3 pb-3 border-b border-[#dfe6f0]">
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen((v) => !v)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#0667d0]" />
                    <span>{mobileFilterOpen ? 'Ẩn bộ lọc' : 'Danh mục & Bộ lọc'}</span>
                  </button>
                  <select
                    aria-label="Sắp xếp sản phẩm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2.5 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                  >
                    <option value="popular">Mặc định: Nổi bật</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>

                {/* Left Filter Sidebar */}
                <aside
                  className={`${
                    mobileFilterOpen ? 'block' : 'hidden'
                  } lg:block lg:col-span-3 space-y-5`}
                >
                  {/* DANH MỤC */}
                  <div className="rounded-2xl border border-[#dfe6f0] bg-white overflow-hidden">
                    <div className="px-4 py-3 bg-[#f6f8fb] border-b border-[#dfe6f0] border-l-4 border-l-[#0667d0]">
                      <h2 className="text-[13px] font-extrabold text-[#17324d] uppercase tracking-wider">
                        DANH MỤC
                      </h2>
                    </div>
                    <div className="p-2.5 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter('all');
                          setSelectedSubTypes([]);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[13.5px] font-semibold transition cursor-pointer ${
                          selectedCategoryFilter === 'all'
                            ? 'bg-[#eff5ff] text-[#0667d0]'
                            : 'text-[#334155] hover:bg-[#f6f8fb]'
                        }`}
                      >
                        Tất cả sản phẩm
                      </button>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter(cat.id);
                            setSelectedSubTypes([]);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-[13.5px] font-semibold transition cursor-pointer ${
                            selectedCategoryFilter === cat.id
                              ? 'bg-[#eff5ff] text-[#0667d0]'
                              : 'text-[#334155] hover:bg-[#f6f8fb]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}

                      <div className="pt-2 mt-2 border-t border-[#eef2f7]">
                        <div className="px-3 py-1 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                          THEO THÚ CƯNG
                        </div>
                        <button
                          type="button"
                          onClick={() => setPetScope('all')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition cursor-pointer ${
                            petScope === 'all'
                              ? 'bg-[#eff5ff] text-[#0667d0] font-semibold'
                              : 'text-[#334155] hover:bg-[#f6f8fb]'
                          }`}
                        >
                          Tất cả Chó &amp; Mèo
                        </button>
                        {PET_AUDIENCES.map((aud) => (
                          <button
                            key={aud.id}
                            type="button"
                            onClick={() => setPetScope(aud.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition cursor-pointer ${
                              petScope === aud.id
                                ? 'bg-[#eff5ff] text-[#0667d0] font-semibold'
                                : 'text-[#334155] hover:bg-[#f6f8fb]'
                            }`}
                          >
                            {aud.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BỘ LỌC (LOẠI SẢN PHẨM + GIÁ SẢN PHẨM, không có THƯƠNG HIỆU) */}
                  <div className="rounded-2xl border border-[#dfe6f0] bg-white overflow-hidden">
                    <div className="px-4 py-3 bg-[#f6f8fb] border-b border-[#dfe6f0] border-l-4 border-l-[#0667d0] flex items-center justify-between">
                      <h2 className="text-[13px] font-extrabold text-[#17324d] uppercase tracking-wider">
                        BỘ LỌC
                      </h2>
                      {(selectedSubTypes.length > 0 ||
                        selectedPriceRanges.length > 0 ||
                        selectedCategoryFilter !== 'all' ||
                        petScope !== 'all' ||
                        searchQuery) && (
                        <button
                          type="button"
                          onClick={resetCatalogFilters}
                          className="text-[12px] font-semibold text-[#0667d0] hover:underline cursor-pointer"
                        >
                          Xóa lọc
                        </button>
                      )}
                    </div>

                    <div className="p-4 space-y-5">
                      {/* LOẠI SẢN PHẨM */}
                      <div>
                        <h3 className="text-[12.5px] font-bold text-[#17324d] uppercase tracking-wide mb-3">
                          LOẠI SẢN PHẨM
                        </h3>
                        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                          {(selectedCategoryFilter === 'all'
                            ? PRODUCT_SUBTYPES
                            : PRODUCT_SUBTYPES.filter(
                                (st) => st.category === selectedCategoryFilter
                              )
                          ).map((st) => {
                            const checked = selectedSubTypes.includes(st.id);
                            return (
                              <label
                                key={st.id}
                                className="flex items-center gap-2.5 text-[13.5px] text-[#334155] hover:text-[#17324d] cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleSubTypeFilter(st.id)}
                                  className="w-4 h-4 rounded border-[#cbd5e1] accent-[#0667d0] cursor-pointer"
                                />
                                <span className={checked ? 'font-semibold text-[#0667d0]' : ''}>
                                  {st.id}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* GIÁ SẢN PHẨM */}
                      <div className="pt-4 border-t border-[#eef2f7]">
                        <h3 className="text-[12.5px] font-bold text-[#17324d] uppercase tracking-wide mb-3">
                          GIÁ SẢN PHẨM
                        </h3>
                        <div className="space-y-2.5">
                          {PRICE_RANGES.map((range) => {
                            const checked = selectedPriceRanges.includes(range.id);
                            return (
                              <label
                                key={range.id}
                                className="flex items-center gap-2.5 text-[13.5px] text-[#334155] hover:text-[#17324d] cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePriceRangeFilter(range.id)}
                                  className="w-4 h-4 rounded border-[#cbd5e1] accent-[#0667d0] cursor-pointer"
                                />
                                <span className={checked ? 'font-semibold text-[#0667d0]' : ''}>
                                  {range.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Right Results Area */}
                <div className="lg:col-span-9 space-y-6 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#dfe6f0]">
                    <div>
                      <h1 className="text-[26px] lg:text-[30px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                        {searchQuery
                          ? `Kết quả cho "${searchQuery}"`
                          : selectedCategoryFilter !== 'all'
                            ? CATEGORY_LABELS[selectedCategoryFilter]
                            : petScope === 'dog'
                              ? 'Đồ dùng dành cho Chó'
                              : petScope === 'cat'
                                ? 'Đồ dùng dành cho Mèo'
                                : 'Tất cả đồ dùng thú cưng'}
                      </h1>
                      <p className="text-[13px] text-[#52657a] mt-1">
                        Hiển thị <strong className="text-[#17324d]">{filteredSearchList.length}</strong> sản phẩm phù hợp
                      </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                      <span className="text-[13px] font-medium text-[#52657a]">Sắp xếp:</span>
                      <select
                        aria-label="Sắp xếp sản phẩm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="px-3.5 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0] cursor-pointer"
                      >
                        <option value="popular">Mặc định: Nổi bật</option>
                        <option value="price-asc">Giá: Thấp đến Cao</option>
                        <option value="price-desc">Giá: Cao đến Thấp</option>
                        <option value="rating">Đánh giá cao nhất</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filter Chips */}
                  {(selectedSubTypes.length > 0 || selectedPriceRanges.length > 0 || petScope !== 'all') && (
                    <div className="flex flex-wrap items-center gap-2">
                      {petScope !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setPetScope('all')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eff5ff] border border-[#b9d7ff] text-xs font-semibold text-[#0667d0] cursor-pointer"
                        >
                          <span>{petScope === 'dog' ? 'Dành cho Chó' : 'Dành cho Mèo'}</span>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {selectedSubTypes.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleSubTypeFilter(st)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eff5ff] border border-[#b9d7ff] text-xs font-semibold text-[#0667d0] cursor-pointer"
                        >
                          <span>{st}</span>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ))}
                      {selectedPriceRanges.map((rid) => {
                        const rLabel = PRICE_RANGES.find((r) => r.id === rid)?.label;
                        return (
                          <button
                            key={rid}
                            type="button"
                            onClick={() => togglePriceRangeFilter(rid)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eff5ff] border border-[#b9d7ff] text-xs font-semibold text-[#0667d0] cursor-pointer"
                          >
                            <span>{rLabel}</span>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Product Grid */}
                  {filteredSearchList.length === 0 ? (
                    <div className="rounded-2xl border border-[#dfe6f0] bg-[#f8faff] p-12 text-center space-y-3">
                      <h2 className="text-lg font-bold text-[#17324d]">
                        Không tìm thấy sản phẩm phù hợp
                      </h2>
                      <p className="text-sm text-[#52657a]">
                        Thử bỏ bớt điều kiện lọc hoặc tìm kiếm bằng từ khóa khác.
                      </p>
                      <button
                        type="button"
                        onClick={resetCatalogFilters}
                        className="px-5 py-2.5 rounded-xl bg-[#0667d0] text-white text-[13px] font-bold cursor-pointer"
                      >
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredSearchList.map((item, idx) => (
                        <TiltCard
                          key={item.id}
                          item={item}
                          index={idx}
                          isLiked={!!likedIds[item.id]}
                          isLoggedIn={isLoggedIn}
                          onToggleLike={toggleLike}
                          onViewProduct={openProductDetail}
                          onAddToCart={(prod) => addProductToCart(prod)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 2B. PROMOTIONS PAGE (TỔNG HỢP SẢN PHẨM ĐANG GIẢM GIÁ)
           * =================================================================== */}
          {currentPage === 'promotions' && (
            <motion.div
              key="promotions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-8 pb-16 space-y-8"
            >
              {/* Promo Header + Home-style Category Filter */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-[#dfe6f0]">
                <div className="space-y-2 max-w-2xl">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#52657a] hover:text-[#0667d0] transition cursor-pointer"
                  >
                    <span>Trang chủ</span>
                    <span>/</span>
                    <span className="text-[#0667d0]">Khuyến mãi</span>
                  </button>
                  <h1 className="text-[26px] lg:text-[32px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                    Sản phẩm đang giảm giá hôm nay
                  </h1>
                  <p className="text-[14px] text-[#52657a]">
                    Tổng hợp tất cả sản phẩm thức ăn, thuốc &amp; làm đẹp, chuồng nệm và phụ kiện đang áp dụng mức giá ưu đãi trực tiếp.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#f3f7ff] border border-[#dfe6f0] overflow-x-auto no-scrollbar max-w-full shrink-0">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'food', label: 'Dinh dưỡng & Pate' },
                    { id: 'hygiene', label: 'Thuốc & Làm đẹp' },
                    { id: 'bed', label: 'Nệm ngủ' },
                    { id: 'backpack', label: 'Balo & Phụ kiện' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setPromoCatFilter(tab.id as typeof promoCatFilter)
                      }
                      className={`px-4 py-2 rounded-lg text-[13px] font-bold transition cursor-pointer whitespace-nowrap ${
                        promoCatFilter === tab.id
                          ? 'bg-[#0667d0] text-white shadow-xs'
                          : 'text-[#52657a] hover:text-[#17324d]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPromotionsList.length === 0 ? (
                <div className="rounded-2xl border border-[#dfe6f0] bg-[#f8faff] p-10 text-center space-y-3">
                  <p className="text-sm text-[#52657a]">
                    Không có sản phẩm giảm giá trong nhóm lọc này.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCatFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0667d0] text-white text-xs font-bold cursor-pointer"
                  >
                    Xem tất cả ưu đãi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredPromotionsList.map((item, idx) => (
                    <TiltCard
                      key={item.id}
                      item={item}
                      index={idx}
                      isLiked={!!likedIds[item.id]}
                      isLoggedIn={isLoggedIn}
                      onToggleLike={toggleLike}
                      onViewProduct={openProductDetail}
                      onAddToCart={(prod) => addProductToCart(prod)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ===================================================================
           * 2C. CUSTOMER ACCOUNT MANAGEMENT PAGE (SHOPEE-ADAPTED)
           * =================================================================== */}
          {currentPage === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pb-14"
            >
              <Suspense fallback={workspaceFallback}>
              <AccountPage
                isLoggedIn={isLoggedIn}
                userName={userName}
                userEmail={userEmail}
                userPhone={userPhone}
                userGender={userGender}
                activeTab={accountTab}
                onTabChange={setAccountTab}
                onUpdateProfile={({ name, email, phone, gender }) => {
                  setUserName(name);
                  setUserEmail(email);
                  setUserPhone(phone);
                  setUserGender(gender);
                  setOwnerName(name);
                  setOwnerPhone(phone);
                  setCheckoutName(name);
                  setCheckoutPhone(phone);
                  setCheckoutEmail(email);
                  triggerToast('Đã cập nhật thông tin tài khoản.');
                }}
                addresses={addresses}
                onAddAddress={(addr) => {
                  const newId = `addr-${Date.now()}`;
                  setAddresses((prev) => {
                    const base = addr.isDefault
                      ? prev.map((a) => ({ ...a, isDefault: false }))
                      : prev;
                    return [...base, { ...addr, id: newId }];
                  });
                  if (addr.isDefault) {
                    setShippingAddress(addr.address);
                  }
                  triggerToast('Đã thêm địa chỉ nhận hàng mới.');
                }}
                onUpdateAddress={(updated) => {
                  setAddresses((prev) =>
                    prev.map((a) => {
                      if (a.id === updated.id) return updated;
                      return updated.isDefault ? { ...a, isDefault: false } : a;
                    })
                  );
                  if (updated.isDefault) {
                    setShippingAddress(updated.address);
                  }
                  triggerToast('Đã cập nhật địa chỉ giao hàng.');
                }}
                onSetDefaultAddress={(id) => {
                  setAddresses((prev) =>
                    prev.map((a) => {
                      const nextDefault = a.id === id;
                      if (nextDefault) {
                        setShippingAddress(a.address);
                      }
                      return { ...a, isDefault: nextDefault };
                    })
                  );
                  triggerToast('Đã cập nhật địa chỉ nhận hàng mặc định.');
                }}
                onDeleteAddress={(id) => {
                  setAddresses((prev) => prev.filter((a) => a.id !== id));
                  triggerToast('Đã xóa địa chỉ nhận hàng.');
                }}
                onRequestConfirm={(dialog) => setConfirmDialog(dialog)}
                orders={orders}
                bookings={bookings.filter((b) => !b.id.startsWith('BK-2026-'))}
                likedProducts={products.filter((p) => likedIds[p.id])}
                onToggleLike={toggleLike}
                onAddToCart={(prod, qty) => addProductToCart(prod, qty)}
                onBuyAgain={(order) => {
                  order.items.forEach((ordItem) => {
                    const matched = products.find((p) => p.id === ordItem.id);
                    if (matched) {
                      addProductToCart(matched, ordItem.quantity);
                    }
                  });
                  navigateTo('cart');
                }}
                onOpenProduct={(id) => {
                  const found = products.find((p) => p.id === id);
                  if (found) openProductDetail(found);
                }}
                onNavigate={navigateTo}
                onLogout={handleLogout}
              />
              </Suspense>
            </motion.div>
          )}

          {/* ===================================================================
           * 3. PRODUCT DETAIL & CUSTOMER REVIEWS PAGE
           * =================================================================== */}
          {currentPage === 'product' && (
            <motion.div
              key="product"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pb-16"
            >
              {/* Breadcrumb */}
              <div className="h-14 flex items-center gap-2.5 text-[13px] flex-wrap">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#52657a] hover:text-[#0667d0] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#52657a]" />
                <button
                  onClick={() => handleSelectCategory(selectedProduct.category)}
                  className="text-[#52657a] hover:text-[#0667d0] cursor-pointer"
                >
                  {CATEGORY_LABELS[selectedProduct.category]}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#52657a]" />
                <span className="font-semibold text-[#0667d0] truncate max-w-[180px] sm:max-w-[320px]">
                  {selectedProduct.name}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Visual Gallery */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative aspect-4/3 rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] overflow-hidden">
                    {selectedProduct.discountBadge && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#c2410c] text-white text-[12px] font-bold z-10">
                        {selectedProduct.discountBadge}
                      </span>
                    )}
                    <img
                      src={selectedProduct.gallery[activeGalleryIdx] || selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {selectedProduct.gallery.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {selectedProduct.gallery.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveGalleryIdx(idx)}
                          className={`aspect-square rounded-xl bg-[#eff5ff] border-2 overflow-hidden cursor-pointer transition ${
                            activeGalleryIdx === idx
                              ? 'border-[#0667d0]'
                              : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${selectedProduct.name} ảnh ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-[#f8faff] border border-[#dfe6f0] flex items-center gap-3 text-[13px] text-[#52657a]">
                    <ShieldCheck className="w-5 h-5 text-[#0667d0] shrink-0" />
                    <span>100% chính hãng · Kiểm định chất lượng thú y · Đổi trả trong 7 ngày.</span>
                  </div>
                </div>

                {/* Right Details Panel */}
                <div className="lg:col-span-5 space-y-6 bg-white rounded-2xl border border-[#dfe6f0] p-6 lg:p-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-bold text-[#0667d0] uppercase tracking-wider">
                        {selectedProduct.brand}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        <span>Còn {selectedProduct.stockCount} sản phẩm</span>
                      </span>
                    </div>

                    <h1 className="text-[24px] lg:text-[26px] font-extrabold text-[#17324d] leading-snug">
                      {selectedProduct.name}
                    </h1>
                    <div className="text-[13px] text-[#52657a] mt-1">{selectedProduct.packSize}</div>
                    <div className="text-[13px] font-semibold mt-2.5 flex items-center gap-2 tabular-nums">
                      <span className="inline-flex items-center gap-1 text-[#17324d]">
                        <Star className="w-4 h-4 fill-[#ffb547] text-[#ffb547]" />
                        <span>{selectedProduct.rating.toFixed(1)}</span>
                      </span>
                      <span className="text-[#52657a]">
                        ({productReviews.length} đánh giá từ khách hàng)
                      </span>
                      <a href="#product-reviews" className="text-[#0667d0] hover:underline">
                        Xem đánh giá
                      </a>
                    </div>
                  </div>

                  <div className="py-3 border-y border-[#dfe6f0] space-y-1.5">
                    <div className="flex items-baseline gap-3 tabular-nums">
                      <span className="text-[28px] font-extrabold text-[#17324d]">
                        {selectedProduct.price}
                      </span>
                      {selectedProduct.originalPrice && (
                        <span className="text-[14px] text-[#52657a] line-through">
                          {selectedProduct.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-[#52657a] leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-2 text-[13px] text-[#17324d]">
                    {selectedProduct.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0667d0] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Size / Variant Selector */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#17324d] block">
                      Quy cách đóng gói
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setProductSelectedSize(size)}
                          className={`py-2.5 px-3 rounded-xl text-[13px] font-bold border transition cursor-pointer ${
                            productSelectedSize === size
                              ? 'border-[#0667d0] bg-[#eff5ff] text-[#0667d0]'
                              : 'border-[#dfe6f0] bg-white text-[#52657a] hover:border-[#0667d0]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Actions */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="py-1.5 rounded-xl border border-[#dfe6f0] flex items-center px-2 bg-white">
                        <button
                          onClick={() => setProductQuantity((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 flex items-center justify-center text-[#52657a] hover:text-[#17324d] cursor-pointer"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-[#17324d] tabular-nums">
                          {productQuantity}
                        </span>
                        <button
                          onClick={() => setProductQuantity((q) => q + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#52657a] hover:text-[#17324d] cursor-pointer"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          addProductToCart(selectedProduct, productQuantity, productSelectedSize)
                        }
                        className="flex-1 py-3 px-4 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Thêm vào giỏ hàng</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (
                          addProductToCart(
                            selectedProduct,
                            productQuantity,
                            productSelectedSize
                          )
                        ) {
                          navigateTo('cart');
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Mua ngay · Giao nhanh 2 giờ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Section — Openly Readable by Guests */}
              <section
                id="product-reviews"
                className="mt-14 pt-12 border-t border-[#dfe6f0] grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                {/* Left Rating Summary + Write Review */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="rounded-2xl bg-[#f8faff] border border-[#dfe6f0] p-6 space-y-4">
                    <h2 className="text-[20px] font-extrabold text-[#17324d]">
                      Đánh giá từ khách hàng
                    </h2>
                    <div className="flex items-baseline gap-3 tabular-nums">
                      <span className="text-[40px] font-extrabold text-[#17324d] leading-none">
                        {selectedProduct.rating.toFixed(1)}
                      </span>
                      <div>
                        <div className="flex items-center gap-0.5 text-[#ffb547]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#ffb547]" />
                          ))}
                        </div>
                        <div className="text-[13px] text-[#52657a] mt-1">
                          Dựa trên {productReviews.length} nhận xét đã xác thực
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {[
                        { stars: 5, pct: 88 },
                        { stars: 4, pct: 10 },
                        { stars: 3, pct: 2 },
                      ].map((row) => (
                        <div key={row.stars} className="flex items-center gap-2.5 text-[13px] tabular-nums">
                          <span className="w-11 text-[#52657a] font-medium">{row.stars} sao</span>
                          <div className="flex-1 h-1.5 rounded-full bg-[#dfe6f0] overflow-hidden">
                            <div
                              className="h-full bg-[#0667d0] rounded-full"
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="w-9 text-right text-[#52657a]">{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Write Review Form (Auth Gated) */}
                  {isLoggedIn ? (
                    <form
                      onSubmit={handleSubmitReview}
                      className="rounded-2xl bg-white border border-[#dfe6f0] p-6 space-y-4"
                    >
                      <h3 className="text-[15px] font-bold text-[#17324d]">
                        Viết đánh giá của bạn
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setReviewRating(starVal)}
                            className="cursor-pointer p-0.5"
                            aria-label={`Đánh giá ${starVal} sao`}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                starVal <= reviewRating
                                  ? 'fill-[#ffb547] text-[#ffb547]'
                                  : 'text-[#dfe6f0]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={reviewPetTag}
                        onChange={(e) => setReviewPetTag(e.target.value)}
                        placeholder="Ví dụ: Nuôi Poodle 2 tuổi"
                        className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                      />
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm thực tế về sản phẩm..."
                        className="w-full p-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors"
                      >
                        Gửi đánh giá
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-2xl bg-white border border-[#dfe6f0] p-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#17324d]">
                        <MessageSquare className="w-4 h-4 text-[#0667d0]" />
                        <span>Chia sẻ cảm nhận sản phẩm</span>
                      </div>
                      <p className="text-[13px] text-[#52657a] leading-relaxed">
                        Chỉ hội viên đã đăng nhập mới có thể gửi đánh giá mới.
                      </p>
                      <button
                        onClick={() =>
                          requireLoginFor('product', 'Đăng nhập để gửi đánh giá sản phẩm.')
                        }
                        className="text-[13px] font-bold text-[#0667d0] hover:underline cursor-pointer"
                      >
                        Đăng nhập để viết đánh giá →
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Review Cards */}
                <div className="lg:col-span-8 space-y-4">
                  {productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl bg-white border border-[#dfe6f0] p-6 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#17324d]">{rev.author}</span>
                            {rev.verified && (
                              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                <span>Đã mua hàng</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-[#52657a] mt-0.5">{rev.petTag}</div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-0.5 text-[#ffb547] justify-end">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#ffb547]" />
                            ))}
                          </div>
                          <div className="text-[12px] text-[#52657a] mt-1">{rev.date}</div>
                        </div>
                      </div>

                      <p className="text-[14px] text-[#17324d] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ===================================================================
           * 4. CART & CHECKOUT PAGE (Guest & Member Checkout)
           * =================================================================== */}
          {currentPage === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-16"
            >
              {cartItems.length === 0 ? (
                <div className="max-w-[520px] mx-auto rounded-2xl border border-[#dfe6f0] bg-[#f8faff] text-center py-14 px-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#eff5ff] text-[#0667d0] mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#17324d]">
                    Giỏ hàng của bạn đang trống
                  </h2>
                  <p className="text-sm text-[#52657a]">
                    Chọn thêm thức ăn dinh dưỡng hoặc phụ kiện chăm sóc cho thú cưng của bạn.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="py-3 px-6 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white font-bold text-sm cursor-pointer transition-colors"
                    >
                      Khám phá sản phẩm
                    </button>
                    {!isLoggedIn && (
                      <button
                        type="button"
                        onClick={openOrderLookupModal}
                        className="py-3 px-5 rounded-xl border border-[#dfe6f0] hover:border-[#0667d0] bg-white text-[#17324d] hover:text-[#0667d0] font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <PackageSearch className="w-4 h-4" />
                        <span>Tra cứu đơn hàng</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column */}
                  <div className="lg:col-span-8 bg-white rounded-2xl border border-[#dfe6f0] p-6 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-[#dfe6f0]">
                      <h2 className="text-lg font-bold text-[#17324d]">
                        Giỏ hàng ({totalCartCount} sản phẩm)
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDialog({
                            title: 'Xóa toàn bộ giỏ hàng',
                            message:
                              'Bạn có chắc chắn muốn xóa tất cả sản phẩm hiện có trong giỏ hàng không?',
                            confirmLabel: 'Xóa giỏ hàng',
                            tone: 'danger',
                            onConfirm: () => {
                              setCartItems([]);
                              triggerToast('Đã xóa toàn bộ sản phẩm trong giỏ.');
                            },
                          });
                        }}
                        className="text-[13px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
                      >
                        Xóa tất cả
                      </button>
                    </div>

                    <div className="divide-y divide-[#dfe6f0]">
                      {cartItems.map((item) => (
                        <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover bg-[#f3f7ff] shrink-0"
                          />
                          <div className="flex-1 space-y-1">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-[#0667d0] bg-[#eff5ff] px-2.5 py-0.5 rounded">
                              {item.category}
                            </span>
                            <h3 className="text-sm font-bold text-[#17324d]">{item.name}</h3>
                            <p className="text-[13px] text-[#52657a]">{item.desc}</p>
                            <div className="text-sm font-extrabold text-[#0667d0] tabular-nums">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-[#dfe6f0] rounded-xl overflow-hidden bg-[#f8faff]">
                              <button
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-[#17324d] hover:bg-[#eff5ff] cursor-pointer"
                                aria-label="Giảm số lượng"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-[#17324d] tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center text-[#17324d] hover:bg-[#eff5ff] cursor-pointer"
                                aria-label="Tăng số lượng"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeCartItem(item.id)}
                              className="p-2 text-[#52657a] hover:text-[#c2410c] cursor-pointer transition-colors"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Summary Column */}
                  <div className="lg:col-span-4 bg-white rounded-2xl border border-[#dfe6f0] p-6 space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-bold text-[#17324d]">Tóm tắt &amp; Thanh toán</h2>
                      {!isLoggedIn && (
                        <button
                          type="button"
                          onClick={openOrderLookupModal}
                          className="text-[12px] font-semibold text-[#0667d0] hover:underline cursor-pointer"
                        >
                          Tra cứu đơn
                        </button>
                      )}
                    </div>

                    {/* Payment Session Countdown Timer (45s) */}
                    <div
                      className={`rounded-xl px-3.5 py-2.5 border flex items-center justify-between gap-3 transition-colors ${
                        paymentSecondsLeft <= 15
                          ? 'bg-[#fff2e9] border-[#ffddc7] text-[#c2410c]'
                          : 'bg-[#eff5ff] border-[#c8ddf8] text-[#0667d0]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[12px] font-semibold">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Thời gian hoàn tất thanh toán</span>
                      </div>
                      <span className="text-[14px] font-extrabold tabular-nums">
                        00:{String(paymentSecondsLeft).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Contact Info (Guest form requires Name, Phone, Gmail; Logged-in pre-fills) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[13px] font-bold text-[#17324d]">
                          {isLoggedIn
                            ? 'Thông tin người nhận'
                            : 'Thông tin khách hàng (Không cần đăng nhập)'}
                        </div>
                        {!isLoggedIn && (
                          <span className="text-[11px] font-semibold text-[#c2410c]">* Bắt buộc</span>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        <input
                          type="text"
                          value={checkoutName}
                          onChange={(e) => {
                            setCheckoutName(e.target.value);
                            if (checkoutError) setCheckoutError(null);
                          }}
                          placeholder="Họ và tên người nhận *"
                          aria-label="Họ và tên người nhận"
                          className={`w-full h-10 px-3 text-[13px] rounded-xl bg-[#f8faff] border text-[#17324d] focus:outline-none ${
                            checkoutError && !checkoutName.trim() && !isLoggedIn
                              ? 'border-[#c2410c]'
                              : 'border-[#dfe6f0] focus:border-[#0667d0]'
                          }`}
                        />
                        <input
                          type="tel"
                          value={checkoutPhone}
                          onChange={(e) => {
                            setCheckoutPhone(e.target.value);
                            if (checkoutError) setCheckoutError(null);
                          }}
                          placeholder="Số điện thoại liên hệ *"
                          aria-label="Số điện thoại liên hệ"
                          className={`w-full h-10 px-3 text-[13px] rounded-xl bg-[#f8faff] border text-[#17324d] focus:outline-none ${
                            checkoutError && !checkoutPhone.trim()
                              ? 'border-[#c2410c]'
                              : 'border-[#dfe6f0] focus:border-[#0667d0]'
                          }`}
                        />
                        <input
                          type="email"
                          value={checkoutEmail}
                          onChange={(e) => {
                            setCheckoutEmail(e.target.value);
                            if (checkoutError) setCheckoutError(null);
                          }}
                          placeholder="Gmail / Email nhận xác nhận *"
                          aria-label="Gmail nhận xác nhận đơn hàng"
                          className={`w-full h-10 px-3 text-[13px] rounded-xl bg-[#f8faff] border text-[#17324d] focus:outline-none ${
                            checkoutError && !checkoutEmail.trim() && !isLoggedIn
                              ? 'border-[#c2410c]'
                              : 'border-[#dfe6f0] focus:border-[#0667d0]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Delivery Method Selector */}
                    <div className="space-y-2.5 pt-2 border-t border-[#dfe6f0]">
                      <div className="text-[13px] font-bold text-[#17324d]">
                        Hình thức nhận hàng
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDeliveryMethod('delivery');
                            if (checkoutError) setCheckoutError(null);
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                            deliveryMethod === 'delivery'
                              ? 'border-[#0667d0] bg-[#eff5ff] text-[#0667d0]'
                              : 'border-[#dfe6f0] bg-white text-[#52657a] hover:border-[#0667d0]'
                          }`}
                        >
                          <Truck className="w-4 h-4 shrink-0" />
                          <span className="text-[12px] font-bold">Giao tận nơi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeliveryMethod('pickup');
                            if (checkoutError) setCheckoutError(null);
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                            deliveryMethod === 'pickup'
                              ? 'border-[#0667d0] bg-[#eff5ff] text-[#0667d0]'
                              : 'border-[#dfe6f0] bg-white text-[#52657a] hover:border-[#0667d0]'
                          }`}
                        >
                          <Store className="w-4 h-4 shrink-0" />
                          <span className="text-[12px] font-bold">Nhận tại cửa hàng</span>
                        </button>
                      </div>

                      {deliveryMethod === 'delivery' ? (
                        <input
                          type="text"
                          value={isLoggedIn ? shippingAddress : checkoutAddress}
                          onChange={(e) => {
                            if (isLoggedIn) {
                              setShippingAddress(e.target.value);
                            } else {
                              setCheckoutAddress(e.target.value);
                            }
                            if (checkoutError) setCheckoutError(null);
                          }}
                          placeholder="Địa chỉ giao hàng (Số nhà, đường, quận/huyện) *"
                          aria-label="Địa chỉ giao hàng"
                          className={`w-full h-10 px-3 text-[13px] rounded-xl bg-[#f8faff] border text-[#17324d] focus:outline-none ${
                            checkoutError &&
                            !(isLoggedIn ? shippingAddress : checkoutAddress).trim()
                              ? 'border-[#c2410c]'
                              : 'border-[#dfe6f0] focus:border-[#0667d0]'
                          }`}
                        />
                      ) : (
                        <div className="rounded-xl bg-[#f8faff] border border-[#c8ddf8] p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0667d0]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{storeSettings.storeName || STORE_PICKUP_INFO.name}</span>
                          </div>
                          <p className="text-[12px] text-[#17324d] font-medium leading-snug">
                            {[storeSettings.streetAddress, storeSettings.district, storeSettings.city]
                              .filter(Boolean)
                              .join(', ') || STORE_PICKUP_INFO.address}
                          </p>
                          <p className="text-[11px] text-[#52657a]">
                            Giờ nhận hàng: {storeSettings.hours || STORE_PICKUP_INFO.hours} · Giữ đơn miễn phí 48 giờ
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Options */}
                    <div className="space-y-2.5 pt-2 border-t border-[#dfe6f0]">
                      <div className="text-[13px] font-bold text-[#17324d]">
                        Phương thức thanh toán
                      </div>
                      <div className="space-y-2">
                        {activePaymentOptions.map((opt) => {
                          const isSelected = effectivePaymentMethod === opt.id;
                          const IconComp =
                            opt.id === 'vnpay'
                              ? QrCode
                              : opt.id === 'momo'
                                ? Wallet
                                : Banknote;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPaymentMethod(opt.id)}
                              className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                                isSelected
                                  ? 'border-[#0667d0] bg-[#eff5ff]'
                                  : 'border-[#dfe6f0] bg-white hover:border-[#0667d0]'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'bg-[#0667d0] text-white'
                                    : 'bg-[#f3f7ff] text-[#0667d0]'
                                }`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[13px] font-bold text-[#17324d]">
                                    {opt.label}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#dfe6f0] text-[#52657a]">
                                    {opt.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#52657a] mt-0.5 leading-snug">
                                  {opt.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {checkoutError && (
                      <div
                        role="alert"
                        className="rounded-xl bg-[#fff2e9] border border-[#ffddc7] px-3.5 py-2.5 flex items-start gap-2 text-[12px] font-semibold text-[#9a3412]"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#c2410c]" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    <div className="space-y-2.5 pt-2 border-t border-[#dfe6f0] text-[13px] tabular-nums">
                      <div className="flex justify-between text-[#52657a]">
                        <span>Tạm tính:</span>
                        <span className="font-bold text-[#17324d]">
                          {cartSubtotal.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <div className="flex justify-between text-[#0667d0]">
                        <span>{deliveryMethod === 'pickup' ? 'Nhận hàng:' : 'Vận chuyển:'}</span>
                        <span className="font-bold">
                          {deliveryMethod === 'pickup' ? 'Tại cửa hàng (Miễn phí)' : 'Miễn phí'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#dfe6f0] flex justify-between items-baseline tabular-nums">
                      <span className="text-sm font-bold text-[#17324d]">Tổng thanh toán:</span>
                      <span className="text-xl font-extrabold text-[#0667d0]">
                        {cartFinalTotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Xác nhận thanh toán</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===================================================================
           * 5. SERVICE BOOKING PAGE (Guest & Member Booking)
           * =================================================================== */}
          {currentPage === 'service' && (
            <motion.div
              key="service"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pb-16"
            >
              {/* Breadcrumb */}
              <div className="h-14 flex items-center gap-2.5 text-[13px]">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#52657a] hover:text-[#0667d0] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#52657a]" />
                <span className="font-semibold text-[#0667d0]">Dịch vụ chăm sóc &amp; Khách sạn 5 sao</span>
              </div>

              {/* Hero Banner */}
              <div className="rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-8 lg:p-10 mb-8 space-y-2">
                <h1 className="text-[28px] lg:text-[34px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                  Dịch vụ chăm sóc &amp; Khách sạn thú cưng chuẩn y khoa
                </h1>
                <p className="text-[14px] text-[#52657a] max-w-[58ch] leading-relaxed">
                  Quy trình vệ sinh 7 bước nhẹ nhàng, phòng lưu trú riêng biệt và đội ngũ chăm sóc tận tâm.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Packages + Booking Form (Gated for guests) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Packages Catalog — flat container wrapper removed so cards aren't nested */}
                  <div className="space-y-3.5">
                    <h2 className="text-[18px] font-bold text-[#17324d]">
                      Bảng giá gói dịch vụ
                    </h2>

                    <div className="space-y-3">
                      {SPA_PACKAGES.map((pkg) => {
                        const active = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                              active
                                ? 'bg-[#eff5ff] border-[#0667d0]'
                                : 'bg-white border-[#dfe6f0] hover:border-[#0667d0]/60'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[15px] font-bold text-[#17324d]">{pkg.name}</span>
                                {pkg.isPopular && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#c2410c] text-white text-[12px] font-bold">
                                    Phổ biến nhất
                                  </span>
                                )}
                              </div>
                              <p className="text-[13px] text-[#52657a] leading-relaxed">{pkg.desc}</p>
                              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#52657a]">
                                <Clock className="w-3.5 h-3.5 text-[#0667d0]" />
                                <span>Thời lượng: {pkg.duration}</span>
                              </div>
                            </div>
                            <div className="text-base font-extrabold text-[#0667d0] shrink-0 tabular-nums">
                              {pkg.priceStr}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!ownerPhone.trim()) {
                        triggerToast('Vui lòng nhập số điện thoại để PetsFriend liên hệ xác nhận lịch hẹn.');
                        return;
                      }
                      const newBooking: ServiceBookingRecord = {
                        id: `BK${Math.floor(100000 + Math.random() * 899999)}`,
                        serviceName: selectedSpaPackage.name,
                        petName: bookingPetType,
                        date: bookingDate,
                        timeSlot: bookingTime,
                        price: selectedSpaPackage.price,
                        status: 'upcoming',
                        note: petNote.trim() || undefined,
                      };
                      setBookings((prev) => [newBooking, ...prev]);
                      setBookingConfirmed(true);
                      triggerToast(
                        `Đã xác nhận lịch hẹn "${selectedSpaPackage.name}" lúc ${bookingTime} (${formatBookingDate(bookingDate)}).`
                      );
                    }}
                    className="bg-white rounded-2xl border border-[#dfe6f0] p-6 lg:p-8 space-y-6"
                  >
                    <h2 className="text-base font-bold text-[#17324d]">
                      Thông tin đặt lịch hẹn
                    </h2>

                    <div className="space-y-2.5">
                      <label className="text-[13px] font-bold text-[#17324d] block">
                        Phân loại thú cưng
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          'Chó nhỏ (< 5kg)',
                          'Chó vừa (5–10kg)',
                          'Chó lớn (> 10kg)',
                          'Mèo cưng',
                        ].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setBookingPetType(t)}
                            className={`py-2.5 px-3 rounded-xl text-[13px] font-bold border transition cursor-pointer ${
                              bookingPetType === t
                                ? 'bg-[#eff5ff] border-[#0667d0] text-[#0667d0]'
                                : 'bg-white border-[#dfe6f0] text-[#52657a] hover:border-[#0667d0]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="booking-date-input"
                          className="text-[13px] font-semibold text-[#52657a] flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#0667d0]" />
                          <span>Ngày hẹn</span>
                        </label>
                        <input
                          id="booking-date-input"
                          type="date"
                          min={TODAY_ISO}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          aria-label="Chọn ngày hẹn lịch chăm sóc"
                          className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] focus:border-[#0667d0] text-[13px] font-bold text-[#17324d] focus:outline-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[#52657a] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0667d0]" />
                          <span>Khung giờ</span>
                        </label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-bold text-[#17324d] focus:outline-none"
                        >
                          <option value="09:00 Sáng">09:00 Sáng</option>
                          <option value="10:30 Sáng">10:30 Sáng</option>
                          <option value="14:00 Chiều">14:00 Chiều</option>
                          <option value="15:30 Chiều">15:30 Chiều</option>
                          <option value="17:00 Chiều">17:00 Chiều</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[#52657a]">Họ và tên</label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-bold text-[#17324d] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[#52657a]">Số điện thoại</label>
                        <input
                          type="text"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          placeholder="Ví dụ: 0909 123 456"
                          className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] font-bold text-[#17324d] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[#52657a]">
                        Ghi chú về tình trạng thú cưng
                      </label>
                      <textarea
                        value={petNote}
                        onChange={(e) => setPetNote(e.target.value)}
                        placeholder="Ví dụ: Da nhạy cảm, cần tỉa gọn vùng mặt..."
                        rows={2}
                        className="w-full p-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] text-[#17324d] focus:outline-none"
                      />
                    </div>

                    {bookingConfirmed && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-800 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            Đã ghi nhận lịch hẹn <strong>{selectedSpaPackage.name}</strong> ({bookingPetType}) lúc{' '}
                            <strong>{bookingTime}</strong> ngày <strong>{formatBookingDate(bookingDate)}</strong>.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingConfirmed(false)}
                          className="text-[12px] font-bold text-emerald-900 hover:underline cursor-pointer shrink-0"
                        >
                          Đặt thêm dịch vụ khác
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Xác nhận đặt lịch hẹn</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Right Standards Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-2xl border border-[#dfe6f0] p-6 space-y-4">
                    <h2 className="text-base font-bold text-[#0667d0] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Quy trình 7 bước chuẩn y khoa</span>
                    </h2>
                    <div className="space-y-3 text-[13px] text-[#17324d]">
                      {[
                        '1. Kiểm tra tổng quát tình trạng da, lông, tai và móng',
                        '2. Vệ sinh tai, cắt dũa và mài tròn móng an toàn',
                        '3. Chải gỡ lông rối và vệ sinh tuyến hôi nhẹ nhàng',
                        '4. Tắm sạch sâu 2 lần bằng sữa tắm thảo mộc dịu nhẹ',
                        '5. Sấy ấm ion âm hạn chế tiếng ồn và không gây căng thẳng',
                        '6. Cắt tỉa tạo phom chuẩn theo giống thú cưng',
                        '7. Xịt dưỡng phục hồi độ ẩm và kiểm tra lại trước khi bàn giao',
                      ].map((s, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0667d0] shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#0667d0] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[13px] text-[#52657a]">Tư vấn lịch trống trong ngày</div>
                      <div className="text-lg font-extrabold text-[#0667d0] tabular-nums">1900 6868</div>
                      <div className="text-[13px] text-[#52657a]">Phục vụ 8:00 – 21:00 mỗi ngày</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 5B. CONTACT PAGE
           * =================================================================== */}
          {currentPage === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pb-16"
            >
              <div className="py-6 border-b border-[#dfe6f0] space-y-2">
                <div className="flex items-center gap-2 text-[12px] text-[#52657a]">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#0667d0] cursor-pointer"
                  >
                    Trang chủ
                  </button>
                  <span>&gt;</span>
                  <span className="font-semibold text-[#0667d0]">Liên hệ</span>
                </div>
                <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#17324d] tracking-tight">
                  Liên hệ PetsFriend
                </h1>
                <p className="text-[14px] text-[#52657a] max-w-[60ch]">
                  Hỗ trợ tư vấn dinh dưỡng, đặt lịch dịch vụ chăm sóc và theo dõi đơn hàng trực tiếp.
                </p>
              </div>

              <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Info Column */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-[#dfe6f0] p-6 sm:p-7 space-y-5">
                  <h2 className="text-lg font-extrabold text-[#17324d]">
                    Hệ thống cửa hàng &amp; Tổng đài
                  </h2>

                  <div className="space-y-4 divide-y divide-[#eef2f7]">
                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#0667d0] flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-[#52657a]">Hotline 24/7</div>
                        <div className="text-[18px] font-extrabold text-[#0667d0] tabular-nums">
                          1900 6868
                        </div>
                        <div className="text-[12px] text-[#52657a]">
                          Hỗ trợ trực tiếp đơn hàng &amp; bác sĩ thú y trực ca
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 pt-4">
                      <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#0667d0] flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-[#52657a]">Email chăm sóc khách hàng</div>
                        <div className="text-[14px] font-bold text-[#17324d]">hello@pethub.vn</div>
                        <div className="text-[12px] text-[#52657a]">Phản hồi trong vòng 2 giờ làm việc</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 pt-4">
                      <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#0667d0] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-[12px] font-semibold text-[#52657a]">Cơ sở TP. Hồ Chí Minh</div>
                        <div className="text-[13px] font-semibold text-[#17324d]">
                          Quận 1: 128 Nguyễn Trãi, P. Bến Thành, TP.HCM
                        </div>
                        <div className="text-[13px] font-semibold text-[#17324d]">
                          Quận 7: 45 Nguyễn Thị Thập, P. Tân Hưng, TP.HCM
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 pt-4">
                      <div className="w-10 h-10 rounded-xl bg-[#fff2e9] text-[#c2410c] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-[#52657a]">Giờ mở cửa</div>
                        <div className="text-[14px] font-bold text-[#17324d]">08:00 – 21:00 mỗi ngày</div>
                        <div className="text-[12px] text-[#52657a]">Mở cửa tất cả các ngày cuối tuần &amp; ngày lễ</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Contact Form Column */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#dfe6f0] p-6 sm:p-8">
                  {contactSent ? (
                    <div className="py-8 text-center space-y-4 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-[#eff5ff] text-[#0667d0] mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-[22px] font-extrabold text-[#17324d]">
                        Đã tiếp nhận yêu cầu hỗ trợ
                      </h2>
                      <p className="text-[14px] text-[#52657a] leading-relaxed">
                        Cảm ơn <span className="font-bold text-[#17324d]">{contactName}</span>. Tư vấn viên PetsFriend sẽ liên hệ qua số{' '}
                        <span className="font-bold text-[#0667d0] tabular-nums">{contactPhone}</span> trong thời gian sớm nhất.
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setContactSent(false);
                            setContactMessage('');
                          }}
                          className="px-5 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors"
                        >
                          Gửi tin nhắn khác
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('home')}
                          className="px-5 py-2.5 rounded-xl bg-[#f3f7ff] hover:bg-[#e3edff] text-[#17324d] text-[13px] font-bold cursor-pointer transition-colors"
                        >
                          Về trang chủ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) {
                          triggerToast('Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung.');
                          return;
                        }
                        setContactSent(true);
                        triggerToast('Đã gửi tin nhắn liên hệ tới PetsFriend.');
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="text-lg font-extrabold text-[#17324d]">
                          Gửi lời nhắn cho PetsFriend
                        </h2>
                        <p className="text-[13px] text-[#52657a] mt-1">
                          Không cần đăng nhập — điền thông tin bên dưới để được tư vấn viên phản hồi trực tiếp.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#17324d] block">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="VD: Nguyễn Minh Anh"
                            className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#17324d] block">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            required
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="VD: 0901 234 567"
                            className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#17324d] block">
                          Chủ đề hỗ trợ
                        </label>
                        <select
                          value={contactTopic}
                          onChange={(e) => setContactTopic(e.target.value)}
                          className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none cursor-pointer"
                        >
                          <option value="Tư vấn sản phẩm & dinh dưỡng">Tư vấn sản phẩm &amp; dinh dưỡng</option>
                          <option value="Đặt lịch dịch vụ chăm sóc">Đặt lịch dịch vụ chăm sóc</option>
                          <option value="Theo dõi đơn hàng & giao nhận">Theo dõi đơn hàng &amp; giao nhận</option>
                          <option value="Hỗ trợ bảo hành & đổi trả">Hỗ trợ bảo hành &amp; đổi trả</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#17324d] block">
                          Nội dung lời nhắn
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Mô tả nhu cầu của bé cưng hoặc mã đơn hàng bạn cần kiểm tra..."
                          className="w-full rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] p-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Gửi yêu cầu liên hệ</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 6. LOGIN & REGISTER PAGES
           * =================================================================== */}
          {(currentPage === 'login' || currentPage === 'register') && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-[#f8faff] py-10 lg:py-14 px-5 flex flex-col items-center justify-center gap-6 min-h-[640px]"
            >
              {/* Primary Auth Card (Always First) */}
              <div className="w-full max-w-[520px] rounded-3xl bg-white border border-[#dfe6f0] shadow-[0_16px_40px_rgba(23,50,77,0.07)] p-7 sm:p-10">
                <div className="w-full rounded-xl bg-[#f3f7ff] p-1 grid grid-cols-2 gap-1 mb-6">
                  <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className={`py-2.5 rounded-lg text-[13px] font-bold transition cursor-pointer ${
                      currentPage === 'login'
                        ? 'bg-white text-[#0667d0] shadow-xs'
                        : 'text-[#52657a] hover:text-[#17324d]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('register')}
                    className={`py-2.5 rounded-lg text-[13px] font-bold transition cursor-pointer ${
                      currentPage === 'register'
                        ? 'bg-white text-[#0667d0] shadow-xs'
                        : 'text-[#52657a] hover:text-[#17324d]'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>

                {currentPage === 'login' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const identifier = loginEmail.trim().toLowerCase();
                      const pwd = loginPassword;
                      if (!identifier || !pwd) {
                        setLoginError('Vui lòng nhập đầy đủ tài khoản/email và mật khẩu.');
                        return;
                      }

                      const matchedWorkspace = DEFAULT_WORKSPACE_ACCOUNTS.find(
                        (acc) => acc.email.toLowerCase() === identifier || acc.username.toLowerCase() === identifier
                      );

                      if (matchedWorkspace) {
                        if (pwd !== matchedWorkspace.password) {
                          setLoginError(
                            'Tên đăng nhập / email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
                          );
                          return;
                        }
                        setLoginError(null);
                        setIsLoggedIn(true);
                        setAuthRole(matchedWorkspace.role);
                        setUserName(matchedWorkspace.displayName);
                        setUserEmail(matchedWorkspace.email);
                        triggerToast(
                          matchedWorkspace.role === 'admin'
                            ? `Đăng nhập thành công (${matchedWorkspace.displayName} · Quản trị viên).`
                            : `Đăng nhập thành công (${matchedWorkspace.displayName} · Nhân viên giới hạn quyền).`
                        );
                        navigateTo('admin', matchedWorkspace.role);
                        return;
                      }

                      const nameFromEmail = loginEmail.includes('@')
                        ? ownerName
                        : loginEmail.trim() || 'Trịnh Anh Khoa';
                      setLoginError(null);
                      setUserName(nameFromEmail);
                      if (loginEmail.includes('@')) {
                        setUserEmail(loginEmail.trim());
                      }
                      setCheckoutName(nameFromEmail);
                      setCheckoutPhone(userPhone);
                      setCheckoutEmail(loginEmail.includes('@') ? loginEmail.trim() : userEmail);
                      setIsLoggedIn(true);
                      setAuthRole('customer');
                      triggerToast(`Đăng nhập thành công. Xin chào ${nameFromEmail}.`);
                      navigateTo(
                        returnPage === 'login' || returnPage === 'register' || returnPage === 'admin'
                          ? 'home'
                          : returnPage,
                        'customer'
                      );
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <h1 className="text-[22px] font-extrabold text-[#17324d]">
                        Đăng nhập tài khoản
                      </h1>
                      <p className="text-[14px] text-[#52657a] mt-1">
                        Nhập email hoặc số điện thoại hội viên để tiếp tục.
                      </p>
                    </div>

                    {loginError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-semibold text-rose-700">
                        {loginError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#17324d] block">
                        Email hoặc Số điện thoại
                      </label>
                      <div className="h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus-within:border-[#0667d0] px-3.5 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#0667d0]" />
                        <input
                          type="text"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="example@email.com"
                          className="flex-1 bg-transparent text-[13px] font-medium text-[#17324d] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <label className="font-bold text-[#17324d]">Mật khẩu</label>
                        <button
                          type="button"
                          onClick={() =>
                            triggerToast('Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn.')
                          }
                          className="py-1 font-semibold text-[#0667d0] hover:underline cursor-pointer"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>
                      <div className="h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus-within:border-[#0667d0] px-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Lock className="w-4 h-4 text-[#52657a]" />
                          <input
                            type={showPass ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value);
                              setLoginError(null);
                            }}
                            placeholder="Nhập mật khẩu"
                            className="flex-1 bg-transparent text-[13px] font-bold text-[#17324d] focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="py-1 text-[#52657a] hover:text-[#17324d] cursor-pointer"
                          aria-label="Ẩn hoặc hiện mật khẩu"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!regName.trim() || !regPhone.trim() || !regEmail.trim()) {
                        setRegError('Vui lòng nhập đầy đủ họ tên, số điện thoại và email.');
                        return;
                      }
                      if (regPassword.length < 6) {
                        setRegError('Mật khẩu phải có ít nhất 6 ký tự.');
                        return;
                      }
                      setRegError('');
                      const chosenName = regName.trim();
                      setUserName(chosenName);
                      setUserEmail(regEmail.trim());
                      setUserPhone(regPhone.trim());
                      setOwnerName(chosenName);
                      setOwnerPhone(regPhone.trim());
                      setCheckoutName(chosenName);
                      setCheckoutPhone(regPhone.trim());
                      setCheckoutEmail(regEmail.trim());
                      setIsLoggedIn(true);
                      setAuthRole('customer');
                      setRegPassword('');
                      triggerToast(`Tạo tài khoản thành công. Chào mừng ${chosenName}.`);
                      navigateTo(
                        returnPage === 'login' || returnPage === 'register' || returnPage === 'admin'
                          ? 'home'
                          : returnPage,
                        'customer'
                      );
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <h1 className="text-[22px] font-extrabold text-[#17324d]">
                        Đăng ký hội viên mới
                      </h1>
                      <p className="text-[13px] text-[#52657a] mt-1">
                        Tạo tài khoản để quản lý đơn hàng, lưu địa chỉ và theo dõi lịch hẹn chăm sóc thú cưng.
                      </p>
                    </div>

                    {regError && (
                      <div className="px-3.5 py-2.5 rounded-xl bg-[#fff2e9] border border-[#ffddc7] text-[12px] font-semibold text-[#9a3412]">
                        {regError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#17324d] block">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => {
                            setRegName(e.target.value);
                            if (regError) setRegError('');
                          }}
                          placeholder="VD: Nguyễn Minh Anh"
                          className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#17324d] block">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => {
                            setRegPhone(e.target.value);
                            if (regError) setRegError('');
                          }}
                          placeholder="VD: 0901 234 567"
                          className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-[#17324d] block">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          if (regError) setRegError('');
                        }}
                        placeholder="VD: minhanh@email.com"
                        className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-[#17324d] block">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#52657a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPass ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (regError) setRegError('');
                          }}
                          placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                          className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] pl-10 pr-10 text-[13px] font-medium text-[#17324d] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPass((p) => !p)}
                          aria-label={showRegPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52657a] hover:text-[#17324d] cursor-pointer"
                        >
                          {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Đăng ký hội viên</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

              {/* Compact Member Benefits Row Below Form */}
              <div className="w-full max-w-[780px] grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: ShoppingBag,
                    color: 'text-[#0667d0]',
                    title: 'Giao nhanh 2 giờ',
                    desc: 'Lưu địa chỉ & theo dõi đơn tiện lợi',
                  },
                  {
                    icon: Calendar,
                    color: 'text-[#c2410c]',
                    title: 'Đặt lịch chăm sóc 24/7',
                    desc: 'Chủ động chọn khung giờ & gói chăm sóc',
                  },
                  {
                    icon: Tag,
                    color: 'text-[#0667d0]',
                    title: 'Khuyến mãi hội viên',
                    desc: 'Theo dõi sản phẩm giảm giá & lưu lịch sử đơn hàng',
                  },
                ].map((feat, i) => {
                  const IconComp = feat.icon;
                  return (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white border border-[#dfe6f0] flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#eff5ff] flex items-center justify-center shrink-0">
                        <IconComp className={`w-4 h-4 ${feat.color}`} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#17324d]">{feat.title}</div>
                        <div className="text-[12px] text-[#52657a]">{feat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 7. CHECKOUT SUCCESS & FAIL PAGES
           * =================================================================== */}
          {(currentPage === 'checkout-success' || currentPage === 'checkout-fail') && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 pt-10 pb-16"
            >
              <div className="max-w-[600px] mx-auto pt-4 space-y-7 text-center">
                {currentPage === 'checkout-success' ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#eff5ff] text-[#0667d0] mx-auto flex items-center justify-center">
                      <Check className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h1 className="text-[28px] font-extrabold text-[#17324d]">
                      Thanh toán thành công
                    </h1>
                    <p className="text-[14px] text-[#52657a]">
                      Cảm ơn {lastOrder?.customerName || (isLoggedIn ? userName : 'Quý khách')}. Đơn hàng{' '}
                      <span className="font-bold text-[#0667d0]">{lastOrder?.code || '#PH8899'}</span>{' '}
                      đã được xác nhận qua <span className="font-semibold text-[#17324d]">{lastOrder?.paymentMethod || 'VNPay'}</span>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#fff2e9] text-[#c2410c] mx-auto flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <h1 className="text-[28px] font-extrabold text-[#c2410c]">
                      Thanh toán không thành công
                    </h1>
                    <p className="text-[14px] text-[#52657a]">
                      Lý do: <span className="font-bold text-[#c2410c]">{lastOrder?.failReason || 'Hết thời gian thanh toán'}</span>. Phiên giao dịch đã hết hạn, sản phẩm vẫn được giữ trong giỏ hàng để bạn thanh toán lại.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-[#dfe6f0] overflow-hidden text-left bg-white">
                  <div className="px-6 py-4 bg-[#f8faff] flex flex-wrap items-center justify-between gap-2 text-[13px] tabular-nums">
                    <span className="font-bold text-[#0667d0]">
                      Mã đơn hàng: {lastOrder?.code || '#PH8899'}
                    </span>
                    <span className="text-[#52657a]">Ngày: {lastOrder?.date || '25/10/2026'}</span>
                  </div>

                  {(lastOrder?.customerPhone || lastOrder?.shippingAddress || lastOrder?.paymentMethod) && (
                    <div className="px-6 py-3.5 border-b border-[#dfe6f0] bg-[#fcfdff] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#52657a]">
                      <div>
                        <span className="font-semibold text-[#17324d]">Người nhận: </span>
                        {lastOrder.customerName || 'Quý khách'}
                        {lastOrder.customerPhone ? ` · ${lastOrder.customerPhone}` : ''}
                      </div>
                      <div>
                        <span className="font-semibold text-[#17324d]">Thanh toán: </span>
                        {lastOrder.paymentMethod || 'VNPay'}
                      </div>
                      {lastOrder.shippingAddress && (
                        <div className="sm:col-span-2">
                          <span className="font-semibold text-[#17324d]">
                            {lastOrder.deliveryMethod === 'pickup' ? 'Điểm nhận hàng: ' : 'Địa chỉ giao hàng: '}
                          </span>
                          {lastOrder.shippingAddress}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 divide-y divide-[#dfe6f0]">
                    {(lastOrder?.items.length ? lastOrder.items : [
                      {
                        id: 'fallback-1',
                        productId: CATALOG_PRODUCTS[0].id,
                        name: CATALOG_PRODUCTS[0].name,
                        desc: CATALOG_PRODUCTS[0].packSize,
                        price: CATALOG_PRODUCTS[0].priceNum,
                        priceStr: CATALOG_PRODUCTS[0].price,
                        quantity: 1,
                        image: CATALOG_PRODUCTS[0].image,
                        category: 'Thức ăn dinh dưỡng',
                      },
                    ]).map((ordItem) => (
                      <div key={ordItem.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <img
                          src={ordItem.image}
                          alt={ordItem.name}
                          className="w-12 h-12 rounded-xl object-cover bg-[#f3f7ff] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-[#17324d] truncate">
                            {ordItem.quantity}x {ordItem.name}
                          </div>
                          <div className="text-[12px] text-[#52657a]">{ordItem.desc}</div>
                        </div>
                        <div className="text-[13px] font-bold text-[#17324d] tabular-nums">
                          {(ordItem.price * ordItem.quantity).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 border-t border-[#dfe6f0] flex items-center justify-between tabular-nums">
                    <span className="text-[15px] font-bold text-[#17324d]">
                      Tổng thanh toán:{' '}
                      {(lastOrder?.total ?? CATALOG_PRODUCTS[0].priceNum).toLocaleString('vi-VN')}₫
                    </span>
                    <span
                      className={`text-[12px] font-bold ${
                        currentPage === 'checkout-success' ? 'text-[#0667d0]' : 'text-[#c2410c]'
                      }`}
                    >
                      {currentPage === 'checkout-success' ? 'Đã xác nhận' : 'Hết thời gian thanh toán'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="py-3 px-5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Tiếp tục mua sắm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {currentPage === 'checkout-success' && !isLoggedIn ? (
                    <button
                      type="button"
                      onClick={openOrderLookupModal}
                      className="py-3 px-5 rounded-xl border border-[#dfe6f0] hover:border-[#0667d0] text-[#17324d] hover:text-[#0667d0] font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <PackageSearch className="w-4 h-4" />
                      <span>Tra cứu đơn hàng</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigateTo('cart')}
                      className="py-3 px-5 rounded-xl border border-[#dfe6f0] hover:border-[#0667d0] text-[#17324d] font-bold text-[14px] cursor-pointer transition-colors"
                    >
                      {currentPage === 'checkout-fail' ? 'Thử thanh toán lại' : 'Xem giỏ hàng'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {isCompactLayout ? (
        <CompactFooter onNavigate={navigateTo} />
      ) : (
        <PetHubFooter
          onNavigate={navigateTo}
          onSelectCategory={handleSelectCategory}
          isLoggedIn={isLoggedIn}
          onQuickToast={triggerToast}
        />
      )}
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />

      {/* Guest Order Lookup Modal */}
      <AnimatePresence>
      {lookupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-lookup-title"
          onClick={() => setLookupOpen(false)}
        >
          <motion.div
            ref={lookupModalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
            className="w-full max-w-[520px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_24px_60px_rgba(23,50,77,0.22)] p-6 space-y-5 max-h-[90vh] overflow-y-auto focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff5ff] text-[#0667d0] flex items-center justify-center shrink-0">
                  <PackageSearch className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="order-lookup-title" className="text-[17px] font-bold text-[#17324d]">
                    Tra cứu đơn hàng
                  </h3>
                  <p className="text-[13px] text-[#52657a] mt-0.5">
                    Nhập số điện thoại và mã đơn hàng để kiểm tra trạng thái đơn vừa đặt.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLookupOpen(false)}
                aria-label="Đóng tra cứu"
                className="p-1.5 rounded-lg text-[#52657a] hover:bg-[#f3f7ff] hover:text-[#17324d] cursor-pointer press-tactile"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleOrderLookupSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lookup-phone-input" className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    id="lookup-phone-input"
                    type="tel"
                    value={lookupPhone}
                    onChange={(e) => {
                      setLookupPhone(e.target.value);
                      if (lookupError) setLookupError(null);
                    }}
                    placeholder="VD: 0909 123 456"
                    className="w-full h-10 px-3 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] text-[13px] text-[#17324d] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lookup-code-input" className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Mã đơn hàng *
                  </label>
                  <input
                    id="lookup-code-input"
                    type="text"
                    value={lookupCode}
                    onChange={(e) => {
                      setLookupCode(e.target.value);
                      if (lookupError) setLookupError(null);
                    }}
                    placeholder="VD: PH123456"
                    className="w-full h-10 px-3 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0667d0] text-[13px] text-[#17324d] focus:outline-none uppercase"
                  />
                </div>
              </div>

              {lookupError && (
                <div role="alert" className="rounded-xl bg-[#fff2e9] border border-[#ffddc7] px-3.5 py-2.5 text-[12px] font-semibold text-[#9a3412]">
                  {lookupError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {lastOrder?.customerPhone && lastOrder.code && !lastOrder.failReason ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLookupPhone(lastOrder.customerPhone || '');
                      setLookupCode(lastOrder.code.replace(/^#/, ''));
                      setLookupError(null);
                    }}
                    className="text-[12px] font-semibold text-[#0667d0] hover:underline cursor-pointer"
                  >
                    Dùng đơn vừa đặt ({lastOrder.code})
                  </button>
                ) : (
                  <span className="text-[11px] text-[#52657a]">
                    Mã mẫu: PH261108 · SĐT: 0909 123 456
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors press-tactile"
                >
                  Kiểm tra đơn hàng
                </button>
              </div>
            </form>

            {lookupResult && (
              <div className="rounded-2xl border border-[#dfe6f0] bg-[#f8faff] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#dfe6f0]">
                  <div>
                    <div className="text-[14px] font-extrabold text-[#17324d]">
                      Đơn hàng #{lookupResult.id}
                    </div>
                    <div className="text-[12px] text-[#52657a]">{lookupResult.createdAt}</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      ORDER_STATUS_META[lookupResult.status].cls
                    }`}
                  >
                    {ORDER_STATUS_META[lookupResult.status].label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px] text-[#52657a]">
                  <div>
                    <span className="font-semibold text-[#17324d]">Khách hàng: </span>
                    {lookupResult.customerName} · {lookupResult.customerPhone}
                  </div>
                  <div>
                    <span className="font-semibold text-[#17324d]">Thanh toán: </span>
                    {lookupResult.paymentMethod}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-[#17324d]">
                      {lookupResult.deliveryMethod === 'pickup'
                        ? 'Nhận tại cửa hàng: '
                        : 'Giao tận nơi: '}
                    </span>
                    {lookupResult.shippingAddress}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {lookupResult.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-[12px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="w-9 h-9 rounded-lg object-cover bg-white shrink-0"
                        />
                        <span className="font-semibold text-[#17324d] truncate">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-[#17324d] tabular-nums shrink-0">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-[#dfe6f0] flex items-center justify-between text-[13px] tabular-nums">
                  <span className="font-bold text-[#17324d]">Tổng thanh toán:</span>
                  <span className="text-[16px] font-extrabold text-[#0667d0]">
                    {lookupResult.totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Floating Contact Stack */}
      {currentPage !== 'admin' && (
        <FloatingContact onQuickToast={triggerToast} />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
            className="fixed left-5 bottom-6 z-50 max-w-[360px] px-4 py-3 rounded-xl bg-[#17324d] text-white text-xs font-semibold shadow-[0_12px_30px_rgba(23,50,77,0.28)] flex items-center gap-2.5 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-[#ffb547] shrink-0" aria-hidden="true" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}

export default App;

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Gift,
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
} from 'lucide-react';
import type {
  PageId,
  ProductCategory,
  ProductItem,
  ProductReview,
  CartItem,
} from './data/mockData';
import {
  CATALOG_PRODUCTS,
  SPA_PACKAGES,
  STOREFRONT_SUPPLIES,
} from './data/mockData';
import {
  PetHubHeader,
  PetHubFooter,
  CompactHeader,
  CompactFooter,
} from './components/HeadersAndFooters';
import { TiltCard } from './components/TiltCard';
import { FloatingContact } from './components/FloatingContact';

interface OrderSnapshot {
  code: string;
  date: string;
  items: CartItem[];
  total: number;
}

const CATEGORY_LABELS: Record<'all' | ProductCategory, string> = {
  all: 'Tất cả sản phẩm',
  food: 'Dinh dưỡng & Pate',
  bed: 'Nệm & Không gian',
  backpack: 'Balo & Phụ kiện',
  hygiene: 'Thuốc & Chăm sóc y tế',
  spa: 'Dịch vụ Spa',
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
    titleTop: 'CHĂM SÓC Y KHOA',
    titleAccent: 'Dịu lành & An tâm.',
    desc: 'Thuốc đặc trị nấm da, nhỏ gáy phòng ve rận và sữa tắm dịu nhẹ cho chó mèo.',
    ctaLabel: 'Xem thuốc & chăm sóc',
    ctaCategory: 'hygiene',
    image: '/images/hero-vet-banner.jpg',
    imageAlt: 'Bộ sản phẩm thuốc trị nấm và chăm sóc da lông cho thú cưng',
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
    titleTop: 'DỊCH VỤ SPA 5 SAO',
    titleAccent: 'Thư giãn & Tỏa sáng.',
    desc: 'Quy trình tắm thảo mộc 7 bước chuẩn y khoa, cắt tỉa tạo kiểu và khách sạn giám sát 24/7.',
    ctaLabel: 'Khám phá dịch vụ Spa',
    ctaPage: 'service',
    image: '/images/hero-spa-banner.jpg',
    imageAlt: 'Dịch vụ Spa tắm gội và tạo kiểu chuẩn y khoa cho thú cưng',
  },
];

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [returnPage, setReturnPage] = useState<PageId>('home');
  const [heroSlide, setHeroSlide] = useState(0);

  // Auth State (Guest mode strictly view-only; purchase/cart/booking require login)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Trịnh Khoa');

  // Catalog & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [homeCategoryTab, setHomeCategoryTab] = useState<'all' | 'food' | 'hygiene' | 'bed' | 'backpack'>('all');

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

  // Cart & Order State (empty & inaccessible until authenticated)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [voucherCode, setVoucherCode] = useState('PETHUB100K');
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderSnapshot | null>(null);

  // Service Booking State
  const [bookingPetType, setBookingPetType] = useState('Chó nhỏ (< 5kg)');
  const [selectedPackageId, setSelectedPackageId] = useState('pkg-3');
  const [bookingDate, setBookingDate] = useState('Hôm nay, 25/10');
  const [bookingTime, setBookingTime] = useState('10:30 Sáng');
  const [ownerName, setOwnerName] = useState('Trịnh Khoa');
  const [ownerPhone, setOwnerPhone] = useState('0909 686 868');
  const [petNote, setPetNote] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Auth Form State
  const [showPass, setShowPass] = useState(false);
  const [loginEmail, setLoginEmail] = useState('khoa.trinh@pethub.vn');
  const [regName, setRegName] = useState('Trịnh Khoa');
  const [regPhone, setRegPhone] = useState('0909 686 868');
  const [regEmail, setRegEmail] = useState('khoa.trinh@pethub.vn');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const navigateTo = (page: PageId) => {
    if (!isLoggedIn && (page === 'cart' || page === 'checkout-success' || page === 'checkout-fail')) {
      setReturnPage(page === 'cart' ? 'cart' : 'home');
      setCurrentPage('login');
      triggerToast('Vui lòng đăng nhập để sử dụng giỏ hàng và thanh toán.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requireLoginFor = (targetPage: PageId, message: string) => {
    setReturnPage(targetPage);
    setCurrentPage('login');
    triggerToast(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: 'all' | ProductCategory) => {
    setSelectedCategoryFilter(cat);
    navigateTo('search');
  };

  const openProductDetail = (item: ProductItem) => {
    setSelectedProductId(item.id);
    setActiveGalleryIdx(0);
    setProductQuantity(1);
    setProductSelectedSize(item.sizes[0] || item.packSize);
    navigateTo('product');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCartItems([]);
    setIsVoucherApplied(false);
    setBookingConfirmed(false);
    setCurrentPage('home');
    triggerToast('Đã đăng xuất khỏi tài khoản thành viên.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    return CATALOG_PRODUCTS.find((p) => p.id === selectedProductId) || CATALOG_PRODUCTS[0];
  }, [selectedProductId]);

  const productReviews = useMemo(() => {
    const extra = customReviews[selectedProduct.id] || [];
    return [...extra, ...selectedProduct.reviews];
  }, [customReviews, selectedProduct]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = isVoucherApplied && cartSubtotal > 0 ? 100000 : 0;
  const cartFinalTotal = Math.max(0, cartSubtotal - discountAmount);
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const addProductToCart = (item: ProductItem, qty = 1, sizeLabel?: string) => {
    if (!isLoggedIn) {
      requireLoginFor('product', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      setSelectedProductId(item.id);
      return false;
    }

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
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    triggerToast('Đã xóa sản phẩm khỏi giỏ hàng.');
  };

  const handleCheckout = (simulateFail = false) => {
    if (!isLoggedIn) {
      requireLoginFor('cart', 'Vui lòng đăng nhập để thanh toán.');
      return;
    }
    const snapshot: OrderSnapshot = {
      code: `#PET${Math.floor(1000 + Math.random() * 9000)}`,
      date: '25/10/2026',
      items: [...cartItems],
      total: cartFinalTotal,
    };
    setLastOrder(snapshot);
    if (!simulateFail) {
      setCartItems([]);
      setIsVoucherApplied(false);
    }
    navigateTo(simulateFail ? 'checkout-fail' : 'checkout-success');
  };

  // Catalog Filters
  const filteredSearchList = useMemo(() => {
    return CATALOG_PRODUCTS.filter((item) => {
      const matchesCat =
        selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.packSize.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [searchQuery, selectedCategoryFilter]);

  const featuredProducts = useMemo(() => {
    if (homeCategoryTab === 'all') {
      return CATALOG_PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);
    }
    return CATALOG_PRODUCTS.filter((p) => p.category === homeCategoryTab).slice(0, 4);
  }, [homeCategoryTab]);

  const flashSaleProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((p) => p.isFlashSale);
  }, []);

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
      petTag: reviewPetTag.trim() || 'Thành viên PetHub',
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#17324d] overflow-x-clip selection:bg-[#0874e8] selection:text-white">
      {/* Header */}
      {isCompactLayout ? (
        <CompactHeader onNavigate={navigateTo} isLoggedIn={isLoggedIn} />
      ) : (
        <PetHubHeader
          currentPage={currentPage}
          activeCatalogCategory={selectedCategoryFilter}
          onNavigate={navigateTo}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogout={handleLogout}
          cartCount={totalCartCount}
          cartTotal={cartFinalTotal.toLocaleString('vi-VN') + '₫'}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 relative">
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
              {/* Hero Banner Showcase (petshome.vn inspired) */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pt-7 pb-8">
                {(() => {
                  const activeBanner = HERO_BANNERS[heroSlide];
                  return (
                    <div className="relative rounded-3xl bg-[#eff5ff] border border-[#dfe6f0] overflow-hidden shadow-[0_18px_46px_rgba(23,50,77,0.06)]">
                      {/* Desktop full-bleed product photography with soft left scrim */}
                      <div className="hidden md:block absolute inset-0">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={activeBanner.id}
                            src={activeBanner.image}
                            alt={activeBanner.imageAlt}
                            initial={{ opacity: 0.4 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0.4 }}
                            transition={{ duration: 0.35 }}
                            className="w-full h-full object-cover object-right"
                          />
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#eff5ff] via-[#eff5ff]/95 via-48% to-transparent" />
                      </div>

                      <div className="relative z-10 px-6 sm:px-16 lg:px-20 py-9 sm:py-12 lg:py-14 md:min-h-[400px] lg:min-h-[430px] flex flex-col justify-center">
                        <div className="max-w-[520px] space-y-5">
                          <h1 className="text-[25px] sm:text-[38px] lg:text-[44px] font-extrabold text-[#17324d] leading-[1.14] tracking-[-0.03em]">
                            {activeBanner.titleTop}
                            <br />
                            <span className="text-[#0874e8]">{activeBanner.titleAccent}</span>
                          </h1>

                          <p className="text-[14px] sm:text-[15px] text-[#425a70] max-w-[440px] leading-relaxed font-medium">
                            {activeBanner.desc}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                              onClick={() =>
                                activeBanner.ctaPage
                                  ? navigateTo(activeBanner.ctaPage)
                                  : activeBanner.ctaCategory && handleSelectCategory(activeBanner.ctaCategory)
                              }
                              className="h-11 sm:h-12 px-6 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-[13px] sm:text-[14px] inline-flex items-center gap-2 shadow-[0_8px_20px_rgba(8,116,232,0.22)] cursor-pointer transition-colors"
                            >
                              <span>{activeBanner.ctaLabel}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile studio visual cleanly framed on the product showcase side */}
                      <div className="md:hidden px-4 pb-8">
                        <div className="h-[210px] w-full rounded-2xl overflow-hidden border border-[#dfe6f0] bg-white">
                          <img
                            src={activeBanner.image}
                            alt={activeBanner.imageAlt}
                            className="w-[162%] max-w-none -ml-[62%] h-full object-cover object-center"
                          />
                        </div>
                      </div>

                      {/* Left / Right Slide Arrows */}
                      <button
                        type="button"
                        aria-label="Banner trước"
                        onClick={() =>
                          setHeroSlide((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)
                        }
                        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white border border-[#dfe6f0] text-[#17324d] items-center justify-center shadow-xs cursor-pointer transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Banner tiếp theo"
                        onClick={() => setHeroSlide((prev) => (prev + 1) % HERO_BANNERS.length)}
                        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white border border-[#dfe6f0] text-[#17324d] items-center justify-center shadow-xs cursor-pointer transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Slide Dots */}
                      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {HERO_BANNERS.map((b, idx) => (
                          <button
                            key={b.id}
                            type="button"
                            aria-label={`Chuyển đến banner ${idx + 1}`}
                            onClick={() => setHeroSlide(idx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              heroSlide === idx ? 'w-7 bg-[#0874e8]' : 'w-2 bg-[#17324d]/25 hover:bg-[#17324d]/45'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 4 Commitments Bar */}
                <div className="mt-5 rounded-2xl bg-white border border-[#dfe6f0] px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      icon: ShieldCheck,
                      color: 'text-[#0874e8]',
                      title: 'Chính hãng 100%',
                      sub: 'Kiểm định nguồn gốc rõ ràng',
                    },
                    {
                      icon: Truck,
                      color: 'text-[#ff641f]',
                      title: 'Giao nhanh 2 giờ',
                      sub: 'Miễn phí đơn từ 499.000₫',
                    },
                    {
                      icon: Headphones,
                      color: 'text-[#0874e8]',
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
                          <div className="text-[13px] font-bold text-[#17324d]">{pillar.title}</div>
                          <div className="text-[12px] text-[#587085]">{pillar.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Brand Statement */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-10 border-b border-[#dfe6f0]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-[680px]">
                    <h2 className="text-[26px] lg:text-[32px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                      Tin chọn bởi hơn 50.000 gia đình Việt.
                    </h2>
                    <p className="text-[14px] text-[#587085] leading-relaxed">
                      Mỗi sản phẩm tại PetHub đều được chọn lọc kỹ lưỡng về thành phần, chất liệu và độ an toàn lâu dài.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="text-[13px] font-bold text-[#0874e8] hover:underline flex items-center gap-1.5 cursor-pointer self-start lg:self-auto shrink-0"
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
                    className="text-[13px] font-bold text-[#0874e8] hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Tất cả danh mục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {STOREFRONT_SUPPLIES.map((sup) => (
                    <motion.div
                      key={sup.id}
                      whileHover={{ y: -4 }}
                      onClick={() => handleSelectCategory(sup.filterCategory)}
                      className="group rounded-2xl bg-white border border-[#dfe6f0] hover:border-[#0874e8]/50 p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-48 w-full rounded-xl overflow-hidden mb-5 bg-[#f8faff]">
                          <img
                            src={sup.image}
                            alt={sup.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="text-[19px] font-bold text-[#17324d] group-hover:text-[#0874e8] transition-colors">
                          {sup.title}
                        </h3>
                        <p className="text-[13px] text-[#587085] mt-1.5 leading-relaxed">
                          {sup.desc}
                        </p>
                      </div>
                      <div className="pt-4 mt-5 border-t border-[#dfe6f0] flex items-center justify-between">
                        <span className="text-[11px] text-[#587085] font-medium">{sup.meta}</span>
                        <span className="text-[12px] font-bold text-[#0874e8] flex items-center gap-1">
                          <span>Khám phá</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </motion.div>
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
                    <p className="text-[13px] text-[#587085] mt-1">
                      Được khách hàng đánh giá cao và tin dùng mỗi ngày.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#f3f7ff] border border-[#dfe6f0] overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'food', label: 'Dinh dưỡng & Pate' },
                      { id: 'hygiene', label: 'Thuốc & Y tế' },
                      { id: 'bed', label: 'Nệm ngủ' },
                      { id: 'backpack', label: 'Balo' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setHomeCategoryTab(tab.id as typeof homeCategoryTab)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                          homeCategoryTab === tab.id
                            ? 'bg-[#0874e8] text-white shadow-xs'
                            : 'text-[#587085] hover:text-[#17324d]'
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
                      className="group rounded-2xl bg-white border border-[#dfe6f0] hover:border-[#0874e8]/40 p-4 flex flex-col justify-between transition-all hover:shadow-[0_14px_30px_rgba(23,50,77,0.07)]"
                    >
                      <div>
                        <div
                          onClick={() => openProductDetail(item)}
                          className="relative aspect-square w-full rounded-xl bg-[#f8faff] overflow-hidden mb-3.5 cursor-pointer"
                        >
                          {item.discountBadge && (
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#ff641f] text-white text-[10px] font-bold z-10">
                              {item.discountBadge}
                            </span>
                          )}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#0874e8] uppercase tracking-wider">
                            {item.brand}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#587085] tabular-nums">
                            <Star className="w-3 h-3 fill-[#ffb547] text-[#ffb547]" />
                            {item.rating.toFixed(1)} ({item.reviewCount})
                          </span>
                        </div>

                        <h4
                          onClick={() => openProductDetail(item)}
                          className="text-[14px] font-bold text-[#17324d] leading-snug line-clamp-2 hover:text-[#0874e8] cursor-pointer"
                        >
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-[#587085] mt-1">{item.packSize}</div>
                      </div>

                      <div className="pt-3.5 mt-3.5 border-t border-[#dfe6f0] flex items-center justify-between gap-2">
                        <div className="tabular-nums">
                          <div className="text-[16px] font-extrabold text-[#17324d]">{item.price}</div>
                          {item.originalPrice && (
                            <div className="text-[11px] text-[#94a3b8] line-through">
                              {item.originalPrice}
                            </div>
                          )}
                        </div>

                        {isLoggedIn ? (
                          <button
                            onClick={() => addProductToCart(item)}
                            className="h-9 px-3 rounded-lg bg-[#0874e8] hover:bg-[#1464f4] text-white font-semibold text-[12px] flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Thêm vào giỏ</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openProductDetail(item)}
                            className="h-9 px-3 rounded-lg border border-[#dfe6f0] hover:border-[#0874e8] text-[#17324d] hover:text-[#0874e8] font-semibold text-[12px] cursor-pointer transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Limited Flash Sale */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-10">
                <div className="rounded-3xl bg-gradient-to-r from-[#eff5ff] via-[#f8faff] to-[#fff5f0] border border-[#dfe6f0] p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dfe6f0]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#ff641f] text-white flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-[22px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                          Ưu đãi giới hạn hôm nay
                        </h2>
                        <p className="text-[12px] text-[#587085]">
                          Mức giá đặc quyền áp dụng đến hết khung giờ.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-[12px] font-semibold text-[#587085]">Kết thúc sau</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-white">
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#17324d]">08</span>
                        <span className="text-[#17324d]">:</span>
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#17324d]">45</span>
                        <span className="text-[#17324d]">:</span>
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#ff641f]">22</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    {flashSaleProducts.map((item) => {
                      const sold = item.soldCount || 0;
                      const total = item.totalStock || 100;
                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white border border-[#dfe6f0] p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                        >
                          <div>
                            <div
                              onClick={() => openProductDetail(item)}
                              className="relative aspect-square w-full rounded-xl bg-[#f8faff] overflow-hidden mb-3 cursor-pointer"
                            >
                              {item.discountBadge && (
                                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#ff641f] text-white text-[10px] font-bold z-10">
                                  {item.discountBadge}
                                </span>
                              )}
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>

                            <div className="text-[10px] font-bold text-[#0874e8] uppercase tracking-wider">
                              {item.brand}
                            </div>
                            <h4
                              onClick={() => openProductDetail(item)}
                              className="text-[13px] font-bold text-[#17324d] leading-snug line-clamp-2 mt-1 hover:text-[#0874e8] cursor-pointer"
                            >
                              {item.name}
                            </h4>
                            <div className="text-[11px] text-[#587085] mt-1">{item.packSize}</div>
                            <div className="inline-flex items-center gap-1 text-[11px] text-[#587085] mt-1 tabular-nums">
                              <Star className="w-3 h-3 fill-[#ffb547] text-[#ffb547]" />
                              <span>{item.rating.toFixed(1)} ({item.reviewCount})</span>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-[#dfe6f0] space-y-2.5">
                            <div className="flex items-baseline gap-2 tabular-nums">
                              <span className="text-[17px] font-extrabold text-[#ff641f]">
                                {item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-[11px] text-[#94a3b8] line-through">
                                  {item.originalPrice}
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="h-1.5 w-full bg-[#f0f3f6] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#ff641f] rounded-full"
                                  style={{ width: `${Math.min(100, (sold / total) * 100)}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-[#587085] font-medium mt-1 flex justify-between tabular-nums">
                                <span>Đã bán {sold}</span>
                                <span>Còn {Math.max(0, total - sold)}</span>
                              </div>
                            </div>

                            {isLoggedIn ? (
                              <button
                                onClick={() => addProductToCart(item)}
                                className="w-full py-2 rounded-lg bg-[#0874e8] hover:bg-[#1464f4] text-white font-semibold text-xs cursor-pointer transition-colors"
                              >
                                Thêm vào giỏ
                              </button>
                            ) : (
                              <button
                                onClick={() => openProductDetail(item)}
                                className="w-full py-2 rounded-lg border border-[#dfe6f0] hover:border-[#0874e8] text-[#17324d] hover:text-[#0874e8] font-semibold text-xs cursor-pointer transition-colors"
                              >
                                Xem chi tiết &amp; Đánh giá
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-12 border-t border-[#dfe6f0]">
                <div className="max-w-[540px] mb-9 space-y-2">
                  <h2 className="text-[28px] lg:text-[32px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                    Chăm sóc chuẩn y khoa.
                  </h2>
                  <p className="text-[14px] text-[#587085]">
                    Không gian thư giãn riêng biệt, nhẹ nhàng và an toàn tuyệt đối.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-8 flex flex-col justify-between min-h-[300px]">
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#dfe6f0] text-[#0874e8] flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-[22px] font-bold text-[#17324d]">
                        Spa &amp; Grooming
                      </h3>
                      <p className="text-[13px] text-[#587085] leading-relaxed max-w-[420px]">
                        Tắm thảo mộc, cắt tỉa tạo phom và vệ sinh toàn diện theo quy trình 7 bước dịu nhẹ.
                      </p>
                    </div>

                    <div className="pt-5 mt-6 border-t border-[#dfe6f0] flex items-center justify-between">
                      <div className="tabular-nums">
                        <div className="text-[11px] text-[#587085]">Chỉ từ</div>
                        <div className="text-[20px] font-extrabold text-[#0874e8]">180.000₫</div>
                      </div>
                      <button
                        onClick={() => navigateTo('service')}
                        className="h-10 px-5 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <span>{isLoggedIn ? 'Đặt lịch Spa' : 'Xem bảng giá'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#fff8f5] border border-[#ffe4d6] p-8 flex flex-col justify-between min-h-[300px]">
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#ffe4d6] text-[#ff641f] flex items-center justify-center">
                        <PawPrint className="w-5 h-5" />
                      </div>
                      <h3 className="text-[22px] font-bold text-[#17324d]">
                        Khách sạn thú cưng 5 sao
                      </h3>
                      <p className="text-[13px] text-[#587085] leading-relaxed max-w-[420px]">
                        Phòng điều hòa riêng biệt, camera theo dõi 24/7 và chế độ dinh dưỡng theo yêu cầu.
                      </p>
                    </div>

                    <div className="pt-5 mt-6 border-t border-[#ffe4d6] flex items-center justify-between">
                      <div className="tabular-nums">
                        <div className="text-[11px] text-[#587085]">Chỉ từ</div>
                        <div className="text-[20px] font-extrabold text-[#ff641f]">150.000₫ / ngày</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPackageId('pkg-4');
                          navigateTo('service');
                        }}
                        className="h-10 px-5 rounded-xl bg-[#ff641f] hover:bg-[#ee5e17] text-white font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <span>{isLoggedIn ? 'Đặt phòng ngay' : 'Xem chi tiết'}</span>
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
              <div className="h-14 flex items-center gap-2.5 text-[12px]">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="font-semibold text-[#0874e8]">
                  {CATEGORY_LABELS[selectedCategoryFilter]}
                </span>
              </div>

              {/* Filter Header */}
              <div className="rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-7 lg:p-10 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <h1 className="text-[30px] lg:text-[36px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                      {searchQuery
                        ? `Kết quả cho "${searchQuery}"`
                        : 'Cửa hàng đồ dùng thú cưng'}
                    </h1>
                    <p className="text-[14px] text-[#587085]">
                      Hiển thị {filteredSearchList.length} sản phẩm chính hãng. Bấm vào từng sản phẩm để xem thông tin và đánh giá thực tế.
                    </p>
                  </div>

                  {!isLoggedIn && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#dfe6f0] text-xs text-[#17324d] shrink-0">
                      <Lock className="w-4 h-4 text-[#0874e8] shrink-0" />
                      <span>
                        Bạn đang xem ở chế độ khách.{' '}
                        <button
                          onClick={() => requireLoginFor('search', 'Đăng nhập để mở khóa giỏ hàng và đặt mua.')}
                          className="font-bold text-[#0874e8] hover:underline cursor-pointer"
                        >
                          Đăng nhập để mua hàng
                        </button>
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {(
                    [
                      { id: 'all', label: 'Tất cả sản phẩm' },
                      { id: 'food', label: 'Dinh dưỡng & Pate' },
                      { id: 'hygiene', label: 'Thuốc & Chăm sóc y tế' },
                      { id: 'bed', label: 'Nệm & Không gian' },
                      { id: 'backpack', label: 'Balo & Phụ kiện' },
                    ] as const
                  ).map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => setSelectedCategoryFilter(pill.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        selectedCategoryFilter === pill.id
                          ? 'bg-[#0874e8] text-white'
                          : 'bg-white text-[#587085] border border-[#dfe6f0] hover:border-[#0874e8] hover:text-[#17324d]'
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              {filteredSearchList.length === 0 ? (
                <div className="rounded-2xl border border-[#dfe6f0] bg-[#f8faff] p-12 text-center space-y-3">
                  <h2 className="text-lg font-bold text-[#17324d]">
                    Không tìm thấy sản phẩm phù hợp
                  </h2>
                  <p className="text-sm text-[#587085]">
                    Thử tìm với từ khóa khác hoặc đặt lại bộ lọc danh mục.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryFilter('all');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#0874e8] text-white text-xs font-bold cursor-pointer"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="h-14 flex items-center gap-2.5 text-[12px] flex-wrap">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <button
                  onClick={() => handleSelectCategory(selectedProduct.category)}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  {CATEGORY_LABELS[selectedProduct.category]}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="font-semibold text-[#0874e8] truncate max-w-[180px] sm:max-w-[320px]">
                  {selectedProduct.name}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Visual Gallery */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative aspect-4/3 rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] overflow-hidden">
                    {selectedProduct.discountBadge && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#ff641f] text-white text-[11px] font-bold z-10">
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
                              ? 'border-[#0874e8]'
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

                  <div className="p-4 rounded-xl bg-[#f8faff] border border-[#dfe6f0] flex items-center gap-3 text-[13px] text-[#587085]">
                    <ShieldCheck className="w-5 h-5 text-[#0874e8] shrink-0" />
                    <span>100% chính hãng · Kiểm định chất lượng thú y · Đổi trả trong 7 ngày.</span>
                  </div>
                </div>

                {/* Right Details Panel */}
                <div className="lg:col-span-5 space-y-6 bg-white rounded-2xl border border-[#dfe6f0] p-6 lg:p-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-bold text-[#0874e8] uppercase tracking-wider">
                        {selectedProduct.brand}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Còn {selectedProduct.stockCount} sản phẩm</span>
                      </span>
                    </div>

                    <h1 className="text-[24px] lg:text-[26px] font-extrabold text-[#17324d] leading-snug">
                      {selectedProduct.name}
                    </h1>
                    <div className="text-[13px] text-[#587085] mt-1">{selectedProduct.packSize}</div>
                    <div className="text-[12px] font-semibold mt-2.5 flex items-center gap-2 tabular-nums">
                      <span className="inline-flex items-center gap-1 text-[#17324d]">
                        <Star className="w-4 h-4 fill-[#ffb547] text-[#ffb547]" />
                        <span>{selectedProduct.rating.toFixed(1)}</span>
                      </span>
                      <span className="text-[#587085]">
                        ({productReviews.length} đánh giá từ khách hàng)
                      </span>
                      <a href="#product-reviews" className="text-[#0874e8] hover:underline">
                        Xem đánh giá
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8faff] border border-[#dfe6f0] space-y-1.5">
                    <div className="flex items-baseline gap-3 tabular-nums">
                      <span className="text-[28px] font-extrabold text-[#17324d]">
                        {selectedProduct.price}
                      </span>
                      {selectedProduct.originalPrice && (
                        <span className="text-[14px] text-[#94a3b8] line-through">
                          {selectedProduct.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#587085] leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-2 text-[13px] text-[#17324d]">
                    {selectedProduct.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0874e8] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Size / Variant Selector */}
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#17324d] block">
                      Quy cách đóng gói
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setProductSelectedSize(size)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            productSelectedSize === size
                              ? 'border-[#0874e8] bg-[#eff5ff] text-[#0874e8]'
                              : 'border-[#dfe6f0] bg-white text-[#587085] hover:border-[#0874e8]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Actions — Auth Gated */}
                  {isLoggedIn ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="h-11 rounded-xl border border-[#dfe6f0] flex items-center px-2 bg-white">
                          <button
                            onClick={() => setProductQuantity((q) => Math.max(1, q - 1))}
                            className="w-7 h-7 flex items-center justify-center text-[#587085] hover:text-[#17324d] cursor-pointer"
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-bold text-sm text-[#17324d] tabular-nums">
                            {productQuantity}
                          </span>
                          <button
                            onClick={() => setProductQuantity((q) => q + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#587085] hover:text-[#17324d] cursor-pointer"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            addProductToCart(selectedProduct, productQuantity, productSelectedSize)
                          }
                          className="flex-1 h-11 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
                        className="w-full h-11 rounded-xl bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>Mua ngay · Giao nhanh 2 giờ</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl bg-[#eff5ff] border border-[#dfe6f0] space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-[#0874e8] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[13px] font-bold text-[#17324d]">
                            Đăng nhập để đặt mua sản phẩm
                          </div>
                          <p className="text-[12px] text-[#587085] mt-0.5 leading-relaxed">
                            Khách tham quan có thể xem chi tiết và đọc đánh giá. Vui lòng đăng nhập tài khoản thành viên để thêm vào giỏ hàng hoặc thanh toán.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={() =>
                            requireLoginFor('product', 'Đăng nhập để thêm sản phẩm vào giỏ hàng.')
                          }
                          className="flex-1 h-10 px-4 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-xs cursor-pointer transition-colors"
                        >
                          Đăng nhập để mua hàng
                        </button>
                        <button
                          onClick={() => {
                            setReturnPage('product');
                            navigateTo('register');
                          }}
                          className="h-10 px-4 rounded-xl bg-white border border-[#dfe6f0] hover:border-[#0874e8] text-[#17324d] font-bold text-xs cursor-pointer transition-colors"
                        >
                          Đăng ký
                        </button>
                      </div>
                    </div>
                  )}
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
                        <div className="text-[12px] text-[#587085] mt-1">
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
                        <div key={row.stars} className="flex items-center gap-2.5 text-xs tabular-nums">
                          <span className="w-10 text-[#587085] font-medium">{row.stars} sao</span>
                          <div className="flex-1 h-1.5 rounded-full bg-[#dfe6f0] overflow-hidden">
                            <div
                              className="h-full bg-[#0874e8] rounded-full"
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[#587085]">{row.pct}%</span>
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
                        className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-xs text-[#17324d] focus:outline-none focus:border-[#0874e8]"
                      />
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm thực tế về sản phẩm..."
                        className="w-full p-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-xs text-[#17324d] focus:outline-none focus:border-[#0874e8]"
                      />
                      <button
                        type="submit"
                        className="w-full h-10 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Gửi đánh giá
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-2xl bg-white border border-[#dfe6f0] p-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#17324d]">
                        <MessageSquare className="w-4 h-4 text-[#0874e8]" />
                        <span>Chia sẻ cảm nhận sản phẩm</span>
                      </div>
                      <p className="text-xs text-[#587085] leading-relaxed">
                        Chỉ hội viên đã đăng nhập mới có thể gửi đánh giá mới.
                      </p>
                      <button
                        onClick={() =>
                          requireLoginFor('product', 'Đăng nhập để gửi đánh giá sản phẩm.')
                        }
                        className="text-xs font-bold text-[#0874e8] hover:underline cursor-pointer"
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
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                <span>Đã mua hàng</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#587085] mt-0.5">{rev.petTag}</div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-0.5 text-[#ffb547] justify-end">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#ffb547]" />
                            ))}
                          </div>
                          <div className="text-[11px] text-[#94a3b8] mt-1">{rev.date}</div>
                        </div>
                      </div>

                      <p className="text-[13px] text-[#17324d] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ===================================================================
           * 4. CART & CHECKOUT PAGE (Auth Required)
           * =================================================================== */}
          {currentPage === 'cart' && isLoggedIn && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pb-16"
            >
              {/* Stepper */}
              <div className="h-20 flex items-center justify-center gap-6 text-[13px] font-semibold">
                <span className="text-[#0874e8] flex items-center gap-2 font-bold">
                  <span className="w-6 h-6 rounded-full bg-[#0874e8] text-white text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>Giỏ hàng</span>
                </span>
                <div className="w-12 h-px bg-[#dfe6f0]" />
                <span className="text-[#587085]">2. Thanh toán</span>
                <div className="w-12 h-px bg-[#dfe6f0]" />
                <span className="text-[#587085]">3. Hoàn tất</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="max-w-[520px] mx-auto rounded-2xl border border-[#dfe6f0] bg-[#f8faff] text-center py-14 px-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#eff5ff] text-[#0874e8] mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#17324d]">
                    Giỏ hàng của bạn đang trống
                  </h2>
                  <p className="text-sm text-[#587085]">
                    Chọn thêm thức ăn dinh dưỡng hoặc phụ kiện chăm sóc cho thú cưng của bạn.
                  </p>
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="h-11 px-6 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-sm cursor-pointer transition-colors"
                  >
                    Khám phá sản phẩm
                  </button>
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
                        onClick={() => {
                          setCartItems([]);
                          triggerToast('Đã xóa toàn bộ sản phẩm trong giỏ.');
                        }}
                        className="text-xs font-semibold text-[#ff641f] hover:underline cursor-pointer"
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0874e8] bg-[#eff5ff] px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <h3 className="text-sm font-bold text-[#17324d]">{item.name}</h3>
                            <p className="text-xs text-[#587085]">{item.desc}</p>
                            <div className="text-sm font-extrabold text-[#0874e8] tabular-nums">
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
                              className="p-2 text-[#587085] hover:text-[#ff641f] cursor-pointer transition-colors"
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
                    <h3 className="text-base font-bold text-[#17324d]">Tóm tắt đơn hàng</h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#17324d] block">
                        Mã ưu đãi hội viên
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="Nhập PETHUB100K..."
                          className="flex-1 h-10 px-3 text-xs rounded-xl border border-[#dfe6f0] bg-[#f8faff] font-bold text-[#0874e8] uppercase focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (voucherCode.trim() === 'PETHUB100K') {
                              setIsVoucherApplied(true);
                              triggerToast('Đã áp dụng ưu đãi 100.000₫ cho đơn hàng.');
                            } else {
                              triggerToast('Mã chưa hợp lệ. Thử mã hội viên: PETHUB100K');
                            }
                          }}
                          className="h-10 px-3.5 rounded-xl bg-[#0874e8] text-white text-xs font-bold hover:bg-[#1464f4] transition cursor-pointer"
                        >
                          {isVoucherApplied ? 'Đã áp dụng' : 'Áp dụng'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-[#dfe6f0] text-xs tabular-nums">
                      <div className="flex justify-between text-[#587085]">
                        <span>Tạm tính:</span>
                        <span className="font-bold text-[#17324d]">
                          {cartSubtotal.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      {isVoucherApplied && (
                        <div className="flex justify-between text-[#ff641f]">
                          <span>Ưu đãi hội viên:</span>
                          <span className="font-bold">-100.000₫</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#0874e8]">
                        <span>Vận chuyển:</span>
                        <span className="font-bold">Miễn phí</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#dfe6f0] flex justify-between items-baseline tabular-nums">
                      <span className="text-sm font-bold text-[#17324d]">Tổng thanh toán:</span>
                      <span className="text-xl font-extrabold text-[#0874e8]">
                        {cartFinalTotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleCheckout(false)}
                        className="w-full h-12 rounded-xl bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>Xác nhận thanh toán</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCheckout(true)}
                        className="w-full py-2 text-[11px] font-semibold text-[#587085] hover:text-[#17324d] cursor-pointer"
                      >
                        Kiểm tra trạng thái giao dịch gián đoạn
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===================================================================
           * 5. SERVICE BOOKING PAGE (Viewing Public, Booking Requires Login)
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
              <div className="h-14 flex items-center gap-2.5 text-[12px]">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="font-semibold text-[#0874e8]">Dịch vụ Spa &amp; Khách sạn 5 sao</span>
              </div>

              {/* Hero Banner */}
              <div className="rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-8 lg:p-10 mb-8 space-y-2">
                <h1 className="text-[28px] lg:text-[34px] font-extrabold text-[#17324d] tracking-[-0.02em]">
                  Spa &amp; Khách sạn thú cưng chuẩn y khoa
                </h1>
                <p className="text-[14px] text-[#587085] max-w-2xl leading-relaxed">
                  Quy trình vệ sinh 7 bước nhẹ nhàng, phòng lưu trú riêng biệt và đội ngũ chăm sóc tận tâm.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Packages + Booking Form (Gated for guests) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Packages Catalog — Publicly Viewable */}
                  <div className="bg-white rounded-2xl border border-[#dfe6f0] p-6 lg:p-8 space-y-4">
                    <h2 className="text-base font-bold text-[#17324d]">
                      Bảng giá gói dịch vụ
                    </h2>

                    <div className="space-y-3">
                      {SPA_PACKAGES.map((pkg) => {
                        const active = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                              active
                                ? 'bg-[#eff5ff] border-[#0874e8]'
                                : 'bg-[#f8faff] border-[#dfe6f0] hover:border-[#0874e8]/60'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-[#17324d]">{pkg.name}</span>
                                {pkg.isPopular && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#ff641f] text-white text-[10px] font-bold">
                                    Phổ biến nhất
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#587085] leading-relaxed">{pkg.desc}</p>
                              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#587085]">
                                <Clock className="w-3.5 h-3.5 text-[#0874e8]" />
                                <span>Thời lượng: {pkg.duration}</span>
                              </div>
                            </div>
                            <div className="text-base font-extrabold text-[#0874e8] shrink-0 tabular-nums">
                              {pkg.priceStr}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking Form — Requires Auth */}
                  {isLoggedIn ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setBookingConfirmed(true);
                        triggerToast(
                          `Đã xác nhận lịch hẹn "${selectedSpaPackage.name}" lúc ${bookingTime} (${bookingDate}).`
                        );
                      }}
                      className="bg-white rounded-2xl border border-[#dfe6f0] p-6 lg:p-8 space-y-6"
                    >
                      <h2 className="text-base font-bold text-[#17324d]">
                        Thông tin đặt lịch hẹn
                      </h2>

                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-[#17324d] block">
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
                              className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                bookingPetType === t
                                  ? 'bg-[#eff5ff] border-[#0874e8] text-[#0874e8]'
                                  : 'bg-white border-[#dfe6f0] text-[#587085] hover:border-[#0874e8]'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#587085] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0874e8]" />
                            <span>Ngày hẹn</span>
                          </label>
                          <select
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
                          >
                            <option value="Hôm nay, 25/10">Hôm nay, 25/10</option>
                            <option value="Ngày mai, 26/10">Ngày mai, 26/10</option>
                            <option value="Thứ Bảy, 27/10">Thứ Bảy, 27/10</option>
                            <option value="Chủ Nhật, 28/10">Chủ Nhật, 28/10</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#587085] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#0874e8]" />
                            <span>Khung giờ</span>
                          </label>
                          <select
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
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
                          <label className="text-xs font-semibold text-[#587085]">Họ và tên</label>
                          <input
                            type="text"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#587085]">Số điện thoại</label>
                          <input
                            type="text"
                            value={ownerPhone}
                            onChange={(e) => setOwnerPhone(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#587085]">
                          Ghi chú về tình trạng thú cưng
                        </label>
                        <textarea
                          value={petNote}
                          onChange={(e) => setPetNote(e.target.value)}
                          placeholder="Ví dụ: Da nhạy cảm, cần tỉa gọn vùng mặt..."
                          rows={2}
                          className="w-full p-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-xs text-[#17324d] focus:outline-none"
                        />
                      </div>

                      {bookingConfirmed && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            Đã ghi nhận lịch hẹn <strong>{selectedSpaPackage.name}</strong> ({bookingPetType}) lúc{' '}
                            <strong>{bookingTime}</strong> ngày <strong>{bookingDate}</strong>.
                          </span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>Xác nhận đặt lịch hẹn</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-6 lg:p-8 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#dfe6f0] flex items-center justify-center text-[#0874e8] shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-[#17324d]">
                            Đăng nhập để đặt lịch dịch vụ
                          </h3>
                          <p className="text-[13px] text-[#587085] leading-relaxed">
                            Bạn đã chọn gói <strong>{selectedSpaPackage.name}</strong> ({selectedSpaPackage.priceStr}). Vui lòng đăng nhập tài khoản thành viên để giữ khung giờ hẹn và theo dõi lịch sử chăm sóc.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            requireLoginFor('service', 'Đăng nhập để đặt lịch dịch vụ Spa & Khách sạn.')
                          }
                          className="h-11 px-6 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-xs cursor-pointer transition-colors"
                        >
                          Đăng nhập để đặt lịch
                        </button>
                        <button
                          onClick={() => {
                            setReturnPage('service');
                            navigateTo('register');
                          }}
                          className="h-11 px-6 rounded-xl bg-white border border-[#dfe6f0] hover:border-[#0874e8] text-[#17324d] font-bold text-xs cursor-pointer transition-colors"
                        >
                          Đăng ký thành viên mới
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Standards Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-2xl border border-[#dfe6f0] p-6 space-y-4">
                    <h3 className="text-base font-bold text-[#0874e8] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Quy trình 7 bước chuẩn y khoa</span>
                    </h3>
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
                          <CheckCircle2 className="w-4 h-4 text-[#0874e8] shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#0874e8] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-[#587085]">Tư vấn lịch trống trong ngày</div>
                      <div className="text-lg font-extrabold text-[#0874e8] tabular-nums">1900 6868</div>
                      <div className="text-[11px] text-[#587085]">Phục vụ 8:00 – 21:00 mỗi ngày</div>
                    </div>
                  </div>
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
                <div className="w-full h-11 rounded-xl bg-[#f3f7ff] p-1 grid grid-cols-2 gap-1 mb-6">
                  <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className={`rounded-lg text-[13px] font-bold transition cursor-pointer ${
                      currentPage === 'login'
                        ? 'bg-white text-[#0874e8] shadow-xs'
                        : 'text-[#587085] hover:text-[#17324d]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('register')}
                    className={`rounded-lg text-[13px] font-bold transition cursor-pointer ${
                      currentPage === 'register'
                        ? 'bg-white text-[#0874e8] shadow-xs'
                        : 'text-[#587085] hover:text-[#17324d]'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>

                {currentPage === 'login' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const nameFromEmail = loginEmail.includes('@')
                        ? ownerName
                        : loginEmail.trim() || 'Trịnh Khoa';
                      setUserName(nameFromEmail);
                      setIsLoggedIn(true);
                      triggerToast(`Đăng nhập thành công. Xin chào ${nameFromEmail}.`);
                      navigateTo(returnPage === 'login' || returnPage === 'register' ? 'home' : returnPage);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <h1 className="text-[22px] font-extrabold text-[#17324d]">
                        Đăng nhập tài khoản
                      </h1>
                      <p className="text-[13px] text-[#587085] mt-1">
                        Nhập email hoặc số điện thoại hội viên để tiếp tục.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#17324d] block">
                        Email hoặc Số điện thoại
                      </label>
                      <div className="h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus-within:border-[#0874e8] px-3.5 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#0874e8]" />
                        <input
                          type="text"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
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
                          className="font-semibold text-[#0874e8] hover:underline cursor-pointer"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>
                      <div className="h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus-within:border-[#0874e8] px-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Lock className="w-4 h-4 text-[#587085]" />
                          <input
                            type={showPass ? 'text' : 'password'}
                            defaultValue="pethub2026"
                            className="flex-1 bg-transparent text-[13px] font-bold text-[#17324d] focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="text-[#587085] hover:text-[#17324d] cursor-pointer"
                          aria-label="Ẩn hoặc hiện mật khẩu"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const chosenName = regName.trim() || 'Thành viên mới';
                      setUserName(chosenName);
                      setOwnerName(chosenName);
                      setOwnerPhone(regPhone);
                      setIsLoggedIn(true);
                      triggerToast(`Tạo tài khoản thành công. Chào mừng ${chosenName}.`);
                      navigateTo(returnPage === 'login' || returnPage === 'register' ? 'home' : returnPage);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <h1 className="text-[22px] font-extrabold text-[#17324d]">
                        Đăng ký hội viên mới
                      </h1>
                      <p className="text-[12px] text-[#587085] mt-0.5">
                        Nhận mã giảm giá 100.000₫ (PETHUB100K) cho đơn hàng đầu tiên.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#17324d] block">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0874e8] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#17324d] block">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0874e8] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-[#17324d] block">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#f8faff] border border-[#dfe6f0] focus:border-[#0874e8] px-3.5 text-[13px] font-medium text-[#17324d] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Đăng ký &amp; Mở khóa mua sắm</span>
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
                    color: 'text-[#0874e8]',
                    title: 'Giao nhanh 2 giờ',
                    desc: 'Lưu địa chỉ & theo dõi đơn tiện lợi',
                  },
                  {
                    icon: Calendar,
                    color: 'text-[#ff641f]',
                    title: 'Đặt lịch Spa 24/7',
                    desc: 'Chủ động chọn khung giờ & gói chăm sóc',
                  },
                  {
                    icon: Gift,
                    color: 'text-[#0874e8]',
                    title: 'Ưu đãi 100.000₫',
                    desc: 'Dùng mã PETHUB100K cho hội viên mới',
                  },
                ].map((feat, i) => {
                  const IconComp = feat.icon;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white border border-[#dfe6f0] flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#eff5ff] flex items-center justify-center shrink-0">
                        <IconComp className={`w-4 h-4 ${feat.color}`} />
                      </div>
                      <div>
                        <div className="text-[12.5px] font-bold text-[#17324d]">{feat.title}</div>
                        <div className="text-[11px] text-[#587085]">{feat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 7. CHECKOUT SUCCESS & FAIL PAGES (Auth Required)
           * =================================================================== */}
          {(currentPage === 'checkout-success' || currentPage === 'checkout-fail') && isLoggedIn && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1320px] mx-auto px-5 pb-16"
            >
              <div className="h-20 flex items-center justify-center gap-6 text-[13px] font-semibold">
                <span className="text-[#0874e8]">1. Giỏ hàng</span>
                <div className="w-12 h-px bg-[#dfe6f0]" />
                <span className="text-[#0874e8]">2. Thanh toán</span>
                <div className="w-12 h-px bg-[#dfe6f0]" />
                <span
                  className={`font-bold ${
                    currentPage === 'checkout-success' ? 'text-[#0874e8]' : 'text-[#ff641f]'
                  }`}
                >
                  3. Hoàn tất
                </span>
              </div>

              <div className="max-w-[600px] mx-auto pt-4 space-y-7 text-center">
                {currentPage === 'checkout-success' ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#eff5ff] text-[#0874e8] mx-auto flex items-center justify-center">
                      <Check className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h1 className="text-[28px] font-extrabold text-[#17324d]">
                      Đặt hàng thành công
                    </h1>
                    <p className="text-[14px] text-[#587085]">
                      Cảm ơn {userName}. Đơn hàng đang được chuẩn bị và xác nhận đã gửi qua email của bạn.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#fff2e9] text-[#ff641f] mx-auto flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <h1 className="text-[28px] font-extrabold text-[#ff641f]">
                      Thanh toán chưa hoàn tất
                    </h1>
                    <p className="text-[14px] text-[#587085]">
                      Giao dịch bị gián đoạn. Sản phẩm vẫn được giữ trong giỏ hàng để bạn thanh toán lại.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-[#dfe6f0] overflow-hidden text-left bg-white">
                  <div className="px-6 py-4 bg-[#f8faff] flex items-center justify-between text-[13px] tabular-nums">
                    <span className="font-bold text-[#0874e8]">
                      Mã đơn hàng: {lastOrder?.code || '#PET8899'}
                    </span>
                    <span className="text-[#587085]">Ngày: {lastOrder?.date || '25/10/2026'}</span>
                  </div>

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
                          <div className="text-[12px] text-[#587085]">{ordItem.desc}</div>
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
                        currentPage === 'checkout-success' ? 'text-[#0874e8]' : 'text-[#ff641f]'
                      }`}
                    >
                      {currentPage === 'checkout-success' ? 'Đã xác nhận' : 'Chờ thanh toán'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="h-12 rounded-xl bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Tiếp tục mua sắm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateTo('cart')}
                    className="h-12 rounded-xl border border-[#dfe6f0] hover:border-[#0874e8] text-[#17324d] font-bold text-[14px] cursor-pointer transition-colors"
                  >
                    {currentPage === 'checkout-fail' ? 'Thử thanh toán lại' : 'Xem giỏ hàng'}
                  </button>
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

      {/* Floating Contact Stack */}
      <FloatingContact onQuickToast={triggerToast} />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="fixed left-5 bottom-6 z-50 max-w-[360px] px-4 py-3 rounded-xl bg-[#17324d] text-white text-xs font-semibold shadow-[0_12px_30px_rgba(23,50,77,0.28)] flex items-center gap-2.5 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-[#ffb547] shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

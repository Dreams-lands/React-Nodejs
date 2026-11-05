import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  SlidersHorizontal,
  Minus,
  Plus,
  MessagesSquare,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Heart,
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
  Sparkle,
  Truck,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import type { PageId, PetCardItem, CartItem } from './data/mockData';
import {
  DOGS_LIST,
  CATS_LIST,
  SEARCH_ITEMS,
  INITIAL_CART,
  SPA_PACKAGES,
  MILO_GALLERY,
  STOREFRONT_SUPPLIES,
  STOREFRONT_FAVORITES,
  FLASH_SALE_ITEMS,
} from './data/mockData';
import {
  PetHubHeader,
  PetHubFooter,
  CompactHeader,
  CompactFooter,
} from './components/HeadersAndFooters';
import { TiltCard } from './components/TiltCard';
import { FloatingContact } from './components/FloatingContact';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  const [homeCategoryTab, setHomeCategoryTab] = useState<'all' | 'food' | 'bed' | 'backpack'>('all');
  const [productQuantity, setProductQuantity] = useState(1);
  const [productSelectedSize, setProductSelectedSize] = useState('2 kg');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({ 'dog-3': true, 'cat-1': true });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [voucherCode, setVoucherCode] = useState('PETHUB100K');
  const [isVoucherApplied, setIsVoucherApplied] = useState(true);

  // Service Booking State
  const [bookingPetType, setBookingPetType] = useState('🐶 Chó nhỏ (< 5kg)');
  const [selectedPackageId, setSelectedPackageId] = useState('pkg-3');
  const [bookingDate, setBookingDate] = useState('Hôm nay, 25/10');
  const [bookingTime, setBookingTime] = useState('10:30 Sáng');
  const [ownerName, setOwnerName] = useState('Trịnh Khoa');
  const [ownerPhone, setOwnerPhone] = useState('0909 686 868');
  const [petNote, setPetNote] = useState('Bé hơi nhát nước một chút, nhờ cô tắm nhẹ nhàng giúp em ạ.');

  // Milo Profile State
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Auth State
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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = !prev[id];
      triggerToast(
        next ? '❤️ Đã lưu bé cưng vào danh sách yêu thích!' : 'Đã bỏ khỏi danh sách yêu thích'
      );
      return { ...prev, [id]: next };
    });
  };

  // Cart calculation
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = isVoucherApplied ? 100000 : 0;
  const cartFinalTotal = Math.max(0, cartSubtotal - discountAmount);
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

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
    triggerToast('🗑️ Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleCardAction = (item: PetCardItem) => {
    if (item.ctaLabel === 'Thêm vào giỏ') {
      const existing = cartItems.find((c) => c.name.includes(item.name));
      if (existing) {
        updateCartQty(existing.id, 1);
      } else {
        const newItem: CartItem = {
          id: 'c-' + Date.now(),
          name: item.name + ' - ' + item.breed,
          desc: item.meta,
          price: item.priceNum * 1000,
          priceStr: item.price,
          quantity: 1,
          image: item.image,
          category: item.category === 'dog' ? 'Chó cưng' : item.category === 'cat' ? 'Mèo cưng' : 'Phụ kiện',
        };
        setCartItems((prev) => [...prev, newItem]);
      }
      triggerToast(`🛒 Đã thêm "${item.name}" vào giỏ hàng!`);
    } else if (item.ctaLabel === 'Đặt lịch hẹn') {
      navigateTo('service');
    } else {
      navigateTo('profile');
    }
  };

  // Filtered Search List
  const filteredSearchList = useMemo(() => {
    const allPool = [...SEARCH_ITEMS, ...DOGS_LIST.slice(0, 2), ...CATS_LIST.slice(0, 2)];
    return allPool.filter((item) => {
      const matchesCat =
        selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.breed.toLowerCase().includes(q) ||
        item.meta.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [searchQuery, selectedCategoryFilter]);

  const filteredDogs = useMemo(() => {
    if (selectedGenderFilter === 'all') return DOGS_LIST;
    return DOGS_LIST.filter((d) => d.gender === selectedGenderFilter);
  }, [selectedGenderFilter]);

  const filteredCats = useMemo(() => {
    if (selectedGenderFilter === 'all') return CATS_LIST;
    return CATS_LIST.filter((c) => c.gender === selectedGenderFilter);
  }, [selectedGenderFilter]);

  const filteredStorefrontFavorites = useMemo(() => {
    if (homeCategoryTab === 'all') return STOREFRONT_FAVORITES;
    return STOREFRONT_FAVORITES.filter((p) => p.category === homeCategoryTab);
  }, [homeCategoryTab]);

  const isCompactLayout =
    currentPage === 'login' ||
    currentPage === 'register' ||
    currentPage === 'checkout-success' ||
    currentPage === 'checkout-fail';

  const PAGE_TABS: { id: PageId; label: string; badge?: string }[] = [
    { id: 'home', label: '🏠 Trang chủ', badge: 'CHÍNH' },
    { id: 'dogs', label: '🐶 Chó cưng' },
    { id: 'cats', label: '🐱 Mèo cưng' },
    { id: 'product', label: '📦 Chi tiết SP' },
    { id: 'search', label: '🔍 Tìm kiếm' },
    { id: 'profile', label: '🐾 Hồ sơ Milo' },
    { id: 'cart', label: '🛒 Giỏ hàng', badge: `${totalCartCount}` },
    { id: 'service', label: '✨ Đặt lịch Spa' },
    { id: 'login', label: '🔐 Đăng nhập' },
    { id: 'register', label: '🎁 Đăng ký' },
    { id: 'checkout-success', label: '✅ TT Thành công' },
    { id: 'checkout-fail', label: '❌ TT Thất bại' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#17324d] font-sans selection:bg-[#0874e8] selection:text-white">
      {/* Quick Interactive Page Switcher Bar (Sticky Top Dock for testing all 10 customer screens) */}
      <div className="sticky top-0 z-50 bg-[#17324d]/95 backdrop-blur-md text-white px-4 py-2 border-b border-white/10 shadow-md">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              PAGE KHÁCH HÀNG (10 MÀN HÌNH HOÀN CHỈNH):
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {PAGE_TABS.map((tab) => {
              const active = currentPage === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#0874e8] text-white shadow-[0_4px_12px_rgba(8,116,232,0.45)]'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-[#ff641f] text-[9px] font-extrabold text-white">
                      {tab.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header */}
      {isCompactLayout ? (
        <CompactHeader onNavigate={navigateTo} />
      ) : (
        <PetHubHeader
          currentPage={currentPage}
          onNavigate={navigateTo}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={totalCartCount}
          cartTotal={cartFinalTotal.toLocaleString('vi-VN') + '₫'}
          showFlashSale={currentPage === 'profile'}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {/* ===================================================================
           * 0. STOREFRONT HOMEPAGE (TRANG CHỦ PETHUB — Khớp 100% Figma 4:4017)
           * =================================================================== */}
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="w-full pb-16"
            >
              {/* 1. Hero Promotion Section (Figma 4:4018) */}
              <div className="max-w-[1440px] mx-auto px-4 lg:px-16 pt-6 pb-10">
                <div className="relative rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-8 lg:p-14 overflow-hidden">
                  <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#1464f4]/5 pointer-events-none" />
                  <div className="absolute right-32 top-8 w-64 h-64 rounded-full bg-[#ff641f]/5 pointer-events-none" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="lg:col-span-7 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#dfe6f0] shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-[#0874e8]" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0874e8]">
                          SỰ KIỆN VUI VẺ PET • 21–31 THÁNG 10
                        </span>
                      </div>

                      <h1 className="text-[38px] sm:text-[48px] lg:text-[54px] font-extrabold text-[#0874e8] leading-[1.12] tracking-tight">
                        Tình yêu lớn. Bàn chân nhỏ.<br />
                        <span className="text-[#17324d]">Ưu đãi bất khả chiến bại.</span>
                      </h1>

                      <p className="text-[15px] sm:text-[16px] text-[#587085] max-w-[560px] leading-relaxed">
                        Đổ đầy bát của họ. Làm cho ngày của họ trọn vẹn. Tiết kiệm tới 30% trên thức ăn dinh dưỡng, giường nệm thoải mái và những món đồ chơi yêu thích hàng ngày.
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigateTo('search')}
                          className="px-7 py-3.5 rounded-xl bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-[14px] flex items-center gap-2.5 shadow-[0_8px_20px_rgba(255,100,31,0.32)] cursor-pointer transition"
                        >
                          <span>Mua sắm vui vẻ, tiết kiệm lớn</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigateTo('dogs')}
                          className="px-6 py-3.5 rounded-xl bg-white border border-[#dfe6f0] text-[#17324d] font-bold text-[14px] hover:border-[#0874e8] hover:text-[#0874e8] transition cursor-pointer"
                        >
                          Khám phá cún & mèo cưng
                        </motion.button>
                      </div>
                    </div>

                    {/* Hero Right Visual with 30% Badge & Image */}
                    <div className="lg:col-span-5 relative flex items-center justify-center">
                      <div className="relative w-full max-w-[420px] aspect-4/3 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(23,50,77,0.12)] border-2 border-white">
                        <img
                          src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=85"
                          alt="Pet Hub Happy Pets"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Floating Savings Badge (Figma 4:4080) */}
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="absolute -bottom-6 -left-4 sm:left-4 bg-gradient-to-tr from-[#ff641f] to-[#ff8c42] text-white rounded-2xl p-4 shadow-[0_12px_24px_rgba(255,100,31,0.35)] border-2 border-white text-center w-36"
                      >
                        <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">TIẾT KIỆM ĐẾN</div>
                        <div className="text-[34px] font-black leading-none my-1">30%</div>
                        <div className="text-[9px] font-bold uppercase tracking-tight opacity-90 leading-tight">CHO BÉ YÊU THÍCH</div>
                      </motion.div>
                    </div>
                  </div>

                  {/* 4 Value Propositions Bar (Figma 4:4089) */}
                  <div className="mt-12 pt-8 border-t border-[#dfe6f0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#dfe6f0] flex items-center justify-center text-[#0874e8] shrink-0 shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#17324d]">100% chính hãng</div>
                        <div className="text-[11px] text-[#587085]">Thương hiệu uy tín, kiểm định chuẩn</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#dfe6f0] flex items-center justify-center text-[#ff641f] shrink-0 shadow-xs">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#17324d]">Giao nhanh toàn quốc</div>
                        <div className="text-[11px] text-[#587085]">Miễn phí vận chuyển từ 499.000₫</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#dfe6f0] flex items-center justify-center text-[#1464f4] shrink-0 shadow-xs">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#17324d]">Chăm sóc tận tâm</div>
                        <div className="text-[11px] text-[#587085]">Bác sĩ thú y tư vấn chu đáo 24/7</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#dfe6f0] flex items-center justify-center text-[#0874e8] shrink-0 shadow-xs">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#17324d]">Đổi trả dễ dàng</div>
                        <div className="text-[11px] text-[#587085]">Yên tâm mua sắm đổi trong 7 ngày</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Welcome to Pet Hub Section (Figma 4:4106) */}
              <div className="max-w-[1440px] mx-auto px-4 lg:px-16 py-10 border-b border-[#dfe6f0]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff641f]">
                      NGƯỜI BẠN ĐỒNG HÀNH KHU VỰC CỦA BẠN
                    </div>
                    <h2 className="text-[28px] lg:text-[34px] font-extrabold text-[#17324d] leading-snug">
                      Chào mừng đến với Trung tâm thú cưng của chúng tôi
                    </h2>
                    <p className="text-[14px] text-[#587085] leading-relaxed max-w-[720px]">
                      Điểm đến cuối cùng của bạn về thức ăn, phụ kiện và dịch vụ chăm sóc chuyên nghiệp cho thú cưng cao cấp. Từ dấu chân nhỏ đầu tiên cho đến cuộc phiêu lưu trong cuộc đời, chúng tôi mang đến cho các bậc cha mẹ thú cưng ở Việt Nam mọi thứ họ cần để giúp những người bạn thân nhất của họ phát triển khỏe mạnh.
                    </p>
                  </div>
                  <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-4">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-[32px] font-black text-[#0874e8]">50,000+</span>
                      <span className="text-[13px] text-[#587085] font-medium">cha mẹ thú cưng tin cậy</span>
                    </div>
                    <button
                      onClick={() => navigateTo('dogs')}
                      className="text-[13px] font-bold text-[#0874e8] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Khám phá thêm về PetHub</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Pet Supplies 3 Cards (Figma 4:4217) */}
              <div className="max-w-[1440px] mx-auto px-4 lg:px-16 py-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff641f] mb-1">
                      MỌI THỨ CHO MỌI NGÀY CỦA HỌ
                    </div>
                    <h2 className="text-[28px] lg:text-[32px] font-extrabold text-[#17324d]">
                      Đồ dùng cho thú cưng
                    </h2>
                  </div>
                  <button
                    onClick={() => navigateTo('search')}
                    className="text-[14px] font-bold text-[#0874e8] hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Khám phá tất cả nguồn cung cấp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {STOREFRONT_SUPPLIES.map((sup) => (
                    <motion.div
                      key={sup.id}
                      whileHover={{ y: -6, boxShadow: '0 20px 30px rgba(8,116,232,0.1)' }}
                      onClick={() => navigateTo('search')}
                      className="group rounded-2xl bg-white border border-[#dfe6f0] p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between h-[360px]"
                    >
                      <div>
                        <div className="h-44 w-full rounded-xl overflow-hidden mb-5 bg-[#f8faff]">
                          <img
                            src={sup.image}
                            alt={sup.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="text-[20px] font-extrabold text-[#17324d] group-hover:text-[#0874e8] transition-colors">
                          {sup.title}
                        </h3>
                        <p className="text-[12px] text-[#587085] mt-1 line-clamp-1">
                          {sup.desc}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#dfe6f0] flex items-center justify-between">
                        <span className="text-[11px] text-[#587085] font-medium">{sup.meta}</span>
                        <span className="text-[12px] font-bold text-[#0874e8] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Mua sắm ngay →
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 4. Pet Parent Favorites (Figma 4:4254) */}
              <div className="max-w-[1440px] mx-auto px-4 lg:px-16 py-12 border-t border-[#dfe6f0]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-[24px] lg:text-[28px] font-extrabold text-[#17324d]">
                      Yêu thích của cha mẹ thú cưng
                    </h2>
                    <p className="text-[13px] text-[#587085] mt-0.5">
                      Những sản phẩm được đánh giá 5 sao cao nhất bởi cộng đồng yêu thú cưng
                    </p>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#f3f7ff] border border-[#dfe6f0] overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'Tất cả sản phẩm' },
                      { id: 'food', label: 'Thức ăn' },
                      { id: 'bed', label: 'Giường' },
                      { id: 'backpack', label: 'Ba lô' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setHomeCategoryTab(tab.id as any)}
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
                  {filteredStorefrontFavorites.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -6 }}
                      className="group rounded-xl bg-white border border-[#dfe6f0] p-4 flex flex-col justify-between shadow-xs hover:shadow-[0_12px_24px_rgba(23,50,77,0.08)] transition-all"
                    >
                      <div>
                        <div
                          onClick={() => navigateTo('product')}
                          className="relative aspect-square w-full rounded-lg bg-[#f8faff] overflow-hidden mb-3 cursor-pointer"
                        >
                          {item.discountBadge && (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#ff641f] text-white text-[11px] font-extrabold z-10">
                              {item.discountBadge}
                            </span>
                          )}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="text-[10px] font-extrabold text-[#0874e8] uppercase tracking-wider mb-1">
                          {item.brand}
                        </div>
                        <h4
                          onClick={() => navigateTo('product')}
                          className="text-[14px] font-bold text-[#17324d] leading-snug line-clamp-2 hover:text-[#0874e8] cursor-pointer"
                        >
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-[#587085] mt-1">{item.packSize}</div>
                        <div className="text-[11px] text-[#ffb547] font-semibold mt-1">
                          {item.rating} ({item.reviewCount})
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#dfe6f0] flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[16px] font-extrabold text-[#ff641f]">{item.price}</div>
                          {item.originalPrice && (
                            <div className="text-[11px] text-[#587085] line-through">
                              {item.originalPrice}
                            </div>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            const newCartItem: CartItem = {
                              id: `cart-${item.id}-${Date.now()}`,
                              name: item.name,
                              desc: `${item.brand} • ${item.packSize}`,
                              price: parseInt(item.price.replace(/\D/g, '')) || 465000,
                              priceStr: item.price,
                              quantity: 1,
                              image: item.image,
                              category: item.category,
                            };
                            setCartItems((prev) => [newCartItem, ...prev]);
                            triggerToast(`🛒 Đã thêm "${item.name}" vào giỏ hàng!`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-[12px] flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                        >
                          <span>Thêm vào giỏ</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 5. Flash Sale Section (Figma 4:4119) */}
              <div className="max-w-[1440px] mx-auto px-4 lg:px-16 py-12">
                <div className="rounded-2xl bg-gradient-to-r from-[#eff5ff] via-[#f8faff] to-[#fff5f0] border border-[#dfe6f0] p-6 lg:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dfe6f0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ff641f] text-white flex items-center justify-center font-bold">
                        ⚡
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff641f]">
                          GIỜ VÀNG GIÁ SỐC
                        </div>
                        <h2 className="text-[24px] font-extrabold text-[#17324d]">
                          Flash Sale Hôm Nay • Giảm tới 30%
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-[#587085]">Kết thúc sau:</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <span className="px-2.5 py-1 rounded-md bg-[#17324d]">08</span>:
                        <span className="px-2.5 py-1 rounded-md bg-[#17324d]">45</span>:
                        <span className="px-2.5 py-1 rounded-md bg-[#ff641f]">22</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    {FLASH_SALE_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl bg-white border border-[#dfe6f0] p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition"
                      >
                        <div>
                          <div className="relative aspect-square w-full rounded-lg bg-[#f8faff] overflow-hidden mb-3">
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#ff641f] text-white text-[11px] font-extrabold z-10">
                              {item.discount}
                            </span>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="text-[10px] font-extrabold text-[#0874e8] uppercase">
                            {item.brand}
                          </div>
                          <h4 className="text-[13px] font-bold text-[#17324d] leading-snug line-clamp-2">
                            {item.name}
                          </h4>
                          <div className="text-[11px] text-[#587085] mt-1">{item.packSize}</div>
                          <div className="text-[11px] text-[#ffb547] mt-0.5">
                            ★★★★★ {item.rating}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#dfe6f0] space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[17px] font-extrabold text-[#ff641f]">
                              {item.price}
                            </span>
                            <span className="text-[11px] text-[#587085] line-through">
                              {item.originalPrice}
                            </span>
                          </div>

                          {/* Progress Stock Bar */}
                          <div>
                            <div className="h-1.5 w-full bg-[#f0f3f6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#ff641f] to-[#ff8c42] rounded-full"
                                style={{ width: `${(item.soldCount / item.totalStock) * 100}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-[#587085] font-semibold mt-1 flex justify-between">
                              <span>Đã bán {item.soldCount}</span>
                              <span>Còn {item.totalStock - item.soldCount}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const newCartItem: CartItem = {
                                id: `flash-${item.id}-${Date.now()}`,
                                name: item.name,
                                desc: `${item.brand} • ${item.packSize}`,
                                price: parseInt(item.price.replace(/\D/g, '')) || 389000,
                                priceStr: item.price,
                                quantity: 1,
                                image: item.image,
                                category: 'Thức ăn',
                              };
                              setCartItems((prev) => [newCartItem, ...prev]);
                              triggerToast(`⚡ Đã thêm "${item.name}" Flash Sale vào giỏ!`);
                            }}
                            className="w-full py-2 rounded-lg bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-xs cursor-pointer transition"
                          >
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. Pet Services (Figma 4:4374) */}
              <div className="max-w-[1440px] mx-auto px-4 lg:px-16 py-12 border-t border-[#dfe6f0]">
                <div className="text-center max-w-[640px] mx-auto mb-10 space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff641f]">
                    DỊCH VỤ THÚ CƯNG CAO CẤP
                  </div>
                  <h2 className="text-[28px] lg:text-[34px] font-extrabold text-[#17324d]">
                    Chăm sóc thêm một chút. Rất nhiều tình yêu.
                  </h2>
                  <p className="text-[14px] text-[#587085]">
                    Được tin tưởng bởi hàng nghìn gia đình thú cưng với hệ thống trang thiết bị đạt chuẩn y khoa quốc tế.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Spa & Grooming Card */}
                  <div className="rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="space-y-3 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#dfe6f0] text-[#0874e8] flex items-center justify-center shadow-xs">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-[24px] font-extrabold text-[#17324d]">
                        Spa & Chăm sóc thú cưng
                      </h3>
                      <p className="text-[13px] text-[#587085] leading-relaxed max-w-[420px]">
                        Tắm nhẹ nhàng, cắt tỉa chuyên nghiệp và ngập tràn tình yêu thương. Quy trình chăm sóc 7 bước dịu nhẹ không stress cho bé.
                      </p>
                      <div className="text-[12px] font-semibold text-[#0874e8]">
                        Tắm & sấy khô • Tạo kiểu lông • Chăm sóc móng • Vệ sinh tai
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#dfe6f0]/70 flex items-center justify-between relative z-10">
                      <div>
                        <div className="text-[11px] text-[#587085]">Chỉ từ</div>
                        <div className="text-[20px] font-extrabold text-[#0874e8]">150.000₫</div>
                      </div>
                      <button
                        onClick={() => navigateTo('service')}
                        className="px-5 py-2.5 rounded-lg bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-xs cursor-pointer shadow-xs transition"
                      >
                        Đặt một ngày spa ngay →
                      </button>
                    </div>
                  </div>

                  {/* Hotel Boarding Card */}
                  <div className="rounded-2xl bg-[#fff8f5] border border-[#ffe4d6] p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="space-y-3 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#ffe4d6] text-[#ff641f] flex items-center justify-center shadow-xs">
                        <PawPrint className="w-6 h-6" />
                      </div>
                      <h3 className="text-[24px] font-extrabold text-[#17324d]">
                        Khách sạn thú cưng 5 sao
                      </h3>
                      <p className="text-[13px] text-[#587085] leading-relaxed max-w-[420px]">
                        Kỳ nghỉ dưỡng an toàn và ấm cúng cho bé khi bạn vắng nhà. Phòng điều hòa riêng biệt, camera 24/7 và chế độ dinh dưỡng chuẩn thú y.
                      </p>
                      <div className="text-[12px] font-semibold text-[#ff641f]">
                        Phòng tiện nghi • Camera 24/7 • Dạo chơi hàng ngày • Thức ăn hạt cao cấp
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#ffe4d6] flex items-center justify-between relative z-10">
                      <div>
                        <div className="text-[11px] text-[#587085]">Chỉ từ</div>
                        <div className="text-[20px] font-extrabold text-[#ff641f]">200.000₫ / đêm</div>
                      </div>
                      <button
                        onClick={() => navigateTo('service')}
                        className="px-5 py-2.5 rounded-lg bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-xs cursor-pointer shadow-xs transition"
                      >
                        Khám phá phòng nghỉ →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * PRODUCT DETAIL PAGE (CHI TIẾT SẢN PHẨM — Khớp Figma 13:3172)
           * =================================================================== */}
          {currentPage === 'product' && (
            <motion.div
              key="product"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1440px] mx-auto px-4 lg:px-16 pb-16"
            >
              {/* Breadcrumb */}
              <div className="h-16 flex items-center gap-3 text-[13px]">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <button
                  onClick={() => navigateTo('dogs')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Chó
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <button
                  onClick={() => navigateTo('search')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Thức ăn cho chó
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="font-semibold text-[#0874e8]">Thức ăn khô cho chó mini</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Visual Gallery (Figma 13:3219) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative aspect-4/3 rounded-2xl bg-[#eff5ff] border border-[#dfe6f0] overflow-hidden">
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#ff641f] text-white text-[11px] font-extrabold z-10 shadow-xs">
                      BÁN HÀNG TUYỆT VỜI · −20%
                    </span>
                    <img
                      src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1000&q=85"
                      alt="Royal Canin Mini Adult"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=85',
                      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=85',
                      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=400&q=85',
                    ].map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-xl bg-[#eff5ff] border border-[#dfe6f0] overflow-hidden cursor-pointer hover:border-[#0874e8] transition"
                      >
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8faff] border border-[#dfe6f0] flex items-center gap-3 text-[12px] text-[#587085]">
                    <ShieldCheck className="w-4 h-4 text-[#0874e8] shrink-0" />
                    <span>100% xác thực. Đã kiểm tra chất lượng thú y. Thú cưng hạnh phúc được đảm bảo.</span>
                  </div>
                </div>

                {/* Right Details Panel */}
                <div className="lg:col-span-5 space-y-6 bg-white rounded-2xl border border-[#dfe6f0] p-6 lg:p-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-extrabold text-[#0874e8] uppercase tracking-wider">
                        CANIN HOÀNG GIA (ROYAL CANIN)
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Còn hàng · Còn 22</span>
                      </span>
                    </div>

                    <h1 className="text-[26px] font-extrabold text-[#17324d] leading-snug">
                      Thức ăn khô cho chó trưởng thành loại nhỏ
                    </h1>
                    <div className="text-[13px] text-[#587085] mt-1">Giống nhỏ • 2 kg</div>
                    <div className="text-[12px] text-[#ffb547] font-semibold mt-2 flex items-center gap-2">
                      <span>★★★★★ 4.9 (128 đánh giá)</span>
                      <span className="text-[#0874e8] hover:underline cursor-pointer">Đọc đánh giá ↓</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8faff] border border-[#dfe6f0] space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-extrabold text-[#ff641f]">389.000₫</span>
                      <span className="text-[14px] text-[#587085] line-through">489.000₫</span>
                      <span className="px-2 py-0.5 rounded bg-[#ff641f]/10 text-[#ff641f] text-xs font-bold">
                        Tiết kiệm 100.000₫
                      </span>
                    </div>
                    <p className="text-[12px] text-[#587085]">
                      Dinh dưỡng hàng ngày cho người bạn nhỏ thân yêu. Cung cấp năng lượng cân bằng và giữ bộ lông luôn óng mượt.
                    </p>
                  </div>

                  {/* Pack Size Selector */}
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#17324d] block">Kích thước gói</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['2 kg', '4 kg', '8 kg'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setProductSelectedSize(size)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            productSelectedSize === size
                              ? 'border-[#0874e8] bg-[#eff5ff] text-[#0874e8]'
                              : 'border-[#dfe6f0] bg-white text-[#587085] hover:border-[#0874e8]'
                          }`}
                        >
                          {size} {productSelectedSize === size && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="h-[44px] rounded-lg border border-[#dfe6f0] flex items-center px-2 bg-white">
                        <button
                          onClick={() => setProductQuantity((q) => Math.max(1, q - 1))}
                          className="w-7 h-7 flex items-center justify-center text-[#587085] hover:text-[#17324d] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-[#17324d]">
                          {productQuantity}
                        </span>
                        <button
                          onClick={() => setProductQuantity((q) => q + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#587085] hover:text-[#17324d] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const newCartItem: CartItem = {
                            id: `cart-prod-${Date.now()}`,
                            name: `Thức ăn khô Royal Canin Mini Adult (${productSelectedSize})`,
                            desc: 'CANIN HOÀNG GIA • Giống nhỏ',
                            price: 389000,
                            priceStr: '389.000₫',
                            quantity: productQuantity,
                            image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=300&q=85',
                            category: 'Thức ăn',
                          };
                          setCartItems((prev) => [newCartItem, ...prev]);
                          triggerToast(`🛒 Đã thêm ${productQuantity}x Royal Canin Mini Adult vào giỏ!`);
                        }}
                        className="flex-1 h-[44px] rounded-lg bg-[#0874e8] hover:bg-[#1464f4] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Thêm vào giỏ hàng</span>
                      </motion.button>
                    </div>

                    <button
                      onClick={() => {
                        const newCartItem: CartItem = {
                          id: `cart-prod-buy-${Date.now()}`,
                          name: `Thức ăn khô Royal Canin Mini Adult (${productSelectedSize})`,
                          desc: 'CANIN HOÀNG GIA • Giống nhỏ',
                          price: 389000,
                          priceStr: '389.000₫',
                          quantity: productQuantity,
                          image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=300&q=85',
                          category: 'Thức ăn',
                        };
                        setCartItems((prev) => [newCartItem, ...prev]);
                        navigateTo('cart');
                      }}
                      className="w-full h-[44px] rounded-lg bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <span>Mua ngay · Giao hàng siêu tốc</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 1 & 2. DOGS & CATS CATEGORY LISTING PAGES
           * =================================================================== */}
          {(currentPage === 'dogs' || currentPage === 'cats') && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-12"
            >
              {/* Breadcrumb */}
              <div className="h-16 flex items-center gap-3 text-[13px]">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="font-semibold text-[#0874e8]">
                  {currentPage === 'dogs' ? 'Chó cưng thuần chủng' : 'Mèo cưng thuần chủng'}
                </span>
              </div>

              {/* Hero Banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="w-full min-h-[240px] rounded-[4px] bg-[#eff5ff] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center"
              >
                <div className="p-8 lg:px-12">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#ff641f] mb-2">
                    {currentPage === 'dogs' ? 'TÌNH YÊU LỚN. BƯỚC CHÂN NHỎ.' : 'BƯỚC CHÂN NHỎ. TRÁI TIM LỚN.'}
                  </div>
                  <h1 className="text-[44px] lg:text-[56px] font-extrabold text-[#0874e8] leading-none mb-4">
                    {currentPage === 'dogs' ? 'Chó cưng' : 'Mèo cưng'}
                  </h1>
                  <p className="text-[16px] lg:text-[17px] text-[#35609a] max-w-[520px] leading-relaxed">
                    {currentPage === 'dogs'
                      ? 'Hành trình yêu thương bắt đầu từ một chiếc đuôi vẫy mừng. Hãy làm quen với người bạn nhỏ trung thành đang chờ đón bạn.'
                      : 'Làm quen với những bé mèo thuần chủng, lanh lợi và khỏe mạnh. Mỗi ngày bên bé là một ngày tràn ngập niềm vui và tiếng gừ êm ái.'}
                  </p>
                </div>
                <div className="h-[240px] w-full overflow-hidden relative bg-[#d4e7f7]">
                  <img
                    src={
                      currentPage === 'dogs'
                        ? 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85'
                        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=85'
                    }
                    alt="Hero Pets"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </motion.div>

              {/* Catalog Layout */}
              <div className="pt-9 flex flex-col lg:flex-row gap-8">
                {/* Left Filter Sidebar */}
                <aside className="w-full lg:w-[248px] shrink-0 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#dfe6f0]">
                    <div className="flex items-center gap-2 text-[18px] font-bold text-[#0874e8]">
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Bộ lọc</span>
                    </div>
                    <button
                      onClick={() => setSelectedGenderFilter('all')}
                      className="text-[12px] text-[#6d7d94] hover:text-[#0874e8] cursor-pointer"
                    >
                      Đặt lại tất cả
                    </button>
                  </div>

                  {/* Breed Group */}
                  <div className="pb-6 border-b border-[#dfe6f0] space-y-3">
                    <div className="flex items-center justify-between text-[15px] font-bold text-[#0874e8]">
                      <span>{currentPage === 'dogs' ? 'Giống cún' : 'Giống mèo'}</span>
                      <Minus className="w-4 h-4" />
                    </div>
                    {(currentPage === 'dogs'
                      ? [
                          { label: 'Golden Retriever', count: 8 },
                          { label: 'Labrador Retriever', count: 6 },
                          { label: 'Chó săn Beagle', count: 4 },
                          { label: 'Corgi chân lùn', count: 3 },
                          { label: 'Poodle Toy', count: 5 },
                          { label: 'Spaniel Hoàng Gia', count: 4 },
                        ]
                      : [
                          { label: 'Mèo Anh lông ngắn', count: 9 },
                          { label: 'Mèo Ragdoll mắt xanh', count: 5 },
                          { label: 'Scottish Fold tai cụp', count: 6 },
                          { label: 'Mèo Ba Tư lông xù', count: 4 },
                          { label: 'Mèo Bengal vằn báo', count: 5 },
                          { label: 'Mèo Maine Coon', count: 3 },
                        ]
                    ).map((opt) => (
                      <label
                        key={opt.label}
                        className="flex items-center justify-between text-[13px] text-[#35609a] hover:text-[#0874e8] cursor-pointer group"
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-[#dfe6f0] accent-[#0874e8]"
                          />
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {opt.label}
                          </span>
                        </span>
                        <span className="text-[12px] text-[#6d7d94]">{opt.count}</span>
                      </label>
                    ))}
                  </div>

                  {/* Age Group */}
                  <div className="pb-6 border-b border-[#dfe6f0] space-y-3">
                    <div className="flex items-center justify-between text-[15px] font-bold text-[#0874e8]">
                      <span>Độ tuổi</span>
                      <Minus className="w-4 h-4" />
                    </div>
                    {[
                      { label: '8–12 tuần', count: 18 },
                      { label: '13–16 tuần', count: 10 },
                      { label: '4–6 tháng', count: 5 },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        className="flex items-center justify-between text-[13px] text-[#35609a] hover:text-[#0874e8] cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-[#dfe6f0] accent-[#0874e8]"
                          />
                          <span>{opt.label}</span>
                        </span>
                        <span className="text-[12px] text-[#6d7d94]">{opt.count}</span>
                      </label>
                    ))}
                  </div>

                  {/* Gender Group */}
                  <div className="pb-6 border-b border-[#dfe6f0] space-y-3">
                    <div className="flex items-center justify-between text-[15px] font-bold text-[#0874e8]">
                      <span>Giới tính</span>
                      <Minus className="w-4 h-4" />
                    </div>
                    {[
                      { label: 'Đực', count: 18 },
                      { label: 'Cái', count: 15 },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        onClick={() =>
                          setSelectedGenderFilter((prev) =>
                            prev === opt.label ? 'all' : opt.label
                          )
                        }
                        className="flex items-center justify-between text-[13px] text-[#35609a] hover:text-[#0874e8] cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedGenderFilter === opt.label}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 rounded border-[#dfe6f0] accent-[#0874e8]"
                          />
                          <span>{opt.label}</span>
                        </span>
                        <span className="text-[12px] text-[#6d7d94]">{opt.count}</span>
                      </label>
                    ))}
                  </div>

                  {/* Consultation Promo Card */}
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="p-5 rounded-[6px] bg-[#fff2e9] space-y-2.5"
                  >
                    <MessagesSquare className="w-6 h-6 text-[#ff641f]" />
                    <h4 className="text-[16px] font-bold text-[#35609a] leading-snug">
                      Chưa biết bé nào hợp với bạn?
                    </h4>
                    <p className="text-[12px] text-[#6d7d94] leading-relaxed">
                      Đội ngũ tư vấn viên PetHub luôn sẵn sàng giúp bạn chọn bé cún/mèo hợp tính cách
                      và không gian sống.
                    </p>
                    <button
                      onClick={() =>
                        triggerToast('💬 Chuyên gia tư vấn thú cưng PetHub đã sẵn sàng kết nối!')
                      }
                      className="text-[13px] font-bold text-[#0874e8] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      Nhận tư vấn ngay →
                    </button>
                  </motion.div>
                </aside>

                {/* Right Product Grid */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <p className="text-[15px] text-[#35609a]">
                      Gặp gỡ người bạn nhỏ ·{' '}
                      <span className="font-semibold">
                        {currentPage === 'dogs' ? '33 bé cún thuần chủng' : '28 bé mèo thuần chủng'}
                      </span>
                    </p>
                    <div className="px-3.5 py-2 rounded-[4px] border border-[#dfe6f0] text-[13px] text-[#35609a] flex items-center gap-6 bg-white">
                      <span>Sắp xếp: Được yêu thích nhất</span>
                      <ChevronDown className="w-4 h-4 text-[#6d7d94]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {(currentPage === 'dogs' ? filteredDogs : filteredCats).map((item, idx) => (
                      <TiltCard
                        key={item.id}
                        item={item}
                        index={idx}
                        isLiked={!!likedIds[item.id]}
                        onToggleLike={toggleLike}
                        onCardAction={handleCardAction}
                      />
                    ))}
                  </div>

                  {/* Pagination Row */}
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#6d7d94]">
                    <span>Hiển thị 1–6 trên 33 bé cưng đồng hành</span>
                    <div className="flex items-center gap-1.5">
                      {['1', '2', '3', '…', '6', '→'].map((p, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => triggerToast(`Đang chuyển đến trang ${p}`)}
                          className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-semibold cursor-pointer transition ${
                            p === '1'
                              ? 'bg-[#2161ed] text-white'
                              : 'border border-[#dfe6f0] text-[#35609a] hover:border-[#2161ed]'
                          }`}
                        >
                          {p}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 3. SEARCH PAGE
           * =================================================================== */}
          {currentPage === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-12"
            >
              {/* Breadcrumb */}
              <div className="h-16 flex items-center gap-3 text-[13px]">
                <button
                  onClick={() => navigateTo('home')}
                  className="text-[#587085] hover:text-[#0874e8] cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="font-semibold text-[#0874e8]">Tìm kiếm sản phẩm & Dịch vụ</span>
              </div>

              {/* Search Hero Banner */}
              <div className="w-full min-h-[240px] rounded-[4px] bg-[#eff5ff] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center">
                <div className="p-8 lg:px-12">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#ff641f] mb-2">
                    KẾT QUẢ TÌM KIẾM THÔNG MINH
                  </div>
                  <h1 className="text-[40px] lg:text-[44px] font-extrabold text-[#0874e8] leading-tight mb-3">
                    Tìm kiếm{searchQuery ? `: "${searchQuery}"` : ''}
                  </h1>
                  <p className="text-[16px] text-[#35609a] leading-relaxed mb-4">
                    Tìm thấy {filteredSearchList.length} sản phẩm, bé cưng & gói dịch vụ phù hợp.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'Tất cả (48)' },
                      { id: 'dog', label: '🐶 Chó cưng' },
                      { id: 'cat', label: '🐱 Mèo cưng' },
                      { id: 'food', label: '🦴 Thức ăn dinh dưỡng' },
                      { id: 'accessory', label: '🛏️ Phụ kiện & Nệm' },
                      { id: 'spa', label: '✨ Dịch vụ Spa' },
                    ].map((pill) => (
                      <motion.button
                        key={pill.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategoryFilter(pill.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
                          selectedCategoryFilter === pill.id
                            ? 'bg-[#0874e8] text-white shadow-xs'
                            : 'bg-white text-[#35609a] border border-[#dfe6f0] hover:border-[#0874e8]'
                        }`}
                      >
                        {pill.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="h-[240px] w-full overflow-hidden bg-[#d4e7f7]">
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85"
                    alt="Search Pets"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>

              {/* Grid Content */}
              <div className="pt-9">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredSearchList.map((item, idx) => (
                    <TiltCard
                      key={item.id}
                      item={item}
                      index={idx}
                      isLiked={!!likedIds[item.id]}
                      onToggleLike={toggleLike}
                      onCardAction={handleCardAction}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 4. MILO CAT PROFILE PAGE
           * =================================================================== */}
          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-12"
            >
              <div className="py-5 space-y-2">
                <div className="flex items-center gap-2 text-[12px] text-[#587085]">
                  <button onClick={() => navigateTo('home')} className="hover:text-[#0874e8] cursor-pointer">
                    Trang chủ
                  </button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <button onClick={() => navigateTo('cats')} className="hover:text-[#0874e8] cursor-pointer">
                    Mèo cưng
                  </button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Anh lông ngắn</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-[#0874e8] font-semibold">Bé Milo</span>
                </div>
                <button
                  onClick={() => navigateTo('cats')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0874e8] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại với tất cả các bé mèo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <div className="relative h-[440px] rounded-[6px] overflow-hidden bg-[#efe8dc] border border-[#dfe6f0]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activePhotoIdx}
                        src={MILO_GALLERY[activePhotoIdx]}
                        alt="Milo"
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded bg-white/95 text-[11px] font-bold text-[#0874e8] flex items-center gap-2 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-[#ff641f]" />
                      <span>Sẵn sàng cho một mái ấm yêu thương</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded bg-white/95 text-[11px] font-bold text-[#0874e8]">
                      0{activePhotoIdx + 1} / 04
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {MILO_GALLERY.map((img, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ y: -2 }}
                        onClick={() => setActivePhotoIdx(i)}
                        className={`h-24 rounded-[4px] overflow-hidden border-2 cursor-pointer transition ${
                          activePhotoIdx === i ? 'border-[#0874e8]' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Milo ${i + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0874e8]">
                      MÈO ANH LÔNG NGẮN (GOLDEN)
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleLike('cat-1')}
                      className="w-9 h-9 rounded-full border border-[#dfe6f0] flex items-center justify-center text-[#0874e8] cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedIds['cat-1'] ? 'fill-[#ff4757] text-[#ff4757]' : ''
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div>
                    <h1 className="text-[44px] font-bold text-[#0874e8] leading-none mb-2">
                      Bé Milo
                    </h1>
                    <p className="text-[15px] text-[#35609a]">
                      Một chàng mèo nhỏ vàng óng, quấn quýt và tràn ngập tình cảm.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-[28px] font-bold text-[#0874e8]">$1,250</span>
                    <span className="text-[12px] text-[#6d7d94]">Đã bao gồm gói bảo hành sức khỏe 12 tháng</span>
                  </div>

                  <div className="rounded-[4px] border border-[#dfe6f0] divide-y divide-[#dfe6f0] text-[13px]">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-[#6d7d94]">Độ tuổi</span>
                      <span className="font-semibold text-[#17324d]">12 tuần</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-[#6d7d94]">Giới tính</span>
                      <span className="font-semibold text-[#17324d]">Đực</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-[#6d7d94]">Tình trạng tiêm chủng</span>
                      <span className="font-semibold text-[#0874e8] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đầy đủ 2 mũi tiêm</span>
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const miloCartItem: CartItem = {
                        id: 'c-milo',
                        name: 'Bé Mèo Anh lông ngắn (Milo)',
                        desc: '12 tuần tuổi · Giống đực · Tiêm chủng 2 mũi · Sổ khám thú y',
                        price: 31250000,
                        priceStr: '31.250.000₫',
                        quantity: 1,
                        image: MILO_GALLERY[0],
                        category: 'Mèo cưng thuần chủng',
                      };
                      setCartItems((prev) => [
                        miloCartItem,
                        ...prev.filter((c) => c.id !== 'c-milo'),
                      ]);
                      navigateTo('cart');
                    }}
                    className="w-full h-[48px] rounded-[4px] bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,100,31,0.32)] cursor-pointer transition"
                  >
                    <span>Đón bé Milo về nhà ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 5. CART PAGE (GIỎ HÀNG — Trùng khớp thiết kế Figma 213:817)
           * =================================================================== */}
          {currentPage === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1440px] mx-auto px-4 lg:px-20 pb-16"
            >
              {/* Stepper Header */}
              <div className="h-[88px] flex items-center justify-center gap-6 text-[13px] font-semibold">
                <span className="text-[#1464f4] flex items-center gap-2 font-bold">
                  <span className="w-5 h-5 rounded-full bg-[#1464f4] text-white text-xs flex items-center justify-center">1</span>
                  <span>01 Giỏ hàng</span>
                </span>
                <div className="w-16 h-px bg-[#dfe6f0]" />
                <span className="text-[#647083] flex items-center gap-2">
                  <span>02 Thanh toán</span>
                </span>
                <div className="w-16 h-px bg-[#dfe6f0]" />
                <span className="text-[#647083] flex items-center gap-2">
                  <span>03 Hoàn tất</span>
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#eff5ff] text-[#0874e8] mx-auto flex items-center justify-center">
                    <PawPrint className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#17324d]">Giỏ hàng của bạn đang trống</h2>
                  <p className="text-sm text-[#587085]">Hãy tìm kiếm và đón bé cưng hoặc sản phẩm yêu thích về tổ ấm nhé!</p>
                  <button
                    onClick={() => navigateTo('dogs')}
                    className="px-6 py-2.5 rounded-lg bg-[#0874e8] text-white font-bold text-sm cursor-pointer hover:bg-[#1464f4] transition"
                  >
                    Khám phá cửa hàng ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Cart Items (8 cols) */}
                  <div className="lg:col-span-8 bg-white rounded-xl border border-[#dfe6f0] p-6 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-[#dfe6f0]">
                      <h2 className="text-lg font-bold text-[#1464f4]">
                        Giỏ hàng của bạn ({totalCartCount} sản phẩm)
                      </h2>
                      <button
                        onClick={() => {
                          setCartItems([]);
                          triggerToast('Đã dọn sạch giỏ hàng');
                        }}
                        className="text-xs font-semibold text-[#ff4757] hover:underline cursor-pointer"
                      >
                        Xóa tất cả
                      </button>
                    </div>

                    <div className="divide-y divide-[#dfe6f0] space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover bg-[#f3f7ff] shrink-0"
                          />
                          <div className="flex-1 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0874e8] bg-[#eff5ff] px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <h3 className="text-sm font-bold text-[#17324d]">{item.name}</h3>
                            <p className="text-xs text-[#647083] line-clamp-1">{item.desc}</p>
                            <div className="text-sm font-extrabold text-[#1464f4]">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </div>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-[#dfe6f0] rounded-lg overflow-hidden bg-[#f8faff]">
                              <button
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center font-bold text-[#647083] hover:bg-white cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-[#17324d]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center font-bold text-[#1464f4] hover:bg-white cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeCartItem(item.id)}
                              className="p-2 text-[#ff4757] hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              aria-label="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Order Summary (4 cols) */}
                  <div className="lg:col-span-4 bg-white rounded-xl border border-[#dfe6f0] p-6 space-y-5">
                    <h3 className="text-lg font-bold text-[#17324d]">Tóm tắt đơn hàng</h3>

                    {/* Voucher Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#17324d] block">Mã giảm giá / Voucher</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="Nhập mã ưu đãi..."
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#dfe6f0] bg-[#f8faff] font-bold text-[#1464f4] uppercase focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (voucherCode.trim() === 'PETHUB100K') {
                              setIsVoucherApplied(true);
                              triggerToast('🎉 Đã áp dụng mã giảm giá 100.000₫!');
                            } else {
                              triggerToast('Mã không hợp lệ! Dùng thử PETHUB100K nhé');
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-[#1464f4] text-white text-xs font-bold hover:bg-[#0874e8] transition cursor-pointer"
                        >
                          {isVoucherApplied ? 'Đã áp dụng' : 'Áp dụng'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-[#dfe6f0] text-xs">
                      <div className="flex justify-between text-[#647083]">
                        <span>Tạm tính:</span>
                        <span className="font-bold text-[#17324d]">
                          {cartSubtotal.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      {isVoucherApplied && (
                        <div className="flex justify-between text-[#ff641f]">
                          <span>Giảm giá voucher:</span>
                          <span className="font-bold">-100.000₫</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#1464f4]">
                        <span>Phí vận chuyển:</span>
                        <span className="font-bold">Miễn phí giao hàng</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#dfe6f0] flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#17324d]">Tổng thanh toán:</span>
                      <span className="text-xl font-extrabold text-[#1464f4]">
                        {cartFinalTotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateTo('checkout-success')}
                      className="w-full h-12 rounded-lg bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(255,100,31,0.35)] cursor-pointer transition"
                    >
                      <span>Tiến hành thanh toán ({totalCartCount})</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <div className="p-3 rounded-lg bg-[#eff5ff] text-[11px] text-[#35609a] space-y-1">
                      <div className="font-bold text-[#0874e8]">🛡️ Cam kết PetHub Care:</div>
                      <div>• Bảo hành sức khỏe thú cưng 12 tháng trọn vẹn</div>
                      <div>• Đổi trả phụ kiện, thức ăn trong 7 ngày nếu lỗi</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===================================================================
           * 6. SERVICE BOOKING PAGE (ĐẶT LỊCH SPA — Trùng khớp thiết kế Figma 213:991)
           * =================================================================== */}
          {currentPage === 'service' && (
            <motion.div
              key="service"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-16"
            >
              {/* Breadcrumb */}
              <div className="h-16 flex items-center gap-3 text-[13px]">
                <button onClick={() => navigateTo('home')} className="text-[#587085] hover:text-[#0874e8] cursor-pointer">
                  Trang chủ
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="text-[#587085]">Dịch vụ thú cưng</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#587085]" />
                <span className="font-semibold text-[#0874e8]">Đặt lịch Spa & Làm đẹp</span>
              </div>

              {/* Service Hero Banner */}
              <div className="w-full min-h-[160px] rounded-xl bg-[#eff5ff] p-8 lg:p-10 mb-8 flex flex-col justify-center border border-[#dfe6f0]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#ff641f] mb-1">
                  DỊCH VỤ CHĂM SÓC THÚ CƯNG 5 SAO TẠI PETHUB
                </div>
                <h1 className="text-3xl font-extrabold text-[#0874e8] mb-2">
                  Đặt lịch Spa & Làm đẹp cho bé cưng
                </h1>
                <p className="text-sm text-[#35609a] max-w-2xl leading-relaxed">
                  Quy trình vệ sinh 7 bước chuẩn y khoa, phòng sấy ấm dịu dàng, cắt tỉa tạo kiểu bởi Master Groomer chứng nhận quốc tế.
                </p>
              </div>

              {/* 2-Column Booking Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column (7 cols) */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    triggerToast(`✨ Đã nhận lịch hẹn Spa cho bé lúc ${bookingTime} - ${bookingDate}!`);
                  }}
                  className="lg:col-span-7 bg-white rounded-xl border border-[#dfe6f0] p-6 lg:p-8 space-y-6 shadow-xs"
                >
                  {/* Step 1: Pet Type */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#17324d] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0874e8] text-white text-xs flex items-center justify-center font-bold">1</span>
                      <span>Chọn bé cưng của bạn:</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        '🐶 Chó nhỏ (< 5kg)',
                        '🐕 Chó vừa (5–10kg)',
                        '🦮 Chó lớn (> 10kg)',
                        '🐱 Mèo cưng',
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBookingPetType(t)}
                          className={`p-2.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            bookingPetType === t
                              ? 'bg-[#eff5ff] border-[#0874e8] text-[#0874e8] shadow-xs'
                              : 'bg-white border-[#dfe6f0] text-[#647083] hover:border-[#0874e8]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Service Package */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#17324d] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0874e8] text-white text-xs flex items-center justify-center font-bold">2</span>
                      <span>Chọn gói dịch vụ chăm sóc:</span>
                    </h3>
                    <div className="space-y-3">
                      {SPA_PACKAGES.map((pkg) => {
                        const active = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                              active
                                ? 'bg-[#eff5ff] border-[#0874e8] ring-2 ring-[#0874e8]/20'
                                : 'bg-[#f8faff] border-[#dfe6f0] hover:border-[#0874e8]'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#17324d]">{pkg.name}</span>
                                {pkg.isPopular && (
                                  <span className="px-2 py-0.5 rounded bg-[#ff641f] text-white text-[10px] font-bold">
                                    Ưa chuộng nhất 🔥
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#647083] leading-relaxed">{pkg.desc}</p>
                              <span className="inline-block text-[11px] font-semibold text-[#587085]">
                                ⏱️ Thời gian: {pkg.duration}
                              </span>
                            </div>
                            <div className="text-base font-extrabold text-[#0874e8] shrink-0">
                              {pkg.priceStr}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Date & Time */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#17324d] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0874e8] text-white text-xs flex items-center justify-center font-bold">3</span>
                      <span>Chọn Ngày & Khung giờ phục vụ:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#587085] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0874e8]" />
                          <span>Ngày hẹn:</span>
                        </label>
                        <select
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
                        >
                          <option value="Hôm nay, 25/10">Hôm nay, 25/10</option>
                          <option value="Ngày mai, 26/10">Ngày mai, 26/10</option>
                          <option value="Thứ Bảy, 27/10">Thứ Bảy, 27/10</option>
                          <option value="Chủ Nhật, 28/10">Chủ Nhật, 28/10</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#587085] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0874e8]" />
                          <span>Khung giờ:</span>
                        </label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
                        >
                          <option value="09:00 Sáng">09:00 Sáng (Khởi động)</option>
                          <option value="10:30 Sáng">10:30 Sáng (Yêu thích)</option>
                          <option value="14:00 Chiều">14:00 Chiều</option>
                          <option value="15:30 Chiều">15:30 Chiều</option>
                          <option value="17:00 Chiều">17:00 Chiều (Sau giờ làm)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Contact Info */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#17324d] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0874e8] text-white text-xs flex items-center justify-center font-bold">4</span>
                      <span>Thông tin chủ bé:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#587085]">Họ và tên của bạn</label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#587085]">Số điện thoại liên hệ</label>
                        <input
                          type="text"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#dfe6f0] bg-[#f8faff] text-xs font-bold text-[#17324d] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#587085]">Ghi chú đặc biệt về bé</label>
                      <textarea
                        value={petNote}
                        onChange={(e) => setPetNote(e.target.value)}
                        rows={2}
                        className="w-full p-3 rounded-lg border border-[#dfe6f0] bg-[#f8faff] text-xs text-[#17324d] focus:outline-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 rounded-lg bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(255,100,31,0.35)] cursor-pointer transition"
                  >
                    <Sparkle className="w-4 h-4" />
                    <span>Xác nhận đặt lịch hẹn ngay (Ưu đãi 10% online)</span>
                  </motion.button>
                </form>

                {/* Right Standards Column (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 7-Step Process Card */}
                  <div className="bg-white rounded-xl border border-[#dfe6f0] p-6 space-y-4 shadow-xs">
                    <h3 className="text-base font-bold text-[#0874e8] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Quy trình Spa 7 Bước Chuẩn Y Khoa</span>
                    </h3>
                    <div className="space-y-3 text-xs text-[#35609a]">
                      {[
                        '1. Khám tổng quát & kiểm tra tình trạng da lông, tai, móng',
                        '2. Vệ sinh tai, nhổ lông tai & cắt dũa móng an toàn',
                        '3. Vắt tuyến hôi & chải gỡ lông rối kỹ lưỡng',
                        '4. Tắm thảo mộc diệt khuẩn 2 lần bằng nước ấm chuyên dụng',
                        '5. Sấy ấm ion âm & chải phồng lông bồng bềnh êm ái',
                        '6. Cắt tỉa tạo kiểu theo yêu cầu của bố mẹ',
                        '7. Xịt dưỡng bóng lông cao cấp & tặng bánh thưởng',
                      ].map((s, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Hotline Box */}
                  <div className="p-5 rounded-xl bg-[#eff5ff] border border-[#dfe6f0] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0874e8] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-[#587085]">Cần đặt lịch gấp trong ngày?</div>
                      <div className="text-lg font-extrabold text-[#0874e8]">Hotline 1900 6868</div>
                      <div className="text-[11px] text-[#35609a]">Tư vấn trực tiếp cùng Master Groomer</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 7 & 8. LOGIN & REGISTER PAGES
           * =================================================================== */}
          {(currentPage === 'login' || currentPage === 'register') && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-[#f8faff] py-14 px-4 flex items-center justify-center min-h-[780px]"
            >
              <div className="w-full max-w-[1020px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_16px_40px_rgba(23,50,77,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-5 bg-[#eff5ff] p-8 lg:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#dfe6f0] text-[11px] font-bold text-[#1464f4]">
                      <PawPrint className="w-3.5 h-3.5 text-[#ff641f]" />
                      <span>CỘNG ĐỒNG PETHUB CLUB</span>
                    </div>

                    <h2 className="text-[26px] lg:text-[28px] font-extrabold text-[#17324d] leading-snug">
                      Trọn vẹn yêu thương cho bé cưng mỗi ngày.
                    </h2>

                    <p className="text-[13px] text-[#587085] leading-relaxed">
                      Đăng nhập để theo dõi sổ tiêm chủng điện tử, quản lý đơn hàng nhanh chóng và nhận ưu đãi đặc quyền dành riêng cho hội viên.
                    </p>

                    <div className="space-y-3 pt-1">
                      {[
                        {
                          icon: ShieldCheck,
                          color: 'text-[#1464f4]',
                          title: 'Sổ sức khỏe & tiêm chủng điện tử',
                          desc: 'Lưu trữ lịch khám thú y & nhắc lịch tự động',
                        },
                        {
                          icon: Gift,
                          color: 'text-[#ff641f]',
                          title: 'Tích điểm thưởng hoàn tiền 5%',
                          desc: 'Đổi quà, thức ăn & voucher spa miễn phí',
                        },
                        {
                          icon: Headphones,
                          color: 'text-[#0874e8]',
                          title: 'Tư vấn bác sĩ thú y 24/7',
                          desc: 'Hỗ trợ trực tuyến qua Zalo & Hotline 1900 6868',
                        },
                      ].map((feat, i) => {
                        const IconComp = feat.icon;
                        return (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-white border border-[#dfe6f0] flex items-center gap-3.5"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#f3f7ff] flex items-center justify-center shrink-0">
                              <IconComp className={`w-5 h-5 ${feat.color}`} />
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-[#17324d]">
                                {feat.title}
                              </div>
                              <div className="text-[11px] text-[#647083]">{feat.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-12 px-4 rounded-xl bg-[#1464f4] text-white flex items-center justify-center gap-2 text-[12px] font-semibold">
                    <Star className="w-4 h-4 fill-[#ffb547] text-[#ffb547]" />
                    <span>Hơn 25.000+ bố mẹ thú cưng tin dùng • Đánh giá 4.9/5</span>
                  </div>
                </div>

                <div className="lg:col-span-7 p-8 lg:px-14 lg:py-10 flex flex-col justify-center">
                  <div className="w-full h-[42px] rounded-xl bg-[#f3f7ff] p-1 grid grid-cols-2 gap-1 mb-6">
                    <button
                      type="button"
                      onClick={() => navigateTo('login')}
                      className={`rounded-lg text-[13px] font-bold transition cursor-pointer ${
                        currentPage === 'login'
                          ? 'bg-white text-[#1464f4] shadow-xs'
                          : 'text-[#647083] hover:text-[#17324d]'
                      }`}
                    >
                      Đăng nhập
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('register')}
                      className={`rounded-lg text-[13px] font-bold transition cursor-pointer ${
                        currentPage === 'register'
                          ? 'bg-white text-[#1464f4] shadow-xs'
                          : 'text-[#647083] hover:text-[#17324d]'
                      }`}
                    >
                      Đăng ký tài khoản
                    </button>
                  </div>

                  {currentPage === 'login' ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        triggerToast('🎉 Đăng nhập thành công! Chào mừng trở lại, Trịnh Khoa!');
                        setTimeout(() => navigateTo('dogs'), 700);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <h1 className="text-[24px] font-extrabold text-[#17324d]">
                          Chào mừng bạn trở lại! 👋
                        </h1>
                        <p className="text-[13px] text-[#647083] mt-1">
                          Nhập email hoặc số điện thoại để truy cập tài khoản của bạn.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#17324d] block">
                          Email hoặc Số điện thoại
                        </label>
                        <div className="h-[46px] rounded-lg bg-[#f8faff] border-[1.5px] border-[#1464f4] px-3.5 flex items-center gap-3">
                          <Mail className="w-4 h-4 text-[#1464f4]" />
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
                              triggerToast('📧 Đã gửi liên kết khôi phục mật khẩu tới email của bạn!')
                            }
                            className="font-semibold text-[#1464f4] hover:underline cursor-pointer"
                          >
                            Quên mật khẩu?
                          </button>
                        </div>
                        <div className="h-[46px] rounded-lg bg-[#f8faff] border border-[#dfe6f0] px-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <Lock className="w-4 h-4 text-[#647083]" />
                            <input
                              type={showPass ? 'text' : 'password'}
                              defaultValue="pethub2026"
                              className="flex-1 bg-transparent text-[13px] font-bold text-[#17324d] focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="text-[#647083] hover:text-[#17324d] cursor-pointer"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-[48px] rounded-lg bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(255,100,31,0.35)] cursor-pointer transition"
                      >
                        <span>Đăng nhập vào tài khoản</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </form>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        triggerToast('🎁 Chúc mừng! Bạn đã tạo tài khoản & nhận Voucher 100.000₫!');
                        setTimeout(() => navigateTo('dogs'), 800);
                      }}
                      className="space-y-3.5"
                    >
                      <div>
                        <h1 className="text-[22px] font-extrabold text-[#17324d]">
                          Tạo tài khoản hội viên mới ✨
                        </h1>
                        <p className="text-[12px] text-[#647083] mt-0.5">
                          Nhận ngay voucher 100.000₫ cho đơn hàng đầu tiên của bé cưng.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[12px] font-bold text-[#17324d] block">Họ và tên</label>
                          <input
                            type="text"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full h-[42px] rounded-lg bg-[#f8faff] border-[1.5px] border-[#1464f4] px-3 text-[13px] font-medium text-[#17324d] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[12px] font-bold text-[#17324d] block">Số điện thoại</label>
                          <input
                            type="text"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full h-[42px] rounded-lg bg-[#f8faff] border border-[#dfe6f0] px-3 text-[13px] font-medium text-[#17324d] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#17324d] block">Địa chỉ Email</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full h-[42px] rounded-lg bg-[#f8faff] border border-[#dfe6f0] px-3 text-[13px] font-medium text-[#17324d] focus:outline-none"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-[48px] rounded-lg bg-[#ff641f] hover:bg-[#ee5e17] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(255,100,31,0.35)] cursor-pointer transition"
                      >
                        <span>Tạo tài khoản & Nhận Voucher 100K</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
           * 9 & 10. CHECKOUT SUCCESS & CHECKOUT FAIL
           * =================================================================== */}
          {(currentPage === 'checkout-success' || currentPage === 'checkout-fail') && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[1440px] mx-auto px-4 pb-16"
            >
              <div className="h-[88px] flex items-center justify-center gap-6 text-[13px] font-semibold">
                <span className="text-[#1464f4] flex items-center gap-2">
                  <span>✓</span>
                  <span>Giỏ hàng</span>
                </span>
                <div className="w-16 h-px bg-[#dfe6f0]" />
                <span className="text-[#1464f4] flex items-center gap-2">
                  <span>✓</span>
                  <span>Thanh toán</span>
                </span>
                <div className="w-16 h-px bg-[#dfe6f0]" />
                <span
                  className={`flex items-center gap-2 font-bold ${
                    currentPage === 'checkout-success' ? 'text-[#1464f4]' : 'text-[#ff4757]'
                  }`}
                >
                  <span>03</span>
                  <span>Hoàn tất</span>
                </span>
              </div>

              <div className="max-w-[640px] mx-auto pt-4 space-y-7 text-center">
                {currentPage === 'checkout-success' ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="w-20 h-20 rounded-2xl bg-[#f3f7ff] text-[#1464f4] mx-auto flex items-center justify-center"
                    >
                      <Check className="w-10 h-10 stroke-[2.5]" />
                    </motion.div>
                    <h1 className="text-[32px] font-extrabold text-[#1464f4]">
                      Đặt hàng thành công!
                    </h1>
                    <p className="text-[14px] text-[#647083]">
                      Cảm ơn bạn đã mua sắm tại PetHub. Thông tin đơn hàng đã được gửi vào email của bạn.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="w-20 h-20 rounded-2xl bg-[#fff2e9] text-[#ff641f] mx-auto flex items-center justify-center"
                    >
                      <AlertTriangle className="w-10 h-10 stroke-[2.2]" />
                    </motion.div>
                    <h1 className="text-[32px] font-extrabold text-[#ff641f]">
                      Thanh toán chưa hoàn tất
                    </h1>
                    <p className="text-[14px] text-[#647083]">
                      Giao dịch bị gián đoạn hoặc vượt quá hạn mức thẻ. Đơn hàng của bạn vẫn được giữ trong 24 giờ.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-[#dfe6f0] overflow-hidden text-left bg-white shadow-xs">
                  <div className="px-6 py-4 bg-[#f3f7ff] flex items-center justify-between text-[13px]">
                    <span className="font-bold text-[#1464f4]">Mã đơn hàng: #PET8899</span>
                    <span className="text-[#647083]">Ngày đặt: 25/10/2026</span>
                  </div>

                  <div className="p-6 space-y-4 divide-y divide-[#dfe6f0]">
                    <div className="flex items-center gap-4 pb-4">
                      <img
                        src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=200&q=80"
                        alt="Mèo Anh lông ngắn"
                        className="w-12 h-12 rounded-lg object-cover bg-[#efe8dc]"
                      />
                      <div>
                        <div className="text-[14px] font-bold text-[#17324d]">
                          1x Bé Mèo Anh lông ngắn (Milo)
                        </div>
                        <div className="text-[12px] text-[#7c8798]">
                          12 tuần tuổi · Giống đực · Đầy đủ 2 mũi tiêm
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-[#dfe6f0] flex items-center justify-between">
                    <span className="text-[16px] font-bold text-[#1464f4]">
                      Tổng thanh toán: 31,250,000₫
                    </span>
                    <span className="text-[12px] font-semibold text-[#1464f4] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã thanh toán</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigateTo('dogs')}
                    className="h-12 rounded-lg bg-[#ee5e17] hover:bg-[#ff641f] text-white font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Tiếp tục mua sắm</span>
                  </button>
                  <button
                    onClick={() => navigateTo('cart')}
                    className="h-12 rounded-lg border border-[#1464f4] text-[#1464f4] font-bold text-[14px] hover:bg-[#f3f7ff] cursor-pointer transition"
                  >
                    Xem lại giỏ hàng
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
        <PetHubFooter onNavigate={navigateTo} />
      )}

      {/* Floating Contact Icons on ALL 10 customer pages */}
      <FloatingContact onQuickToast={triggerToast} />

      {/* Interactive Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="fixed left-6 bottom-8 z-50 px-4 py-3 rounded-xl bg-[#17324d] text-white text-xs font-bold shadow-[0_12px_32px_rgba(23,50,77,0.3)] flex items-center gap-2.5 border border-white/15"
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

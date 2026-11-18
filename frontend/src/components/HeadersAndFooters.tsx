import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  ShoppingCart,
  Headphones,
  Mail,
  ShieldCheck,
  PawPrint,
  LogOut,
  LogIn,
  ChevronDown,
  LayoutGrid,
  PackageSearch,
  Menu,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import type { PageId, ProductCategory } from '../data/mockData';
import type { ThemeMode } from '../lib/useThemeDroplet';
import { CategoryMenuList } from './CategoryMenuList';
import { ThemeToggleButton } from './ThemeToggleButton';

interface FullHeaderProps {
  currentPage: PageId;
  activeCatalogCategory: 'all' | ProductCategory;
  activePetAudience?: 'all' | 'dog' | 'cat';
  onNavigate: (page: PageId) => void;
  onSelectCategory: (cat: 'all' | ProductCategory) => void;
  onSelectPetAudience?: (pet: 'dog' | 'cat') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoggedIn: boolean;
  userName: string;
  workspaceRole?: 'admin' | 'staff' | null;
  onLogout: () => void;
  onOpenOrderLookup?: () => void;
  cartCount: number;
  cartTotal: string;
  theme?: ThemeMode;
  onToggleTheme?: (el: HTMLElement) => void;
}

export const PetHubHeader: React.FC<FullHeaderProps> = ({
  currentPage,
  activeCatalogCategory,
  activePetAudience = 'all',
  onNavigate,
  onSelectCategory,
  onSelectPetAudience,
  searchQuery,
  onSearchChange,
  isLoggedIn,
  userName,
  workspaceRole = null,
  onLogout,
  onOpenOrderLookup,
  cartCount,
  cartTotal,
  theme = 'light',
  onToggleTheme,
}) => {
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProductMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProductMenuOpen(false);
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search');
  };

  const handleContactClick = () => {
    setProductMenuOpen(false);
    onNavigate('contact');
  };

  return (
    <header className="w-full bg-white dark:bg-[#111827] sticky top-0 z-40 border-b border-[#dfe6f0] dark:border-[#1f2937]">
      {/* 1. Mobile Header (Adapted from User Specification - Image 1) */}
      <div className="lg:hidden bg-[#241a15] text-white">
        <div className="px-3 pt-2.5 pb-2 flex items-center justify-between gap-2">
          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Mở menu danh mục"
            className="w-10 h-10 -ml-1 rounded-lg flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Menu className="w-6 h-6 text-white" strokeWidth={2.4} />
          </button>

          {/* Brand Logo */}
          <motion.button
            type="button"
            onClick={() => onNavigate('home')}
            whileTap={{ scale: 0.96 }}
            aria-label="PetsFriend — Về trang chủ"
            className="flex items-center gap-1.5 text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-[#38bdf8]">
              <PawPrint className="w-4 h-4" />
            </div>
            <span className="text-[19px] font-extrabold text-white tracking-tight leading-none">
              PetsFriend
            </span>
          </motion.button>

          {/* Right: Theme Toggle & Cart */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={() => onNavigate('cart')}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Box Row (Image 1) */}
        <div className="px-3 pb-3">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="h-10 rounded-lg bg-[#f4f4f5] dark:bg-[#27272a] px-3.5 flex items-center gap-2 border border-transparent focus-within:border-white/50 transition"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentPage !== 'search') onNavigate('search');
              }}
              aria-label="Tìm kiếm sản phẩm"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 min-w-0 bg-transparent text-[13px] text-[#18181b] dark:text-white placeholder-[#71717a] dark:placeholder-[#a1a1aa] focus:outline-none"
            />
            <button
              type="submit"
              className="w-7 h-7 rounded flex items-center justify-center text-[#71717a] dark:text-[#a1a1aa] hover:text-[#0667d0] cursor-pointer"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. Desktop Main Header */}
      <div className="hidden lg:block max-w-[1320px] mx-auto px-3 sm:px-8 lg:px-12">
        <div className="h-16 md:h-20 flex items-center justify-between gap-2 md:gap-6">
          {/* Brand Logo */}
          <motion.button
            type="button"
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="PetsFriend — Về trang chủ"
            className="flex items-center gap-1.5 sm:gap-2.5 text-left cursor-pointer shrink-0 group"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#eff5ff] flex items-center justify-center text-[#0667d0] group-hover:bg-[#0667d0] group-hover:text-white transition-colors">
              <PawPrint className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[16px] sm:text-[25px] font-extrabold text-[#0667d0] leading-none tracking-tight">
                PetsFriend
              </div>
              <div className="text-[11px] font-semibold text-[#52657a] tracking-[0.08em] uppercase mt-1 hidden sm:block">
                ĐỒ DÙNG &amp; CHĂM SÓC THÚ CƯNG
              </div>
            </div>
          </motion.button>

          {/* Desktop Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="flex-1 min-w-[210px] max-w-[520px] h-11 rounded-xl border border-[#dfe6f0] bg-[#f8faff] flex items-center overflow-hidden focus-within:bg-white focus-within:border-[#0667d0] transition-colors"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentPage !== 'search') onNavigate('search');
              }}
              aria-label="Tìm kiếm sản phẩm và dịch vụ"
              placeholder="Tìm thức ăn, nệm ngủ, balo, dịch vụ chăm sóc..."
              className="flex-1 min-w-0 px-4 bg-transparent text-[13px] text-[#17324d] placeholder-[#52657a] focus:outline-none"
            />
            <button
              type="submit"
              className="w-10 h-9 mr-1 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Account & Cart & Theme */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
            {/* Shopping Cart Button — accessible to both guests and members */}
            <button
              type="button"
              onClick={() => onNavigate('cart')}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#eff5ff] hover:bg-[#0667d0] text-[#17324d] hover:text-white transition-colors cursor-pointer group"
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-[#0667d0] group-hover:text-white transition-colors" aria-hidden="true" />
                <span className="ml-1 sm:ml-1.5 px-1.5 py-0.5 rounded-full bg-[#c2410c] text-white text-[11px] font-bold leading-none tabular-nums">
                  {cartCount}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[12px] font-bold tabular-nums">{cartTotal}</div>
              </div>
            </button>

            {isLoggedIn ? (
              <>
                {workspaceRole && (
                  <button
                    type="button"
                    onClick={() => onNavigate('admin')}
                    className="py-2 px-2.5 sm:px-3 rounded-xl bg-[#eff5ff] hover:bg-[#e1eeff] border border-[#c8ddf8] text-[#0667d0] text-[12px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {workspaceRole === 'staff' ? 'Bảng công việc' : 'Quản trị cửa hàng'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('account')}
                  title="Quản lý tài khoản"
                  className="flex items-center gap-2 pr-1.5 py-1 pl-1 rounded-xl hover:bg-[#eff5ff] transition cursor-pointer text-left"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#eff5ff] flex items-center justify-center text-[#0667d0]">
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-[11px] text-[#52657a]">Tài khoản của tôi</div>
                    <div className="text-[13px] font-bold text-[#17324d]">{userName}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="py-2 px-2.5 sm:px-3 rounded-lg border border-[#dfe6f0] hover:border-[#c2410c] text-[#52657a] hover:text-[#c2410c] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden lg:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                {onOpenOrderLookup && (
                  <button
                    type="button"
                    onClick={onOpenOrderLookup}
                    title="Tra cứu đơn hàng"
                    aria-label="Tra cứu đơn hàng"
                    className="py-2 px-2 sm:px-3.5 rounded-xl border border-[#c8ddf8] bg-[#eff5ff] hover:bg-[#e1eeff] text-[#0667d0] text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <PackageSearch className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="hidden xl:inline">Tra cứu đơn hàng</span>
                    <span className="hidden sm:inline xl:hidden">Tra cứu</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="py-1.5 sm:py-2 px-2 sm:px-4 rounded-xl border border-[#dfe6f0] hover:border-[#0667d0] text-[#17324d] hover:text-[#0667d0] text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 shrink-0 hidden sm:block" aria-hidden="true" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="hidden sm:flex py-2 px-4 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-semibold items-center justify-center cursor-pointer transition-colors whitespace-nowrap"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar with Cohesive Category Dropdown Trigger (Desktop only) */}
      <nav className="hidden lg:block w-full h-11 bg-[#0667d0] text-white relative z-30" aria-label="Điều hướng chính">
        <div className="max-w-[1320px] mx-auto h-full px-1 sm:px-8 lg:px-12 flex items-center justify-between gap-0.5 sm:gap-4">
          <div className="flex items-center gap-0.5 sm:gap-2 text-[10.5px] xs:text-[11px] sm:text-[13px] h-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
            <div
              ref={menuRef}
              className="sm:relative h-full flex items-center shrink-0"
              onMouseEnter={() => setProductMenuOpen(true)}
              onMouseLeave={() => setProductMenuOpen(false)}
            >
              <button
                type="button"
                aria-expanded={productMenuOpen}
                aria-haspopup="menu"
                onClick={() => setProductMenuOpen((prev) => !prev)}
                className="h-8 px-1.5 sm:px-3.5 rounded-lg bg-[#044d9e] hover:bg-[#04428a] border border-white/20 text-white font-bold inline-flex items-center justify-between gap-1 sm:gap-2 cursor-pointer whitespace-nowrap transition-colors"
              >
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden sm:inline">Danh mục sản phẩm</span>
                  <span className="sm:hidden">Danh mục</span>
                </span>
                <ChevronDown
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform duration-200 ${
                    productMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {productMenuOpen && (
                <div
                  role="menu"
                  className="fixed sm:absolute left-2 right-2 sm:left-0 sm:right-auto top-[110px] sm:top-full pt-1.5 sm:w-[268px] z-50"
                >
                  <div className="rounded-xl bg-white border border-[#dfe6f0] shadow-[0_16px_36px_rgba(23,50,77,0.14)] overflow-hidden max-h-[75vh] overflow-y-auto">
                    <CategoryMenuList
                      activeCategory={currentPage === 'search' ? activeCatalogCategory : 'all'}
                      activePetAudience={currentPage === 'search' ? activePetAudience : 'all'}
                      roleMode="menuitem"
                      onSelectCategory={(cat) => {
                        onSelectCategory(cat);
                        setProductMenuOpen(false);
                      }}
                      onSelectPetAudience={(pet) => {
                        onSelectPetAudience?.(pet);
                        setProductMenuOpen(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setProductMenuOpen(false);
                onNavigate('home');
              }}
              className={`px-1 sm:px-3 py-1.5 rounded-md font-semibold cursor-pointer whitespace-nowrap shrink-0 transition ${
                currentPage === 'home' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white'
              }`}
            >
              Trang chủ
            </button>

            <button
              onClick={() => {
                setProductMenuOpen(false);
                onNavigate('promotions');
              }}
              className={`px-1 sm:px-3 py-1.5 rounded-md font-semibold cursor-pointer whitespace-nowrap shrink-0 transition ${
                currentPage === 'promotions' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white'
              }`}
            >
              Khuyến mãi
            </button>

            <button
              onClick={() => {
                setProductMenuOpen(false);
                onNavigate('service');
              }}
              className={`px-1 sm:px-3 py-1.5 rounded-md font-semibold cursor-pointer whitespace-nowrap shrink-0 transition ${
                currentPage === 'service' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white'
              }`}
            >
              Dịch vụ
            </button>

            <button
              type="button"
              onClick={handleContactClick}
              className={`px-1 sm:px-3 py-1.5 rounded-md font-semibold cursor-pointer whitespace-nowrap shrink-0 transition ${
                currentPage === 'contact' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white'
              }`}
            >
              Liên hệ
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[12px] font-semibold text-white shrink-0">
            <Headphones className="w-3.5 h-3.5" />
            <span>Miễn phí giao đơn từ 499.000₫ · Hotline: 1900 6868</span>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Slide-out Drawer Navigation (Adapted from User Spec - Image 2) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-[310px] max-w-[85vw] bg-white dark:bg-[#18181b] z-50 flex flex-col shadow-2xl lg:hidden overflow-hidden"
              aria-label="Menu điều hướng di động"
            >
              {/* Drawer Top Header Banner (Dark chocolate matching Image 2) */}
              <div className="bg-[#241a15] dark:bg-[#120f0d] text-white pt-7 pb-6 px-4 relative text-center shrink-0 border-b border-[#3b2c24] dark:border-[#27272a]">
                {/* Close Button X */}
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Đóng menu"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Avatar Icon Circle */}
                <div className="w-14 h-14 rounded-full border-2 border-white/60 bg-white/10 flex items-center justify-center mx-auto mb-2 text-white shadow-sm">
                  <User className="w-7 h-7" strokeWidth={1.75} />
                </div>

                {/* Greeting Text */}
                <div className="text-white text-[15px] font-medium tracking-wide mb-3">
                  {isLoggedIn ? `Xin chào, ${userName}` : 'Xin chào'}
                </div>

                {/* Action Buttons (Bordered Rectangles) */}
                {isLoggedIn ? (
                  <div className="flex flex-col items-center gap-2">
                    {workspaceRole && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('admin');
                        }}
                        className="px-4 py-1.5 rounded bg-[#0667d0] hover:bg-[#0558b5] text-white text-[11px] font-bold tracking-wider uppercase transition cursor-pointer"
                      >
                        {workspaceRole === 'staff' ? 'BẢNG CÔNG VIỆC' : 'QUẢN TRỊ CỬA HÀNG'}
                      </button>
                    )}
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('account');
                        }}
                        className="px-4 py-1.5 border border-white/70 hover:border-white text-white text-[12px] font-bold tracking-wider uppercase rounded-xs transition cursor-pointer hover:bg-white/10"
                      >
                        TÀI KHOẢN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onLogout();
                        }}
                        className="px-4 py-1.5 border border-white/70 hover:border-white text-white text-[12px] font-bold tracking-wider uppercase rounded-xs transition cursor-pointer hover:bg-white/10"
                      >
                        ĐĂNG XUẤT
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onNavigate('login');
                      }}
                      className="px-4 py-1.5 border border-white/70 hover:border-white text-white text-[12px] font-bold tracking-wider uppercase rounded-xs transition cursor-pointer hover:bg-white/10"
                    >
                      ĐĂNG NHẬP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onNavigate('register');
                      }}
                      className="px-4 py-1.5 border border-white/70 hover:border-white text-white text-[12px] font-bold tracking-wider uppercase rounded-xs transition cursor-pointer hover:bg-white/10"
                    >
                      ĐĂNG KÝ
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#f4f4f5] dark:divide-[#27272a] text-[#27272a] dark:text-[#f4f4f5]">
                {/* SECTION 1: DANH MỤC */}
                <div className="bg-[#f4f4f5] dark:bg-[#18181b] text-[#71717a] dark:text-[#a1a1aa] text-[11px] font-bold uppercase tracking-wider px-4 py-2 border-b border-[#e4e4e7] dark:border-[#27272a]">
                  DANH MỤC
                </div>

                {/* Hệ thống cửa hàng */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate('contact');
                  }}
                  className="w-full px-4 py-3 text-left text-[14px] font-medium hover:text-[#0667d0] hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition flex items-center justify-between cursor-pointer"
                >
                  <span>Hệ thống cửa hàng</span>
                </button>

                {/* Trang chủ */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full px-4 py-3 text-left text-[14px] font-medium hover:text-[#0667d0] hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition flex items-center justify-between cursor-pointer"
                >
                  <span>Trang chủ</span>
                </button>

                {/* Khuyến mãi (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onNavigate('promotions');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Khuyến mãi
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('promotions')}
                      aria-label="Mở rộng mục Khuyến mãi"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['promotions'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['promotions'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('promotions');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tất cả khuyến mãi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('promotions');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Flash Sale giảm sốc đến 50%
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('promotions');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Combo dinh dưỡng tiết kiệm
                      </button>
                    </div>
                  )}
                </div>

                {/* Dịch vụ chăm sóc (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onNavigate('service');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Dịch vụ chăm sóc
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('service')}
                      aria-label="Mở rộng mục Dịch vụ chăm sóc"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['service'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['service'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('service');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tất cả dịch vụ thú cưng
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('service');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tắm &amp; Spa toàn diện
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('service');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Cắt tỉa &amp; Tạo kiểu lông
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('service');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Khách sạn thú cưng cao cấp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('service');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Bác sĩ thú y &amp; Tiêm phòng
                      </button>
                    </div>
                  )}
                </div>

                {/* Tin tức (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Tin tức
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('news')}
                      aria-label="Mở rộng mục Tin tức"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['news'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['news'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Cẩm nang chăm sóc thú cưng
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Dinh dưỡng khoa học cho chó mèo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Sự kiện &amp; Cộng đồng PetsFriend
                      </button>
                    </div>
                  )}
                </div>

                {/* Liên hệ */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate('contact');
                  }}
                  className="w-full px-4 py-3 text-left text-[14px] font-medium hover:text-[#0667d0] hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition flex items-center justify-between cursor-pointer"
                >
                  <span>Liên hệ</span>
                </button>

                {/* Tra cứu đơn hàng */}
                {onOpenOrderLookup && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenOrderLookup();
                    }}
                    className="w-full px-4 py-3 text-left text-[14px] font-medium text-[#0667d0] hover:bg-[#eff5ff] dark:hover:bg-[#1e293b] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Tra cứu đơn hàng</span>
                  </button>
                )}

                {/* SECTION 2: DANH MỤC SẢN PHẨM */}
                <div className="bg-[#f4f4f5] dark:bg-[#18181b] text-[#71717a] dark:text-[#a1a1aa] text-[11px] font-bold uppercase tracking-wider px-4 py-2 border-y border-[#e4e4e7] dark:border-[#27272a]">
                  DANH MỤC SẢN PHẨM
                </div>

                {/* Chó cưng (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onSelectPetAudience?.('dog');
                        onNavigate('search');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Chó cưng
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('dog')}
                      aria-label="Mở rộng mục Chó cưng"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['dog'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['dog'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('dog');
                          onSelectCategory('all');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tất cả sản phẩm cho Chó
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('dog');
                          onSelectCategory('food');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Dinh dưỡng &amp; Pate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('dog');
                          onSelectCategory('bed');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Chuồng nệm &amp; Giường ngủ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('dog');
                          onSelectCategory('backpack');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Balo, Dây dắt &amp; Phụ kiện
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('dog');
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Sữa tắm &amp; Vệ sinh
                      </button>
                    </div>
                  )}
                </div>

                {/* Mèo cưng (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onSelectPetAudience?.('cat');
                        onNavigate('search');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Mèo cưng
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('cat')}
                      aria-label="Mở rộng mục Mèo cưng"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['cat'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['cat'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('cat');
                          onSelectCategory('all');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tất cả sản phẩm cho Mèo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('cat');
                          onSelectCategory('food');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Dinh dưỡng &amp; Pate mèo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('cat');
                          onSelectCategory('backpack');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Cát vệ sinh &amp; Nhà vệ sinh
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectPetAudience?.('cat');
                          onSelectCategory('bed');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Ổ nệm &amp; Cào móng
                      </button>
                    </div>
                  )}
                </div>

                {/* Nhà xinh (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onSelectCategory('bed');
                        onNavigate('search');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Nhà xinh
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('house')}
                      aria-label="Mở rộng mục Nhà xinh"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['house'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['house'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('bed');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tất cả Nhà xinh &amp; Nệm ngủ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('bed');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Nệm ngủ &amp; Giường êm ái
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('bed');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Chuồng &amp; Lồng vận chuyển
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('backpack');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Bát ăn &amp; Bình nước tự động
                      </button>
                    </div>
                  )}
                </div>

                {/* Làm đẹp (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onSelectCategory('hygiene');
                        onNavigate('search');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Làm đẹp
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('beauty')}
                      aria-label="Mở rộng mục Làm đẹp"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['beauty'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['beauty'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tất cả sản phẩm Làm đẹp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Sữa tắm &amp; Xịt dưỡng lông
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Lược chải &amp; Kéo tỉa lông
                      </button>
                    </div>
                  )}
                </div>

                {/* Tủ thuốc (+) */}
                <div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onSelectCategory('hygiene');
                        onNavigate('search');
                      }}
                      className="flex-1 text-left text-[14px] font-medium hover:text-[#0667d0] cursor-pointer"
                    >
                      Tủ thuốc
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection('meds')}
                      aria-label="Mở rộng mục Tủ thuốc"
                      className="p-1 text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white cursor-pointer"
                    >
                      {expandedSections['meds'] ? (
                        <Minus className="w-4 h-4 font-bold" />
                      ) : (
                        <Plus className="w-4 h-4 font-bold" />
                      )}
                    </button>
                  </div>
                  {expandedSections['meds'] && (
                    <div className="bg-[#fcfcfd] dark:bg-[#1e1e24] pl-7 pr-4 py-1.5 space-y-2 border-t border-[#f4f4f5] dark:border-[#27272a] text-[13px] text-[#52525b] dark:text-[#d4d4d8]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Tất cả Tủ thuốc thú y
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Trị ve rận &amp; Bọ chét
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Men tiêu hóa &amp; Bổ sung Canxi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectCategory('hygiene');
                          onNavigate('search');
                        }}
                        className="w-full text-left py-1 hover:text-[#0667d0] cursor-pointer block"
                      >
                        • Thuốc nhỏ mắt, tai &amp; Kháng khuẩn
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export const PetHubFooter: React.FC<{
  onNavigate: (p: PageId) => void;
  onSelectCategory: (cat: 'all' | ProductCategory) => void;
  isLoggedIn: boolean;
  onQuickToast?: (msg: string) => void;
}> = ({ onNavigate, onSelectCategory, isLoggedIn, onQuickToast }) => {
  return (
    <footer id="contact-footer" className="w-full bg-white mt-12">
      {/* Newsletter Banner */}
      <div className="w-full bg-[#0667d0] py-8 px-5 sm:px-8 lg:px-12">
        <div className="max-w-[1320px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] lg:text-[20px] font-bold leading-snug">
                Nhận đặc quyền hội viên &amp; cẩm nang chăm sóc thú cưng.
              </h2>
              <p className="text-[13px] text-white mt-0.5 max-w-[58ch]">
                Cập nhật bộ sưu tập mới và ưu đãi dành riêng cho thành viên PetsFriend.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isLoggedIn) {
                onQuickToast?.('Đã đăng ký nhận bản tin hội viên PetsFriend.');
              } else {
                onNavigate('register');
              }
            }}
            className="w-full lg:w-[440px] bg-white rounded-xl p-1.5 flex items-center gap-1.5 shrink-0"
          >
            <input
              type="email"
              placeholder="Nhập địa chỉ email của bạn"
              className="flex-1 min-w-0 px-3 py-2 text-[13px] text-[#17324d] placeholder-[#52657a] focus:outline-none"
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white text-[13px] font-bold cursor-pointer transition-colors shrink-0"
            >
              Đăng ký ngay
            </button>
          </form>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-[#dfe6f0]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PawPrint className="w-5 h-5 text-[#c2410c]" />
            <span className="text-[24px] font-extrabold text-[#0667d0] leading-none">PetsFriend</span>
          </div>
          <p className="text-[13px] text-[#52657a] leading-relaxed mb-4">
            Hệ thống đồ dùng thiết yếu, dinh dưỡng tuyển chọn và dịch vụ chăm sóc thú cưng chuẩn y khoa.
          </p>
          <p className="text-[13px] text-[#17324d] leading-relaxed whitespace-pre-line">
            {'1900 6868 • hello@pethub.vn\n128 Nguyễn Trãi, Quận 1, TP.HCM\nMở cửa: 8:00 – 21:00 mỗi ngày'}
          </p>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-[#17324d] uppercase tracking-wider mb-4">
            Danh mục cửa hàng
          </h3>
          <ul className="space-y-2.5 text-[13px] text-[#52657a]">
            <li>
              <button onClick={() => onSelectCategory('food')} className="hover:text-[#0667d0] cursor-pointer">
                Dinh dưỡng &amp; Pate
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('hygiene')} className="hover:text-[#0667d0] cursor-pointer">
                Thuốc &amp; Làm đẹp
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('bed')} className="hover:text-[#0667d0] cursor-pointer">
                Nệm &amp; Không gian nghỉ
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('backpack')} className="hover:text-[#0667d0] cursor-pointer">
                Balo &amp; Phụ kiện
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('promotions')} className="hover:text-[#0667d0] cursor-pointer">
                Khuyến mãi hôm nay
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('service')} className="hover:text-[#0667d0] cursor-pointer">
                Dịch vụ chăm sóc &amp; Khách sạn 5 sao
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-[#17324d] uppercase tracking-wider mb-4">
            Hỗ trợ hội viên
          </h3>
          <ul className="space-y-2.5 text-[13px] text-[#52657a]">
            <li>
              <button onClick={() => onNavigate('account')} className="hover:text-[#0667d0] cursor-pointer">
                Quản lý tài khoản
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('login')} className="hover:text-[#0667d0] cursor-pointer">
                Đăng nhập tài khoản
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('register')} className="hover:text-[#0667d0] cursor-pointer">
                Đăng ký hội viên mới
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('cart')} className="hover:text-[#0667d0] cursor-pointer">
                Giỏ hàng &amp; Thanh toán
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-[#0667d0] cursor-pointer">
                Liên hệ &amp; Hệ thống cửa hàng
              </button>
            </li>
            <li>
              <span className="text-[#52657a]">Chính sách đổi trả 7 ngày</span>
            </li>
            <li>
              <span className="text-[#52657a]">Bảo mật thông tin khách hàng</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-[#17324d] uppercase tracking-wider mb-4">
            Thanh toán an toàn
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1.5 rounded-lg border border-[#dfe6f0] text-[12px] font-bold text-[#0667d0]">
              VNPay
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-[#dfe6f0] text-[12px] font-bold text-[#b7247d]">
              MoMo
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-[#dfe6f0] text-[12px] font-bold text-[#17324d]">
              COD
            </span>
          </div>
          <p className="text-[13px] text-[#52657a] leading-relaxed mb-4">
            Thanh toán trực tuyến bảo mật hoặc nhận hàng thanh toán. Giá niêm yết đã bao gồm VAT.
          </p>
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#17324d]">
            <ShieldCheck className="w-4 h-4 text-[#0667d0] shrink-0" />
            <span>100% chính hãng · Kiểm định minh bạch</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#52657a] gap-2">
        <span>© 2026 PetsFriend Việt Nam. Mọi quyền được bảo lưu.</span>
        <span className="text-[#17324d] font-medium">
          Chăm sóc chuẩn mực cho người bạn bốn chân.
        </span>
      </div>
    </footer>
  );
};

/* ============================================================================
 * COMPACT HEADER & FOOTER (Auth & Checkout Pages)
 * ============================================================================ */
export const CompactHeader: React.FC<{
  onNavigate: (p: PageId) => void;
  isLoggedIn: boolean;
  theme?: ThemeMode;
  onToggleTheme?: (el: HTMLElement) => void;
}> = ({ onNavigate, theme = 'light', onToggleTheme }) => {
  return (
    <header className="w-full bg-white border-b border-[#dfe6f0]">
      <div className="w-full h-8 bg-[#0667d0] text-white flex items-center justify-center text-[12px] font-medium">
        Chăm sóc đúng cách. An tâm mỗi ngày.
      </div>

      <div className="max-w-[1320px] mx-auto h-16 sm:h-20 px-3 sm:px-8 lg:px-12 flex items-center justify-between gap-2 sm:gap-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer shrink-0 group min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#eff5ff] flex items-center justify-center text-[#0667d0] group-hover:bg-[#0667d0] group-hover:text-white transition-colors shrink-0">
            <PawPrint className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[18px] sm:text-[24px] font-extrabold text-[#0667d0] tracking-tight leading-none">
              PetsFriend
            </div>
            <div className="hidden sm:block text-[11px] font-semibold text-[#52657a] tracking-[0.08em] uppercase mt-1">
              ĐỒ DÙNG &amp; CHĂM SÓC THÚ CƯNG
            </div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-[#17324d]">
          <button onClick={() => onNavigate('home')} className="hover:text-[#0667d0] transition cursor-pointer">
            Trang chủ
          </button>
          <button onClick={() => onNavigate('search')} className="hover:text-[#0667d0] transition cursor-pointer">
            Sản phẩm
          </button>
          <button onClick={() => onNavigate('promotions')} className="hover:text-[#0667d0] transition cursor-pointer">
            Khuyến mãi
          </button>
          <button onClick={() => onNavigate('service')} className="hover:text-[#0667d0] transition cursor-pointer">
            Dịch vụ
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="hover:text-[#0667d0] transition cursor-pointer"
          >
            Liên hệ
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
          <button
            onClick={() => onNavigate('cart')}
            aria-label="Giỏ hàng"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#eff5ff] text-[#0667d0] font-bold text-[12px] sm:text-[13px] cursor-pointer hover:bg-[#dfeafb] transition-colors"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Giỏ hàng</span>
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="hidden sm:inline text-[13px] font-semibold text-[#52657a] hover:text-[#0667d0] cursor-pointer"
          >
            ← Quay lại cửa hàng
          </button>
        </div>
      </div>
    </header>
  );
};

export const CompactFooter: React.FC<{ onNavigate: (p: PageId) => void }> = ({ onNavigate }) => {
  return (
    <footer id="contact-footer" className="w-full bg-white border-t border-[#dfe6f0]">
      <div className="w-full py-5 bg-[#f8faff] flex flex-wrap items-center justify-center gap-3 px-4 text-[13px]">
        <Headphones className="w-4 h-4 text-[#0667d0]" />
        <span className="text-[#52657a]">Cần hỗ trợ nhanh?</span>
        <span className="font-bold text-[#0667d0]">1900 6868</span>
        <span className="text-[#dfe6f0]">|</span>
        <span className="text-[#52657a]">8:00 – 21:00 mỗi ngày</span>
      </div>

      <div className="max-w-[1320px] mx-auto py-5 px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#52657a] gap-2">
        <span>© 2026 PetsFriend Việt Nam.</span>
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('home')} className="hover:text-[#0667d0] cursor-pointer">
            Trang chủ
          </button>
          <button onClick={() => onNavigate('search')} className="hover:text-[#0667d0] cursor-pointer">
            Sản phẩm
          </button>
          <button onClick={() => onNavigate('service')} className="hover:text-[#0667d0] cursor-pointer">
            Dịch vụ chăm sóc
          </button>
          <button onClick={() => onNavigate('contact')} className="hover:text-[#0667d0] cursor-pointer">
            Liên hệ
          </button>
        </div>
      </div>
    </footer>
  );
};

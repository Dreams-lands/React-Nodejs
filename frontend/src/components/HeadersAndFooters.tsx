import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  ChevronDown,
  Headphones,
  Mail,
  ShieldCheck,
  PawPrint,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import type { PageId } from '../data/mockData';

interface FullHeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  cartTotal: string;
  showFlashSale?: boolean;
}

export const PetHubHeader: React.FC<FullHeaderProps> = ({
  currentPage,
  onNavigate,
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  showFlashSale,
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search');
  };

  return (
    <header className="w-full bg-white border-b border-[#dfe6f0]">
      {/* 1. Top Orange Announcement Bar (#ff641f, height 32px) */}
      <div className="w-full h-8 bg-[#ff641f] text-white px-6 lg:px-16 flex items-center justify-between text-xs">
        <p className="font-normal truncate">
          Một chút tình yêu, được chuyển giao. Miễn phí vận chuyển cho đơn hàng từ 499.000₫
        </p>
        <div className="hidden md:flex items-center gap-3 text-[11px] font-semibold shrink-0">
          <button onClick={() => onNavigate('search')} className="hover:underline cursor-pointer">
            Cửa hàng của chúng tôi
          </button>
          <span className="opacity-50">|</span>
          <button
            onClick={() => onNavigate('checkout-success')}
            className="hover:underline cursor-pointer"
          >
            Theo dõi đơn hàng của bạn
          </button>
          <span className="opacity-50">|</span>
          <span>VN/VN</span>
        </div>
      </div>

      {/* 2. Main Header (height 98px) */}
      <div className="max-w-[1440px] mx-auto h-[98px] px-6 lg:px-16 flex items-center justify-between gap-6 lg:gap-9">
        {/* Brand Logo */}
        <motion.button
          onClick={() => onNavigate('home')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 text-left cursor-pointer shrink-0 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#fff2e9] flex items-center justify-center text-[#ff641f] group-hover:rotate-12 transition-transform duration-300">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[31px] font-normal text-[#0874e8] leading-none tracking-tight">
              pethub.
            </div>
            <div className="text-[9px] font-bold text-[#587085] tracking-wider uppercase mt-1">
              VẬT NUÔI VUI VẺ. CHÚC BẠN VUI VẺ.
            </div>
          </div>
        </motion.button>

        {/* Live Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-[680px] h-[46px] rounded-[4px] border-2 border-[#0874e8] bg-white flex items-center overflow-hidden focus-within:shadow-[0_0_0_4px_rgba(8,116,232,0.15)] transition-shadow"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentPage !== 'search') onNavigate('search');
            }}
            placeholder="Tìm kiếm thức ăn, đồ chơi, nhãn hiệu và mọi thứ mà thú cưng của bạn yêu thích…"
            className="flex-1 px-4 text-[13px] text-[#17324d] placeholder-[#587085] focus:outline-none"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="w-[44px] h-[38px] mr-1 rounded-[3px] bg-[#0874e8] hover:bg-[#1464f4] text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Account & Cart */}
        <div className="flex items-center gap-6 shrink-0">
          <motion.button
            onClick={() => onNavigate('login')}
            whileHover={{ y: -2 }}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#eff5ff] flex items-center justify-center text-[#0874e8] group-hover:bg-[#0874e8] group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#587085]">Xin chào bố mẹ thú cưng</div>
              <div className="text-[13px] font-bold text-[#17324d] group-hover:text-[#0874e8] transition-colors">
                Tài khoản của tôi
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => onNavigate('cart')}
            whileHover={{ y: -2 }}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-full bg-[#eff5ff] flex items-center justify-center text-[#0874e8] group-hover:bg-[#0874e8] group-hover:text-white transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff641f] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <div>
              <div className="text-[10px] text-[#587085]">Giỏ hàng ({cartCount})</div>
              <div className="text-[13px] font-bold text-[#17324d]">{cartTotal}</div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* 3. Mega-Menu Navigation Bar (#0874e8, height 50px) */}
      <div className="w-full h-[50px] bg-[#0874e8] text-white">
        <div className="max-w-[1440px] mx-auto h-full px-6 lg:px-16 flex items-center justify-between">
          <div className="flex items-center gap-7 text-[14px]">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 font-bold cursor-pointer py-1.5 px-3 rounded-md transition ${
                currentPage === 'home' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => onNavigate('search')}
              className={`flex items-center gap-2 font-bold cursor-pointer py-1.5 px-2.5 rounded-md transition ${
                currentPage === 'search' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span>Mua sắm tất cả</span>
            </button>

            <button
              onClick={() => onNavigate('dogs')}
              className={`flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-md transition ${
                currentPage === 'dogs' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 font-normal'
              }`}
            >
              <span>Chó cưng</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => onNavigate('cats')}
              className={`flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-md transition ${
                currentPage === 'cats' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 font-normal'
              }`}
            >
              <span>Mèo cưng</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => onNavigate('service')}
              className={`flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-md transition ${
                currentPage === 'service' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 font-normal'
              }`}
            >
              <span>Dịch vụ Spa & Hotel</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showFlashSale && (
              <button
                onClick={() => onNavigate('search')}
                className="hidden md:flex items-center gap-1.5 text-[#ffb547] font-bold cursor-pointer hover:opacity-90"
              >
                <span>Giảm giá chớp nhoáng</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[13px] font-semibold">
            <Headphones className="w-4 h-4" />
            <span>Đường dây chăm sóc: 1900 6868</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export const PetHubFooter: React.FC<{ onNavigate: (p: PageId) => void }> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white mt-12">
      {/* Newsletter Banner (#0874e8) */}
      <div className="w-full bg-[#0874e8] py-7 px-6 lg:px-16">
        <div className="max-w-[1312px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[20px] lg:text-[23px] font-extrabold leading-snug">
                Những điều tốt đẹp cho bạn. Những điều tuyệt vời cho thú cưng của bạn.
              </h3>
              <p className="text-[13px] text-white/85">
                Tham gia gói để nhận các ưu đãi độc quyền, mẹo chăm sóc thú cưng và thêm một chút niềm vui.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onNavigate('register');
            }}
            className="w-full lg:w-[440px] h-[46px] bg-white rounded-[4px] p-1 flex items-center shrink-0"
          >
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="flex-1 px-3 text-[12px] text-[#17324d] placeholder-[#587085] focus:outline-none"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="h-full px-4 rounded-[3px] bg-[#ff6b24] hover:bg-[#ff641f] text-white text-[12px] font-bold cursor-pointer transition"
            >
              Tham gia nhóm →
            </motion.button>
          </form>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-[#dfe6f0]">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <PawPrint className="w-6 h-6 text-[#ff641f]" />
            <span className="text-[29px] text-[#0874e8] leading-none">pethub.</span>
          </div>
          <p className="text-[13px] text-[#587085] leading-relaxed mb-4">
            Cuộc sống hàng ngày tốt đẹp hơn cho thú cưng ở Việt Nam. Những thứ cần thiết cao cấp.
            Chăm sóc chuyên nghiệp. Tất cả trong một trung tâm.
          </p>
          <p className="text-[12px] text-[#17324d] leading-relaxed whitespace-pre-line mb-4">
            {'1900 6868 • hello@pethub.vn\n128 Nguyễn Trãi, Quận 1, TP.HCM\nMở cửa hàng ngày, 8:00–21:00'}
          </p>
          <div className="flex items-center gap-2">
            {['Facebook', 'Instagram', 'Zalo'].map((soc) => (
              <span
                key={soc}
                className="px-2.5 py-1 rounded border border-[#dfe6f0] text-[10px] font-bold text-[#2161ed] hover:bg-[#eff5ff] cursor-pointer transition"
              >
                {soc}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[14px] font-extrabold text-[#17324d] mb-4">
            Khám phá trung tâm thú cưng
          </h4>
          <ul className="space-y-2.5 text-[12px] text-[#587085]">
            <li>
              <button onClick={() => onNavigate('dogs')} className="hover:text-[#0874e8] cursor-pointer">
                Về chúng tôi
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('search')} className="hover:text-[#0874e8] cursor-pointer">
                Cửa hàng của chúng tôi
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('search')} className="hover:text-[#0874e8] cursor-pointer">
                Spa & Chăm sóc thú cưng
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('cats')} className="hover:text-[#0874e8] cursor-pointer">
                Khách sạn thú cưng
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('profile')} className="hover:text-[#0874e8] cursor-pointer">
                Tạp chí chăm sóc thú cưng
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[14px] font-extrabold text-[#17324d] mb-4">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2.5 text-[12px] text-[#587085]">
            <li>
              <button onClick={() => onNavigate('login')} className="hover:text-[#0874e8] cursor-pointer">
                Tài khoản & Đăng nhập
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('register')} className="hover:text-[#0874e8] cursor-pointer">
                Đăng ký hội viên PetHub
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('checkout-success')}
                className="hover:text-[#0874e8] cursor-pointer"
              >
                Thông tin giao hàng
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('checkout-fail')}
                className="hover:text-[#0874e8] cursor-pointer"
              >
                Trả lại và hoàn tiền
              </button>
            </li>
            <li>
              <span className="hover:text-[#0874e8] cursor-pointer">Chính sách bảo mật</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[14px] font-extrabold text-[#17324d] mb-4">
            Thanh toán dễ dàng, an toàn
          </h4>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1.5 rounded border border-[#dfe6f0] text-[13px] font-extrabold text-[#0874e8]">
              VnPay
            </span>
            <span className="px-3 py-1.5 rounded border border-[#dfe6f0] text-[13px] font-extrabold text-[#b7247d]">
              MoMo
            </span>
            <span className="px-3 py-1.5 rounded border border-[#dfe6f0] text-[13px] font-extrabold text-[#17324d]">
              COD
            </span>
          </div>
          <p className="text-[11px] text-[#587085] leading-relaxed mb-4">
            Thanh toán trực tuyến hoặc bằng tiền mặt khi giao hàng. Tất cả giá đều được tính bằng
            đồng Việt Nam (₫).
          </p>
          <div className="flex items-center gap-2.5 text-[11px] text-[#17324d]">
            <ShieldCheck className="w-5 h-5 text-[#0874e8] shrink-0" />
            <span>Sản phẩm đích thực. Thú cưng hạnh phúc, được đảm bảo.</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#587085] gap-2">
        <span>© 2026 Pet Hub Việt Nam. Mọi quyền được bảo lưu.</span>
        <span className="text-[#35609a]">
          Dành cho những người làm cho cuộc sống của bạn tươi sáng hơn. ♡
        </span>
      </div>
    </footer>
  );
};

/* ============================================================================
 * COMPACT HEADER & FOOTER ("NHÀ THÚ CƯNG")
 * Used on: Đăng nhập, Đăng ký, Thanh toán thành công, Thanh toán thất bại
 * ============================================================================ */
export const CompactHeader: React.FC<{
  onNavigate: (p: PageId) => void;
  onSearchSubmit?: (q: string) => void;
}> = ({ onNavigate }) => {
  return (
    <header className="w-full bg-white border-b border-[#dfe6f0]">
      {/* Top bar (#1464f4, height 32px) */}
      <div className="w-full h-8 bg-[#1464f4] text-white flex items-center justify-center text-[12px] font-medium">
        Yêu thương đúng cách. Chăm sóc mỗi ngày.
      </div>

      {/* Main Nav (height 96px, padding 80px) */}
      <div className="max-w-[1440px] mx-auto h-24 px-6 lg:px-20 flex items-center justify-between gap-8">
        <motion.button
          onClick={() => onNavigate('dogs')}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 text-left cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#fff2e9] flex items-center justify-center text-[#ff641f]">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[20px] font-extrabold text-[#1464f4] tracking-tight leading-none">
              NHÀ THÚ CƯNG
            </div>
            <div className="text-[10px] font-semibold text-[#647083] tracking-widest uppercase mt-1">
              TRỌN VẸN YÊU THƯƠNG
            </div>
          </div>
        </motion.button>

        <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#17324d]">
          <button
            onClick={() => onNavigate('dogs')}
            className="hover:text-[#1464f4] transition cursor-pointer"
          >
            Thú cưng
          </button>
          <button
            onClick={() => onNavigate('search')}
            className="hover:text-[#1464f4] transition cursor-pointer"
          >
            Thức ăn
          </button>
          <button
            onClick={() => onNavigate('search')}
            className="hover:text-[#1464f4] transition cursor-pointer"
          >
            Phụ kiện
          </button>
        </nav>

        <div
          onClick={() => onNavigate('search')}
          className="flex-1 max-w-[583px] h-[42px] rounded-lg bg-[#f3f7ff] px-3.5 flex items-center gap-3 text-[#647083] text-[13px] cursor-pointer hover:ring-2 hover:ring-[#1464f4]/30 transition"
        >
          <Search className="w-4 h-4 text-[#1464f4]" />
          <span>Tìm điều bé yêu cần...</span>
        </div>

        <motion.button
          onClick={() => onNavigate('cart')}
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-2.5 text-[#1464f4] font-bold text-[14px] cursor-pointer shrink-0"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Giỏ hàng</span>
        </motion.button>
      </div>
    </header>
  );
};

export const CompactFooter: React.FC<{ onNavigate: (p: PageId) => void }> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white">
      <div className="w-full h-[84px] bg-[#f3f7ff] flex items-center justify-center gap-3 px-4 text-[13px]">
        <Headphones className="w-5 h-5 text-[#1464f4]" />
        <span className="text-[#647083]">Bạn cần hỗ trợ về đơn hàng?</span>
        <span className="font-bold text-[#1464f4]">1900 8899</span>
        <span className="text-[#dfe6f0]">|</span>
        <span className="text-[#647083]">8:00 – 21:00 mỗi ngày</span>
      </div>

      <div className="max-w-[1440px] mx-auto h-[72px] px-6 lg:px-20 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#7c8798] gap-2">
        <span>© 2026 Nhà Thú Cưng. Trọn vẹn yêu thương.</span>
        <div className="flex items-center gap-7">
          <button onClick={() => onNavigate('dogs')} className="hover:text-[#1464f4] cursor-pointer">
            Chính sách bảo mật
          </button>
          <button onClick={() => onNavigate('search')} className="hover:text-[#1464f4] cursor-pointer">
            Điều khoản mua hàng
          </button>
          <button onClick={() => onNavigate('login')} className="hover:text-[#1464f4] cursor-pointer">
            Liên hệ
          </button>
        </div>
      </div>
    </footer>
  );
};

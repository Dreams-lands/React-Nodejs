import type { ProductSubType } from './categories';

export type PageId =
  | 'home'
  | 'search'
  | 'promotions'
  | 'account'
  | 'product'
  | 'service'
  | 'contact'
  | 'cart'
  | 'login'
  | 'register'
  | 'checkout-success'
  | 'checkout-fail'
  | 'admin';

export type ProductCategory = 'food' | 'bed' | 'backpack' | 'hygiene' | 'spa';

export type OrderStatus = 'pending' | 'shipping' | 'completed' | 'cancelled';

export type PaymentMethodId = 'vnpay' | 'momo' | 'cod';
export type DeliveryMethodId = 'delivery' | 'pickup';

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; cls: string; badgeClass: string }
> = {
  pending: {
    label: 'Chờ xác nhận',
    cls: 'bg-[#fff2e9] text-[#c2410c]',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  shipping: {
    label: 'Đang giao hàng',
    cls: 'bg-[#eff5ff] text-[#0667d0]',
    badgeClass: 'bg-[#eff5ff] text-[#0667d0] border border-[#c7dcff]',
  },
  completed: {
    label: 'Hoàn thành',
    cls: 'bg-emerald-50 text-emerald-700',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  cancelled: {
    label: 'Đã hủy',
    cls: 'bg-rose-50 text-rose-700',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
};

export interface AddressRecord {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant?: string;
  }[];
}

export interface LookupOrderEntry extends OrderRecord {
  deliveryMethod: DeliveryMethodId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  staffName?: string;
  isGuest?: boolean;
}

export interface ServiceBookingRecord {
  id: string;
  serviceName: string;
  petName: string;
  date: string;
  timeSlot: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  note?: string;
  customerName?: string;
  customerPhone?: string;
  staffName?: string;
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}₫`;
}

export interface ProductReview {
  id: string;
  author: string;
  petTag: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
}

export interface ProductItem {
  id: string;
  brand: string;
  name: string;
  shortDesc: string;
  description: string;
  packSize: string;
  sizes: string[];
  rating: number;
  reviewCount: number;
  priceNum: number;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  badge: string;
  category: ProductCategory;
  subType: ProductSubType;
  petType?: 'dog' | 'cat' | 'both';
  image: string;
  gallery: string[];
  bgTone: string;
  stockCount: number;
  highlights: string[];
  isFeatured?: boolean;
  isFlashSale?: boolean;
  soldCount?: number;
  totalStock?: number;
  reviews: ProductReview[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  desc: string;
  price: number;
  priceStr: string;
  quantity: number;
  image: string;
  category: string;
}

export interface SpaPackage {
  id: string;
  name: string;
  desc: string;
  price: number;
  priceStr: string;
  duration: string;
  isPopular?: boolean;
}

export const STOREFRONT_SUPPLIES = [
  {
    id: 'sup-food',
    filterCategory: 'food' as const,
    title: 'Dinh dưỡng & Pate',
    desc: 'Hạt khô, pate tươi nguyên miếng và bánh thưởng nhập khẩu chính ngạch.',
    meta: '120+ sản phẩm đạt chuẩn AAFCO',
    image: '/images/prod-tuna-pate.jpg',
  },
  {
    id: 'sup-hygiene',
    filterCategory: 'hygiene' as const,
    title: 'Thuốc & Làm đẹp',
    desc: 'Thuốc trị nấm da, nhỏ gáy ve rận và sữa tắm dưỡng lông dịu nhẹ cho chó mèo.',
    meta: 'Kiểm định an toàn cho chó mèo',
    image: '/images/prod-antifungal-cream.jpg',
  },
  {
    id: 'sup-bed',
    filterCategory: 'bed' as const,
    title: 'Nệm & Không gian nghỉ',
    desc: 'Chất liệu tự nhiên, êm ái, thoáng khí và dễ tháo rời vệ sinh.',
    meta: 'Thiết kế tối giản cho ngôi nhà hiện đại',
    image: 'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?auto=format&fit=crop&w=700&q=85',
  },
  {
    id: 'sup-carrier',
    filterCategory: 'backpack' as const,
    title: 'Balo & Phụ kiện',
    desc: 'Gọn nhẹ, chống sốc và thông gió tối ưu trên mọi hành trình.',
    meta: 'Phù hợp dạo phố và di chuyển đường dài',
    image: 'https://images.unsplash.com/photo-1527150602-a98f7a6f2746?auto=format&fit=crop&w=700&q=85',
  },
];

export const CATALOG_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-rc-mini',
    brand: 'ROYAL CANIN',
    name: 'Hạt dinh dưỡng cho chó giống nhỏ Mini Adult',
    shortDesc: 'Công thức cân bằng năng lượng, hỗ trợ tiêu hóa và duy trì bộ lông óng mượt.',
    description:
      'Sản phẩm được thiết kế chuyên biệt cho chó trưởng thành giống nhỏ (dưới 10kg), bổ sung L-Carnitine hỗ trợ chuyển hóa chất béo cùng EPA/DHA nuôi dưỡng da và lông khỏe mạnh mỗi ngày.',
    packSize: 'Chó trưởng thành • 2 kg',
    sizes: ['2 kg', '4 kg', '8 kg'],
    rating: 4.9,
    reviewCount: 128,
    priceNum: 389000,
    price: '389.000₫',
    originalPrice: '489.000₫',
    discountBadge: '−20%',
    badge: 'ƯU ĐÃI −20%',
    category: 'food',
    subType: 'Dinh dưỡng & Hạt khô',
    petType: 'dog',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1764249453891-84799ed79e9e?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1714068691210-073dc52c6c1d?auto=format&fit=crop&w=900&q=85',
    ],
    bgTone: '#eff5ff',
    stockCount: 22,
    highlights: [
      'Hạt nhỏ dễ nhai, giảm tích tụ cao răng',
      'Bổ sung Omega-3 & Omega-6 giúp lông mềm mượt',
      'Nhập khẩu chính hãng từ Pháp, tem phụ đầy đủ',
    ],
    isFeatured: false,
    isFlashSale: true,
    soldCount: 68,
    totalStock: 90,
    reviews: [
      {
        id: 'rev-1',
        author: 'Minh Thư',
        petTag: 'Nuôi Poodle 3 tuổi',
        rating: 5,
        date: '18/10/2026',
        verified: true,
        comment: 'Bé nhà mình kén ăn nhưng rất hợp hạt này. Phân đẹp, ít mùi và lông mượt hơn hẳn sau 3 tuần.',
      },
      {
        id: 'rev-2',
        author: 'Quốc Bảo',
        petTag: 'Nuôi Phốc Sóc',
        rating: 5,
        date: '12/10/2026',
        verified: true,
        comment: 'Đóng gói kỹ, hạn sử dụng xa. Giao hàng trong nội thành chỉ khoảng 2 tiếng là nhận được.',
      },
      {
        id: 'rev-3',
        author: 'Lan Anh',
        petTag: 'Nuôi Bichon',
        rating: 4,
        date: '05/10/2026',
        verified: true,
        comment: 'Hạt thơm dịu không bị gắt mùi dầu, kích thước hạt vừa miệng chó nhỏ.',
      },
    ],
  },
  {
    id: 'prod-rc-kitten',
    brand: 'ROYAL CANIN',
    name: 'Hạt dinh dưỡng cho mèo con Kitten',
    shortDesc: 'Tăng cường đề kháng tự nhiên và hỗ trợ phát triển hệ tiêu hóa non nớt.',
    description:
      'Công thức giàu protein dễ tiêu hóa (L.I.P) kết hợp Prebiotics và phức hợp chống oxy hóa vitamin E & C, giúp mèo con từ 4–12 tháng tuổi phát triển khung xương vững chắc.',
    packSize: 'Mèo con 4–12 tháng • 2 kg',
    sizes: ['400 g', '2 kg', '4 kg'],
    rating: 4.9,
    reviewCount: 86,
    priceNum: 465000,
    price: '465.000₫',
    badge: 'BÁN CHẠY',
    category: 'food',
    subType: 'Dinh dưỡng & Hạt khô',
    petType: 'cat',
    image: 'https://images.unsplash.com/photo-1734655154254-69d1d67f6a4e?auto=format&fit=crop&w=800&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1734655154254-69d1d67f6a4e?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1633761971690-ee5f3aca8415?auto=format&fit=crop&w=800&q=85',
    ],
    bgTone: '#eff5ff',
    stockCount: 34,
    highlights: [
      'Hỗ trợ hệ miễn dịch trong giai đoạn tăng trưởng',
      'Giàu chất xơ hòa tan giúp tiêu hóa ổn định',
      'Hạt tam giác nhỏ phù hợp hàm răng mèo con',
    ],
    isFeatured: true,
    reviews: [
      {
        id: 'rev-k1',
        author: 'Hoàng Nam',
        petTag: 'Nuôi mèo Anh lông ngắn',
        rating: 5,
        date: '20/10/2026',
        verified: true,
        comment: 'Mèo nhà mình ăn từ lúc 4 tháng tới giờ trộm vía mập mạp, không bị tiêu chảy khi đổi hạt.',
      },
      {
        id: 'rev-k2',
        author: 'Thảo Vy',
        petTag: 'Nuôi Ragdoll 6 tháng',
        rating: 5,
        date: '14/10/2026',
        verified: true,
        comment: 'Hàng chính hãng có mã QR kiểm tra đầy đủ, túi zip bảo quản rất tiện.',
      },
    ],
  },
  {
    id: 'prod-nutri-dog',
    brand: 'NUTRISOURCE',
    name: 'Hạt cao cấp vị thịt gà tươi & gạo lứt',
    shortDesc: 'Bổ sung lợi khuẩn Good 4 Life cho đường ruột khỏe và khả năng hấp thu tối đa.',
    description:
      'Nguồn đạm chính từ thịt gà tươi kết hợp ngũ cốc nguyên hạt và lợi khuẩn tự nhiên, không chất bảo quản nhân tạo, phù hợp cho chó nhạy cảm với tiêu hóa.',
    packSize: 'Mọi giống chó • 2,5 kg',
    sizes: ['2,5 kg', '6 kg', '12 kg'],
    rating: 4.9,
    reviewCount: 64,
    priceNum: 425000,
    price: '425.000₫',
    originalPrice: '475.000₫',
    discountBadge: '−11%',
    badge: 'ƯU ĐÃI −11%',
    category: 'food',
    subType: 'Dinh dưỡng & Hạt khô',
    petType: 'dog',
    image: 'https://images.unsplash.com/photo-1764249453891-84799ed79e9e?auto=format&fit=crop&w=800&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1764249453891-84799ed79e9e?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=85',
    ],
    bgTone: '#f3f7ff',
    stockCount: 18,
    highlights: [
      'Sản xuất tại Mỹ theo chuẩn dinh dưỡng AAFCO',
      'Không chứa phụ phẩm công nghiệp hay phẩm màu',
      'Giảm rụng lông và tăng độ bóng mượt tự nhiên',
    ],
    isFeatured: false,
    reviews: [
      {
        id: 'rev-n1',
        author: 'Đức Minh',
        petTag: 'Nuôi Corgi 2 tuổi',
        rating: 5,
        date: '19/10/2026',
        verified: true,
        comment: 'Dòng này ít muối hơn nhiều loại phổ thông nên bé uống nước vừa phải, không bị chảy nước mắt.',
      },
    ],
  },
  {
    id: 'prod-vet-antifungal-spray',
    brand: 'VET CARE',
    name: 'Xịt đặc trị nấm da & viêm da cho chó (100ml)',
    shortDesc: 'Công thức kháng nấm Chlorhexidine & Ketoconazole làm dịu ngứa và phục hồi vùng da tổn thương.',
    description:
      'Dung dịch xịt ngoài da phổ rộng chuyên xử lý nấm vòng, ghẻ rụng lông, mẩn đỏ và viêm da tiết bã ở chó. Khô nhanh, không gây nhờn rít và an toàn khi liếm nhẹ sau khi khô.',
    packSize: 'Dành cho Chó • Chai xịt 100 ml',
    sizes: ['100 ml', '250 ml'],
    rating: 4.9,
    reviewCount: 114,
    priceNum: 195000,
    price: '195.000₫',
    originalPrice: '235.000₫',
    discountBadge: '−17%',
    badge: 'CHUẨN THÚ Y',
    category: 'hygiene',
    subType: 'Thuốc & Điều trị',
    petType: 'dog',
    image: '/images/prod-antifungal-spray.jpg',
    gallery: [
      '/images/prod-antifungal-spray.jpg',
      '/images/prod-antifungal-cream.jpg',
    ],
    bgTone: '#f3f7ff',
    stockCount: 30,
    highlights: [
      'Kháng nấm & vi khuẩn bề mặt da sau 3–5 ngày sử dụng đều đặn',
      'Không chứa cồn gây xót trên vùng da đang trầy nhẹ',
      'Đầu xịt phun sương mịn dễ len vào kẽ lông dày',
    ],
    isFeatured: false,
    isFlashSale: true,
    reviews: [
      {
        id: 'rev-vs1',
        author: 'Minh Quân',
        petTag: 'Nuôi Corgi 2 tuổi',
        rating: 5,
        date: '04/11/2026',
        verified: true,
        comment: 'Bé nhà mình bị nấm đồng tiền ở tai, xịt 4 ngày là khô vảy và mọc lông tơ lại rồi.',
      },
      {
        id: 'rev-vs2',
        author: 'Thu Hà',
        petTag: 'Nuôi Poodle',
        rating: 5,
        date: '29/10/2026',
        verified: true,
        comment: 'Không bị mùi hóa chất hắc, bé rất hợp tác mỗi lần xịt.',
      },
    ],
  },
  {
    id: 'prod-vetderm-cream',
    brand: 'VETDERM',
    name: 'Kem bôi trị nấm kẽ chân & vành tai cho mèo (20g)',
    shortDesc: 'Miconazole Nitrate 2% dịu nhẹ, đặc trị nấm kẽ chân, tai và vùng da nhạy cảm ở mèo.',
    description:
      'Tuýp kem bôi da chuyên dụng thẩm thấu nhanh cho các vùng da khu trú như kẽ chân, vành tai, khóe mũi ở mèo. Hỗ trợ tái tạo biểu bì và ngăn nấm tái phát.',
    packSize: 'Dành cho Mèo • Tuýp 20 g',
    sizes: ['Tuýp 20 g', 'Combo 2 tuýp'],
    rating: 4.9,
    reviewCount: 92,
    priceNum: 145000,
    price: '145.000₫',
    originalPrice: '175.000₫',
    discountBadge: '−17%',
    badge: 'ĐẶC TRỊ NẤM',
    category: 'hygiene',
    subType: 'Thuốc & Điều trị',
    petType: 'cat',
    image: '/images/prod-antifungal-cream.jpg',
    gallery: [
      '/images/prod-antifungal-cream.jpg',
      '/images/prod-antifungal-spray.jpg',
    ],
    bgTone: '#eff5ff',
    stockCount: 24,
    highlights: [
      'Hoạt chất Miconazole 2% chuẩn khuyến nghị thú y',
      'Chất kem mỏng nhẹ, không làm bết dính lông xung quanh',
      'Hiệu quả rõ cho nấm vành tai và kẽ chân ở mèo',
    ],
    reviews: [
      {
        id: 'rev-vc1',
        author: 'Bảo Ngọc',
        petTag: 'Nuôi mèo Anh lông ngắn',
        rating: 5,
        date: '02/11/2026',
        verified: true,
        comment: 'Bôi vào vành tai cho bé trước khi đi ngủ rất nhanh thấm, hết đỏ hẳn sau 5 ngày.',
      },
    ],
  },
  {
    id: 'prod-petguard-flea',
    brand: 'PETGUARD',
    name: 'Thuốc nhỏ gáy phòng ve rận & bọ chét cho chó',
    shortDesc: 'Hộp 3 tuýp đơn liều bảo vệ liên tục 90 ngày, không thấm nước sau 24 giờ.',
    description:
      'Giải pháp nhỏ gáy tiện lợi giúp tiêu diệt và phòng ngừa ve chó, bọ chét, rận tai suốt 3 tháng. Chỉ cần rẽ lông vùng sau gáy và nhỏ trực tiếp một lần mỗi tháng.',
    packSize: 'Dành cho Chó • Hộp 3 tuýp',
    sizes: ['Dưới 10 kg (3 tuýp)', '10–25 kg (3 tuýp)'],
    rating: 4.8,
    reviewCount: 83,
    priceNum: 165000,
    price: '165.000₫',
    badge: 'PHÒNG KÝ SINH',
    category: 'hygiene',
    subType: 'Thuốc & Điều trị',
    petType: 'dog',
    image: '/images/prod-flea-drops.jpg',
    gallery: [
      '/images/prod-flea-drops.jpg',
    ],
    bgTone: '#f3f7ff',
    stockCount: 27,
    highlights: [
      'Phòng và diệt ve rận chỉ sau 24 giờ nhỏ gáy',
      'Chia sẵn 3 tuýp đơn liều tiện bảo quản',
      'Phù hợp cho mọi giống chó từ 8 tuần tuổi',
    ],
    reviews: [
      {
        id: 'rev-pg1',
        author: 'Trung Hiếu',
        petTag: 'Nuôi Golden 3 tuổi',
        rating: 5,
        date: '28/10/2026',
        verified: true,
        comment: 'Nhỏ buổi tối là sáng hôm sau thấy rận rụng sạch, bé hết gãi.',
      },
    ],
  },
  {
    id: 'prod-gourmet-chicken-pate',
    brand: 'FELINE FEAST',
    name: 'Pate tươi cho mèo thịt gà xé & cá ngừ hấp (Lon 160g)',
    shortDesc: 'Thịt ức gà xé sợi hòa quyện cá ngừ tươi trong thạch giàu đạm, không ngũ cốc.',
    description:
      'Chế biến từ ức gà tươi và thăn cá ngừ hấp chín chậm giữ trọn vị ngọt tự nhiên cùng nước súp thanh mát, bổ sung Vitamin E & Taurine cho mèo biếng ăn.',
    packSize: 'Dành cho Mèo • Lon 160 g',
    sizes: ['Lẻ 1 lon (160g)', 'Lốc 6 lon', 'Thùng 24 lon'],
    rating: 4.9,
    reviewCount: 105,
    priceNum: 38000,
    price: '38.000₫',
    originalPrice: '45.000₫',
    discountBadge: '−16%',
    badge: 'PATE TƯƠI',
    category: 'food',
    subType: 'Pate & Bánh thưởng',
    petType: 'cat',
    image: '/images/prod-chicken-pate.jpg',
    gallery: [
      '/images/prod-chicken-pate.jpg',
      '/images/prod-tuna-pate.jpg',
    ],
    bgTone: '#fff5f0',
    stockCount: 48,
    highlights: [
      '100% thịt thật xé sợi, không bột độn hay chất tạo đặc',
      'Giúp cấp nước tự nhiên cho mèo lười uống nước',
      'Trộn hạt khô kích thích ăn ngon miệng rõ rệt',
    ],
    isFeatured: false,
    isFlashSale: true,
    reviews: [
      {
        id: 'rev-gp1',
        author: 'Nhã Phương',
        petTag: 'Nuôi mèo Munchkin',
        rating: 5,
        date: '06/11/2026',
        verified: true,
        comment: 'Mở lon ra thấy rõ từng thớ thịt gà và cá ngừ thơm phức, mèo nhà mình mê tít.',
      },
    ],
  },
  {
    id: 'prod-cloud-bed',
    brand: 'PETSFRIEND HOME',
    name: 'Nệm tròn lông cừu Cloud Comfort cho chó',
    shortDesc: 'Vỏ cotton pha lông cừu mềm mại, ruột bông 3D giữ form êm ái quanh năm.',
    description:
      'Thiết kế vành ôm 360 độ tạo cảm giác an toàn cho cún cưng khi cuộn tròn nghỉ ngơi. Vỏ ngoài trang bị khóa kéo ẩn, dễ dàng tháo rời giặt máy mà không bị xù lông.',
    packSize: 'Dành cho Chó • Size M (60 × 50 cm)',
    sizes: ['Size S (50cm)', 'Size M (60cm)', 'Size L (75cm)'],
    rating: 4.9,
    reviewCount: 52,
    priceNum: 590000,
    price: '590.000₫',
    badge: 'THIẾT KẾ MỚI',
    category: 'bed',
    subType: 'Giường - Nệm - Thảm',
    petType: 'dog',
    image: 'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?auto=format&fit=crop&w=800&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1778688634407-afca58da6670?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1723187283804-2d774cb11dad?auto=format&fit=crop&w=800&q=85',
    ],
    bgTone: '#eff5ff',
    stockCount: 15,
    highlights: [
      'Đế hạt cao su chống trượt bám sàn gỗ',
      'Vỏ tháo rời giặt máy không biến dạng',
      'Tông màu trung tính hài hòa nội thất hiện đại',
    ],
    isFeatured: true,
    reviews: [
      {
        id: 'rev-b1',
        author: 'Hải Yến',
        petTag: 'Nuôi Corgi',
        rating: 5,
        date: '21/10/2026',
        verified: true,
        comment: 'Nệm rất dày dặn, đường may chắc chắn. Bé nhà mình nằm suốt từ ngày mang về.',
      },
      {
        id: 'rev-b2',
        author: 'Tuấn Kiệt',
        petTag: 'Nuôi Shiba',
        rating: 5,
        date: '09/10/2026',
        verified: true,
        comment: 'Giặt máy 2 lần rồi vẫn giữ độ phồng tốt, mặt đáy bám sàn không bị xê dịch.',
      },
    ],
  },
  {
    id: 'prod-travel-bag',
    brand: 'PET TRAVEL',
    name: 'Balo phi hành gia vận chuyển mèo chống sốc',
    shortDesc: 'Khung cứng giữ dáng, lưới thoáng 3 mặt giúp mèo cưng thoải mái khi ra ngoài.',
    description:
      'Chất liệu vải Oxford chống thấm nhẹ kết hợp khung nâng đỡ chắc chắn giúp balo không bị xẹp khi đeo. Trang bị dây cài an toàn bên trong và đệm lưng trợ lực êm ái.',
    packSize: 'Dành cho Mèo • Dưới 8 kg',
    sizes: ['Tiêu chuẩn (< 6kg)', 'Mở rộng (< 8kg)'],
    rating: 4.8,
    reviewCount: 41,
    priceNum: 520000,
    price: '520.000₫',
    originalPrice: '580.000₫',
    discountBadge: '−10%',
    badge: 'ƯU ĐÃI −10%',
    category: 'backpack',
    subType: 'Địu - Balo - Túi xách',
    petType: 'cat',
    image: 'https://images.unsplash.com/photo-1527150602-a98f7a6f2746?auto=format&fit=crop&w=800&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1527150602-a98f7a6f2746?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1533413924355-a5797409980e?auto=format&fit=crop&w=800&q=85',
    ],
    bgTone: '#f3f7ff',
    stockCount: 12,
    highlights: [
      '3 mặt lưới thoáng khí, tránh hầm bí mùa nóng',
      'Trọng lượng siêu nhẹ chỉ 1,1 kg',
      'Đệm đáy tháo rời vệ sinh nhanh chóng',
    ],
    isFeatured: false,
    isFlashSale: true,
    reviews: [
      {
        id: 'rev-t1',
        author: 'Phương Linh',
        petTag: 'Nuôi mèo 5kg',
        rating: 5,
        date: '16/10/2026',
        verified: true,
        comment: 'Đeo đi tiêm phòng rất nhẹ vai, lưới thoáng nên bé không bị hoảng hay nóng.',
      },
    ],
  },
  {
    id: 'prod-meo-tuna',
    brand: 'ME-O',
    name: 'Hạt dinh dưỡng cho mèo trưởng thành vị cá biển',
    shortDesc: 'Giàu Taurine bảo vệ thị lực và Vitamin C tăng cường hệ miễn dịch mỗi ngày.',
    description:
      'Công thức cân bằng khoáng chất giúp giảm nguy cơ sỏi tiết niệu ở mèo trưởng thành, kết hợp hương vị cá biển tự nhiên kích thích vị giác.',
    packSize: 'Mèo trưởng thành • 1,2 kg',
    sizes: ['1,2 kg', '3 kg'],
    rating: 4.8,
    reviewCount: 96,
    priceNum: 99000,
    price: '99.000₫',
    originalPrice: '129.000₫',
    discountBadge: '−23%',
    badge: 'ƯU ĐÃI −23%',
    category: 'food',
    subType: 'Dinh dưỡng & Hạt khô',
    petType: 'cat',
    image: 'https://images.unsplash.com/photo-1633761971690-ee5f3aca8415?auto=format&fit=crop&w=700&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1633761971690-ee5f3aca8415?auto=format&fit=crop&w=700&q=85',
      'https://images.unsplash.com/photo-1734655154254-69d1d67f6a4e?auto=format&fit=crop&w=700&q=85',
    ],
    bgTone: '#eff5ff',
    stockCount: 16,
    highlights: [
      'Bổ sung Taurine & Omega-3 tốt cho mắt và tim mạch',
      'Kiểm soát hàm lượng natri an toàn cho thận',
    ],
    isFlashSale: true,
    soldCount: 84,
    totalStock: 100,
    reviews: [
      {
        id: 'rev-m1',
        author: 'Gia Huy',
        petTag: 'Nuôi mèo mướp',
        rating: 5,
        date: '15/10/2026',
        verified: true,
        comment: 'Giá hợp lý, giao nhanh, bé ăn hết sạch mỗi bữa.',
      },
    ],
  },
  {
    id: 'prod-pedigree-beef',
    brand: 'PEDIGREE',
    name: 'Hạt dinh dưỡng cho chó lớn vị bò & rau củ',
    shortDesc: 'Cung cấp chất xơ, Canxi và đạm cân đối cho chó trưởng thành vận động nhiều.',
    description:
      'Kết hợp 5 nhóm dưỡng chất thiết yếu giúp cơ bắp săn chắc, xương khớp linh hoạt và hỗ trợ hệ tiêu hóa khỏe mạnh mỗi ngày.',
    packSize: 'Chó trưởng thành • 3 kg',
    sizes: ['1,5 kg', '3 kg', '8 kg'],
    rating: 4.8,
    reviewCount: 75,
    priceNum: 335000,
    price: '335.000₫',
    originalPrice: '419.000₫',
    discountBadge: '−20%',
    badge: 'ƯU ĐÃI −20%',
    category: 'food',
    subType: 'Dinh dưỡng & Hạt khô',
    petType: 'dog',
    image: 'https://images.unsplash.com/photo-1714068691210-073dc52c6c1d?auto=format&fit=crop&w=700&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1714068691210-073dc52c6c1d?auto=format&fit=crop&w=700&q=85',
      'https://images.unsplash.com/photo-1764249453891-84799ed79e9e?auto=format&fit=crop&w=700&q=85',
    ],
    bgTone: '#eff5ff',
    stockCount: 28,
    highlights: [
      'Giàu Canxi và Photpho giúp xương răng chắc khỏe',
      'Hương vị bò hầm rau củ dễ ăn',
    ],
    isFlashSale: true,
    soldCount: 52,
    totalStock: 80,
    reviews: [
      {
        id: 'rev-p1',
        author: 'Hoài An',
        petTag: 'Nuôi Golden 4 tuổi',
        rating: 5,
        date: '11/10/2026',
        verified: true,
        comment: 'Túi 3kg rất kinh tế, hạt giòn và thơm.',
      },
    ],
  },
  {
    id: 'prod-dentastix',
    brand: 'DENTASTIX',
    name: 'Thanh gặm sạch răng cho chó giống nhỏ',
    shortDesc: 'Thiết kế chữ X độc đáo hỗ trợ giảm tới 80% mảng bám và cao răng.',
    description:
      'Kết cấu dẻo dai vừa phải kết hợp kẽm Sulphate và STPP giúp làm sạch kẽ răng tự nhiên trong quá trình nhai, giữ hơi thở thơm tho.',
    packSize: 'Combo 7 thanh • 110 g',
    sizes: ['Gói 7 thanh (110g)', 'Hộp 28 thanh'],
    rating: 5.0,
    reviewCount: 142,
    priceNum: 85000,
    price: '85.000₫',
    originalPrice: '115.000₫',
    discountBadge: '−26%',
    badge: 'ƯU ĐÃI −26%',
    category: 'food',
    subType: 'Pate & Bánh thưởng',
    petType: 'dog',
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=700&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=700&q=85',
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=700&q=85',
    ],
    bgTone: '#fff5f0',
    stockCount: 8,
    highlights: [
      'Ít chất béo, không thêm đường',
      'Hỗ trợ vệ sinh răng miệng hằng ngày',
    ],
    isFlashSale: true,
    soldCount: 92,
    totalStock: 100,
    reviews: [
      {
        id: 'rev-d1',
        author: 'Ngọc Trâm',
        petTag: 'Nuôi Corgi 1 tuổi',
        rating: 5,
        date: '22/10/2026',
        verified: true,
        comment: 'Mỗi tối cho 1 thanh là bé rất thích, đỡ hẳn mùi hôi miệng.',
      },
    ],
  },
  {
    id: 'prod-whiskas-pate',
    brand: 'WHISKAS',
    name: 'Pate mềm vị cá ngừ đại dương (Combo 24 gói)',
    shortDesc: 'Cấp ẩm tự nhiên, giàu Omega-3 & Taurine cho mèo mọi lứa tuổi.',
    description:
      'Miếng thịt cá ngừ mềm mịn trong thạch thơm ngon giúp bổ sung nước hằng ngày, đặc biệt hữu ích với những bé mèo ít uống nước.',
    packSize: '24 gói × 85 g',
    sizes: ['Hộp 12 gói', 'Thùng 24 gói'],
    rating: 4.9,
    reviewCount: 74,
    priceNum: 320000,
    price: '320.000₫',
    originalPrice: '375.000₫',
    discountBadge: '−15%',
    badge: 'ƯU ĐÃI −15%',
    category: 'food',
    subType: 'Pate & Bánh thưởng',
    petType: 'cat',
    image: '/images/prod-tuna-pate.jpg',
    gallery: [
      '/images/prod-tuna-pate.jpg',
      '/images/prod-chicken-pate.jpg',
    ],
    bgTone: '#eff5ff',
    stockCount: 25,
    highlights: [
      'Tăng cường bổ sung nước giúp bảo vệ hệ tiết niệu',
      'Không phẩm màu, dễ trộn cùng hạt khô',
    ],
    reviews: [
      {
        id: 'rev-w1',
        author: 'Khánh Vy',
        petTag: 'Nuôi mèo ta',
        rating: 5,
        date: '14/10/2026',
        verified: true,
        comment: 'Mỗi gói chia 2 bữa rất vừa, date mới tinh.',
      },
    ],
  },
  {
    id: 'prod-yu-shampoo',
    brand: 'YU CARE',
    name: 'Sữa tắm thảo mộc dịu nhẹ dưỡng lông cho mèo (400ml)',
    shortDesc: 'Chiết xuất hoa anh đào & lô hội, cân bằng pH tự nhiên cho làn da nhạy cảm của mèo.',
    description:
      'Công thức dịu nhẹ không chứa xà phòng công nghiệp, làm sạch bụi bẩn và khử mùi hôi hiệu quả mà vẫn giữ lớp dầu tự nhiên bảo vệ da mèo.',
    packSize: 'Dành cho Mèo • 400 ml',
    sizes: ['400 ml', '1000 ml'],
    rating: 4.9,
    reviewCount: 59,
    priceNum: 265000,
    price: '265.000₫',
    badge: 'CHĂM SÓC DA LÔNG',
    category: 'hygiene',
    subType: 'Sữa tắm & Dưỡng lông',
    petType: 'cat',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=85',
    ],
    bgTone: '#f3f7ff',
    stockCount: 19,
    highlights: [
      'Độ pH trung tính an toàn cho da nhạy cảm',
      'Lưu hương thảo mộc nhẹ nhàng suốt 5 ngày',
    ],
    reviews: [
      {
        id: 'rev-y1',
        author: 'Thanh Tùng',
        petTag: 'Nuôi mèo Ba Tư trắng',
        rating: 5,
        date: '17/10/2026',
        verified: true,
        comment: 'Tắm xong lông tơi và rất mềm, mùi thơm tự nhiên không bị nồng.',
      },
    ],
  },
  {
    id: 'prod-rattan-bed',
    brand: 'PETSFRIEND HOME',
    name: 'Ổ nệm mây kháng khuẩn đế chống trượt cho mèo',
    shortDesc: 'Khung thoáng khí kết hợp đệm bông kháng khuẩn, phù hợp khí hậu nhiệt đới.',
    description:
      'Đệm lót tháo rời dễ giặt giũ, phần thành nệm nâng đỡ cổ êm ái giúp mèo cưng có giấc ngủ sâu và hạn chế hầm nóng.',
    packSize: 'Dành cho Mèo • Size M/L',
    sizes: ['Size M', 'Size L'],
    rating: 4.8,
    reviewCount: 38,
    priceNum: 550000,
    price: '550.000₫',
    badge: 'MỚI VỀ',
    category: 'bed',
    subType: 'Giường - Nệm - Thảm',
    petType: 'cat',
    image: 'https://images.unsplash.com/photo-1717416699412-76f7123494bd?auto=format&fit=crop&w=700&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1717416699412-76f7123494bd?auto=format&fit=crop&w=700&q=85',
      'https://images.unsplash.com/photo-1723187283804-2d774cb11dad?auto=format&fit=crop&w=700&q=85',
    ],
    bgTone: '#eff5ff',
    stockCount: 14,
    highlights: [
      'Vải sợi tự nhiên thoáng mát, hạn chế bám lông',
      'Dễ dàng tháo rời vệ sinh hằng tuần',
    ],
    reviews: [
      {
        id: 'rev-r1',
        author: 'Bích Ngọc',
        petTag: 'Nuôi mèo Anh',
        rating: 5,
        date: '10/10/2026',
        verified: true,
        comment: 'Mẫu đẹp tối giản, để phòng khách nhìn rất gọn.',
      },
    ],
  },
  {
    id: 'prod-dog-carrier',
    brand: 'PET TRAVEL',
    name: 'Balo & Đai vận chuyển chó dạo phố thoáng khí',
    shortDesc: 'Đệm ngực êm ái kết hợp lưới chịu lực chống sốc, thuận tiện khi đưa chó đi dạo hoặc khám thú y.',
    description:
      'Thiết kế công thái học ôm sát cơ thể cún, phân bổ đều trọng lượng lên vai người đeo và trang bị móc khóa an toàn gắn trực tiếp vào vòng cổ.',
    packSize: 'Dành cho Chó • Dưới 10 kg',
    sizes: ['Size M (< 6kg)', 'Size L (6–10kg)'],
    rating: 4.9,
    reviewCount: 47,
    priceNum: 540000,
    price: '540.000₫',
    badge: 'DÀNH CHO CHÓ',
    category: 'backpack',
    subType: 'Địu - Balo - Túi xách',
    petType: 'dog',
    image: 'https://images.unsplash.com/photo-1533413924355-a5797409980e?auto=format&fit=crop&w=800&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1533413924355-a5797409980e?auto=format&fit=crop&w=800&q=85',
    ],
    bgTone: '#eff5ff',
    stockCount: 16,
    highlights: [
      'Khóa cài an toàn kép chống tuột khi di chuyển',
      'Lưới 3D thoáng mát, dễ giặt nhanh khô',
    ],
    reviews: [
      {
        id: 'rev-dc1',
        author: 'Quốc Khánh',
        petTag: 'Nuôi Poodle 5kg',
        rating: 5,
        date: '05/11/2026',
        verified: true,
        comment: 'Đeo bé đi dạo cuối tuần rất chắc chắn, quai đeo êm không mỏi vai.',
      },
    ],
  },
  {
    id: 'prod-dog-shampoo',
    brand: 'BOTANICAL PAW',
    name: 'Sữa tắm yến mạch & lô hội dịu nhẹ cho chó (500ml)',
    shortDesc: 'Chiết xuất yến mạch colloidal và nha đam giúp làm dịu da nhạy cảm, giảm rụng lông hiệu quả.',
    description:
      'Công thức pH 7.0 cân bằng riêng cho làn da cún, không sulfate và paraben, giữ mùi hương thảo mộc thanh mát suốt 7 ngày.',
    packSize: 'Dành cho Chó • Chai 500ml',
    sizes: ['Chai 500ml', 'Chai 1 Lít'],
    rating: 4.9,
    reviewCount: 74,
    priceNum: 245000,
    price: '245.000₫',
    badge: 'LÀM ĐẸP & DƯỠNG LÔNG',
    category: 'hygiene',
    subType: 'Sữa tắm & Dưỡng lông',
    petType: 'dog',
    image: '/images/prod-dog-shampoo.jpg',
    gallery: ['/images/prod-dog-shampoo.jpg'],
    bgTone: '#eff5ff',
    stockCount: 38,
    highlights: [
      'Làm dịu ngứa rát, cấp ẩm lớp biểu bì da nhạy cảm',
      'Tạo bọt mịn dễ xả sạch, giúp lông tơi bồng bềnh',
    ],
    isFeatured: true,
    reviews: [
      {
        id: 'rev-ds1',
        author: 'Hoàng Nam',
        petTag: 'Nuôi Samoyed',
        rating: 5,
        date: '11/11/2026',
        verified: true,
        comment: 'Tắm xong lông bé trắng xốp và rất ít rụng, mùi nhẹ dễ chịu.',
      },
    ],
  },
  {
    id: 'prod-collar-leash-dog',
    brand: 'PAW WALK',
    name: 'Dây xích & Vòng cổ dù bọc da êm cho chó đi dạo',
    shortDesc: 'Bộ dây dắt và vòng cổ khóa kim loại chắc chắn, có lớp đệm lót cổ chống hằn da cho cún.',
    description:
      'Dây dù dệt mật độ cao kết hợp da mềm và móc xoay 360 độ chống xoắn rối khi thú cưng chạy nhảy.',
    packSize: 'Dành cho Chó • Dài 1.5m',
    sizes: ['Size S (< 8kg)', 'Size M (8–18kg)', 'Size L (> 18kg)'],
    rating: 4.8,
    reviewCount: 62,
    priceNum: 195000,
    price: '195.000₫',
    badge: 'BÁN CHẠY',
    category: 'backpack',
    subType: 'Dây xích & Vòng cổ',
    petType: 'dog',
    image: '/images/prod-collar-leash.jpg',
    gallery: ['/images/prod-collar-leash.jpg'],
    bgTone: '#eff5ff',
    stockCount: 45,
    highlights: [
      'Đệm cổ thoáng khí bảo vệ vùng khí quản thú cưng',
      'Khóa hợp kim không gỉ chịu lực kéo lớn',
    ],
    isFeatured: true,
    reviews: [],
  },
  {
    id: 'prod-collar-cat',
    brand: 'PAW WALK',
    name: 'Vòng cổ lục lạc & Dây dắt mềm an toàn cho mèo',
    shortDesc: 'Trọng lượng siêu nhẹ với khóa thoát hiểm an toàn, phù hợp cho mèo làm quen đi dạo sân vườn.',
    description:
      'Chất liệu sợi dệt mềm mại không làm gãy lông cổ mèo, kèm dây dắt mảnh linh hoạt.',
    packSize: 'Dành cho Mèo • Điều chỉnh 18–30cm',
    sizes: ['Free Size (Mèo < 8kg)'],
    rating: 4.8,
    reviewCount: 39,
    priceNum: 135000,
    price: '135.000₫',
    originalPrice: '165.000₫',
    discountBadge: '−18%',
    badge: 'ƯU ĐÃI −18%',
    category: 'backpack',
    subType: 'Dây xích & Vòng cổ',
    petType: 'cat',
    image: '/images/prod-collar-leash.jpg',
    gallery: ['/images/prod-collar-leash.jpg'],
    bgTone: '#eff5ff',
    stockCount: 34,
    highlights: [
      'Thiết kế khóa bấm nhẹ tay chống mắc kẹt cho mèo',
      'Màu xanh trang nhã, dễ vệ sinh lau sạch',
    ],
    isFeatured: false,
    isFlashSale: true,
    reviews: [],
  },
  {
    id: 'prod-cat-litter-box',
    brand: 'PETSFRIEND HOME',
    name: 'Hộp cát vệ sinh khử mùi có nắp & xẻng xúc cho mèo',
    shortDesc: 'Nhà vệ sinh kín chống văng cát, cửa lật một chiều ngăn mùi hôi và kèm xẻng gài hông tiện lợi.',
    description:
      'Nhựa PP nguyên sinh dày dặn an toàn, khay đáy sâu chứa được lượng cát lớn cho mèo đi vệ sinh thoải mái.',
    packSize: 'Dành cho Mèo • 52 × 40 × 39 cm',
    sizes: ['Size Tiêu chuẩn (< 7kg)', 'Size XL (> 7kg)'],
    rating: 4.9,
    reviewCount: 91,
    priceNum: 440000,
    price: '440.000₫',
    badge: 'CHỐNG VĂNG CÁT',
    category: 'backpack',
    subType: 'Hộp cát & Vệ sinh',
    petType: 'cat',
    image: '/images/prod-cat-litter-box.jpg',
    gallery: ['/images/prod-cat-litter-box.jpg'],
    bgTone: '#eff5ff',
    stockCount: 24,
    highlights: [
      'Bậc cửa rũ cát giúp giữ sàn nhà luôn sạch sẽ',
      'Nắp trên tháo mở nhanh trong 3 giây khi dọn cát',
    ],
    isFeatured: true,
    reviews: [],
  },
  {
    id: 'prod-dog-cage',
    brand: 'PETSFRIEND HOME',
    name: 'Lồng chuồng chó sơn tĩnh điện gấp gọn khay nhựa',
    shortDesc: 'Khung thép nan dày phủ sơn tĩnh điện chống gỉ, hai cửa ra vào kèm khay đáy rút vệ sinh dễ dàng.',
    description:
      'Cấu trúc chắc chắn, dễ gấp phẳng cất giữ hoặc mang theo trên ô tô khi gia đình đi du lịch.',
    packSize: 'Dành cho Chó • Size M (76 × 52 × 60 cm)',
    sizes: ['Size M (76cm)', 'Size L (92cm)', 'Size XL (108cm)'],
    rating: 4.9,
    reviewCount: 53,
    priceNum: 680000,
    price: '680.000₫',
    badge: 'CHỐNG GỈ SÉT',
    category: 'bed',
    subType: 'Lồng - Chuồng',
    petType: 'dog',
    image: '/images/prod-pet-cage.jpg',
    gallery: ['/images/prod-pet-cage.jpg'],
    bgTone: '#eff5ff',
    stockCount: 19,
    highlights: [
      'Chốt khóa kép an toàn, nan thép bo tròn không sắc cạnh',
      'Khay nhựa ABS chịu lực tháo rút vệ sinh nhanh chóng',
    ],
    isFeatured: true,
    reviews: [],
  },
  {
    id: 'prod-cat-cage',
    brand: 'PETSFRIEND HOME',
    name: 'Chuồng mèo biệt thự nhiều tầng sơn tĩnh điện kèm võng',
    shortDesc: 'Không gian 3 tầng rộng rãi có sàn gỗ và võng ngủ treo êm ái cho từ 1–3 bé mèo.',
    description:
      'Lý tưởng khi cần cách ly chăm sóc hậu phẫu, nuôi mèo con hoặc tạo góc vận động riêng gọn gàng.',
    packSize: 'Dành cho Mèo • 78 × 54 × 115 cm',
    sizes: ['2 Tầng (90cm)', '3 Tầng Villa (115cm)'],
    rating: 4.9,
    reviewCount: 44,
    priceNum: 1250000,
    price: '1.250.000₫',
    originalPrice: '1.490.000₫',
    discountBadge: '−16%',
    badge: 'ƯU ĐÃI −16%',
    category: 'bed',
    subType: 'Lồng - Chuồng',
    petType: 'cat',
    image: '/images/prod-cat-cage.jpg',
    gallery: ['/images/prod-cat-cage.jpg'],
    bgTone: '#eff5ff',
    stockCount: 11,
    highlights: [
      'Tặng kèm võng nỉ hai mặt và thang leo gỗ chắc chắn',
      'Bánh xe xoay 360 độ có khóa hãm cố định an toàn',
    ],
    isFeatured: false,
    isFlashSale: true,
    reviews: [],
  },
  {
    id: 'prod-dog-orthopedic-bed',
    brand: 'PETSFRIEND HOME',
    name: 'Giường nệm chữ nhật memory foam nâng đỡ xương cho chó',
    shortDesc: 'Lõi foam đàn hồi cao hỗ trợ khớp hông cho chó trung và lớn, bọc vải nhung gân thoáng khí.',
    description:
      'Thành nệm cao 3 cạnh làm gối tựa đầu thoải mái, phần đáy phủ hạt cao su chống xê dịch trên sàn gạch.',
    packSize: 'Dành cho Chó • Size L (90 × 70 cm)',
    sizes: ['Size M (75 × 55cm)', 'Size L (90 × 70cm)'],
    rating: 4.9,
    reviewCount: 58,
    priceNum: 790000,
    price: '790.000₫',
    originalPrice: '890.000₫',
    discountBadge: '−11%',
    badge: 'ƯU ĐÃI −11%',
    category: 'bed',
    subType: 'Giường - Nệm - Thảm',
    petType: 'dog',
    image: '/images/prod-dog-bed.jpg',
    gallery: ['/images/prod-dog-bed.jpg'],
    bgTone: '#eff5ff',
    stockCount: 15,
    highlights: [
      'Vỏ nệm kéo khóa tháo rời giặt máy tiện lợi',
      'Lõi memory foam mật độ cao không xẹp lún',
    ],
    isFeatured: false,
    isFlashSale: true,
    reviews: [],
  },
  {
    id: 'prod-cat-plush-bed',
    brand: 'PETSFRIEND HOME',
    name: 'Giường nệm tròn lông cừu ấm áp cho mèo',
    shortDesc: 'Lòng nệm sâu ôm trọn cơ thể mèo, mang lại cảm giác an toàn và giữ ấm tuyệt đối.',
    description:
      'Sợi bông PP siêu mịn đàn hồi tốt kết hợp lớp lông cừu nhân tạo mềm mượt giúp mèo ngủ sâu giấc.',
    packSize: 'Dành cho Mèo • Đường kính 50 cm',
    sizes: ['Size S (45cm)', 'Size M (55cm)'],
    rating: 4.8,
    reviewCount: 66,
    priceNum: 420000,
    price: '420.000₫',
    badge: 'ÊM ÁI',
    category: 'bed',
    subType: 'Giường - Nệm - Thảm',
    petType: 'cat',
    image: '/images/prod-cat-plush-bed.jpg',
    gallery: ['/images/prod-cat-plush-bed.jpg'],
    bgTone: '#eff5ff',
    stockCount: 27,
    highlights: [
      'Thiết kế bo tròn nâng cổ giảm áp lực cột sống',
      'Chống bám bụi và dễ giặt sạch định kỳ',
    ],
    isFeatured: true,
    reviews: [],
  },
  {
    id: 'prod-ceramic-bowl-dog',
    brand: 'PETSFRIEND HOME',
    name: 'Bộ bát ăn đôi gốm sứ kệ gỗ sồi chống trượt cho chó',
    shortDesc: 'Hai chén sứ nung an toàn kết hợp giá gỗ nâng chiều cao vừa tầm, bảo vệ đốt sống cổ cho cún.',
    description:
      'Bề mặt gốm tráng men láng mịn hạn chế tích tụ vi khuẩn gây mụn cằm và dễ rửa sạch dầu mỡ thức ăn.',
    packSize: 'Dành cho Chó • 2 × 450ml',
    sizes: ['Bộ 2 bát (2×450ml)'],
    rating: 4.9,
    reviewCount: 41,
    priceNum: 290000,
    price: '290.000₫',
    badge: 'AN TOÀN VỆ SINH',
    category: 'backpack',
    subType: 'Dụng cụ ăn uống',
    petType: 'dog',
    image: '/images/prod-ceramic-bowl.jpg',
    gallery: ['/images/prod-ceramic-bowl.jpg'],
    bgTone: '#eff5ff',
    stockCount: 31,
    highlights: [
      'Khung gỗ sồi tự nhiên phủ chống ẩm bền đẹp',
      'Bát sứ tháo rời rửa máy rửa chén thoải mái',
    ],
    isFeatured: true,
    reviews: [],
  },
  {
    id: 'prod-ceramic-bowl-cat',
    brand: 'PETSFRIEND HOME',
    name: 'Bộ bát ăn đôi sứ trắng nâng cổ chống nghẹn cho mèo',
    shortDesc: 'Độ cao 11cm giúp mèo ăn uống đúng tư thế sinh lý, hạn chế nôn trớ thức ăn sau bữa.',
    description:
      'Chén miệng rộng tránh chạm ria mép mèo nhạy cảm, phối kệ gỗ tối giản phù hợp mọi góc bếp.',
    packSize: 'Dành cho Mèo • 2 × 300ml',
    sizes: ['Bộ 2 bát (2×300ml)'],
    rating: 4.9,
    reviewCount: 59,
    priceNum: 255000,
    price: '255.000₫',
    originalPrice: '295.000₫',
    discountBadge: '−14%',
    badge: 'ƯU ĐÃI −14%',
    category: 'backpack',
    subType: 'Dụng cụ ăn uống',
    petType: 'cat',
    image: '/images/prod-ceramic-bowl.jpg',
    gallery: ['/images/prod-ceramic-bowl.jpg'],
    bgTone: '#eff5ff',
    stockCount: 29,
    highlights: [
      'Thiết kế lòng bát nông giúp ria mèo không bị tì cấn',
      'Kệ gỗ nặng vững chắc không bị mèo đẩy đổ',
    ],
    isFeatured: false,
    isFlashSale: true,
    reviews: [],
  },
];

export const INITIAL_ADDRESSES: AddressRecord[] = [
  {
    id: 'addr-1',
    label: 'Nhà riêng',
    recipient: 'Trịnh Anh Khoa',
    phone: '0909 123 456',
    address: '128 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Văn phòng',
    recipient: 'Trịnh Anh Khoa',
    phone: '0909 123 456',
    address: 'Tầng 6, Tòa nhà PetsFriend Tech, Q. Phú Nhuận, TP. Hồ Chí Minh',
    isDefault: false,
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'PH261108',
    createdAt: '12/11/2026 • 14:20',
    status: 'shipping',
    totalAmount: 584000,
    shippingAddress: '128 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    items: [
      {
        id: 'prod-rc-mini',
        name: 'Hạt dinh dưỡng cho chó giống nhỏ Mini Adult',
        image:
          'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=85',
        price: 389000,
        quantity: 1,
        variant: 'Túi 2kg',
      },
      {
        id: 'prod-collar-leash-dog',
        name: 'Dây xích & Vòng cổ dù bọc da êm cho chó đi dạo',
        image: '/images/prod-collar-leash.jpg',
        price: 195000,
        quantity: 1,
        variant: 'Size M (8–18kg)',
      },
    ],
  },
  {
    id: 'PH261029',
    createdAt: '04/11/2026 • 09:45',
    status: 'completed',
    totalAmount: 705000,
    shippingAddress: '128 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'Chuyển khoản QR / Napas',
    items: [
      {
        id: 'prod-cat-litter-box',
        name: 'Hộp cát vệ sinh khử mùi có nắp & xẻng xúc cho mèo',
        image: '/images/prod-cat-litter-box.jpg',
        price: 440000,
        quantity: 1,
        variant: 'Size Tiêu chuẩn (< 7kg)',
      },
      {
        id: 'prod-yu-shampoo',
        name: 'Sữa tắm thảo mộc dịu nhẹ dưỡng lông cho mèo (400ml)',
        image:
          'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=85',
        price: 265000,
        quantity: 1,
        variant: 'Chai 400ml',
      },
    ],
  },
];

export const INITIAL_BOOKINGS: ServiceBookingRecord[] = [
  {
    id: 'BK261115',
    serviceName: 'Chăm sóc Toàn diện 7 Bước',
    petName: 'Milo (Corgi 2 tuổi)',
    date: '2026-11-18',
    timeSlot: '10:30 Sáng',
    price: 390000,
    status: 'upcoming',
    note: 'Tỉa gọn lông bàn chân và bụng, bé hiền.',
  },
];

export const SPA_PACKAGES: SpaPackage[] = [
  {
    id: 'pkg-1',
    name: 'Tắm thảo mộc & Thư giãn',
    desc: 'Tắm sạch sâu 2 lần bằng sữa tắm hữu cơ, sấy ấm ion âm êm dịu, vệ sinh tuyến hôi và xịt dưỡng mượt lông.',
    price: 180000,
    priceStr: '180.000₫',
    duration: '45 phút',
  },
  {
    id: 'pkg-2',
    name: 'Cắt tỉa & Tạo phom lông thẩm mỹ',
    desc: 'Tỉa gọn khuôn mặt, tạo phom lông bồng bềnh tự nhiên, vệ sinh vùng bàn chân và bụng gọn gàng.',
    price: 280000,
    priceStr: '280.000₫',
    duration: '60 phút',
  },
  {
    id: 'pkg-3',
    name: 'Chăm sóc Toàn diện 7 Bước',
    desc: 'Trọn gói tắm thảo mộc, massage thư giãn, sấy tạo phom, cắt tỉa nghệ thuật, cắt dũa móng và vệ sinh tai chuyên sâu.',
    price: 390000,
    priceStr: '390.000₫',
    duration: '90 phút',
    isPopular: true,
  },
  {
    id: 'pkg-4',
    name: 'Khách sạn thú cưng 5 sao',
    desc: 'Phòng riêng điều hòa lọc khí, camera theo dõi 24/7, 3 bữa dinh dưỡng theo chế độ và dạo chơi hằng ngày.',
    price: 150000,
    priceStr: '150.000₫ / ngày',
    duration: '24 giờ',
  },
];

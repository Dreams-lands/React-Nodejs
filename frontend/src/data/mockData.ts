export type PageId =
  | 'home'
  | 'dogs'
  | 'cats'
  | 'product'
  | 'search'
  | 'profile'
  | 'cart'
  | 'service'
  | 'login'
  | 'register'
  | 'checkout-success'
  | 'checkout-fail';

export interface PetCardItem {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  breed: string;
  meta: string;
  badge: string;
  category: 'dog' | 'cat' | 'food' | 'accessory' | 'spa';
  ctaLabel: string;
  image: string;
  bgTone: string;
  gender?: 'Đực' | 'Cái';
  ageGroup?: string;
}

export interface CartItem {
  id: string;
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

export const DOGS_LIST: PetCardItem[] = [
  {
    id: 'dog-1',
    name: 'Bơ (Buddy)',
    price: '$1,250',
    priceNum: 1250,
    breed: 'Chó Golden Retriever',
    meta: '12 tuần · Đực · Đã tiêm phòng & sổ thú y',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=700&q=85',
    bgTone: '#CBE0EC',
    gender: 'Đực',
    ageGroup: '8–12 tuần',
  },
  {
    id: 'dog-2',
    name: 'Daisy',
    price: '$950',
    priceNum: 950,
    breed: 'Chó săn Beagle thuần chủng',
    meta: '10 tuần · Cái · Đã tiêm phòng & sổ thú y',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=700&q=85',
    bgTone: '#F4DFC8',
    gender: 'Cái',
    ageGroup: '8–12 tuần',
  },
  {
    id: 'dog-3',
    name: 'Milo Corgi',
    price: '$1,400',
    priceNum: 1400,
    breed: 'Corgi chân ngắn (Pembroke)',
    meta: '14 tuần · Đực · Đã tiêm phòng & sổ thú y',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=700&q=85',
    bgTone: '#D4E4EC',
    gender: 'Đực',
    ageGroup: '13–16 weeks',
  },
  {
    id: 'dog-4',
    name: 'Luna',
    price: '$1,100',
    priceNum: 1100,
    breed: 'Chó Labrador màu kem',
    meta: '11 tuần · Cái · Đã tiêm phòng & sổ thú y',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=700&q=85',
    bgTone: '#E8D8C8',
    gender: 'Cái',
    ageGroup: '8–12 tuần',
  },
  {
    id: 'dog-5',
    name: 'Gấu (Teddy)',
    price: '$1,650',
    priceNum: 1650,
    breed: 'Poodle Toy lông xoăn nâu đỏ',
    meta: '13 tuần · Đực · Đã tiêm phòng & sổ thú y',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1594149929911-78975a43d4f5?auto=format&fit=crop&w=700&q=85',
    bgTone: '#C8DCE6',
    gender: 'Đực',
    ageGroup: '13–16 weeks',
  },
  {
    id: 'dog-6',
    name: 'Rosie',
    price: '$1,500',
    priceNum: 1500,
    breed: 'Spaniel Hoàng Gia (Cavalier)',
    meta: '12 tuần · Cái · Đã tiêm phòng & sổ thú y',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=700&q=85',
    bgTone: '#F2DCC6',
    gender: 'Cái',
    ageGroup: '8–12 tuần',
  },
];

export const CATS_LIST: PetCardItem[] = [
  {
    id: 'cat-1',
    name: 'Bé Milo',
    price: '$1,250',
    priceNum: 1250,
    breed: 'Mèo Anh lông ngắn (Golden)',
    meta: '12 tuần · Đực · Đầy đủ 2 mũi tiêm',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'cat',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=700&q=85',
    bgTone: '#EFE8DC',
    gender: 'Đực',
    ageGroup: '8–12 tuần',
  },
  {
    id: 'cat-2',
    name: 'Bé Luna',
    price: '$1,450',
    priceNum: 1450,
    breed: 'Mèo Ragdoll mắt xanh biển',
    meta: '14 tuần · Cái · Đầy đủ 2 mũi tiêm',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'cat',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=700&q=85',
    bgTone: '#D8E6F0',
    gender: 'Cái',
    ageGroup: '13–16 weeks',
  },
  {
    id: 'cat-3',
    name: 'Oliver',
    price: '$1,650',
    priceNum: 1650,
    breed: 'Mèo Maine Coon khổng lồ',
    meta: '16 tuần · Đực · Đầy đủ 2 mũi tiêm',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'cat',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=700&q=85',
    bgTone: '#D4E2EC',
    gender: 'Đực',
    ageGroup: '13–16 weeks',
  },
  {
    id: 'cat-4',
    name: 'Cleo',
    price: '$1,350',
    priceNum: 1350,
    breed: 'Mèo Ba Tư lông xù quý phái',
    meta: '13 tuần · Cái · Đầy đủ 2 mũi tiêm',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'cat',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=700&q=85',
    bgTone: '#DCE8F2',
    gender: 'Cái',
    ageGroup: '13–16 weeks',
  },
  {
    id: 'cat-5',
    name: 'Simba',
    price: '$1,800',
    priceNum: 1800,
    breed: 'Mèo Bengal vằn báo hoa mai',
    meta: '12 tuần · Đực · Đầy đủ 2 mũi tiêm',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'cat',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=700&q=85',
    bgTone: '#F2DFCC',
    gender: 'Đực',
    ageGroup: '8–12 tuần',
  },
  {
    id: 'cat-6',
    name: 'Bơ Sữa',
    price: '$1,150',
    priceNum: 1150,
    breed: 'Scottish Tai Cụp (Fold)',
    meta: '15 tuần · Cái · Đầy đủ 2 mũi tiêm',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'cat',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=700&q=85',
    bgTone: '#F4E1CE',
    gender: 'Cái',
    ageGroup: '13–16 weeks',
  },
];

export const SEARCH_ITEMS: PetCardItem[] = [
  {
    id: 'srch-1',
    name: 'Royal Canin Puppy',
    price: '485.000₫',
    priceNum: 485,
    breed: 'Hạt dinh dưỡng chuyên sâu túi 2kg',
    meta: 'Nhập khẩu Pháp · Tốt cho tiêu hóa & lông da mượt',
    badge: 'BÁN CHẠY NHẤT',
    category: 'food',
    ctaLabel: 'Thêm vào giỏ',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=85',
    bgTone: '#D4E4EC',
  },
  {
    id: 'srch-2',
    name: 'Daisy',
    price: '$950',
    priceNum: 2300,
    breed: 'Chó săn Beagle thuần chủng',
    meta: '10 tuần · Cái · Đã tiêm chủng & khám thú y',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=700&q=85',
    bgTone: '#F4DFC8',
  },
  {
    id: 'srch-3',
    name: 'Milo Corgi',
    price: '$1,400',
    priceNum: 3400,
    breed: 'Pembroke Welsh Corgi',
    meta: '14 tuần · Đực · Bảo hành sức khỏe 12 tháng',
    badge: 'SẴN SÀNG ĐÓN VỀ',
    category: 'dog',
    ctaLabel: 'Xem chi tiết',
    image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=700&q=85',
    bgTone: '#CBE0EC',
  },
  {
    id: 'srch-4',
    name: 'Pate Whiskas Vị Cá Ngừ',
    price: '320.000₫',
    priceNum: 320,
    breed: 'Combo 24 gói x 85g thạch mềm',
    meta: 'Giàu Omega-3 & Taurine · Dành cho mèo mọi lứa tuổi',
    badge: 'ƯU ĐÃI -15%',
    category: 'food',
    ctaLabel: 'Thêm vào giỏ',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=700&q=85',
    bgTone: '#E8D8C8',
  },
  {
    id: 'srch-5',
    name: 'Nệm Mây Bông Êm',
    price: '550.000₫',
    priceNum: 550,
    breed: 'Ổ đệm bông kháng khuẩn chống trượt',
    meta: 'Size M/L · Vỏ tháo rời giặt máy · Êm ái ấm áp',
    badge: 'MỚI VỀ KHO',
    category: 'accessory',
    ctaLabel: 'Thêm vào giỏ',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=700&q=85',
    bgTone: '#C8DCE6',
  },
  {
    id: 'srch-6',
    name: 'Spa Toàn Diện PetHub',
    price: '390.000₫',
    priceNum: 390,
    breed: 'Gói tắm thảo mộc & cắt tỉa tạo kiểu',
    meta: '60 phút · Vệ sinh tai, cắt dũa móng & massage thư giãn',
    badge: 'ĐẶT LỊCH NGAY',
    category: 'spa',
    ctaLabel: 'Đặt lịch hẹn',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=85',
    bgTone: '#F2DCC6',
  },
];

export const INITIAL_CART: CartItem[] = [
  {
    id: 'c-1',
    name: 'Bé Mèo Anh lông ngắn (Milo)',
    desc: '12 tuần tuổi · Giống đực · Đầy đủ 2 mũi tiêm & sổ thú y điện tử',
    price: 31250000,
    priceStr: '31.250.000₫',
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=300&q=85',
    category: 'Thú cưng thuần chủng',
  },
  {
    id: 'c-2',
    name: 'Thức ăn hạt Royal Canin Puppy (2kg)',
    desc: 'Nhập khẩu Pháp · Dinh dưỡng phát triển hệ xương và lông óng ả',
    price: 485000,
    priceStr: '485.000₫',
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=300&q=85',
    category: 'Thức ăn dinh dưỡng',
  },
  {
    id: 'c-3',
    name: 'Pate Whiskas Vị Cá Ngừ (Combo 24 gói)',
    desc: 'Giàu Omega-3 & Taurine bổ mắt cho mèo',
    price: 320000,
    priceStr: '320.000₫',
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=85',
    category: 'Pate & Thức ăn ướt',
  },
];

export const SPA_PACKAGES: SpaPackage[] = [
  {
    id: 'pkg-1',
    name: 'Tắm thảo mộc & Massage thư giãn',
    desc: 'Tắm sạch sâu 2 lần bằng dầu gội thảo dược hữu cơ, sấy ấm êm dịu, vắt tuyến hôi & xịt dưỡng mượt lông.',
    price: 180000,
    priceStr: '180.000₫',
    duration: '45 phút',
  },
  {
    id: 'pkg-2',
    name: 'Cắt tỉa tạo kiểu chuẩn Hàn Quốc',
    desc: 'Tỉa tròn khuôn mặt teddy bear, tạo form bồng bềnh, cắt tỉa vệ sinh bàn chân và vệ sinh hậu môn gọn gàng.',
    price: 280000,
    priceStr: '280.000₫',
    duration: '60 phút',
  },
  {
    id: 'pkg-3',
    name: 'Spa Toàn Diện (All-In-One cao cấp)',
    desc: 'Gồm tắm thảo mộc + massage + sấy tạo kiểu + cắt tỉa nghệ thuật + cắt dũa móng + vệ sinh nhổ lông tai + tặng bánh thưởng.',
    price: 390000,
    priceStr: '390.000₫',
    duration: '90 phút',
    isPopular: true,
  },
  {
    id: 'pkg-4',
    name: 'Khách sạn thú cưng 5 sao (Boarding)',
    desc: 'Phòng máy lạnh lọc không khí riêng, camera livestream 24/7 cho bố mẹ xem bé, 3 bữa ăn dinh dưỡng & dắt đi dạo hàng ngày.',
    price: 150000,
    priceStr: '150.000₫ / ngày',
    duration: '24 giờ',
  },
];

export const MILO_GALLERY = [
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1000&q=85',
];

export interface StorefrontProduct {
  id: string;
  brand: string;
  name: string;
  packSize: string;
  rating: string;
  reviewCount: number;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  image: string;
  category: 'food' | 'bed' | 'backpack' | 'toy';
}

export interface FlashSaleItem {
  id: string;
  brand: string;
  name: string;
  packSize: string;
  rating: string;
  price: string;
  originalPrice: string;
  discount: string;
  soldCount: number;
  totalStock: number;
  image: string;
}

export const STOREFRONT_SUPPLIES = [
  {
    id: 'sup-food',
    title: 'Thức ăn dinh dưỡng',
    desc: 'Dinh dưỡng cân bằng. Bụng bé luôn khỏe vui.',
    meta: 'Hơn 120 món ngon và hạt nhập khẩu',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=85',
    tag: 'Thức ăn',
  },
  {
    id: 'sup-bed',
    title: 'Nệm & Giường êm',
    desc: 'Góc ngủ trưa yêu thích mới của hoàng thượng.',
    meta: 'Êm ái cho mọi giấc mơ ngọt ngào',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=85',
    tag: 'Giường',
  },
  {
    id: 'sup-carrier',
    title: 'Balo & Túi vận chuyển',
    desc: 'Cùng người bạn thân thiết vi vu mọi cung đường.',
    meta: 'Balo phi hành gia thoáng khí cao cấp',
    image: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?auto=format&fit=crop&w=600&q=85',
    tag: 'Ba lô',
  },
];

export const STOREFRONT_FAVORITES: StorefrontProduct[] = [
  {
    id: 'fav-1',
    brand: 'ROYAL CANIN',
    name: 'Thức ăn hạt cho mèo con Kitten · Phát triển toàn diện',
    packSize: 'Mèo con 4–12 tháng • 2 kg',
    rating: '★★★★★ 4.9',
    reviewCount: 86,
    price: '465.000₫',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=500&q=85',
    category: 'food',
  },
  {
    id: 'fav-2',
    brand: 'NUTRISOURCE',
    name: 'Thức ăn hạt cao cấp cho cún vị thịt gà tươi & gạo lứt',
    packSize: 'Mọi giống chó • 2,5 kg',
    rating: '★★★★★ 4.9',
    reviewCount: 64,
    price: '425.000₫',
    originalPrice: '475.000₫',
    discountBadge: '−11%',
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=500&q=85',
    category: 'food',
  },
  {
    id: 'fav-3',
    brand: 'PETHUB HOME',
    name: 'Nệm tròn lông cừu Cloud Comfort êm ái chống lạnh',
    packSize: 'Vỏ tháo giặt được • 60 × 50 cm',
    rating: '★★★★★ 4.9',
    reviewCount: 52,
    price: '590.000₫',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=500&q=85',
    category: 'bed',
  },
  {
    id: 'fav-4',
    brand: 'PET TRAVEL',
    name: 'Balo phi hành gia trong suốt chống sốc cao cấp',
    packSize: 'Chó/Mèo dưới 8kg • Siêu nhẹ',
    rating: '★★★★★ 4.8',
    reviewCount: 41,
    price: '520.000₫',
    originalPrice: '580.000₫',
    discountBadge: '−10%',
    image: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?auto=format&fit=crop&w=500&q=85',
    category: 'backpack',
  },
];

export const FLASH_SALE_ITEMS: FlashSaleItem[] = [
  {
    id: 'fs-1',
    brand: 'ROYAL CANIN',
    name: 'Thức ăn khô cho chó trưởng thành giống nhỏ Mini Adult',
    packSize: 'Giống nhỏ • 2 kg',
    rating: '4.9 (128)',
    price: '389.000₫',
    originalPrice: '489.000₫',
    discount: '−20%',
    soldCount: 68,
    totalStock: 90,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'fs-2',
    brand: 'ME-O',
    name: 'Thức ăn hạt cho mèo trưởng thành vị cá biển tươi',
    packSize: 'Mèo trưởng thành • 1,2 kg',
    rating: '4.8 (96)',
    price: '99.000₫',
    originalPrice: '129.000₫',
    discount: '−23%',
    soldCount: 84,
    totalStock: 100,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'fs-3',
    brand: 'PEDIGREE',
    name: 'Thức ăn hạt cho chó lớn vị bò và rau củ dinh dưỡng',
    packSize: 'Chó trưởng thành • 3 kg',
    rating: '4.8 (75)',
    price: '335.000₫',
    originalPrice: '419.000₫',
    discount: '−20%',
    soldCount: 52,
    totalStock: 80,
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'fs-4',
    brand: 'DENTASTIX',
    name: 'Xương gặm sạch răng Pedigree Dentastix cho chó nhỏ',
    packSize: 'Combo 7 thanh • 110g',
    rating: '5.0 (142)',
    price: '85.000₫',
    originalPrice: '115.000₫',
    discount: '−26%',
    soldCount: 92,
    totalStock: 100,
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=400&q=85',
  },
];

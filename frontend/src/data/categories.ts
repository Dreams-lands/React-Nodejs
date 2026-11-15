import type { ComponentType } from 'react';
import { Utensils, Pill, BedDouble, ShoppingBag, Dog, Cat } from 'lucide-react';
import type { ProductCategory } from './mockData';

export type ProductSubType =
  | 'Dinh dưỡng & Hạt khô'
  | 'Pate & Bánh thưởng'
  | 'Thuốc & Điều trị'
  | 'Sữa tắm & Dưỡng lông'
  | 'Lồng - Chuồng'
  | 'Giường - Nệm - Thảm'
  | 'Địu - Balo - Túi xách'
  | 'Dây xích & Vòng cổ'
  | 'Hộp cát & Vệ sinh'
  | 'Dụng cụ ăn uống';

export type PriceRangeId = 'under-200k' | '200k-500k' | '500k-1m' | 'over-1m';

export const PRODUCT_CATEGORIES: {
  id: ProductCategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'food', label: 'Dinh dưỡng & Pate', icon: Utensils },
  { id: 'hygiene', label: 'Thuốc & Làm đẹp', icon: Pill },
  { id: 'bed', label: 'Nệm & Không gian nghỉ', icon: BedDouble },
  { id: 'backpack', label: 'Balo & Phụ kiện', icon: ShoppingBag },
];

export const PRODUCT_SUBTYPES: {
  id: ProductSubType;
  category: ProductCategory;
}[] = [
  { id: 'Dinh dưỡng & Hạt khô', category: 'food' },
  { id: 'Pate & Bánh thưởng', category: 'food' },
  { id: 'Thuốc & Điều trị', category: 'hygiene' },
  { id: 'Sữa tắm & Dưỡng lông', category: 'hygiene' },
  { id: 'Lồng - Chuồng', category: 'bed' },
  { id: 'Giường - Nệm - Thảm', category: 'bed' },
  { id: 'Địu - Balo - Túi xách', category: 'backpack' },
  { id: 'Dây xích & Vòng cổ', category: 'backpack' },
  { id: 'Hộp cát & Vệ sinh', category: 'backpack' },
  { id: 'Dụng cụ ăn uống', category: 'backpack' },
];

export const PRICE_RANGES: {
  id: PriceRangeId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: 'under-200k', label: 'Dưới 200.000₫', min: 0, max: 199999 },
  { id: '200k-500k', label: '200.000₫ - 500.000₫', min: 200000, max: 500000 },
  { id: '500k-1m', label: '500.000₫ - 1.000.000₫', min: 500001, max: 1000000 },
  { id: 'over-1m', label: 'Trên 1.000.000₫', min: 1000001, max: Number.MAX_SAFE_INTEGER },
];

export const PET_AUDIENCES: {
  id: 'dog' | 'cat';
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'dog', label: 'Đồ dùng cho Chó', icon: Dog },
  { id: 'cat', label: 'Đồ dùng cho Mèo', icon: Cat },
];

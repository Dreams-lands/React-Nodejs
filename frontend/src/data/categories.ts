import type { ComponentType } from 'react';
import { Utensils, Pill, BedDouble, ShoppingBag, Dog, Cat } from 'lucide-react';
import type { ProductCategory } from './mockData';

export const PRODUCT_CATEGORIES: {
  id: ProductCategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'food', label: 'Dinh dưỡng & Pate', icon: Utensils },
  { id: 'hygiene', label: 'Thuốc & Chăm sóc y tế', icon: Pill },
  { id: 'bed', label: 'Nệm & Không gian nghỉ', icon: BedDouble },
  { id: 'backpack', label: 'Balo & Phụ kiện', icon: ShoppingBag },
];

export const PET_AUDIENCES: {
  id: 'dog' | 'cat';
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'dog', label: 'Đồ dùng cho Chó', icon: Dog },
  { id: 'cat', label: 'Đồ dùng cho Mèo', icon: Cat },
];

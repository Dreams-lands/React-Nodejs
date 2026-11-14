import type { ComponentType } from 'react';
import { Utensils, Pill, BedDouble, ShoppingBag } from 'lucide-react';
import type { ProductCategory } from './mockData';

export const PRODUCT_CATEGORIES: {
  id: ProductCategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'food', label: 'Dinh dưỡng & Pate', icon: Utensils },
  { id: 'hygiene', label: 'Thuốc & Chăm sóc y tế', icon: Pill },
  { id: 'bed', label: 'Nệm ngủ & Không gian', icon: BedDouble },
  { id: 'backpack', label: 'Balo & Phụ kiện', icon: ShoppingBag },
];

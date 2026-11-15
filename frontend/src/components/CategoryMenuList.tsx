import React from 'react';
import type { ProductCategory } from '../data/mockData';
import { PRODUCT_CATEGORIES, PET_AUDIENCES } from '../data/categories';

interface CategoryMenuListProps {
  activeCategory?: 'all' | ProductCategory;
  activePetAudience?: 'all' | 'dog' | 'cat';
  onSelectCategory: (cat: 'all' | ProductCategory) => void;
  onSelectPetAudience: (pet: 'dog' | 'cat') => void;
  roleMode?: 'button' | 'menuitem';
}

/**
 * Shared category & pet-audience navigation list used in the header dropdown menu.
 */
export const CategoryMenuList: React.FC<CategoryMenuListProps> = ({
  activeCategory = 'all',
  activePetAudience = 'all',
  onSelectCategory,
  onSelectPetAudience,
  roleMode = 'button',
}) => {
  const itemRole = roleMode === 'menuitem' ? 'menuitem' : undefined;

  return (
    <div className="text-[#17324d]">
      <div className="divide-y divide-[#eef2f7]">
        {PRODUCT_CATEGORIES.map((sub) => {
          const isActive =
            activePetAudience === 'all' && activeCategory === sub.id;
          const IconComp = sub.icon;
          return (
            <button
              key={sub.id}
              type="button"
              role={itemRole}
              onClick={() => onSelectCategory(sub.id)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors group ${
                isActive
                  ? 'bg-[#eff5ff] text-[#0667d0]'
                  : 'hover:bg-[#f5f9ff] text-[#17324d]'
              }`}
            >
              <IconComp
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#0667d0]'
                    : 'text-[#52657a] group-hover:text-[#0667d0]'
                }`}
              />
              <span className="text-[13px] font-semibold leading-snug truncate">
                {sub.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#dfe6f0] bg-[#f8faff]">
        <div className="px-4 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
          Phân loại riêng theo thú cưng
        </div>
        <div className="divide-y divide-[#eef2f7]">
          {PET_AUDIENCES.map((pet) => {
            const isActive = activePetAudience === pet.id;
            const PetIcon = pet.icon;
            return (
              <button
                key={pet.id}
                type="button"
                role={itemRole}
                onClick={() => onSelectPetAudience(pet.id)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors group ${
                  isActive
                    ? 'bg-[#eff5ff] text-[#0667d0]'
                    : 'hover:bg-white text-[#17324d]'
                }`}
              >
                <PetIcon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#0667d0]'
                      : 'text-[#52657a] group-hover:text-[#0667d0]'
                  }`}
                />
                <span className="text-[13px] font-semibold leading-snug truncate">
                  {pet.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

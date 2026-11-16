import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import type { ProductItem } from '../data/mockData';

interface TiltCardProps {
  item: ProductItem;
  index: number;
  isLiked: boolean;
  isLoggedIn?: boolean;
  onToggleLike: (id: string) => void;
  onViewProduct: (item: ProductItem) => void;
  onAddToCart: (item: ProductItem) => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  item,
  index,
  isLiked,
  onToggleLike,
  onViewProduct,
  onAddToCart,
}) => {
  const cardRef = useRef<HTMLElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotionRef.current || !cardRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);

    rafRef.current = window.requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;
      card.style.transition = 'transform 100ms ease-out, border-color 200ms ease';
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      if (glareRef.current) {
        glareRef.current.style.opacity = '1';
        glareRef.current.style.background = `radial-gradient(320px circle at ${px * 100}% ${py * 100}%, rgba(255, 255, 255, 0.26), rgba(6, 103, 208, 0.03) 45%, transparent 80%)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (cardRef.current) {
      cardRef.current.style.transition =
        'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms ease';
      cardRef.current.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group card-elevate relative bg-white rounded-2xl border border-[#dfe6f0] overflow-hidden shadow-[0_2px_10px_rgba(23,50,77,0.03)] hover:border-[#0667d0]/40 flex flex-col"
    >
      {/* Subtle Mouse-Tracking Glare */}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 opacity-0"
      />

      {/* Image Container */}
      <div className="relative h-[220px] w-full overflow-hidden" style={{ backgroundColor: item.bgTone }}>
        <button
          type="button"
          onClick={() => onViewProduct(item)}
          aria-label={`Xem chi tiết ${item.name}`}
          className="w-full h-full block cursor-pointer focus-visible:outline-offset-[-2px]"
        >
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </button>

        {item.badge && (
          <div className="pointer-events-none absolute top-3.5 left-3.5 z-10 px-3 py-1.5 rounded-full bg-white/95 border border-[#dfe6f0] shadow-xs">
            <span className="text-[12px] font-bold tracking-wide uppercase text-[#17324d] block leading-none">
              {item.badge}
            </span>
          </div>
        )}

        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(item.id);
          }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          aria-pressed={isLiked}
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-white/95 border border-[#dfe6f0] shadow-xs flex items-center justify-center cursor-pointer transition-colors hover:bg-white"
          aria-label={isLiked ? `Bỏ ${item.name} khỏi yêu thích` : `Lưu ${item.name} vào yêu thích`}
        >
          <Heart
            aria-hidden="true"
            className={`w-4 h-4 transition-colors duration-200 ${
              isLiked ? 'fill-[#c2410c] text-[#c2410c]' : 'text-[#52657a]'
            }`}
          />
        </motion.button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white relative z-30">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#0667d0]">
              {item.brand}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#52657a] tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#ffb547] text-[#ffb547]" aria-hidden="true" />
              <span>{item.rating.toFixed(1)}</span>
              <span className="text-[#52657a]">({item.reviewCount})</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onViewProduct(item)}
            className="w-full text-left cursor-pointer"
          >
            <h2 className="text-[16px] font-bold text-[#17324d] group-hover:text-[#0667d0] transition-colors leading-snug line-clamp-2 mb-1.5">
              {item.name}
            </h2>
          </button>

          <p className="text-[13px] text-[#52657a] line-clamp-1 mb-4">
            {item.packSize}
          </p>
        </div>

        <div className="pt-3.5 border-t border-[#dfe6f0] flex items-center justify-between gap-3">
          <div className="tabular-nums">
            <div className="text-[18px] font-extrabold text-[#17324d] leading-none">
              {item.price}
            </div>
            {item.originalPrice && (
              <div className="text-[12px] text-[#52657a] line-through mt-1">
                {item.originalPrice}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="py-2 px-4 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 press-tactile"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};

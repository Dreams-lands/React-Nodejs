import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Star, ShoppingBag } from 'lucide-react';
import type { ProductItem } from '../data/mockData';

interface TiltCardProps {
  item: ProductItem;
  index: number;
  isLiked: boolean;
  isLoggedIn: boolean;
  onToggleLike: (id: string) => void;
  onViewProduct: (item: ProductItem) => void;
  onAddToCart: (item: ProductItem) => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  item,
  index,
  isLiked,
  isLoggedIn,
  onToggleLike,
  onViewProduct,
  onAddToCart,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 8;
    const rotateX = (0.5 - py) * 8;
    setTilt({
      rotateX,
      rotateY,
      glareX: px * 100,
      glareY: py * 100,
      hovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovered: false });
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
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(${
          tilt.hovered ? '-2px' : '0px'
        })`,
        transition: tilt.hovered
          ? 'transform 0.1s ease-out, box-shadow 0.25s ease'
          : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease',
      }}
      className="group relative bg-white rounded-2xl border border-[#dfe6f0] overflow-hidden shadow-[0_2px_10px_rgba(23,50,77,0.03)] hover:shadow-[0_16px_36px_rgba(6,103,208,0.1)] hover:border-[#0667d0]/40 flex flex-col"
    >
      {/* Subtle Mouse-Tracking Glare */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          background: `radial-gradient(320px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.26), rgba(6, 103, 208, 0.03) 45%, transparent 80%)`,
        }}
      />

      {/* Image Container */}
      <div
        onClick={() => onViewProduct(item)}
        className="relative h-[220px] w-full overflow-hidden cursor-pointer"
        style={{ backgroundColor: item.bgTone }}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {item.badge && (
          <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1.5 rounded-full bg-white/95 border border-[#dfe6f0] shadow-xs">
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
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-white/95 border border-[#dfe6f0] shadow-xs flex items-center justify-center cursor-pointer transition-colors hover:bg-white"
          aria-label={isLiked ? 'Bỏ khỏi yêu thích' : 'Lưu sản phẩm yêu thích'}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isLiked ? 'fill-[#c2410c] text-[#c2410c]' : 'text-[#52657a]'
            }`}
          />
        </motion.button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white relative z-30">
        <div onClick={() => onViewProduct(item)} className="cursor-pointer">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#0667d0]">
              {item.brand}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#52657a] tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#ffb547] text-[#ffb547]" />
              <span>{item.rating.toFixed(1)}</span>
              <span className="text-[#52657a]">({item.reviewCount})</span>
            </span>
          </div>

          <h2 className="text-[16px] font-bold text-[#17324d] group-hover:text-[#0667d0] transition-colors leading-snug line-clamp-2 mb-1.5">
            {item.name}
          </h2>

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

          {isLoggedIn ? (
            <motion.button
              type="button"
              onClick={() => onAddToCart(item)}
              whileTap={{ scale: 0.96 }}
              className="py-2 px-4 rounded-lg bg-[#0667d0] hover:bg-[#0558b5] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Thêm vào giỏ</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={() => onViewProduct(item)}
              whileTap={{ scale: 0.96 }}
              className="py-2 px-4 rounded-lg border border-[#dfe6f0] hover:border-[#0667d0] text-[#17324d] hover:text-[#0667d0] font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

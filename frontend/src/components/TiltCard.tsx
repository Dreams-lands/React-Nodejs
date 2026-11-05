import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import type { PetCardItem } from '../data/mockData';

interface TiltCardProps {
  item: PetCardItem;
  index: number;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onCardAction: (item: PetCardItem) => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  item,
  index,
  isLiked,
  onToggleLike,
  onCardAction,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 12; // -6deg to +6deg
    const rotateX = (0.5 - py) * 12; // -6deg to +6deg
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
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        type: 'spring',
        stiffness: 260,
        damping: 22,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${
          tilt.hovered ? '8px' : '0px'
        })`,
        transition: tilt.hovered
          ? 'transform 0.08s ease-out, box-shadow 0.25s ease'
          : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease',
      }}
      className="group relative bg-white rounded-[6px] border border-[#dfe6f0] overflow-hidden shadow-[0_2px_10px_rgba(23,50,77,0.04)] hover:shadow-[0_20px_42px_rgba(8,116,232,0.16)] hover:border-[#2161ed]/50 flex flex-col"
    >
      {/* Dynamic Mouse-Tracking Spotlight Glare Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          background: `radial-gradient(360px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.32), rgba(8, 116, 232, 0.05) 45%, transparent 80%)`,
        }}
      />

      {/* Image Container (Matches Figma 332x216 ratio & pastel backdrop) */}
      <div
        className="relative h-[216px] w-full overflow-hidden"
        style={{ backgroundColor: item.bgTone }}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Top-left Status Badge (Exact Figma style: white background, #35609a 10px Bold uppercase) */}
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-[3px] bg-white/95 backdrop-blur-xs shadow-xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#35609a] block leading-none">
            {item.badge}
          </span>
        </div>

        {/* Top-right Save/Like Button with Spring Pop */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(item.id);
          }}
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.82 }}
          className="absolute top-3 right-3 z-30 w-[30px] h-[30px] rounded-[4px] bg-white/95 shadow-xs flex items-center justify-center cursor-pointer transition-colors hover:bg-white"
          aria-label="Yêu thích"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isLiked ? 'fill-[#ff4757] text-[#ff4757]' : 'text-[#2161ed]'
            }`}
          />
        </motion.button>
      </div>

      {/* Card Body (Exact Figma spacing & typography) */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white relative z-30">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-[21px] font-bold text-[#2161ed] group-hover:text-[#0874e8] transition-colors leading-tight">
              {item.name}
            </h3>
            <span className="text-[18px] font-bold text-[#2161ed] shrink-0">
              {item.price}
            </span>
          </div>

          <p className="text-[14px] font-semibold text-[#35609a] mb-1">
            {item.breed}
          </p>
          <p className="text-[12px] text-[#6d7d94] mb-4 line-clamp-1">
            {item.meta}
          </p>
        </div>

        {/* Outlined Figma Button with TikTok Shimmer Fill Effect on Hover */}
        <motion.button
          type="button"
          onClick={() => onCardAction(item)}
          whileTap={{ scale: 0.97 }}
          className="relative overflow-hidden w-full h-[42px] rounded-[4px] border border-[#35609a]/60 group-hover:border-[#2161ed] bg-white group-hover:bg-[#2161ed] text-[#2161ed] group-hover:text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
        >
          {/* Diagonal Light Sweep on Hover */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <span className="relative z-10">{item.ctaLabel}</span>
          <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

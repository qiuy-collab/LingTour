import React from 'react';

interface ArchivalHeroProps {
  image: string;
  alt: string;
}

export const ArchivalHero: React.FC<ArchivalHeroProps> = ({ image, alt }) => {
  return (
    <div className="relative aspect-[3/4] rotate-2 overflow-hidden border-[12px] border-white bg-white scrapbook-shadow transition-transform duration-700 hover:rotate-0">
      {/* 漏光效果 */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50" />

      {/* 图像主体 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* 破碎边缘模拟/撕裂纹理叠加 */}
      <div className="absolute inset-0 z-20 border-[8px] border-white/20 opacity-30" />

      {/* 胶带效果 */}
      <div className="absolute -top-4 left-1/2 z-30 h-10 w-32 -translate-x-1/2 -rotate-2 border border-black/5 bg-white/40 backdrop-blur-[2px]" />

      <div className="absolute inset-0 bg-black/5" />
    </div>
  );
};

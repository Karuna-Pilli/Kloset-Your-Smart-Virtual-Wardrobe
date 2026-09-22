import React from 'react';
import klosetLogoImg from '../assets/images/kloset_logo_1787815217161.jpg';
import klosetIconImg from '../assets/images/kloset_icon_1787815235310.jpg';

interface AppLogoProps {
  variant?: 'full' | 'compact' | 'icon-only' | 'image-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'full',
  size = 'md',
  onClick,
  className = '',
}) => {
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  }[size];

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  if (variant === 'image-only') {
    return (
      <div
        onClick={onClick}
        className={`group select-none cursor-pointer transition-transform duration-300 hover:scale-[1.02] ${className}`}
        title="Kloset - Your smart virtual wardrobe"
      >
        <img
          src={klosetLogoImg}
          alt="Kloset - Your smart virtual wardrobe"
          className={`${heights} w-auto object-contain drop-shadow-xs`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'icon-only') {
    return (
      <div
        onClick={onClick}
        className={`group relative select-none cursor-pointer ${className}`}
        title="Kloset - Your smart virtual wardrobe"
      >
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#DFA995] via-[#C89452] to-[#39402D] rounded-2xl blur-2xs opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
          <div className={`${iconSizes} relative rounded-xl overflow-hidden bg-white border border-[#ECDACF] shadow-xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300`}>
            <img
              src={klosetIconImg}
              alt="Kloset - Your smart virtual wardrobe"
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-2 select-none cursor-pointer ${className}`}
      title="Kloset - Your smart virtual wardrobe"
    >
      {/* Brand Artwork Emblem */}
      <div className="relative flex items-center gap-2">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white border border-[#ECDACF] shadow-2xs p-0.5 shrink-0 group-hover:scale-105 transition-transform duration-300">
          <img
            src={klosetIconImg}
            alt="Kloset"
            className="w-full h-full object-cover rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex flex-col leading-none">
          <span
            className="font-serif font-extrabold text-[#39402D] tracking-tight text-base sm:text-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Kloset
          </span>
          <span className="text-[9px] sm:text-[10px] text-[#C89452] font-semibold tracking-tight whitespace-nowrap mt-0.5">
            Your smart virtual wardrobe
          </span>
        </div>
      </div>
    </div>
  );
};

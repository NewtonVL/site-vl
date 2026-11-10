import React from 'react';

interface BenefitBrandMarkProps {
  offerId: string;
}

/**
 * Marca visual compacta (SVG inline leve, sem dependências externas)
 * para distinguir discretamente cada produto na grade de benefícios.
 */
export const BenefitBrandMark: React.FC<BenefitBrandMarkProps> = ({ offerId }) => {
  switch (offerId) {
    case 'bonequinhas-virais':
      return (
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-[#F90078]/30 bg-[#101014]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <defs>
              <linearGradient id="bv-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F90078" />
                <stop offset="1" stopColor="#7A21E8" />
              </linearGradient>
            </defs>
            <circle cx="15" cy="12" r="4.5" fill="url(#bv-grad)" />
            <path
              d="M8.5 25.5C8.5 21.6 11.4 18.8 15 18.8C18.6 18.8 21.5 21.6 21.5 25.5"
              stroke="url(#bv-grad)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M24.5 6.5L25.4 8.8L27.7 9.7L25.4 10.6L24.5 12.9L23.6 10.6L21.3 9.7L23.6 8.8L24.5 6.5Z"
              fill="#F4C542"
            />
          </svg>
        </div>
      );

    case 'biopro':
      return (
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-[#3080FF]/30 bg-[#0F172B]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <path
              d="M17.5 5.5L9.5 17.2H15.8L14.5 26.5L22.5 14.8H16.2L17.5 5.5Z"
              fill="#3B82F6"
              stroke="#60A5FA"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="8.5" r="2.3" fill="#10B981" />
          </svg>
        </div>
      );

    case 'figurinhas-instagram':
      return (
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-[#FF146A]/25 bg-[#171717]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <path
              d="M8 7.5C8 6.4 8.9 5.5 10 5.5H24.5C25.6 5.5 26.5 6.4 26.5 7.5V19.2L19.7 26H10C8.9 26 8 25.1 8 24V7.5Z"
              fill="#FF146A"
            />
            <path d="M19.7 26V21C19.7 20 20.5 19.2 21.5 19.2H26.5L19.7 26Z" fill="#FFC2D9" />
            <path
              d="M16 11.2L17.1 13.8L19.8 14.9L17.1 16L16 18.7L14.9 16L12.2 14.9L14.9 13.8L16 11.2Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      );

    case 'pack-grid-boss':
      return (
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-[#E9DCE2] bg-[#FAF7F8]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <rect x="6" y="6" width="5.5" height="5.5" rx="1.4" fill="#1F1F1F" />
            <rect x="13.25" y="6" width="5.5" height="5.5" rx="1.4" fill="#F45489" />
            <rect x="20.5" y="6" width="5.5" height="5.5" rx="1.4" fill="#E7B8C9" />
            <rect x="6" y="13.25" width="5.5" height="5.5" rx="1.4" fill="#E7B8C9" />
            <rect x="13.25" y="13.25" width="5.5" height="5.5" rx="1.4" fill="#1F1F1F" />
            <rect x="20.5" y="13.25" width="5.5" height="5.5" rx="1.4" fill="#F45489" />
            <rect x="6" y="20.5" width="5.5" height="5.5" rx="1.4" fill="#F45489" />
            <rect x="13.25" y="20.5" width="5.5" height="5.5" rx="1.4" fill="#E7B8C9" />
            <rect x="20.5" y="20.5" width="5.5" height="5.5" rx="1.4" fill="#1F1F1F" />
          </svg>
        </div>
      );

    case 'bonequinhas-cristas':
      return (
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-[#E71367]/35 bg-[#0C090A]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <path
              d="M16 6.5V25.5M10.5 12.2H21.5"
              stroke="#E71367"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="16" cy="12.2" r="2.2" fill="#F8D7E4" />
            <path
              d="M24 6.5L24.7 8.3L26.5 9L24.7 9.7L24 11.5L23.3 9.7L21.5 9L23.3 8.3L24 6.5Z"
              fill="#EFC66F"
            />
          </svg>
        </div>
      );

    case 'barbearias':
      return (
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-[#FA4B00]/30 bg-[#18181B]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
            <rect x="11.5" y="6.5" width="9" height="19" rx="4.5" stroke="#FFFFFF" strokeWidth="1.8" />
            <path d="M12.2 12.2L19.8 9.2" stroke="#FA4B00" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M12.2 17.4L19.8 14.4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M12.2 22.4L19.8 19.4" stroke="#FA4B00" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );

    default:
      return null;
  }
};

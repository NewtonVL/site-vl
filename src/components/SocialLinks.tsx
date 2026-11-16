import React from 'react';

interface SocialLinkItem {
  id: string;
  label: string;
  ariaLabel: string;
  href: string;
  icon: React.ReactNode;
}

const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    ariaLabel: 'Instagram oficial da Vitrine Local (abre em nova aba)',
    href: 'https://www.instagram.com/vitrinelocaloficial/',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[18px] h-[18px]"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    ariaLabel: 'YouTube oficial da Vitrine Local (abre em nova aba)',
    href: 'https://www.youtube.com/@VitrineLocalOficial',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[19px] h-[19px]"
        aria-hidden="true"
      >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    ariaLabel: 'Facebook oficial da Vitrine Local (abre em nova aba)',
    href: 'https://www.facebook.com/vitrinelocaloficial',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[18px] h-[18px]"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

interface SocialLinksProps {
  className?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} role="navigation" aria-label="Redes sociais da Vitrine Local">
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.ariaLabel}
          title={item.label}
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
};

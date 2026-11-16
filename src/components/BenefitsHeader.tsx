import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowLeft, ShieldCheck } from 'lucide-react';
import { benefitsConfig } from '../config/benefits';

interface BenefitsHeaderProps {
  onNavigateHome: () => void;
}

export const BenefitsHeader: React.FC<BenefitsHeaderProps> = ({ onNavigateHome }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';

    if (href === '/') {
      e.preventDefault();
      onNavigateHome();
      return;
    }

    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <>
      <a
        href="#solucoes"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Pular para as soluções e ofertas
      </a>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#07080A]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
            : 'bg-[#07080A]/75 backdrop-blur-sm border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo & Identificação da Seção */}
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded-lg transition-opacity hover:opacity-95"
                aria-label="Vitrine Local - Voltar para Página Inicial"
              >
                <img
                  src="/logo-white.png"
                  alt="Logo Vitrine Local"
                  className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png';
                  }}
                />
              </a>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/15 h-5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">
                  {benefitsConfig.partner.name}
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7" aria-label="Navegação da página de benefícios">
              <a
                href="#solucoes"
                onClick={(e) => handleLinkClick(e, '#solucoes')}
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 py-1"
              >
                Soluções
              </a>
              <a
                href="#como-funciona"
                onClick={(e) => handleLinkClick(e, '#como-funciona')}
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 py-1"
              >
                Como Funciona
              </a>
              <a
                href="#regras"
                onClick={(e) => handleLinkClick(e, '#regras')}
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 py-1"
              >
                Condições
              </a>
            </nav>

            {/* Desktop Action */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Site Institucional</span>
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-benefits-nav"
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div ref={menuRef} className="md:hidden">
            <div
              className="fixed inset-0 top-[64px] bg-black/60 backdrop-blur-sm -z-10"
              onClick={() => {
                setMobileMenuOpen(false);
                document.body.style.overflow = '';
              }}
              aria-hidden="true"
            />

            <div
              id="mobile-benefits-nav"
              className="absolute inset-x-0 top-full bg-[#090B0E]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            >
              <div className="px-5 pt-4 pb-6 space-y-2">
                <a
                  href="#solucoes"
                  onClick={(e) => handleLinkClick(e, '#solucoes')}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Soluções & Descontos
                </a>
                <a
                  href="#como-funciona"
                  onClick={(e) => handleLinkClick(e, '#como-funciona')}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Como Funciona o Benefício
                </a>
                <a
                  href="#regras"
                  onClick={(e) => handleLinkClick(e, '#regras')}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Condições Resumidas
                </a>
                <div className="pt-3 border-t border-white/10">
                  <a
                    href="/"
                    onClick={(e) => handleLinkClick(e, '/')}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar ao Site Institucional</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

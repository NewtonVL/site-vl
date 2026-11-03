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
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-subtle border-b border-zinc-200/80 py-2.5 sm:py-3'
            : 'bg-white/90 backdrop-blur-sm border-b border-zinc-100 py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Partner Badge */}
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-brand rounded-lg transition-transform hover:opacity-95"
                aria-label="Vitrine Local - Voltar para Página Inicial"
              >
                <img
                  src="/logo.png"
                  alt="Logo Vitrine Local"
                  className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </a>

              <span className="hidden sm:inline-block w-px h-6 bg-zinc-200" aria-hidden="true" />

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-brand/20 text-brand text-[11px] font-semibold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                <span>{benefitsConfig.partner.name}</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7" aria-label="Navegação da página de benefícios">
              <a
                href="#solucoes"
                onClick={(e) => handleLinkClick(e, '#solucoes')}
                className="text-sm font-medium text-zinc-700 hover:text-brand transition-colors duration-150 py-1"
              >
                Soluções
              </a>
              <a
                href="#como-funciona"
                onClick={(e) => handleLinkClick(e, '#como-funciona')}
                className="text-sm font-medium text-zinc-700 hover:text-brand transition-colors duration-150 py-1"
              >
                Como Funciona
              </a>
              <a
                href="#regras"
                onClick={(e) => handleLinkClick(e, '#regras')}
                className="text-sm font-medium text-zinc-700 hover:text-brand transition-colors duration-150 py-1"
              >
                Condições
              </a>
            </nav>

            {/* Desktop Action: Back to main institutional site */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-brand bg-zinc-50 hover:bg-brand-50 border border-zinc-200 hover:border-brand-200 px-3.5 py-2 rounded-full transition-all duration-200 shadow-sm"
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
                className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-700 hover:text-brand hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-benefits-nav"
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div ref={menuRef} className="md:hidden">
            <div
              className="fixed inset-0 top-[57px] bg-black/20 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
              onClick={() => {
                setMobileMenuOpen(false);
                document.body.style.overflow = '';
              }}
              aria-hidden="true"
            />

            <div
              id="mobile-benefits-nav"
              className="absolute inset-x-0 top-full bg-white/98 backdrop-blur-xl border-b border-zinc-200 shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-top-2"
            >
              <div className="px-5 pt-4 pb-6 space-y-2.5">
                <a
                  href="#solucoes"
                  onClick={(e) => handleLinkClick(e, '#solucoes')}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-800 hover:text-brand hover:bg-brand-50 transition-colors"
                >
                  Soluções & Descontos
                </a>
                <a
                  href="#como-funciona"
                  onClick={(e) => handleLinkClick(e, '#como-funciona')}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-800 hover:text-brand hover:bg-brand-50 transition-colors"
                >
                  Como Funciona o Benefício
                </a>
                <a
                  href="#regras"
                  onClick={(e) => handleLinkClick(e, '#regras')}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-800 hover:text-brand hover:bg-brand-50 transition-colors"
                >
                  Condições Resumidas
                </a>
                <div className="pt-3 border-t border-zinc-100">
                  <a
                    href="/"
                    onClick={(e) => handleLinkClick(e, '/')}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
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

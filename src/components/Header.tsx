import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Mail } from 'lucide-react';
import { siteConfig } from '../config/site';

export const Header: React.FC = () => {
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
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Pular para o conteúdo principal
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
            {/* Logo Branca Unificada */}
            <a
              href="#inicio"
              onClick={(e) => handleLinkClick(e, '#inicio')}
              className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded-lg transition-opacity hover:opacity-95"
              aria-label="Vitrine Local - Página Inicial"
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
              {siteConfig.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 py-1 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="#contato"
                onClick={(e) => handleLinkClick(e, '#contato')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 px-4 py-2.5 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                <Mail className="w-3.5 h-3.5 text-brand" />
                <span>Contato</span>
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
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
              id="mobile-navigation"
              className="absolute inset-x-0 top-full bg-[#090B0E]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            >
              <div className="px-5 pt-4 pb-6 space-y-2">
                {siteConfig.navigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-white/10">
                  <a
                    href="#contato"
                    onClick={(e) => handleLinkClick(e, '#contato')}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-600 transition-colors shadow-orange-glow"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Fale com a Vitrine Local</span>
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

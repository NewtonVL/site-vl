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

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
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
    
    // Smooth scroll support across mobile browsers
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
      {/* Skip Link for Accessibility */}
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Pular para o conteúdo principal
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
            {/* Logo */}
            <a
              href="#inicio"
              onClick={(e) => handleLinkClick(e, '#inicio')}
              className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-brand rounded-lg transition-transform hover:opacity-95"
              aria-label="Vitrine Local - Página Inicial"
            >
              <img
                src="/logo.png"
                alt="Logo Vitrine Local"
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
              {siteConfig.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-zinc-700 hover:text-brand transition-colors duration-150 py-1 border-b-2 border-transparent hover:border-brand"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="#contato"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 bg-zinc-50 hover:bg-brand-50 hover:text-brand border border-zinc-200 hover:border-brand-200 px-4 py-2 rounded-full transition-all duration-200 shadow-sm"
              >
                <Mail className="w-4 h-4 text-brand" />
                <span>Contato</span>
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-700 hover:text-brand hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div ref={menuRef} className="md:hidden">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 top-[57px] bg-black/20 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
              onClick={() => {
                setMobileMenuOpen(false);
                document.body.style.overflow = '';
              }}
              aria-hidden="true"
            />

            <div
              id="mobile-navigation"
              className="absolute inset-x-0 top-full bg-white/98 backdrop-blur-xl border-b border-zinc-200 shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-top-2"
            >
              <div className="px-5 pt-4 pb-6 space-y-2.5">
                {siteConfig.navigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-800 hover:text-brand hover:bg-brand-50 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-zinc-100">
                  <a
                    href="#contato"
                    onClick={(e) => handleLinkClick(e, '#contato')}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-600 transition-colors shadow-sm"
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

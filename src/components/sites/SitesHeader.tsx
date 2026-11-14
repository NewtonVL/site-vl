import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowLeft, MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '../../config/sitesLanding';

interface SitesHeaderProps {
  onNavigateHome: () => void;
}

export const SitesHeader: React.FC<SitesHeaderProps> = ({ onNavigateHome }) => {
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
        window.history.pushState(null, '', `/sites${href}`);
      }
    }
  };

  // 4 âncoras essenciais para navegação limpa, sem superlotação
  const navLinks = [
    { label: "Diferencial", href: "#diferencial" },
    { label: "Solução 3 em 1", href: "#solucao" },
    { label: "Portfólio", href: "#portfolio" },
    { label: "Condições (10x)", href: "#contratar" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-950/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3.5'
          : 'bg-dark-950/70 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Marca Comercial Co-branded */}
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-left group focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded-lg"
              aria-label="Voltar para a página inicial da Vitrine Local"
            >
              <img
                src="/logo-white.png"
                alt="Vitrine Local"
                className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "/logo.png";
                }}
              />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/15 h-5">
              <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-400">
                Tecnologia
              </span>
              <a
                href="https://newneo.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-white hover:text-brand transition-colors duration-200"
              >
                NEWNEO
              </a>
            </div>
          </div>

          {/* Desktop Navigation Links — 4 âncoras essenciais com tipografia refinada */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Início VL</span>
            </button>
            <a
              href={buildWhatsAppLink("header")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 motion-reduce:transform-none transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={buildWhatsAppLink("header")}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-brand text-white hover:bg-brand-600 transition-colors duration-200"
              aria-label="WhatsApp comercial oficial"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-x-0 top-[65px] bottom-0 bg-dark-950/98 backdrop-blur-xl border-b border-white/10 z-40 p-6 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-3 pt-2">
            <div className="pb-3 border-b border-white/10">
              <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400">
                Menu de Seções
              </span>
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="block text-base font-semibold text-zinc-100 hover:text-brand-400 py-2.5 border-b border-white/5 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <a
              href={buildWhatsAppLink("spontaneous_visitor")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Conversar no WhatsApp</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateHome();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao portal Vitrine Local</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

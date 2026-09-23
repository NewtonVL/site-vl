import React from 'react';
import { ArrowUp } from 'lucide-react';
import { siteConfig } from '../config/site';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 pb-12 border-b border-zinc-800/80">
          
          {/* Brand Info & White Logo */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
            <a
              href="#inicio"
              className="inline-block mb-4 transition-opacity hover:opacity-90"
              aria-label="Voltar ao início"
            >
              <img
                src="/logo-white.png"
                alt="Vitrine Local - Logo Branca"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </a>
            <p className="text-zinc-400 text-sm leading-relaxed mt-2">
              Aproximando pessoas de empresas e profissionais que fazem parte da vida em suas comunidades.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-8 sm:gap-14">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 text-center sm:text-left">
                Navegação
              </h4>
              <ul className="space-y-2.5 text-center sm:text-left">
                {siteConfig.navigation.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 text-center sm:text-left">
                Contato
              </h4>
              <ul className="space-y-2.5 text-center sm:text-left">
                <li>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="text-sm text-zinc-400 hover:text-brand transition-colors break-all"
                  >
                    {siteConfig.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Back to top button */}
          <div className="flex flex-col items-center md:items-end">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors text-xs font-semibold"
              aria-label="Voltar ao topo da página"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5 text-brand" />
            </button>
          </div>
        </div>

        {/* Bottom Bar with Automated Year */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {currentYear} {siteConfig.brand.name}. Todos os direitos reservados.
          </p>
          <p className="text-zinc-500">
            Conectando pessoas, negócios e oportunidades.
          </p>
        </div>
      </div>
    </footer>
  );
};

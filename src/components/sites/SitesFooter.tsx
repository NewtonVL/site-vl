import React from 'react';
import { ExternalLink, ArrowUp } from 'lucide-react';

interface SitesFooterProps {
  onNavigateHome: () => void;
}

export const SitesFooter: React.FC<SitesFooterProps> = ({ onNavigateHome }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-zinc-400 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Presentation */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="text-left group focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded-lg"
                aria-label="Ir para página principal da Vitrine Local"
              >
                <img
                  src="/logo-white.png"
                  alt="Vitrine Local"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = "/logo.png";
                  }}
                />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Vitrine Local é a marca responsável pelo relacionamento comercial, atendimento e apresentação de soluções digitais para empresas e negócios locais.
            </p>
            <div className="text-xs text-zinc-500">
              Contato oficial: comercial@vitrinelocal.com.br • WhatsApp: (61) 99620-2519
            </div>
          </div>

          {/* Technology & Partnership */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Engenharia e Parcerias
            </h4>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-semibold">
                  Desenvolvimento Tecnológico
                </span>
                <a
                  href="https://newneo.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand font-bold inline-flex items-center gap-1 mt-0.5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded"
                >
                  <span>NEWNEO Tecnologia</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Empresa responsável pela criação, engenharia e desenvolvimento dos sites.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-semibold">
                  Benefício Complementar de Links
                </span>
                <a
                  href="https://bioprolink.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-sky-400 font-bold inline-flex items-center gap-1 mt-0.5 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none rounded"
                >
                  <span>BioPro Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-[11px] text-zinc-400 mt-1">
                  12 meses de acesso à plataforma oficial de centralização de links incluídos no pacote.
                </p>
              </div>
            </div>
          </div>

          {/* Fast Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegação Rápida
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={onNavigateHome}
                  className="hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded"
                >
                  Início institucional (VL)
                </button>
              </li>
              <li>
                <a href="#diferencial" className="hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded">
                  Diferencial da demonstração
                </a>
              </li>
              <li>
                <a href="#solucao" className="hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded">
                  O que está incluído
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded">
                  Portfólio verificado
                </a>
              </li>
              <li>
                <a href="#contratar" className="hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded">
                  Condições comerciais (10x)
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded">
                  Perguntas frequentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} Vitrine Local. Todos os direitos reservados.
          </div>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            <span>Voltar ao topo</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

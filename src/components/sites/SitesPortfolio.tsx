import React, { useState } from 'react';
import { ExternalLink, Check } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesPortfolio: React.FC = () => {
  const { portfolio } = SITES_CONFIG;
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  const activeProject = portfolio.items[activeProjectIndex];

  return (
    <section id="portfolio" className="relative py-20 lg:py-28 bg-dark-950 text-white border-t border-b border-white/5 overflow-hidden">
      {/* Luz ambiente de fundo */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand/10 rounded-full blur-[150px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção com Direção de Arte */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {portfolio.title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
            {portfolio.subtitle}
          </p>
        </div>

        {/* Abas de Navegação entre Projetos */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {portfolio.items.map((item, idx) => {
            const isActive = idx === activeProjectIndex;
            return (
              <button
                key={item.id}
                onClick={() => setActiveProjectIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 border focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                  isActive
                    ? 'bg-brand text-white border-brand shadow-orange-glow'
                    : 'bg-dark-900/80 text-zinc-400 hover:text-white border-white/10 hover:border-white/20'
                }`}
              >
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Vitrine Visual Protagonista com Mockup Real */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Barra do Navegador */}
            <div className="bg-dark-950 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-dark-900 border border-white/5 text-[11px] font-mono text-zinc-400 max-w-[200px] sm:max-w-md truncate">
                <span className="text-emerald-400">https://</span>
                <span className="truncate">{activeProject.url.replace(/^https?:\/\//, '')}</span>
              </div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hidden sm:block">
                {activeProject.badge}
              </div>
            </div>

            {/* Cabeçalho Compacto do Projeto no Mobile (visível antes da imagem no celular) */}
            <div className="p-5 pb-0 lg:hidden text-left">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand block mb-1">
                {activeProject.category}
              </span>
              <h3 className="text-2xl font-black text-white leading-tight">
                {activeProject.name}
              </h3>
              <p className="text-xs font-medium text-zinc-400 mt-0.5">
                {activeProject.tagline}
              </p>
            </div>

            {/* Grid da Vitrine: Imagem sempre protagonista e no topo no mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-5 sm:p-8 lg:p-10 items-center">
              {/* Imagem Protagonista (ordem 1 no mobile e ordem 1 no desktop) */}
              <div className="lg:col-span-7 xl:col-span-8 order-1">
                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
                  <img
                    src={activeProject.image}
                    alt={`Captura real do projeto ${activeProject.name}`}
                    className="w-full h-auto object-cover max-h-[460px] transform group-hover:scale-[1.01] transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Informações Concisas & Único CTA (ordem 2 no mobile e ordem 2 no desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 order-2 space-y-4 text-left">
                {/* Título Visível no Desktop */}
                <div className="hidden lg:block">
                  <span className="text-xs uppercase tracking-wider font-semibold text-brand block mb-1">
                    {activeProject.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {activeProject.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-zinc-400 mt-1">
                    {activeProject.tagline}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {activeProject.description}
                </p>

                {/* Identificação Honesta e Transparente da Natureza do Projeto */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300">
                  <strong className="text-white block mb-0.5">Identificação do projeto:</strong>
                  {activeProject.natureText}
                </div>

                {/* Highlights essenciais */}
                <ul className="space-y-1.5 pt-1 text-xs text-zinc-300">
                  {activeProject.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                {/* ÚNICO CTA CLARO E DIRETO */}
                <div className="pt-2">
                  <a
                    href={activeProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none"
                  >
                    <span>Ver demonstração ao vivo</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

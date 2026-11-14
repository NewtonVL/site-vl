import React, { useState } from 'react';
import { ExternalLink, Check, Lock } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesPortfolio: React.FC = () => {
  const { portfolio } = SITES_CONFIG;
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  const activeProject = portfolio.items[activeProjectIndex];

  return (
    <section id="portfolio" className="relative py-24 lg:py-32 bg-[#090A0C] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção com Direção de Arte */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">
            Portfólio & Demonstrações
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] mb-4">
            Projetos de demonstração <span className="font-light text-zinc-400">e referências do ecossistema</span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            {portfolio.subtitle}
          </p>
        </div>

        {/* Abas em Segmented Control Minimalista */}
        <div className="flex justify-start sm:justify-center mb-10 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <div className="inline-flex p-1 rounded-xl bg-[#0F1115] border border-white/5 max-w-full">
            {portfolio.items.map((item, idx) => {
              const isActive = idx === activeProjectIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveProjectIndex(idx)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vitrine Visual Protagonista com Mockup Real */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* Barra do Navegador com Acabamento Refinado */}
            <div className="bg-[#0B0C0E] px-4 sm:px-6 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[11px] font-mono text-zinc-400 max-w-[200px] sm:max-w-md truncate">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-zinc-500">https://</span>
                <span className="truncate text-zinc-300">{activeProject.url.replace(/^https?:\/\//, '')}</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider hidden sm:block">
                {activeProject.badge}
              </div>
            </div>

            {/* Cabeçalho Compacto do Projeto no Mobile */}
            <div className="p-5 pb-0 lg:hidden text-left">
              <span className="font-mono text-xs text-zinc-400 block mb-1">
                {activeProject.category}
              </span>
              <h3 className="text-2xl font-bold text-white leading-tight">
                {activeProject.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {activeProject.tagline}
              </p>
            </div>

            {/* Grid da Vitrine: Imagem + Metadados e CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 p-5 sm:p-8 lg:p-10 items-center">
              {/* Imagem Protagonista */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
                  <img
                    src={activeProject.image}
                    alt={`Captura real do projeto ${activeProject.name}`}
                    className="w-full h-auto object-cover max-h-[480px] transform group-hover:scale-[1.01] transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Informações Concisas & Único CTA */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4 text-left">
                {/* Título Visível no Desktop */}
                <div className="hidden lg:block">
                  <span className="font-mono text-xs text-zinc-400 block mb-1">
                    {activeProject.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {activeProject.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    {activeProject.tagline}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  {activeProject.description}
                </p>

                {/* Identificação Honesta e Transparente da Natureza do Projeto */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400 leading-relaxed">
                  <span className="text-zinc-200 font-semibold block mb-1">Classificação do projeto:</span>
                  {activeProject.natureText}
                </div>

                {/* Destaques essenciais */}
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none"
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

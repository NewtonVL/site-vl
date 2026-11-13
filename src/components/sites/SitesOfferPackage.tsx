import React from 'react';
import { Globe, Video, Link2, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesOfferPackage: React.FC = () => {
  const { offer } = SITES_CONFIG;

  const siteItem = offer.items.find((i) => i.id === 'site')!;
  const kitItem = offer.items.find((i) => i.id === 'kit-instagram')!;
  const bioproItem = offer.items.find((i) => i.id === 'biopro')!;

  return (
    <section id="solucao" className="relative py-20 lg:py-28 bg-dark-900 text-white overflow-hidden border-t border-b border-white/5">
      {/* Background decorations */}
      <div
        className="absolute top-1/2 left-0 w-96 h-96 bg-brand/10 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Descentralizado e Editorial */}
        <div className="max-w-4xl text-left mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-brand block mb-2">
            A Solução Completa 3 em 1
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {offer.title}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
            {offer.subtitle}
          </p>
        </div>

        {/* Composição Hierárquica: O Site como Flagship Protagonista + 2 Multiplicadores */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-stretch">
          {/* Flagship Protagonista: Site Profissional (7 colunas no Desktop) */}
          <div className="lg:col-span-7 rounded-2xl p-8 sm:p-10 bg-dark-950 border-2 border-brand/50 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl bg-brand text-xs font-black uppercase tracking-wider text-white">
              {siteItem.highlight}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-brand/10 border border-brand/30 text-brand">
                  <Globe className="w-7 h-7 text-brand" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-brand block">
                    {siteItem.subtitle}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {siteItem.title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-zinc-300 leading-relaxed mb-6">
                {siteItem.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Especificações principais do site:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {siteItem.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-200">
                      <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>Engenharia e desenvolvimento de padrão cinematográfico</span>
              <span className="font-mono text-zinc-500 font-bold">Item 01</span>
            </div>
          </div>

          {/* Coluna de Multiplicadores (5 colunas no Desktop com os 2 itens integrados) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {/* Multiplicador 1: Kit Instagram 3D */}
            <div className="rounded-2xl p-7 bg-dark-950/90 border border-white/10 hover:border-purple-500/40 transition-colors duration-200 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Video className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
                    {kitItem.highlight}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mb-1">
                  {kitItem.title}
                </h4>
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-3">
                  {kitItem.subtitle}
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {kitItem.description}
                </p>

                <ul className="space-y-2 text-xs text-zinc-300">
                  {kitItem.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {kitItem.note && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
                  {kitItem.note}
                </div>
              )}
            </div>

            {/* Multiplicador 2: BioPro 12 Meses */}
            <div className="rounded-2xl p-7 bg-dark-950/90 border border-white/10 hover:border-sky-500/40 transition-colors duration-200 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <Link2 className="w-5 h-5 text-sky-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-300">
                    {bioproItem.highlight}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mb-1">
                  {bioproItem.title}
                </h4>
                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-3">
                  {bioproItem.subtitle}
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {bioproItem.description}
                </p>

                <ul className="space-y-2 text-xs text-zinc-300">
                  {bioproItem.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-sky-400 border-t border-white/5">
                <span>Plataforma parceira incluída por 12 meses</span>
                <a
                  href="https://bioprolink.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline font-semibold"
                >
                  <span>Conhecer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Faixa Editorial de Fechamento do Pacote */}
        <div className="rounded-2xl p-6 sm:p-8 bg-dark-950 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-left space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand shrink-0" />
              <span>Solução Integrada de Presença Digital</span>
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300">
              Site profissional, peças estratégicas para o Instagram e hub centralizador de links em um pacote único.
            </p>
          </div>
          <a
            href="#contratar"
            className="shrink-0 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-600 transition-colors duration-200 shadow-orange-glow focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            Conhecer Condições em 10x
          </a>
        </div>
      </div>
    </section>
  );
};

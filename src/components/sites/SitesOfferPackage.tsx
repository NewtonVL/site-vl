import React from 'react';
import { Globe, Video, Link2, Check, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesOfferPackage: React.FC = () => {
  const { offer } = SITES_CONFIG;

  const siteItem = offer.items.find((i) => i.id === 'site')!;
  const kitItem = offer.items.find((i) => i.id === 'kit-instagram')!;
  const bioproItem = offer.items.find((i) => i.id === 'biopro')!;

  return (
    <section id="solucao" className="relative py-24 lg:py-32 bg-[#090A0C] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Descentralizado e Editorial */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">
            Solução Integrada
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] mb-4">
            Os três componentes <span className="font-light text-zinc-400">da sua presença digital</span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            {offer.subtitle}
          </p>
        </div>

        {/* Grid de Soluções: Flagship Central + Multiplicadores em Equilíbrio Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-12">
          {/* Flagship: Site Profissional (7 colunas no Desktop) */}
          <div className="lg:col-span-7 rounded-2xl p-7 sm:p-9 bg-[#0F1115] border border-white/10 flex flex-col justify-between relative shadow-xl">
            <div>
              {/* Header do Item Principal: Reorganizado com amplo respiro no mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-medium">
                      {siteItem.subtitle}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                      {siteItem.title}
                    </h3>
                  </div>
                </div>

                <div className="self-start sm:self-auto pl-14 sm:pl-0">
                  <span className="inline-block px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-medium">
                    {siteItem.highlight}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                {siteItem.description}
              </p>

              {/* Especificações Técnicas em Grid */}
              <div className="pt-6 border-t border-white/5">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block mb-3">
                  Especificações principais do projeto:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {siteItem.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Engenharia & desenvolvimento NEWNEO</span>
              <span>Componente 01</span>
            </div>
          </div>

          {/* Coluna Direita: Multiplicadores em Paleta Neutra e Harmoniosa */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {/* Componente 02: Kit Instagram 3D */}
            <div className="rounded-2xl p-7 bg-[#0F1115]/80 border border-white/5 hover:border-white/15 transition-all duration-200 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
                    Componente 02
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-1">
                  {kitItem.title}
                </h4>
                <p className="text-xs text-zinc-400 mb-3">
                  {kitItem.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                  {kitItem.description}
                </p>

                <ul className="space-y-2 text-xs text-zinc-300">
                  {kitItem.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {kitItem.note && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-500 leading-relaxed">
                  {kitItem.note}
                </div>
              )}
            </div>

            {/* Componente 03: BioPro 12 Meses */}
            <div className="rounded-2xl p-7 bg-[#0F1115]/80 border border-white/5 hover:border-white/15 transition-all duration-200 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
                    Componente 03
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-1">
                  {bioproItem.title}
                </h4>
                <p className="text-xs text-zinc-400 mb-3">
                  {bioproItem.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                  {bioproItem.description}
                </p>

                <ul className="space-y-2 text-xs text-zinc-300">
                  {bioproItem.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-white/5">
                <span>12 meses de acesso oficial incluídos</span>
                <a
                  href="https://bioprolink.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-300 hover:text-white transition-colors duration-150 font-medium"
                >
                  <span>Conhecer plataforma</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Faixa Arquitetural de Fechamento do Pacote */}
        <div className="rounded-2xl p-6 sm:p-7 bg-[#0F1115]/50 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="text-left space-y-1">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
              <span>Solução Integrada de Presença Digital</span>
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400">
              Site profissional, peças estratégicas para o Instagram e hub centralizador de links em um pacote único com condições facilitadas.
            </p>
          </div>
          <a
            href="#contratar"
            className="shrink-0 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white group transition-colors"
          >
            <span>Ver condições em até 10x</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

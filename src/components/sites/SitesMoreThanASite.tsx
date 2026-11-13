import React from 'react';
import { ShieldCheck, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesMoreThanASite: React.FC = () => {
  const { moreThanASite } = SITES_CONFIG;

  const iconMap: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-brand" />,
    MessageCircle: <MessageCircle className="w-5 h-5 text-brand" />,
    Sparkles: <Sparkles className="w-5 h-5 text-brand" />,
    TrendingUp: <TrendingUp className="w-5 h-5 text-brand" />,
  };

  return (
    <section className="relative py-20 lg:py-28 bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Coluna Editorial Esquerda: Conceito e Autoridade */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-widest font-bold text-brand block">
              Posicionamento & Valor Comercial
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              {moreThanASite.title}
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              {moreThanASite.subtitle}
            </p>

            <div className="p-6 rounded-2xl bg-white/5 border-l-2 border-brand text-sm text-zinc-300 leading-relaxed space-y-2">
              <span className="font-bold text-white block">Posicionamento que gera resultados:</span>
              <span>
                Empresas que possuem um site próprio de alto nível constroem autoridade instantânea e eliminam a dependência exclusiva de perfis e algoritmos de redes sociais.
              </span>
            </div>
          </div>

          {/* Coluna Direita: 4 Pilares Comerciais em Lista Editorial Aberta (Sem cards repetitivos) */}
          <div className="lg:col-span-7 divide-y divide-white/10">
            {moreThanASite.pillars.map((pillar, idx) => (
              <div
                key={pillar.id}
                className="py-6 first:pt-0 last:pb-0 flex items-start gap-5 group"
              >
                <div className="pt-1 flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-bold text-zinc-500 group-hover:text-brand transition-colors duration-200">
                    0{idx + 1}
                  </span>
                  <div className="p-2.5 rounded-xl bg-white/5 text-brand group-hover:bg-brand/10 transition-colors duration-200">
                    {iconMap[pillar.icon]}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-brand-300 transition-colors duration-200">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

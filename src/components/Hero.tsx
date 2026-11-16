import React from 'react';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../config/site';

export const Hero: React.FC = () => {
  return (
    <section
      id="inicio"
      className="relative py-20 sm:py-28 lg:py-32 bg-[#07080A] text-white overflow-hidden border-b border-white/5"
    >
      {/* Luz ambiente sutil de profundidade */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[280px] bg-brand/12 rounded-full blur-[160px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Overline Editorial Discreto (sem pílula pesada) */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-zinc-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" aria-hidden="true" />
            <span>{siteConfig.brand.institutionalTag}</span>
          </div>

          {/* Headline com contraste editorial */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-[-0.025em] leading-[1.12] [text-wrap:balance] mb-5">
            Conectando pessoas, negócios{' '}
            <span className="text-brand inline-block">
              e oportunidades.
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-xl text-zinc-300 font-normal leading-relaxed mb-9 max-w-2xl mx-auto [text-wrap:pretty]">
            {siteConfig.hero.subtitle}
          </p>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <a
              href={siteConfig.hero.primaryCta.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080A] group"
            >
              <span>{siteConfig.hero.primaryCta.text}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>

            <a
              href={siteConfig.hero.secondaryCta.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <span>{siteConfig.hero.secondaryCta.text}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

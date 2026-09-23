import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { siteConfig } from '../config/site';

export const Hero: React.FC = () => {
  return (
    <section
      id="inicio"
      className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-white via-zinc-50/50 to-white overflow-hidden"
    >
      {/* Subtle background ambient lights (moderate orange) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-50/60 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 text-zinc-700 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 sm:mb-8 transition-transform hover:scale-[1.02]">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span>{siteConfig.brand.institutionalTag}</span>
          </div>

          {/* Exact Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] mb-6 sm:mb-8">
            Conectando pessoas, negócios{' '}
            <span className="text-brand inline-block">
              e oportunidades.
            </span>
          </h1>

          {/* Exact Hero Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-zinc-600 font-normal leading-relaxed mb-10 sm:mb-12 max-w-3xl mx-auto">
            {siteConfig.hero.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <a
              href={siteConfig.hero.primaryCta.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-brand hover:bg-brand-600 shadow-orange-glow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <span>{siteConfig.hero.primaryCta.text}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={siteConfig.hero.secondaryCta.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-200"
            >
              <span>{siteConfig.hero.secondaryCta.text}</span>
            </a>
          </div>

          {/* Visual Indicator of Identity */}
          <div className="mt-16 sm:mt-20 pt-10 border-t border-zinc-100 flex flex-col items-center">
            <div className="flex items-center gap-3 text-xs tracking-wider uppercase text-zinc-400 font-medium">
              <span>Fortalecendo a economia local</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span>Relações de confiança</span>
            </div>
            
            <a
              href="#sobre"
              className="mt-6 inline-flex items-center justify-center p-2 rounded-full text-zinc-400 hover:text-brand hover:bg-zinc-100 transition-colors"
              aria-label="Rolar para a seção Sobre"
            >
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

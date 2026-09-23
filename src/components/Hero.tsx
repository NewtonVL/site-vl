import React from 'react';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../config/site';

export const Hero: React.FC = () => {
  return (
    <section
      id="inicio"
      className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-b from-white via-zinc-50/40 to-white overflow-hidden"
    >
      {/* Subtle background ambient light */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-brand-50/50 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 text-zinc-700 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 sm:mb-6 transition-transform hover:scale-[1.02]">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span>{siteConfig.brand.institutionalTag}</span>
          </div>

          {/* Exact Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.18] mb-4 sm:mb-6">
            Conectando pessoas, negócios{' '}
            <span className="text-brand inline-block">
              e oportunidades.
            </span>
          </h1>

          {/* Exact Hero Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-zinc-600 font-normal leading-relaxed mb-8 sm:mb-9 max-w-2xl mx-auto">
            {siteConfig.hero.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <a
              href={siteConfig.hero.primaryCta.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-brand hover:bg-brand-600 shadow-orange-glow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <span>{siteConfig.hero.primaryCta.text}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={siteConfig.hero.secondaryCta.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-200"
            >
              <span>{siteConfig.hero.secondaryCta.text}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

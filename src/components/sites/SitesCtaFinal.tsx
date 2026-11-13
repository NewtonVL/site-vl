import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesCtaFinal: React.FC = () => {
  const { ctaFinal } = SITES_CONFIG;

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-dark-950 via-dark-900 to-black text-white overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand/20 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Big Impact Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          {ctaFinal.headline}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-zinc-200 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          {ctaFinal.subheadline}
        </p>

        {/* Big CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href={buildWhatsAppLink("commercial_contract")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-lg font-black text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 motion-reduce:transform-none transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none group"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span>{ctaFinal.ctaButtonText}</span>
            <ArrowRight className="w-5 h-5 motion-reduce:transform-none transition-transform duration-200 group-hover:translate-x-1.5" />
          </a>
        </div>

        {/* Reassurance text */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-zinc-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{ctaFinal.footnote}</span>
        </div>
      </div>
    </section>
  );
};

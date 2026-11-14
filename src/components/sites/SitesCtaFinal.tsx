import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesCtaFinal: React.FC = () => {
  const { ctaFinal } = SITES_CONFIG;

  return (
    <section className="relative py-24 lg:py-32 bg-[#090A0C] text-white border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Big Impact Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-5">
          {ctaFinal.headline}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          {ctaFinal.subheadline}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href={buildWhatsAppLink("commercial_contract")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none group"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{ctaFinal.ctaButtonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Reassurance text */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{ctaFinal.footnote}</span>
        </div>
      </div>
    </section>
  );
};

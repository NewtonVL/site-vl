import React from 'react';
import { CreditCard, MessageCircle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesCommercial: React.FC = () => {
  const { commercial } = SITES_CONFIG;

  return (
    <section id="contratar" className="relative py-24 bg-dark-950 text-white border-t border-b border-white/5 overflow-hidden">
      {/* Background glow behind commercial box */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand/15 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {commercial.title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
            {commercial.subtitle}
          </p>
        </div>

        {/* Central High-Impact Commercial Box */}
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-dark-900 to-dark-950 border-2 border-brand/40 shadow-2xl relative overflow-hidden text-center">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/20 border border-brand/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6">
            <CreditCard className="w-4 h-4 text-brand" />
            <span>{commercial.highlightBadge}</span>
          </div>

          {/* Huge Main Condition Callout — Tipografia sólida com autoridade máxima */}
          <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4 text-brand">
            {commercial.highlightMain}
          </h3>

          <p className="text-base sm:text-lg text-zinc-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            {commercial.highlightDescription}
          </p>

          {/* Included Features Summary in Commercial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Site Premium</span>
                <span className="text-[11px] text-zinc-400">Design cinematográfico</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Kit Instagram</span>
                <span className="text-[11px] text-zinc-400">2 imagens + 1 vídeo 3D</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">BioPro (12 meses)</span>
                <span className="text-[11px] text-zinc-400">Centralizador de links</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={buildWhatsAppLink("commercial_contract")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl text-base font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 motion-reduce:transform-none transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none group"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>{commercial.ctaText}</span>
              <ArrowRight className="w-4 h-4 motion-reduce:transform-none transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>

          {/* Footnote reassurance */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Demonstração visual prévia • Atendimento comercial direto no WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
};

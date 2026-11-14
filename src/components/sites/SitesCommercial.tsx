import React from 'react';
import { CreditCard, MessageCircle, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesCommercial: React.FC = () => {
  const { commercial } = SITES_CONFIG;

  return (
    <section id="contratar" className="relative py-24 lg:py-32 bg-[#090A0C] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">
            Condições Comerciais
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] mb-4">
            Investimento personalizado <span className="font-light text-zinc-400">para o seu negócio</span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            {commercial.subtitle}
          </p>
        </div>

        {/* Painel Executivo de Condições */}
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 lg:p-14 bg-[#0F1115] border border-white/10 shadow-2xl relative">
          <div className="flex flex-col items-center text-center">
            {/* Tag de Condição */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium tracking-wide mb-6">
              <CreditCard className="w-3.5 h-3.5 text-brand" />
              <span>Condição Comercial Facilitada</span>
            </div>

            {/* Headline com Tipografia Firme e Elegante */}
            <h3 className="text-2xl sm:text-4xl lg:text-[38px] font-bold tracking-tight leading-tight text-white mb-4">
              Parcelamento em até 10 vezes no cartão
            </h3>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
              {commercial.highlightDescription}
            </p>

            {/* Resumo Arquitetural dos Componentes Incluídos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl mb-10 text-left">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-brand" />
                  <span className="text-xs font-semibold text-white">Site Profissional</span>
                </div>
                <span className="text-xs text-zinc-400 block pl-6">Design e tecnologia NEWNEO</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-brand" />
                  <span className="text-xs font-semibold text-white">Kit Instagram 3D</span>
                </div>
                <span className="text-xs text-zinc-400 block pl-6">2 imagens + 1 vídeo com IA</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-brand" />
                  <span className="text-xs font-semibold text-white">BioPro (12 meses)</span>
                </div>
                <span className="text-xs text-zinc-400 block pl-6">Centralizador de links oficial</span>
              </div>
            </div>

            {/* CTA Principal de Conversão */}
            <div className="w-full sm:w-auto">
              <a
                href={buildWhatsAppLink("commercial_contract")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none group"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{commercial.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Garantia e Clareza */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Demonstração visual prévia • Atendimento comercial direto no WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

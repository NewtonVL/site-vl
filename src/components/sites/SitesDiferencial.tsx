import React from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesDiferencial: React.FC = () => {
  const { diferencial } = SITES_CONFIG;

  return (
    <section id="diferencial" className="relative py-24 lg:py-32 bg-dark-950 text-white border-t border-b border-white/5">
      {/* Luz ambiente sutil de profundidade */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-brand/5 rounded-full blur-[160px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho Editorial com Ritmo e Respiro */}
        <div className="max-w-3xl text-left mb-16">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">
            Validação Prévia
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] [text-wrap:balance] mb-5">
            Você não precisa contratar no escuro. <br />
            <span className="text-brand">
              Nós mostramos a proposta antes de decidir.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal [text-wrap:pretty]">
            {diferencial.description}
          </p>
        </div>

        {/* Comparativo Asimétrico Editorial: O Mercado vs Vitrine Local */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Lado Esquerdo: O Desgaste do Modelo Tradicional (Monocromático, sóbrio, atrito real) */}
          <div className="lg:col-span-5 rounded-2xl p-8 sm:p-10 bg-dark-900/60 border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
                <span>Como o mercado costuma agir</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-200 mb-6 leading-snug">
                Incerteza sobre o resultado final
              </h3>
              <ul className="space-y-4 text-sm text-zinc-300">
                {diferencial.traditionalModel.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-8 border-t border-white/5 text-xs text-zinc-400 leading-relaxed">
              Processos lentos e fechamentos sem prévia geram insegurança sobre o retorno real do investimento.
            </div>
          </div>

          {/* Lado Direito: O Padrão Vitrine Local + NEWNEO (Arquitetural, iluminado e seguro) */}
          <div className="lg:col-span-7 rounded-2xl p-8 sm:p-11 bg-gradient-to-br from-dark-900 via-dark-900 to-dark-950 border border-brand/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Indicador de Prestígio */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Metodologia Vitrine Local & NEWNEO
              </span>
              <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Validação prévia ativa
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Você avalia a demonstração antes de assumir qualquer compromisso
              </h3>
              <ul className="space-y-4 text-sm sm:text-base text-zinc-200 font-medium">
                {diferencial.ourModel.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <div className="p-1 rounded-md bg-brand/10 text-brand shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-brand" />
                    </div>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selo de Transparência e Honestidade */}
            <div className="pt-6 mt-8 border-t border-white/10 text-xs text-zinc-300 leading-relaxed bg-white/[0.02] -mx-8 -mb-11 p-8 sm:-mx-11 sm:-mb-11 sm:p-10">
              <strong className="text-white block font-semibold mb-1">Compromisso de transparência:</strong>
              {diferencial.demoDisclaimer}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

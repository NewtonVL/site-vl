import React from 'react';
import { ArrowRight, MessageCircle, Check, AlertCircle } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesDiferencial: React.FC = () => {
  const { diferencial } = SITES_CONFIG;

  return (
    <section id="diferencial" className="relative py-20 lg:py-28 bg-dark-950 border-t border-b border-white/5 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Narrativa Editorial Descentralizada: Título Forte Alinhado à Esquerda */}
        <div className="max-w-4xl text-left mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-brand block mb-2">
            A Proposta Vitrine Local
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-5">
            Você não precisa contratar no escuro. <br className="hidden sm:block" />
            <span className="text-brand">
              Nós mostramos a proposta visual antes de decidir.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
            {diferencial.description}
          </p>
        </div>

        {/* Composição Editorial Assimétrica: Contraste Direto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Lado Esquerdo: O Desgaste do Modelo Habitual (Subdued, monocromático e direto) */}
          <div className="lg:col-span-5 rounded-2xl p-7 sm:p-9 bg-dark-900/40 border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                O modelo habitual do mercado
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-200 mb-6 leading-snug">
                Contratações no escuro e expectativas frustradas
              </h3>
              <ul className="space-y-4 text-sm text-zinc-300">
                {diferencial.traditionalModel.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-white/5 text-xs text-zinc-400">
              Processos lentos geram insegurança sobre o resultado final.
            </div>
          </div>

          {/* Lado Direito: A Solução Vitrine Local + NEWNEO (Luminoso, seguro e protagonista) */}
          <div className="lg:col-span-7 rounded-2xl p-7 sm:p-10 bg-gradient-to-br from-dark-900 to-black border border-brand/40 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl bg-brand text-xs font-black uppercase tracking-wider text-white">
              Padrão Vitrine Local
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand block mb-2">
                Nossa proposta de transparência
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-snug">
                Você avalia a demonstração antes de tomar a decisão
              </h3>
              <ul className="space-y-4 text-sm sm:text-base text-zinc-200 font-medium">
                {diferencial.ourModel.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selo de Transparência */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-start gap-3 text-xs text-zinc-300">
              <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-semibold">Compromisso claro:</strong> A demonstração é uma proposta conceitual para validação visual. O site definitivo com todos os dados oficiais, catálogo e canais é finalizado após a contratação.
              </span>
            </div>
          </div>
        </div>

        {/* CTA Integrado ao fluxo da seção */}
        <div className="text-left sm:text-center pt-2">
          <a
            href={buildWhatsAppLink("spontaneous_visitor")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 motion-reduce:transform-none transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Quero conversar sobre uma demonstração para meu negócio</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

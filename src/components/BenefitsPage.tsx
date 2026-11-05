import React, { useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BenefitsHeader } from './BenefitsHeader';
import { BenefitCard } from './BenefitCard';
import { benefitsConfig } from '../config/benefits';

interface BenefitsPageProps {
  onNavigateHome: () => void;
}

export const BenefitsPage: React.FC<BenefitsPageProps> = ({ onNavigateHome }) => {
  useEffect(() => {
    document.title = "Benefícios Exclusivos | Vitrine Local — Condições especiais para você";
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Header */}
      <BenefitsHeader onNavigateHome={onNavigateHome} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-white via-orange-50/20 to-white overflow-hidden border-b border-zinc-100">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] bg-brand-50/40 rounded-full blur-3xl pointer-events-none -z-10"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              {/* Partnership Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 text-zinc-700 text-xs sm:text-sm font-semibold tracking-wide mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span>{benefitsConfig.hero.tag}</span>
              </div>

              {/* Exact Hero Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.18] mb-4 sm:mb-6">
                Benefícios digitais para{' '}
                <span className="text-brand inline-block">
                  fortalecer seus projetos e negócios
                </span>
              </h1>

              {/* Hero Explanation */}
              <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
                {benefitsConfig.hero.subtitle}
              </p>

              {/* Fast Anchor Button */}
              <div className="flex justify-center mb-12">
                <a
                  href="#solucoes"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-brand hover:bg-brand-600 shadow-orange-glow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span>Ver todas as soluções</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* How It Works - 3 Step Flow */}
            <div id="como-funciona" className="pt-8 border-t border-zinc-200/70 scroll-mt-24">
              <div className="text-center mb-8">
                <span className="text-xs uppercase tracking-widest text-brand font-bold">
                  Passo a passo
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
                  {benefitsConfig.hero.stepsTitle}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {benefitsConfig.hero.steps.map((step) => (
                  <div
                    key={step.number}
                    className="relative bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-subtle flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand flex items-center justify-center font-bold text-sm mb-4">
                        {step.number}
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Offers Section */}
        <section id="solucoes" className="py-14 sm:py-20 bg-zinc-50 border-b border-zinc-200/70 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ofertas Selecionadas</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight mb-3">
                Escolha a ferramenta ideal para você
              </h2>
              <p className="text-base sm:text-lg text-zinc-600">
                Soluções pensadas para quem empreende, cria conteúdo e busca mais presença profissional.
              </p>
            </div>

            {/* 5 Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {benefitsConfig.offers.map((offer) => (
                <BenefitCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        </section>

        {/* Conditions Section */}
        <section id="regras" className="py-12 sm:py-16 bg-white scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-zinc-50 border border-zinc-200/90 rounded-3xl p-7 sm:p-10 shadow-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-orange-100/70 text-brand">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {benefitsConfig.rules.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Diretrizes gerais para utilização dos benefícios exclusivos e condições especiais
                  </p>
                </div>
              </div>

              <ul className="space-y-3 pt-4 border-t border-zinc-200/60">
                {benefitsConfig.rules.items.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-zinc-950 text-white border-t border-zinc-900 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-800/80">
            <div className="flex items-center gap-4">
              <img
                src="/logo-white.png"
                alt="Vitrine Local - Logo Branca"
                className="h-9 sm:h-10 w-auto object-contain"
              />
              <span className="text-xs text-zinc-400 border-l border-zinc-800 pl-4">
                {benefitsConfig.partner.name} • {benefitsConfig.partner.tagline}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                Voltar ao Site Institucional
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
            <p>
              © {new Date().getFullYear()} Vitrine Local. Todos os direitos reservados.
            </p>
            <p>
              Conectando pessoas, negócios e oportunidades.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useEffect } from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BenefitsHeader } from './BenefitsHeader';
import { BenefitCard } from './BenefitCard';
import { SocialLinks } from './SocialLinks';
import { EditorialHeading } from './EditorialHeading';
import { benefitsConfig } from '../config/benefits';

interface BenefitsPageProps {
  onNavigateHome: () => void;
}

export const BenefitsPage: React.FC<BenefitsPageProps> = ({ onNavigateHome }) => {
  useEffect(() => {
    document.title = 'Benefícios Exclusivos | Vitrine Local — Condições especiais para você';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07080A] text-white selection:bg-brand/30 selection:text-white antialiased">
      {/* Header */}
      <BenefitsHeader onNavigateHome={onNavigateHome} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-20 bg-[#07080A] overflow-hidden border-b border-white/5">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] bg-brand/12 rounded-full blur-[160px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              {/* Overline Editorial Discreto */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-zinc-400 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" aria-hidden="true" />
                <span>{benefitsConfig.hero.tag}</span>
              </div>

              {/* Exact Hero Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-[-0.025em] leading-[1.14] [text-wrap:balance] mb-5">
                Benefícios digitais para{' '}
                <span className="text-brand inline-block">
                  fortalecer seus projetos e negócios
                </span>
              </h1>

              {/* Hero Explanation */}
              <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-9 max-w-2xl mx-auto [text-wrap:pretty]">
                {benefitsConfig.hero.subtitle}
              </p>

              {/* Fast Anchor Button */}
              <div className="flex justify-center mb-14">
                <a
                  href="#solucoes"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080A] group"
                >
                  <span>Ver todas as soluções</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

            {/* Como Funciona - 3 Passos */}
            <div id="como-funciona" className="pt-12 border-t border-white/10 scroll-mt-24">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1.5">
                    Passo a passo
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {benefitsConfig.hero.stepsTitle}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {benefitsConfig.hero.steps.map((step) => (
                  <div
                    key={step.number}
                    className="bg-[#0F1115]/80 rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-brand block mb-3">
                        {step.number}
                      </span>
                      <h3 className="text-base font-bold text-white mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
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
        <section id="solucoes" className="py-20 sm:py-28 bg-[#090A0C] border-b border-white/5 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EditorialHeading
              overline="Ofertas Selecionadas"
              title={
                <>
                  Escolha a ferramenta ideal{' '}
                  <span className="font-light text-zinc-400">para você</span>
                </>
              }
              subtitle="Soluções pensadas para quem empreende, cria conteúdo e busca mais presença profissional."
              align="left"
              className="mb-12 sm:mb-16"
            />

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {benefitsConfig.offers.map((offer, idx) => (
                <BenefitCard
                  key={offer.id}
                  offer={offer}
                  className={idx >= 3 ? 'lg:self-start' : undefined}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Conditions Section */}
        <section id="regras" className="py-16 sm:py-24 bg-[#07080A] scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-brand flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {benefitsConfig.rules.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Diretrizes gerais para utilização dos benefícios exclusivos e condições especiais
                  </p>
                </div>
              </div>

              <ul className="space-y-3 pt-5 border-t border-white/10">
                {benefitsConfig.rules.items.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
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
      <footer className="bg-[#07080A] text-zinc-400 border-t border-white/5 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <img
                src="/logo-white.png"
                alt="Vitrine Local - Logo Branca"
                className="h-9 sm:h-10 w-auto object-contain"
              />
              <span className="text-xs text-zinc-400 border-l border-white/10 pl-4">
                {benefitsConfig.partner.name} • {benefitsConfig.partner.tagline}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <SocialLinks />
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

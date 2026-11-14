import React, { useState } from 'react';
import { MessageSquareCheck, UserCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesHowItWorks: React.FC = () => {
  const { howItWorks } = SITES_CONFIG;
  const [activeTab, setActiveTab] = useState<'prospect' | 'visitor'>('prospect');

  const currentBranch = howItWorks.branches[activeTab];

  return (
    <section id="como-funciona" className="relative py-24 lg:py-32 bg-[#090A0C] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">
            Como Funciona
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] mb-4">
            Etapas simples e transparentes <span className="font-light text-zinc-400">até seu site no ar</span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            {howItWorks.subtitle}
          </p>
        </div>

        {/* Tab switchers: Prospect vs Visitor */}
        <div className="flex justify-start sm:justify-center mb-12">
          <div className="inline-flex p-1 rounded-xl bg-[#0F1115] border border-white/5 max-w-lg w-full">
            <button
              onClick={() => setActiveTab('prospect')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                activeTab === 'prospect'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquareCheck className="w-4 h-4 shrink-0 text-brand" />
              <span>Já recebi demonstração</span>
            </button>
            <button
              onClick={() => setActiveTab('visitor')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                activeTab === 'visitor'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0 text-brand" />
              <span>Quero uma demonstração</span>
            </button>
          </div>
        </div>

        {/* Trilha Linear de Etapas */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center sm:text-left space-y-1">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider block">
              {currentBranch.title}
            </span>
            <p className="text-sm text-zinc-400">
              {currentBranch.description}
            </p>
          </div>

          {/* Sequential Timeline Track */}
          <div className="relative">
            {/* Linha conectora no desktop */}
            <div
              className="hidden lg:block absolute top-7 left-12 right-12 h-px bg-white/10 pointer-events-none"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {currentBranch.steps.map((step, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-[#0F1115]/80 border border-white/5 hover:border-white/15 transition-all duration-200 flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center font-mono text-xs font-bold mb-4 group-hover:border-brand/40 group-hover:text-brand transition-colors">
                      {step.number}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual CTA for active branch */}
          <div className="mt-12 text-center">
            <a
              href={
                activeTab === 'prospect'
                  ? buildWhatsAppLink("received_demo")
                  : buildWhatsAppLink("spontaneous_visitor")
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{currentBranch.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

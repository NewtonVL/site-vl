import React, { useState } from 'react';
import { MessageSquareCheck, UserCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesHowItWorks: React.FC = () => {
  const { howItWorks } = SITES_CONFIG;
  const [activeTab, setActiveTab] = useState<'prospect' | 'visitor'>('prospect');

  const currentBranch = howItWorks.branches[activeTab];

  return (
    <section id="como-funciona" className="relative py-24 bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {howItWorks.title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
            {howItWorks.subtitle}
          </p>
        </div>

        {/* Tab switchers: Prospect vs Visitor */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-dark-950 border border-white/10 max-w-xl w-full">
            <button
              onClick={() => setActiveTab('prospect')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                activeTab === 'prospect'
                  ? 'bg-brand text-white shadow-orange-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquareCheck className="w-4 h-4 shrink-0" />
              <span>Já recebi demonstração</span>
            </button>
            <button
              onClick={() => setActiveTab('visitor')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
                activeTab === 'visitor'
                  ? 'bg-brand text-white shadow-orange-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Quero uma demonstração</span>
            </button>
          </div>
        </div>

        {/* Steps Pipeline */}
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-200">
              {currentBranch.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              {currentBranch.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentBranch.steps.map((step, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 bg-dark-950/80 border border-white/10 flex flex-col justify-between hover:border-brand/40 transition-colors duration-200 relative group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 text-brand flex items-center justify-center text-sm font-black mb-4">
                    {step.number}
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-brand-300 transition-colors duration-200">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contextual CTA for active branch */}
          <div className="mt-12 text-center">
            {activeTab === 'prospect' ? (
              <a
                href={buildWhatsAppLink("received_demo")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 motion-reduce:transform-none transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{currentBranch.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <a
                href={buildWhatsAppLink("spontaneous_visitor")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 motion-reduce:transform-none transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{currentBranch.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesFaq: React.FC = () => {
  const { faq } = SITES_CONFIG;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 lg:py-32 bg-[#090A0C] text-white border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">
            Perguntas Frequentes
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] mb-4">
            Tire suas dúvidas <span className="font-light text-zinc-400">sobre a contratação</span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            {faq.subtitle}
          </p>
        </div>

        {/* Accordion com Acabamento Refinado */}
        <div className="space-y-3">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/5 bg-[#0F1115]/70 overflow-hidden transition-colors duration-200"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span className="text-base sm:text-lg font-semibold text-white pr-2 tracking-tight">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 motion-reduce:transform-none transition-transform duration-200 text-zinc-400 ${
                      isOpen ? 'rotate-180 text-white bg-white/10' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-zinc-300 leading-relaxed border-t border-white/5"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

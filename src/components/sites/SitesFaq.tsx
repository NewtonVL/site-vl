import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesFaq: React.FC = () => {
  const { faq } = SITES_CONFIG;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Primeiro item aberto por padrão

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20 bg-dark-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {faq.title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            {faq.subtitle}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-dark-950/80 overflow-hidden transition-colors duration-200"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span className="text-base sm:text-lg font-bold text-white pr-2">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 motion-reduce:transform-none transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-brand text-white' : 'text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    className="px-5 sm:px-6 pb-6 pt-2 text-sm sm:text-base text-zinc-300 leading-relaxed border-t border-white/5"
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

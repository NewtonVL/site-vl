import React from 'react';
import { Eye, Network, TrendingUp } from 'lucide-react';
import { siteConfig } from '../config/site';

export const Purpose: React.FC = () => {
  const icons = [
    <Eye className="w-5 h-5 text-brand" key="eye" />,
    <Network className="w-5 h-5 text-brand" key="network" />,
    <TrendingUp className="w-5 h-5 text-brand" key="trend" />,
  ];

  return (
    <section id="proposito" className="py-14 sm:py-20 bg-zinc-50 border-t border-zinc-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand text-xs font-semibold uppercase tracking-wider mb-3">
            <span>{siteConfig.purpose.sectionTag}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-3">
            {siteConfig.purpose.title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-600">
            {siteConfig.purpose.subtitle}
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {siteConfig.purpose.pillars.map((pillar, index) => (
            <div
              key={pillar.id}
              className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-zinc-200/80 shadow-subtle hover:shadow-card hover:border-brand-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center transition-colors group-hover:bg-brand group-hover:text-white">
                    {React.cloneElement(icons[index], {
                      className: 'w-5 h-5 text-brand group-hover:text-white transition-colors duration-200',
                    })}
                  </div>
                  <span className="text-xl font-extrabold text-zinc-200 group-hover:text-brand-200 transition-colors">
                    0{index + 1}
                  </span>
                </div>

                {/* Pillar Title */}
                <h3 className="text-lg font-bold text-zinc-900 mb-2.5 group-hover:text-brand transition-colors">
                  {pillar.title}
                </h3>

                {/* Pillar Description */}
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              {/* Bottom Subtle Accent */}
              <div className="mt-6 pt-4 border-t border-zinc-100">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Pilar Fundamental
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

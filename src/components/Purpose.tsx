import React from 'react';
import { Eye, Network, TrendingUp } from 'lucide-react';
import { siteConfig } from '../config/site';
import { EditorialHeading } from './EditorialHeading';

export const Purpose: React.FC = () => {
  const icons = [
    <Eye className="w-5 h-5 text-brand" key="eye" />,
    <Network className="w-5 h-5 text-brand" key="network" />,
    <TrendingUp className="w-5 h-5 text-brand" key="trend" />,
  ];

  return (
    <section id="proposito" className="py-20 sm:py-28 bg-[#07080A] text-white border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EditorialHeading
          overline={siteConfig.purpose.sectionTag}
          title={
            <>
              Três pilares que{' '}
              <span className="font-light text-zinc-400">movem a nossa atuação</span>
            </>
          }
          subtitle={siteConfig.purpose.subtitle}
          align="left"
          className="mb-12 sm:mb-16"
        />

        {/* 3 Pilares em Superfícies Sobriamente Delimitadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {siteConfig.purpose.pillars.map((pillar, index) => (
            <div
              key={pillar.id}
              className="group relative bg-[#0F1115] rounded-2xl p-7 sm:p-8 border border-white/10 hover:border-white/20 transition-colors duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand/40 transition-colors">
                    {icons[index]}
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-500">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2.5 tracking-tight">
                  {pillar.title}
                </h3>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

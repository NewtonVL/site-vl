import React from 'react';
import { Eye, Users, Store } from 'lucide-react';
import { siteConfig } from '../config/site';

export const About: React.FC = () => {
  return (
    <section id="sobre" className="py-14 sm:py-20 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Subtle Brand Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-xs bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 sm:p-7 shadow-subtle flex flex-col items-center text-center">
              {/* Subtle top badge */}
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-4">
                Identidade Institucional
              </span>

              {/* Smaller, balanced Bag Icon preserving proportions */}
              <div className="relative w-24 sm:w-28 aspect-[921/1024] flex items-center justify-center mb-5">
                <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-xl -z-10" />
                <img
                  src="/logo-icon-lg.png"
                  alt="Símbolo Vitrine Local"
                  className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200 hover:scale-105"
                />
              </div>

              <div className="w-full pt-4 border-t border-zinc-200/60">
                <p className="text-xs text-zinc-500 font-medium">
                  Visibilidade & Conexão Local
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Two Objective Paragraphs */}
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand text-xs font-semibold uppercase tracking-wider mb-3">
              <span>{siteConfig.about.sectionTag}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-tight mb-5">
              {siteConfig.about.title}
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
              {siteConfig.about.paragraphs.map((paragraph, index) => (
                <p key={index} className={index === 0 ? "text-zinc-800 font-medium" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Micro Highlights of the Initiative */}
            <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 text-brand shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Visibilidade</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Destaque aos negócios locais</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 text-brand shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Conexão</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Relações autênticas e diretas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 text-brand shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Valorização</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Comércio e economia local</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Eye, Users, Store } from 'lucide-react';
import { siteConfig } from '../config/site';
import { EditorialHeading } from './EditorialHeading';

export const About: React.FC = () => {
  return (
    <section id="sobre" className="py-20 sm:py-24 bg-[#090A0C] text-white border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Coluna Esquerda: Placa Minimalista da Identidade Institucional */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[260px] bg-[#0F1115] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-5">
                Identidade Institucional
              </span>

              <div className="relative w-16 sm:w-20 aspect-[921/1024] flex items-center justify-center mb-5">
                <div className="absolute inset-0 bg-brand/15 rounded-full blur-xl pointer-events-none" aria-hidden="true" />
                <img
                  src="/logo-icon-lg.png"
                  alt="Símbolo Vitrine Local"
                  className="relative w-full h-full object-contain drop-shadow-md transition-transform duration-200 hover:scale-105"
                />
              </div>

              <div className="w-full pt-4 border-t border-white/10">
                <p className="text-xs text-zinc-400 font-medium">
                  Visibilidade & Conexão Local
                </p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Conteúdo Editorial + Micro-destaques abertos */}
          <div className="lg:col-span-8">
            <EditorialHeading
              overline={siteConfig.about.sectionTag}
              title={
                <>
                  Aproximando quem faz{' '}
                  <span className="font-light text-zinc-400">a comunidade acontecer</span>
                </>
              }
              className="mb-5"
            />

            <div className="space-y-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              {siteConfig.about.paragraphs.map((paragraph, index) => (
                <p key={index} className={index === 0 ? 'text-zinc-200 font-medium' : 'text-zinc-400'}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Micro-destaques abertos (sem caixas repetitivas) */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Visibilidade</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Destaque aos negócios locais</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Conexão</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Relações autênticas e diretas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Valorização</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Comércio e economia local</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

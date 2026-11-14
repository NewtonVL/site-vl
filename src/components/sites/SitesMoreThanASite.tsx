import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import { SITES_CONFIG } from '../../config/sitesLanding';

export const SitesMoreThanASite: React.FC = () => {
  const { moreThanASite } = SITES_CONFIG;
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);
      const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      motionQuery.addEventListener('change', handleMotionChange);

      // Verificação de modo de economia de dados ou conexão lenta
      const nav = navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } };
      if (nav.connection?.saveData || nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g') {
        setSaveData(true);
      }

      return () => {
        motionQuery.removeEventListener('change', handleMotionChange);
      };
    }
  }, []);

  // Carregamento diferido (Lazy Load) por ser uma seção abaixo da Hero
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '300px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const shouldPlayVideo = isInView && !prefersReducedMotion && !saveData;

  const iconMap: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-zinc-300 group-hover:text-brand transition-colors duration-200" />,
    MessageCircle: <MessageCircle className="w-5 h-5 text-zinc-300 group-hover:text-brand transition-colors duration-200" />,
    Sparkles: <Sparkles className="w-5 h-5 text-zinc-300 group-hover:text-brand transition-colors duration-200" />,
    TrendingUp: <TrendingUp className="w-5 h-5 text-zinc-300 group-hover:text-brand transition-colors duration-200" />,
  };

  return (
    <section
      id="posicionamento"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#07080A] text-white border-t border-white/5 overflow-hidden"
    >
      {/* 
        CENÁRIO ATMOSFÉRICO DE FUNDO (Z-0):
        Vídeo em loop contínuo e silencioso, suavizado com blur e escurecido para subordinar
        elementos internos ao conteúdo editorial HTML.
      */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        {/* Poster estático WebP: sempre carregado primeiro para evitar tela preta em qualquer estado */}
        <img
          src="/assets/posicionamento-poster.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center filter blur-[2px] lg:blur-[1.5px] scale-105 z-0 opacity-80 lg:opacity-100"
          loading="lazy"
          decoding="async"
        />

        {/* Vídeo atmosférico diferido: montado apenas quando a seção entra em visão e sem preferências restritivas */}
        {shouldPlayVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center filter blur-[2px] lg:blur-[1.5px] scale-105 z-[1] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-80 lg:opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/assets/posicionamento-atmospheric.webm" type="video/webm" />
            <source src="/assets/posicionamento-atmospheric.mp4" type="video/mp4" />
          </video>
        )}

        {/* 
          Camadas de Escurecimento e Conforto Visual:
          - Desktop: Gradiente horizontal que aprofunda o preto no bloco de texto (coluna esquerda)
            e permite que o brilho arquitetônico respire suavemente no lado direito.
          - Mobile: Gradiente vertical profundo com maior opacidade e desfoque aveludado,
            subordinando rostos, roupas e mockups para que a atenção fique 100% no texto HTML.
        */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#07080A]/95 via-[#07080A]/85 to-[#07080A]/75 backdrop-blur-[1px] z-[2]" />
        <div className="block lg:hidden absolute inset-0 bg-gradient-to-b from-[#07080A]/98 via-[#07080A]/92 to-[#07080A]/96 backdrop-blur-[2px] z-[2]" />
        
        {/* Vinhetas superior e inferior para transição suave com as seções adjacentes */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#090A0C] via-[#090A0C]/80 to-transparent z-[3]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090A0C] via-[#090A0C]/80 to-transparent z-[3]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Coluna Editorial Esquerda: Tese e Autoridade */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block">
              Posicionamento de Mercado
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] [text-wrap:balance]">
              Muito mais que um site: <br className="hidden sm:inline" />
              <span className="font-light text-zinc-400">uma nova presença digital</span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal [text-wrap:pretty]">
              {moreThanASite.subtitle}
            </p>

            <div className="border-l-2 border-brand/80 pl-5 py-1.5 space-y-1.5 text-sm text-zinc-300 leading-relaxed">
              <span className="font-semibold text-white block">Posicionamento que gera resultados:</span>
              <p className="text-zinc-400 font-normal">
                Empresas que possuem um site próprio de alto nível constroem autoridade instantânea e eliminam a dependência exclusiva de perfis e algoritmos de redes sociais.
              </p>
            </div>
          </div>

          {/* Coluna Direita: 4 Benefícios Estratégicos com Respiro e Sem Molduras Pesadas */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-2 lg:pt-0">
            {moreThanASite.pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="space-y-3 group transition-transform duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-brand/40 group-hover:bg-brand/10 transition-all duration-200">
                    {iconMap[pillar.icon]}
                  </div>
                  <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-zinc-100 transition-colors duration-200">
                    {pillar.title}
                  </h3>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed font-normal [text-wrap:pretty] pl-12 sm:pl-0">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

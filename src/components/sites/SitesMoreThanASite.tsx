import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITES_CONFIG } from '../../config/sitesLanding';

gsap.registerPlugin(ScrollTrigger);

export const SitesMoreThanASite: React.FC = () => {
  const { moreThanASite } = SITES_CONFIG;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(9.38);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);
      const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      motionQuery.addEventListener('change', handleMotionChange);

      // Verificação de economia de dados ou conexão lenta
      const nav = navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } };
      if (nav.connection?.saveData || nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g') {
        setSaveData(true);
      }

      return () => {
        motionQuery.removeEventListener('change', handleMotionChange);
      };
    }
  }, []);

  // IntersectionObserver para montagem e carregamento sob demanda
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
      { rootMargin: '400px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const shouldPlayVideo = isInView && !prefersReducedMotion && !saveData;

  // Narrativa controlada por ScrollTrigger (GSAP) usando gsap.context() nativo
  useEffect(() => {
    // Caso haja preferência por movimento reduzido ou economia de dados, mantém o fluxo normal estático
    if (prefersReducedMotion || saveData) {
      cardsRef.current.forEach((card) => {
        if (card) {
          card.style.opacity = '1';
          card.style.transform = 'none';
        }
      });
      return;
    }

    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP (>= 1024px): Narrativa com pin compacto e entrada progressiva dos 4 benefícios
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=850',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Sincronização do avanço e retorno do vídeo com a rolagem
        if (videoRef.current) {
          tl.to(
            videoRef.current,
            {
              currentTime: videoDuration || 9.38,
              ease: 'none',
            },
            0
          );
        }

        // Entrada progressiva dos 4 benefícios
        cardsRef.current.forEach((card, idx) => {
          if (!card) return;
          gsap.set(card, { opacity: 0, y: 35, scale: 0.97 });
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.22,
              ease: 'power2.out',
            },
            0.12 + idx * 0.2
          );
        });
      });

      // MOBILE (< 1024px): Pin leve e responsivo sem prender a rolagem do usuário
      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=700',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Sincronização do vídeo no mobile
        if (videoRef.current) {
          tl.to(
            videoRef.current,
            {
              currentTime: videoDuration || 9.38,
              ease: 'none',
            },
            0
          );
        }

        // Entrada progressiva dos 4 benefícios no mobile
        cardsRef.current.forEach((card, idx) => {
          if (!card) return;
          gsap.set(card, { opacity: 0, y: 30, scale: 0.98 });
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.22,
              ease: 'power2.out',
            },
            0.12 + idx * 0.2
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, saveData, videoLoaded, videoDuration]);

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
      className="relative min-h-screen py-16 lg:py-24 bg-[#07080A] text-white border-t border-white/5 overflow-hidden flex flex-col justify-center"
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

        {/* Vídeo atmosférico diferido: sincronizado via GSAP ScrollTrigger com arquivo intraframe otimizado */}
        {shouldPlayVideo && (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              if (e.currentTarget.duration) {
                setVideoDuration(e.currentTarget.duration);
              }
            }}
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center filter blur-[2px] lg:blur-[1.5px] scale-105 z-[1] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-80 lg:opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/assets/posicionamento-scrub.mp4" type="video/mp4" />
            <source src="/assets/posicionamento-atmospheric.webm" type="video/webm" />
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Coluna Editorial Esquerda: Tese e Autoridade */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block">
              Posicionamento de Mercado
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-white tracking-tight leading-[1.18] [text-wrap:balance]">
              Muito mais que um site: <br className="hidden sm:inline" />
              <span className="font-light text-zinc-400">uma nova presença digital</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal [text-wrap:pretty]">
              {moreThanASite.subtitle}
            </p>

            {/* Escudo de Contraste Dedicado para o Bloco de Autoridade */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#090B0E]/80 backdrop-blur-md border border-white/10 border-l-2 border-l-brand space-y-1.5 shadow-lg">
              <span className="text-xs font-semibold text-white block uppercase tracking-wider">
                Posicionamento que gera resultados:
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Empresas que possuem um site próprio de alto nível constroem autoridade instantânea e eliminam a dependência exclusiva de perfis e algoritmos de redes sociais.
              </p>
            </div>
          </div>

          {/* Coluna Direita: 4 Benefícios Estratégicos com Escudos de Contraste e Revelação Progressiva */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {moreThanASite.pillars.map((pillar, idx) => (
              <div
                key={pillar.id}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
                className="benefit-card p-5 sm:p-6 rounded-2xl bg-[#090B0E]/85 sm:bg-[#090B0E]/75 backdrop-blur-md border border-white/10 space-y-3 shadow-xl transition-all duration-300 hover:border-brand/40 hover:bg-[#090B0E]/95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-brand/40 group-hover:bg-brand/10 transition-all duration-200">
                    {iconMap[pillar.icon]}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight group-hover:text-zinc-100 transition-colors duration-200">
                    {pillar.title}
                  </h3>
                </div>

                {/* Proteção absoluta de contraste para os parágrafos em todas as cenas do vídeo */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal [text-wrap:pretty]">
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

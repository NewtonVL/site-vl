import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITES_CONFIG } from '../../config/sitesLanding';

gsap.registerPlugin(ScrollTrigger);

export const SitesMoreThanASite: React.FC = () => {
  const { moreThanASite } = SITES_CONFIG;
  const sectionRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isInView, setIsInView] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(9.38);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    setIsDesktopViewport(desktopQuery.matches);
    const handleDesktopChange = (e: MediaQueryListEvent) => setIsDesktopViewport(e.matches);
    desktopQuery.addEventListener('change', handleDesktopChange);

    // Verificação de economia de dados ou conexão lenta
    const nav = navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } };
    if (nav.connection?.saveData || nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g') {
      setSaveData(true);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      desktopQuery.removeEventListener('change', handleDesktopChange);
    };
  }, []);

  // IntersectionObserver para montagem e carregamento sob demanda (seção abaixo da Hero)
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

  const shouldRenderVideo = isInView && !prefersReducedMotion && !saveData && !videoFailed;

  // Narrativa controlada por GSAP ScrollTrigger com calibração distinta para Desktop e Mobile
  useEffect(() => {
    // Caso haja movimento reduzido, economia de dados ou falha do vídeo, mantém todo o conteúdo visível em fluxo normal
    if (prefersReducedMotion || saveData) {
      cardsRef.current.forEach((card) => {
        if (card) {
          gsap.set(card, { clearProps: 'all' });
          card.style.opacity = '1';
          card.style.transform = 'none';
        }
      });
      return;
    }

    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP (>= 1024px):
      // Pin de 100svh com duração proporcional à altura real da viewport (1.35x).
      // Timeline normalizada em [0 .. 1]:
      // - 0.00: Tese inicial visível com o início do vídeo
      // - 0.06 -> 0.74: Entrada sequencial dos 4 benefícios com tempo de leitura entre cada um
      // - 0.74 -> 1.00: Todos os 4 benefícios visíveis (platô de leitura antes de o vídeo e o pin terminarem)
      // - 0.00 -> 0.92: Mapeamento suave do vídeo (evitando o fade final de loop)
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${Math.round(window.innerHeight * 1.35)}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const video = desktopVideoRef.current;
              if (!video || video.readyState < 2 || !videoDuration) return;
              // Mapeia o progresso [0..1] para [0..94%] da duração do vídeo, evitando flash do fade final
              const targetTime = Math.min(videoDuration * 0.94, Math.max(0, self.progress * videoDuration * 0.94));
              // Só solicita seek se não houver decodificação pendente e a diferença for perceptível
              if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.03) {
                video.currentTime = targetTime;
              }
            },
          },
        });

        // Garante que a timeline tenha exatamente 1.0s de duração lógica para o mapeamento dos cards
        tl.to({}, { duration: 1 }, 0);

        // Entrada sequencial dos 4 benefícios (todos visíveis em t = 0.74, antes do final em 1.0)
        const cardStarts = [0.06, 0.24, 0.42, 0.60];
        cardsRef.current.forEach((card, idx) => {
          if (!card) return;
          gsap.set(card, { opacity: 0, y: 28, scale: 0.98 });
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.16,
              ease: 'power2.out',
            },
            cardStarts[idx] ?? 0.60
          );
        });
      });

      // MOBILE (< 1024px):
      // Sem pin na seção inteira (evita corte de cards em telas de 667px-844px e evita prender a rolagem).
      // O vídeo de fundo permanece sticky em 100svh em reprodução contínua suave (sem engasgos de seek no iOS/Android),
      // enquanto cada um dos 4 benefícios entra progressivamente conforme sua posição real na viewport.
      mm.add('(max-width: 1023px)', () => {
        cardsRef.current.forEach((card) => {
          if (!card) return;
          gsap.fromTo(
            card,
            { opacity: 0, y: 24, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'top 54%',
                scrub: 0.45,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, saveData, videoDuration]);

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
      className="relative lg:min-h-[100svh] py-16 sm:py-20 lg:py-24 bg-[#07080A] text-white border-t border-white/5 overflow-x-clip flex flex-col justify-center"
    >
      {/* 
        CENÁRIO ATMOSFÉRICO DE FUNDO (Z-0):
        - Desktop: ocupa 100% da seção pinada, sincronizado via ScrollTrigger com arquivo intraframe.
        - Mobile: wrapper sticky (top-0 h-[100svh]) acompanha o usuário durante toda a leitura natural dos cards,
          com reprodução contínua suave (WebM/MP4 leve) para zero travamentos em iOS Safari e Chrome Android.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
        <div className="sticky top-0 h-[100svh] lg:h-full w-full overflow-hidden">
          {/* Poster estático WebP: sempre carregado primeiro para evitar tela preta em qualquer estado */}
          <img
            src="/assets/posicionamento-poster.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[62%_center] lg:object-center filter blur-[1px] lg:blur-[1.5px] scale-105 z-0 opacity-100"
            loading="lazy"
            decoding="async"
          />

          {/* Vídeo Desktop (scrubbing intraframe fluido) */}
          {shouldRenderVideo && isDesktopViewport && (
            <video
              ref={desktopVideoRef}
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={(e) => {
                if (e.currentTarget.duration) {
                  setVideoDuration(e.currentTarget.duration);
                }
              }}
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 w-full h-full object-cover object-center filter blur-[1.5px] scale-105 z-[1] transition-opacity duration-700 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src="/assets/posicionamento-scrub.mp4" type="video/mp4" />
            </video>
          )}

          {/* Vídeo Mobile (reprodução contínua suave sem travamentos de seek em iOS/Android) */}
          {shouldRenderVideo && !isDesktopViewport && (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 w-full h-full object-cover object-[62%_center] filter blur-[1px] scale-105 z-[1] transition-opacity duration-700 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src="/assets/posicionamento-atmospheric.webm" type="video/webm" />
              <source src="/assets/posicionamento-atmospheric.mp4" type="video/mp4" />
            </video>
          )}

          {/* Camadas de Escurecimento e Conforto Visual */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#07080A]/95 via-[#07080A]/85 to-[#07080A]/75 backdrop-blur-[1px] z-[2]" />
          <div className="block lg:hidden absolute inset-0 bg-gradient-to-b from-[#07080A]/80 via-[#07080A]/55 to-[#07080A]/75 z-[2]" />

          {/* Vinhetas superior e inferior para transição suave com as seções adjacentes */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#090A0C] via-[#090A0C]/80 to-transparent z-[3]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090A0C] via-[#090A0C]/80 to-transparent z-[3]" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Coluna Editorial Esquerda: Tese e Autoridade (visível desde o início) */}
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
            <div className="p-4 sm:p-5 rounded-xl bg-[#090B0E]/90 lg:bg-[#090B0E]/85 backdrop-blur-md border border-white/10 border-l-2 border-l-brand space-y-1.5 shadow-lg">
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
                className="benefit-card p-5 sm:p-6 rounded-2xl bg-[#090B0E]/90 sm:bg-[#090B0E]/85 backdrop-blur-md border border-white/10 space-y-3 shadow-xl transition-colors duration-300 hover:border-brand/40 hover:bg-[#090B0E]/95 group"
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

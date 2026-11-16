import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITES_CONFIG } from '../../config/sitesLanding';

gsap.registerPlugin(ScrollTrigger);

const MOBILE_TOTAL_FRAMES = 64;
const SHEET_URLS = [
  '/assets/posicionamento-sheet-1.webp',
  '/assets/posicionamento-sheet-2.webp',
  '/assets/posicionamento-sheet-3.webp',
  '/assets/posicionamento-sheet-4.webp',
];
const FRAME_SIZE = 480;
const SHEET_COLS = 4;
const FRAMES_PER_SHEET = 16;

export const SitesMoreThanASite: React.FC = () => {
  const { moreThanASite } = SITES_CONFIG;
  const sectionRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetsRef = useRef<(HTMLImageElement | null)[]>([null, null, null, null]);
  const lastDrawnFrameRef = useRef<number>(-1);
  const currentProgressRef = useRef<number>(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isInView, setIsInView] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [mobileCanvasReady, setMobileCanvasReady] = useState(false);
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

  const shouldRenderMedia = isInView && !prefersReducedMotion && !saveData && !videoFailed;

  // Desenha um quadro específico no canvas mobile preservando object-cover e object-[62%_center]
  const drawMobileFrame = useCallback((frameIndex: number, force = false) => {
    const canvas = mobileCanvasRef.current;
    if (!canvas) return;
    const clamped = Math.min(MOBILE_TOTAL_FRAMES - 1, Math.max(0, frameIndex));
    if (!force && lastDrawnFrameRef.current === clamped) return;

    const sheetIdx = Math.floor(clamped / FRAMES_PER_SHEET);
    const sheet = sheetsRef.current[sheetIdx];
    if (!sheet || !sheet.complete || sheet.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return;

    const targetW = Math.round(cw * dpr);
    const targetH = Math.round(ch * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const localIdx = clamped % FRAMES_PER_SHEET;
    const sx = (localIdx % SHEET_COLS) * FRAME_SIZE;
    const sy = Math.floor(localIdx / SHEET_COLS) * FRAME_SIZE;

    // Simula object-cover object-[62%_center] em quadro 1:1
    let destW: number;
    let destH: number;
    let destX: number;
    let destY: number;

    if (targetH >= targetW) {
      destH = targetH;
      destW = targetH;
      destX = -(destW - targetW) * 0.62;
      destY = 0;
    } else {
      destW = targetW;
      destH = targetW;
      destX = 0;
      destY = -(destH - targetH) * 0.5;
    }

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(sheet, sx, sy, FRAME_SIZE, FRAME_SIZE, destX, destY, destW, destH);
    lastDrawnFrameRef.current = clamped;
  }, []);

  // Carregamento sob demanda dos 4 spritesheets WebP no mobile (~1.04 MB total)
  useEffect(() => {
    if (!shouldRenderMedia || isDesktopViewport) return;

    let cancelled = false;
    let failedCount = 0;

    SHEET_URLS.forEach((url, idx) => {
      if (sheetsRef.current[idx]) return;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (cancelled) return;
        sheetsRef.current[idx] = img;
        if (idx === 0) {
          setMobileCanvasReady(true);
        }
        const activeFrame = Math.min(
          MOBILE_TOTAL_FRAMES - 1,
          Math.max(0, Math.round(currentProgressRef.current * (MOBILE_TOTAL_FRAMES - 1)))
        );
        if (Math.floor(activeFrame / FRAMES_PER_SHEET) === idx || idx === 0) {
          drawMobileFrame(activeFrame, true);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        failedCount += 1;
        if (failedCount === SHEET_URLS.length) {
          setVideoFailed(true);
        }
      };
      img.src = url;
    });

    const handleResize = () => {
      const activeFrame = Math.min(
        MOBILE_TOTAL_FRAMES - 1,
        Math.max(0, Math.round(currentProgressRef.current * (MOBILE_TOTAL_FRAMES - 1)))
      );
      drawMobileFrame(activeFrame, true);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldRenderMedia, isDesktopViewport, drawMobileFrame]);

  // Narrativa controlada por GSAP ScrollTrigger com calibração distinta para Desktop e Mobile
  useEffect(() => {
    // Caso haja movimento reduzido ou economia de dados, mantém todo o conteúdo visível em fluxo normal
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
              const targetTime = Math.min(videoDuration * 0.94, Math.max(0, self.progress * videoDuration * 0.94));
              if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.03) {
                video.currentTime = targetTime;
              }
            },
          },
        });

        tl.to({}, { duration: 1 }, 0);

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
      // Scrubbing quadro-a-quadro em Canvas + Spritesheets WebP (60fps reais no iOS Safari e Chrome Android).
      // Ao parar o dedo, o quadro permanece parado; ao voltar, os quadros recuam em sincronia exata.
      // Os 4 benefícios entram progressivamente pela rolagem, calibrados pela altura real da tela.
      mm.add('(max-width: 1023px)', () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 65%',
          end: 'bottom 85%',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            currentProgressRef.current = self.progress;
            const frameIdx = Math.min(
              MOBILE_TOTAL_FRAMES - 1,
              Math.max(0, Math.round(self.progress * (MOBILE_TOTAL_FRAMES - 1)))
            );
            drawMobileFrame(frameIdx);
          },
        });

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
  }, [prefersReducedMotion, saveData, videoDuration, drawMobileFrame]);

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
        - Desktop: vídeo intraframe sincronizado via ScrollTrigger.
        - Mobile: Canvas 60fps sobre spritesheets WebP sincronizado 1:1 com o gesto de rolagem
          (para quando o usuário para, avança ao descer e recua ao subir, sem travar iOS/Android).
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
          {shouldRenderMedia && isDesktopViewport && (
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

          {/* Canvas Mobile (scrubbing frame-a-frame via spritesheets WebP, sem autoplay/loop) */}
          {shouldRenderMedia && !isDesktopViewport && (
            <canvas
              ref={mobileCanvasRef}
              className={`absolute inset-0 w-full h-full filter blur-[1px] scale-105 z-[1] transition-opacity duration-500 ${
                mobileCanvasReady ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            />
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

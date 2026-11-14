import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, Monitor, ShieldCheck, Sparkles } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesHero: React.FC = () => {
  const { seasonalCampaign, hero } = SITES_CONFIG;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [canStreamVideo, setCanStreamVideo] = useState(true);

  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecção rigorosa de prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Economia de dados / conexões restritas no mobile
    const navConn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (navConn && (navConn.saveData || navConn.effectiveType === '2g')) {
      setCanStreamVideo(false);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-dark-950 text-white border-b border-white/5">
      {/* 
        CAMADA DE VÍDEO DE FUNDO CINEMATOGRÁFICO (DESKTOP & TELAS GRANDES):
        O vídeo gerado no Google Flow atua como cenário imersivo de fundo.
        A área escura natural do vídeo à esquerda acomoda com alto contraste a headline e os CTAs em HTML,
        enquanto a galeria de projetos iluminada fica exposta à direita.
      */}
      <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Poster estático base de alta resolução: visível durante carregamento ou em prefers-reduced-motion */}
        <img
          src="/assets/hero-poster.webp"
          alt="Cenário conceitual cinematográfico da Vitrine Local & NEWNEO"
          className="absolute inset-0 w-full h-full object-cover object-[75%_center] z-0"
          loading="eager"
        />

        {/* Vídeo HTML5 desktop otimizado com loop contínuo e transição suave */}
        {!reducedMotion && canStreamVideo && (
          <video
            ref={desktopVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/hero-poster.webp"
            aria-hidden="true"
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-[75%_center] z-[1] transition-opacity duration-700 ease-out ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/assets/hero-cinematic-1080p.mp4" type="video/mp4" />
          </video>
        )}

        {/* Gradiente direcional da esquerda: protege a legibilidade do texto e CTAs sobre a área escura */}
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-r from-dark-950 via-dark-950/85 lg:via-dark-950/80 to-transparent"
          aria-hidden="true"
        />

        {/* Vinhetas superior e inferior para transição suave com o header e a seção seguinte */}
        <div
          className="absolute inset-x-0 top-0 h-28 z-[2] bg-gradient-to-b from-dark-950 via-dark-950/70 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 z-[2] bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Luz ambiente de profundidade */}
      <div
        className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand/15 rounded-full blur-[160px] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Banner Sazonal Compacto */}
        {seasonalCampaign.active && (
          <div className="flex justify-start mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="motion-reduce:hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="font-bold text-brand-300">{seasonalCampaign.tag}:</span>
              <span className="text-zinc-200">{seasonalCampaign.headline}</span>
            </div>
          </div>
        )}

        {/* Grid de Conteúdo: Coluna de Texto & Ação à Esquerda */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 xl:col-span-6 text-left space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.05]">
              CONHEÇA SEU SITE <br />
              <span className="text-brand">
                ANTES DE CONTRATAR
              </span>
            </h1>

            <p className="text-base sm:text-xl font-bold text-zinc-200 leading-snug tracking-tight">
              {hero.supportHeadline}
            </p>

            {/* 
              VITRINE CINEMATOGRÁFICA DEDICADA NO CELULAR / TABLET (< lg):
              No mobile, a tela vertical impediria a visualização do vídeo de fundo sem que o texto cobrisse os projetos.
              Aqui o vídeo é exibido em moldura 16:9 focalizada nos projetos (object-[75%_center]),
              garantindo que o visitante veja a atmosfera visual sem nenhuma sobreposição do texto!
            */}
            <div className="lg:hidden my-6">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-dark-900 group">
                <div className="relative aspect-video w-full overflow-hidden">
                  {/* Poster estático base */}
                  <img
                    src="/assets/hero-poster.webp"
                    alt="Cenário conceitual cinematográfico de apresentação da Vitrine Local"
                    className="w-full h-full object-cover object-[75%_center]"
                    loading="eager"
                  />
                  {/* Vídeo mobile otimizado (720p, leve e com loop contínuo) */}
                  {!reducedMotion && canStreamVideo && (
                    <video
                      ref={mobileVideoRef}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster="/assets/hero-poster.webp"
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover object-[75%_center]"
                    >
                      <source src="/assets/hero-cinematic-720p.webm" type="video/webm" />
                      <source src="/assets/hero-cinematic-720p.mp4" type="video/mp4" />
                    </video>
                  )}
                  {/* Badge de transparência conceitual */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-dark-950/85 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-zinc-300">
                    Cenário Conceitual 3D
                  </div>
                  {/* Faixa inferior de ancoragem ao portfólio real */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-dark-950/95 via-dark-950/80 to-transparent flex items-center justify-between text-[11px] text-zinc-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Atmosfera visual de criação
                    </span>
                    <a href="#portfolio" className="text-brand font-bold hover:underline flex items-center gap-1">
                      Ver portfólio real <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Para empresas já prospectadas pela nossa equipe, apresentamos uma demonstração conceitual personalizada desenvolvida para validação antes da decisão. Para quem está conhecendo a Vitrine Local agora, converse conosco para entender a proposta ideal para o seu negócio.
            </p>

            {/* CTAs Principais */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href={buildWhatsAppLink("spontaneous_visitor")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl text-base font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 motion-reduce:transform-none transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none group text-center"
              >
                <MessageCircle className="w-5 h-5 text-white shrink-0" />
                <span>Conversar no WhatsApp</span>
                <ArrowRight className="w-4 h-4 motion-reduce:transform-none transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </a>

              <a
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none text-center"
              >
                <Monitor className="w-4 h-4 text-brand shrink-0" />
                <span>Ver Demonstrações</span>
              </a>
            </div>

            {/* Micro Garantia / Condições */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Demonstração visual prévia • Parcelamento em até 10x no cartão</span>
            </div>
          </div>

          {/* 
            ÁREA DIREITA NO DESKTOP:
            A galeria de projetos do vídeo de fundo fica livre e em destaque aqui.
            Inserimos uma ancoragem sutil para orientar a atenção até o portfólio real navegável.
          */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end items-end h-full pointer-events-none pb-4">
            <div className="p-4 rounded-2xl bg-dark-950/70 backdrop-blur-md border border-white/10 shadow-2xl max-w-xs text-left pointer-events-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Cenário Conceitual 3D</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug mb-2.5">
                Direção visual de apresentação. Conheça as interfaces e capturas reais no portfólio interativo abaixo.
              </p>
              <a
                href="#portfolio"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-400 transition-colors"
              >
                <span>Explorar projetos reais</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

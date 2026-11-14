import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesHero: React.FC = () => {
  const { seasonalCampaign } = SITES_CONFIG;
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
        {/* Grid de Conteúdo: Coluna de Texto & Ação com Direção de Arte Editorial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-7 xl:col-span-6 text-left flex flex-col space-y-6">
            
            {/* Bloco 1: Abertura Editorial (Campanha, Headline e Subtítulo) */}
            <div className="order-1 space-y-6">
              {/* Tratamento Editorial Discreto para a Campanha Sazonal (sem truncar texto em nenhuma tela) */}
              {seasonalCampaign.active && (
                <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-zinc-300">
                  <span className="inline-flex items-center gap-1.5 text-zinc-200 font-semibold tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    {seasonalCampaign.tag}:
                  </span>
                  <span className="text-zinc-400 font-normal leading-relaxed">
                    {seasonalCampaign.headline}
                  </span>
                </div>
              )}

              {/* Headline com Tipografia Editorial e Ritmo Refinado */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-[3.6rem] font-extrabold text-white tracking-[-0.03em] leading-[1.06] [text-wrap:balance]">
                CONHEÇA SEU SITE <br />
                <span className="text-brand">
                  ANTES DE CONTRATAR
                </span>
              </h1>

              {/* Subtítulo de Apoio com Propósito Concreto */}
              <p className="text-base sm:text-xl font-medium text-zinc-200 leading-snug tracking-tight [text-wrap:pretty]">
                Validamos a identidade visual e a estrutura do seu projeto antes de qualquer compromisso comercial.
              </p>
            </div>

            {/* 
              Bloco 2: VITRINE CINEMATOGRÁFICA DEDICADA NO CELULAR / TABLET (< lg):
              No mobile, a tela vertical exibe o vídeo em moldura 16:9 focalizada nos projetos (object-[75%_center]).
            */}
            <div className="order-2 lg:hidden my-2">
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

            {/* 
              Bloco 3: Ação Protagonista de Conversão
              No mobile: aparece imediatamente após a vitrine de vídeo (order-3).
              No desktop: posiciona-se após a distinção dos dois públicos (lg:order-5).
            */}
            <div className="order-3 lg:order-5 pt-2 space-y-3">
              <a
                href={buildWhatsAppLink("spontaneous_visitor")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-all duration-200 motion-reduce:transform-none transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:outline-none group text-center"
              >
                <MessageCircle className="w-5 h-5 text-white shrink-0" />
                <span>Conversar no WhatsApp</span>
                <ArrowRight className="w-4 h-4 motion-reduce:transform-none transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </a>

              {/* Micro Garantia / Condições */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium pt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Demonstração visual prévia • Parcelamento em até 10x no cartão</span>
              </div>
            </div>

            {/* 
              Bloco 4: Distinção Clara e Honesta entre Empresas Prospectadas e Novos Visitantes
              No mobile: fica posicionado abaixo do botão de CTA (order-4).
              No desktop: fica acima do botão de CTA (lg:order-4).
            */}
            <div className="order-4 lg:order-4 space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed [text-wrap:pretty] pt-1 lg:pt-0">
              <p className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>
                  <strong className="text-white font-semibold">Empresas contatadas:</strong> sua equipe pode avaliar a proposta visual já concebida para a sua marca.
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2 shrink-0" />
                <span>
                  <strong className="text-zinc-200 font-medium">Novos contatos:</strong> converse com nosso atendimento pelo WhatsApp para entender o modelo e consultar a viabilidade de uma demonstração.
                </span>
              </p>
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

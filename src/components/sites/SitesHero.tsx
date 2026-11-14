import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, Monitor, ShieldCheck, Flame } from 'lucide-react';
import { SITES_CONFIG, buildWhatsAppLink } from '../../config/sitesLanding';

export const SitesHero: React.FC = () => {
  const { seasonalCampaign, hero } = SITES_CONFIG;
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hasMouse, setHasMouse] = useState(false);

  // Status de disponibilidade do vídeo final autorizado (atualmente pendente de produção oficial)
  // Estrutura preparada para receber o arquivo final sem quebrar a página
  const finalCinematicVideoPath: string | null = null; // Ex: "/assets/hero-cinematic.mp4"

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
      setHasMouse(mediaQuery.matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMouse || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      x: -yPos * 4,
      y: xPos * 4,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 overflow-hidden bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 text-white border-b border-white/5">
      {/* Luz ambiente de profundidade */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-brand/15 rounded-full blur-[170px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Grid Principal: Headline à Esquerda + Vitrine Cinematográfica à Direita (Visível na 1ª tela) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Coluna de Texto & Ação (5 colunas no Desktop) */}
          <div className="lg:col-span-5 text-left space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.05]">
              CONHEÇA SEU SITE <br />
              <span className="text-brand">
                ANTES DE CONTRATAR
              </span>
            </h1>

            <p className="text-base sm:text-xl font-bold text-zinc-200 leading-snug tracking-tight">
              {hero.supportHeadline}
            </p>

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

          {/* Coluna da Vitrine Cinematográfica Protagonista (7 colunas no Desktop) */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 relative"
            style={{ perspective: '1200px' }}
          >
            {/* Brilho e profundidade atrás do mockup */}
            <div className="absolute -inset-2 bg-gradient-to-r from-brand/25 via-orange-500/15 to-amber-500/20 rounded-3xl blur-2xl opacity-70 pointer-events-none -z-10" />

            {/* Container Principal do Mockup de Produção */}
            <div
              className="rounded-2xl sm:rounded-3xl bg-dark-900 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md transition-transform duration-200 ease-out motion-reduce:transform-none"
              style={{
                transform: hasMouse
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                  : 'none',
              }}
            >
              {/* Barra Superior do Navegador — Rótulo Neutro em Português do Brasil */}
              <div className="bg-dark-950 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-dark-900 border border-white/5 text-[11px] text-zinc-300 max-w-[260px] sm:max-w-md truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0"></span>
                  <span className="font-medium text-zinc-200">Ambiente de Demonstração Visual</span>
                </div>
                <div className="text-[11px] font-bold text-brand uppercase tracking-wider hidden sm:block">
                  Demonstrações & Referências
                </div>
              </div>

              {/* Área do Palco: Vídeo Futuro OU Composição Multissegmento com Imagens Reais */}
              <div className="relative bg-dark-950 min-h-[280px] sm:min-h-[360px] flex flex-col justify-center overflow-hidden">
                {finalCinematicVideoPath ? (
                  /* Integração preparada para o vídeo cinematográfico com fallback e suporte a movimento reduzido */
                  <div className="relative w-full h-full min-h-[280px] sm:min-h-[360px]">
                    {/* Imagem estática do poster sempre presente na camada base: garante visualização imediata, suporte a falha e a prefers-reduced-motion */}
                    <img
                      src="/assets/hero-poster.webp"
                      alt="Vitrine cinematográfica de projetos reais da Vitrine Local & NEWNEO"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      loading="eager"
                    />
                    {/* Vídeo sobreposto que respeita prefers-reduced-motion (ao ser ocultado, o poster base permanece visível e nítido) */}
                    <video
                      src={finalCinematicVideoPath}
                      poster="/assets/hero-poster.webp"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      className="relative z-10 w-full h-full object-cover motion-reduce:hidden"
                    />
                  </div>
                ) : (
                  /* Composição Multissegmento com Capturas Reais em Alta Fidelidade (Estado de Produção Atual) */
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-gradient-to-b from-dark-900/60 to-black">
                    {/* Projeto 1: Premium Burger (Gastronomia) */}
                    <div className="space-y-2 group">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                        <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-brand inline-block" />
                          Gastronomia & Delivery
                        </span>
                        <span className="text-zinc-400 text-[10px]">Ao Vivo</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black relative">
                        <img
                          src="/assets/portfolio/premium-burger.webp"
                          alt="Interface real do projeto Premium Burger desenvolvido pela NEWNEO"
                          className="w-full h-auto object-cover max-h-[190px] sm:max-h-[220px] group-hover:scale-[1.02] transition-transform duration-300"
                          loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                          <span className="text-xs font-bold text-white block drop-shadow">Premium Burger Artesanal</span>
                          <span className="text-[10px] text-zinc-300 block drop-shadow">Cardápio visual e pedidos diretos</span>
                        </div>
                      </div>
                    </div>

                    {/* Projeto 2: Titanium Blindagens (Engenharia) */}
                    <div className="space-y-2 group">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                        <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                          Engenharia & Blindagens
                        </span>
                        <span className="text-zinc-400 text-[10px]">Institucional</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black relative">
                        <img
                          src="/assets/portfolio/titanium-blindagens.webp"
                          alt="Interface real do projeto Titanium Blindagens desenvolvido pela NEWNEO"
                          className="w-full h-auto object-cover max-h-[190px] sm:max-h-[220px] group-hover:scale-[1.02] transition-transform duration-300"
                          loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                          <span className="text-xs font-bold text-white block drop-shadow">Titanium Blindagens</span>
                          <span className="text-[10px] text-zinc-300 block drop-shadow">Autoridade e prestígio corporativo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rodapé Interno do Mockup */}
                <div className="px-5 py-3 bg-dark-950/90 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-brand shrink-0" />
                    <span className="text-[11px] text-zinc-300">
                      Identidade visual autoral concebida pela NEWNEO Tecnologia
                    </span>
                  </div>
                  <a
                    href="#portfolio"
                    className="text-white hover:text-brand font-semibold text-xs inline-flex items-center gap-1 transition-colors duration-200 shrink-0"
                  >
                    <span>Ver todos</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

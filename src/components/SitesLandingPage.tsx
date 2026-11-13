import React, { useEffect, useMemo } from 'react';
import { SitesHeader } from './sites/SitesHeader';
import { SitesHero } from './sites/SitesHero';
import { SitesDiferencial } from './sites/SitesDiferencial';
import { SitesMoreThanASite } from './sites/SitesMoreThanASite';
import { SitesOfferPackage } from './sites/SitesOfferPackage';
import { SitesPortfolio } from './sites/SitesPortfolio';
import { SitesHowItWorks } from './sites/SitesHowItWorks';
import { SitesCommercial } from './sites/SitesCommercial';
import { SitesFaq } from './sites/SitesFaq';
import { SitesCtaFinal } from './sites/SitesCtaFinal';
import { SitesFooter } from './sites/SitesFooter';

interface SitesLandingPageProps {
  onNavigateHome: () => void;
}

export const SitesLandingPage: React.FC<SitesLandingPageProps> = ({ onNavigateHome }) => {
  // Leitura arquitetural de parâmetros futuros (?demo=... & ?cliente=...)
  const queryContext = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      demoId: params.get('demo') || params.get('ref') || undefined,
      clientName: params.get('cliente') || params.get('nome') || undefined,
    };
  }, []);

  useEffect(() => {
    // Configura o título exclusivo para /sites
    document.title = "Sites Profissionais Cinematográficos | Vitrine Local & NEWNEO — Conheça seu site antes de contratar";

    // Configura meta tag robots noindex temporária para /sites durante refinamentos
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const createdRobots = !metaRobots;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    const previousRobotsContent = metaRobots.content;
    metaRobots.content = 'noindex, nofollow';

    // Se houver hash na URL (ex: /sites#contratar), faz scroll direto para o elemento
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    return () => {
      // Restaura o estado original ao sair da página /sites
      if (createdRobots && metaRobots && metaRobots.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      } else if (metaRobots) {
        metaRobots.content = previousRobotsContent || 'index, follow';
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-white selection:bg-brand selection:text-white font-sans antialiased caret-brand">
      {/* Estilos dedicados para superfícies de navegador (scrollbar, foco, números tabulares) */}
      <style>{`
        /* Scrollbar customizada e integrada à paleta da marca */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #08090c;
        }
        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 5px;
          border: 2px solid #08090c;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ff5500;
        }
        /* Foco acessível padronizado */
        :focus-visible {
          outline: 2px solid #ff5500;
          outline-offset: 2px;
        }
      `}</style>

      {/* Header Sticky da LP */}
      <SitesHeader onNavigateHome={onNavigateHome} />

      {/* Conteúdo Principal da Landing Page */}
      <main className="flex-grow">
        {/* Banner de Boas-vindas para clientes com parâmetros de demonstração futura */}
        {queryContext.clientName && (
          <div className="bg-brand/20 border-b border-brand/30 py-2.5 px-4 text-center text-xs sm:text-sm text-brand-200">
            <span>Proposta visual personalizada preparada para: </span>
            <strong className="text-white font-bold">{queryContext.clientName}</strong>
          </div>
        )}

        {/* 1. Hero Cinematográfico & Nichos */}
        <SitesHero />

        {/* 2. O Grande Diferencial: Conheça Antes de Contratar */}
        <SitesDiferencial />

        {/* 3. Muito Mais Que Um Site (Benefícios Comerciais Concretos) */}
        <SitesMoreThanASite />

        {/* 4. O Que Está Incluído (Solução 3 em 1: Site + Kit 3D + BioPro) */}
        <SitesOfferPackage />

        {/* 5. Portfólio & Demonstrações Reais Navegáveis */}
        <SitesPortfolio />

        {/* 6. Como Funciona (Jornada em dois caminhos claros) */}
        <SitesHowItWorks />

        {/* 7. Condições Comerciais & Âncora /sites#contratar (Parcelamento 10x) */}
        <SitesCommercial />

        {/* 8. Perguntas Frequentes (FAQ Confirmada) */}
        <SitesFaq />

        {/* 9. Fechamento Sazonal 2026/2027 & CTA Final */}
        <SitesCtaFinal />
      </main>

      {/* Rodapé Co-branded Vitrine Local + NEWNEO + BioPro */}
      <SitesFooter onNavigateHome={onNavigateHome} />
    </div>
  );
};

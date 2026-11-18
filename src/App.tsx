import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Purpose } from './components/Purpose';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BenefitsPage } from './components/BenefitsPage';
import { SitesLandingPage } from './components/SitesLandingPage';
import { SitesContractingPage } from './components/sites/SitesContractingPage';

export function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname.replace(/\/+$/, '') || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.replace(/\/+$/, '') || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentPath !== '/beneficios' && currentPath !== '/sites') {
      document.title = "VL — Vitrine Local | Conectando pessoas, negócios e oportunidades";
    }
  }, [currentPath]);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path.replace(/\/+$/, '') || '/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Rota da Landing Page Premium de Sites (Ativada para implementação e testes)
  if (currentPath === '/sites') {
    return <SitesLandingPage onNavigateHome={() => navigate('/')} />;
  }

  // Rota do Fluxo de Proposta e Contratação Individual (/sites/contratar)
  if (currentPath === '/sites/contratar' || currentPath === '/sites/proposta') {
    return <SitesContractingPage onNavigateSites={() => navigate('/sites')} />;
  }

  // Rota de Benefícios Exclusivos (White Label)
  if (currentPath === '/beneficios') {
    return <BenefitsPage onNavigateHome={() => navigate('/')} />;
  }

  // Site Institucional Principal (Direção Visual Unificada)
  return (
    <div className="min-h-screen flex flex-col bg-[#07080A] text-white selection:bg-brand/30 selection:text-white antialiased">
      {/* Sticky Institutional Header */}
      <Header />

      {/* Main Single-Page Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Sobre Nós */}
        <About />

        {/* Propósito */}
        <Purpose />

        {/* Fechamento Institucional & Contato */}
        <ContactSection />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}

export default App;

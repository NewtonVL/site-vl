import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Purpose } from './components/Purpose';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BenefitsPage } from './components/BenefitsPage';

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
    if (currentPath !== '/beneficios') {
      document.title = "VL — Vitrine Local | Conectando pessoas, negócios e oportunidades";
    }
  }, [currentPath]);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path.replace(/\/+$/, '') || '/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Rota de Benefícios Exclusivos (White Label)
  if (currentPath === '/beneficios') {
    return <BenefitsPage onNavigateHome={() => navigate('/')} />;
  }

  // Site Institucional Principal (100% preservado)
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-brand-100 selection:text-brand-900">
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

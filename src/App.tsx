import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Purpose } from './components/Purpose';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

export function App() {
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

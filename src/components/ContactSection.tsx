import React, { useState } from 'react';
import { Mail, Copy, Check, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/site';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for environments without clipboard permissions
      setCopied(false);
    }
  };

  return (
    <section id="contato" className="py-16 sm:py-24 bg-white border-t border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Fechamento Institucional */}
        <div className="max-w-4xl mx-auto text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-50 border border-brand-100 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand" />
          </div>

          <blockquote className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-3">
            “{siteConfig.closing.quote}”
          </blockquote>
          
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto">
            Aproximar pessoas e negócios locais fortalece toda a comunidade.
          </p>
        </div>

        {/* Seção de Contato Institucional */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-zinc-50 border border-zinc-200 rounded-3xl p-7 sm:p-10 shadow-card text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto mb-5">
              <Mail className="w-6 h-6" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2">
              {siteConfig.contact.label}
            </h3>

            <p className="text-sm sm:text-base text-zinc-600 mb-7 max-w-md mx-auto">
              {siteConfig.contact.helpText}
            </p>

            {/* Email display and actions */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="text-left w-full sm:w-auto">
                <span className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  E-mail oficial
                </span>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-base sm:text-lg font-bold text-brand hover:text-brand-600 transition-colors break-all"
                >
                  {siteConfig.contact.email}
                </a>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Mailto button */}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-sm"
                  aria-label={`Enviar e-mail para ${siteConfig.contact.email}`}
                >
                  <span>Enviar e-mail</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    copied
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                  }`}
                  aria-label="Copiar endereço de e-mail"
                  title="Copiar endereço"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="hidden sm:inline">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {copied && (
              <p className="mt-3 text-xs font-semibold text-emerald-600 animate-in fade-in duration-200">
                Endereço copiado para a área de transferência!
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

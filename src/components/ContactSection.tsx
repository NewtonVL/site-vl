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
      setCopied(false);
    }
  };

  return (
    <section id="contato" className="py-20 sm:py-28 bg-[#090A0C] text-white border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fechamento Institucional */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <span className="inline-block w-2 h-2 rounded-full bg-brand mb-6" aria-hidden="true" />

          <blockquote className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-[1.2] [text-wrap:balance] mb-4">
            “O local ganha força{' '}
            <span className="font-light text-zinc-400">quando as pessoas se conectam.</span>”
          </blockquote>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Aproximar pessoas e negócios locais fortalece toda a comunidade.
          </p>
        </div>

        {/* Cartão de Contato Institucional */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-[#0F1115] border border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl text-center">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-brand flex items-center justify-center mx-auto mb-5">
              <Mail className="w-5 h-5" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {siteConfig.contact.label}
            </h3>

            <p className="text-sm sm:text-base text-zinc-400 mb-7 max-w-md mx-auto">
              {siteConfig.contact.helpText}
            </p>

            {/* E-mail oficial e ações */}
            <div className="bg-[#07080A] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto min-w-0">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                  E-mail oficial
                </span>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-sm sm:text-base font-semibold text-white hover:text-brand transition-colors break-all"
                >
                  {siteConfig.contact.email}
                </a>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-600 transition-colors shadow-orange-glow whitespace-nowrap"
                  aria-label={`Enviar e-mail para ${siteConfig.contact.email}`}
                >
                  <span>Enviar e-mail</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    copied
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-label="Copiar endereço de e-mail"
                  title="Copiar endereço"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
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
              <p className="mt-3 text-xs font-semibold text-emerald-400">
                Endereço copiado para a área de transferência!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

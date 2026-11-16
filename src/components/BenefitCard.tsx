import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Clock, Sparkles, Ticket, Copy, Check, AlertCircle, ChevronDown } from 'lucide-react';
import type { BenefitOffer } from '../config/benefits';
import { BenefitBrandMark } from './BenefitBrandMark';

interface BenefitCardProps {
  offer: BenefitOffer;
  className?: string;
}

type CopyStatus = 'idle' | 'copied' | 'error';

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const copied = document.execCommand('copy');
    if (!copied) {
      throw new Error('Falha ao copiar para a área de transferência');
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ offer, className = '' }) => {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const resetTimerRef = useRef<number | null>(null);
  const detailsId = `offer-details-${offer.id}`;

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopyCoupon = async () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    try {
      await copyTextToClipboard(offer.coupon);
      setCopyStatus('copied');
      resetTimerRef.current = window.setTimeout(() => {
        setCopyStatus('idle');
        resetTimerRef.current = null;
      }, 2500);
    } catch {
      setCopyStatus('error');
      resetTimerRef.current = window.setTimeout(() => {
        setCopyStatus('idle');
        resetTimerRef.current = null;
      }, 4500);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden bg-[#0F1115] rounded-2xl border border-white/10 hover:border-white/20 shadow-xl transition-colors duration-200 flex flex-col justify-between ${className}`.trim()}
    >
      {/* Barra sutil de identidade do produto */}
      <div
        className="h-1 w-full shrink-0"
        style={{ background: offer.accent.topBar }}
        aria-hidden="true"
      />

      <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow">
        <div>
          {/* Barra superior: Categoria e Badge de Desconto adaptado para fundo escuro */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className="font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider leading-snug">
              {offer.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-white text-xs font-bold shrink-0">
              <Sparkles className="w-3 h-3 text-brand" />
              <span>{offer.discount}</span>
            </span>
          </div>

          {/* Marca do Produto + Título + Badge Opcional */}
          <div className="flex items-start gap-3.5 mb-3.5">
            <BenefitBrandMark offerId={offer.id} />
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {offer.title}
              </h3>
              {offer.badge && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                  {offer.badge}
                </span>
              )}
            </div>
          </div>

          {/* Descrição curta */}
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">
            {offer.description}
          </p>

          {/* Expansível "Saiba mais" */}
          {offer.details.length > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-controls={detailsId}
                aria-label={`${isExpanded ? 'Ocultar detalhes' : 'Saiba mais'} sobre ${offer.title}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white py-1 rounded-md transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-[#0F1115]"
              >
                <span>{isExpanded ? 'Ver menos' : 'Saiba mais'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {isExpanded && (
                <div
                  id={detailsId}
                  className="mt-2 p-3.5 rounded-xl bg-[#07080A]/90 border border-white/10 space-y-2"
                >
                  {offer.details.map((detail) => (
                    <p key={detail.label} className="text-xs text-zinc-300 leading-relaxed">
                      <span className="font-semibold text-white">{detail.label}: </span>
                      {detail.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Bloco do Cupom */}
          <div className="mb-4 p-3.5 rounded-xl bg-[#07080A] border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <Ticket className="w-3.5 h-3.5 shrink-0 text-brand" />
                <span>Cupom</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <code className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white font-mono text-xs font-bold tracking-wider select-all">
                  {offer.coupon}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  aria-label={`Copiar cupom ${offer.coupon} de ${offer.title}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-[#07080A] ${
                    copyStatus === 'copied'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/15 text-zinc-200 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div aria-live="polite" className="sr-only">
              {copyStatus === 'copied' && `Cupom ${offer.coupon} copiado para a área de transferência.`}
              {copyStatus === 'error' && `Não foi possível copiar o cupom ${offer.coupon} automaticamente.`}
            </div>
            {copyStatus === 'error' && (
              <p
                role="alert"
                className="mt-2 flex items-start gap-1.5 text-xs text-red-400 leading-relaxed"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Não foi possível copiar automaticamente. Selecione e copie o código {offer.coupon}.</span>
              </p>
            )}
            {offer.couponNote && (
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                {offer.couponNote}
              </p>
            )}
          </div>

          {/* Área de Ação */}
          <div className="pt-4 border-t border-white/10">
            {offer.modalities && offer.modalities.length > 0 ? (
              <div className="space-y-2.5">
                <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Escolha a modalidade
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {offer.modalities.map((modality) => (
                    <div
                      key={modality.id}
                      className="p-3 rounded-xl bg-[#07080A] border border-white/10 flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-white mb-2">
                        {modality.name}
                      </span>
                      {modality.status === 'active' && modality.checkoutUrl ? (
                        <a
                          href={modality.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-brand hover:bg-brand-600 transition-colors shadow-sm"
                        >
                          <span>{modality.buttonText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 bg-white/5 border border-white/10 cursor-not-allowed select-none"
                        >
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{modality.buttonText}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {offer.status === 'active' && offer.checkoutUrl ? (
                  <a
                    href={offer.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-600 shadow-orange-glow transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1115]"
                  >
                    <span>{offer.buttonText || 'Acessar oferta'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-zinc-500 bg-white/5 border border-white/10 cursor-not-allowed select-none"
                    aria-disabled="true"
                  >
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{offer.buttonText || 'Disponível em breve'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

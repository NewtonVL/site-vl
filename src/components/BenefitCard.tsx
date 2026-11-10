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
      className={`group relative overflow-hidden bg-white rounded-2xl border border-zinc-200/90 shadow-subtle hover:shadow-card transition-shadow duration-200 flex flex-col justify-between ${className}`.trim()}
    >
      {/* Subtle Top Identity Accent Strip */}
      <div
        className="h-1 w-full shrink-0"
        style={{ background: offer.accent.topBar }}
        aria-hidden="true"
      />

      <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow">
        <div>
          {/* Top bar: Category and Discount badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider leading-snug">
              {offer.category}
            </span>
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold shrink-0"
              style={{
                backgroundColor: offer.accent.badgeBg,
                borderColor: offer.accent.badgeBorder,
                color: offer.accent.badgeText,
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{offer.discount}</span>
            </span>
          </div>

          {/* Product Brand Mark + Title + Optional Badge */}
          <div className="flex items-start gap-3.5 mb-3.5">
            <BenefitBrandMark offerId={offer.id} />
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
                {offer.title}
              </h3>
              {offer.badge && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                  {offer.badge}
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-sm text-zinc-600 leading-relaxed mb-2.5">
            {offer.description}
          </p>

          {/* Expandable "Saiba mais" */}
          {offer.details.length > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-controls={detailsId}
                aria-label={`${isExpanded ? 'Ocultar detalhes' : 'Saiba mais'} sobre ${offer.title}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 py-1 rounded-md transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
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
                  className="mt-2 p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-2"
                >
                  {offer.details.map((detail) => (
                    <p key={detail.label} className="text-xs text-zinc-600 leading-relaxed">
                      <span className="font-semibold text-zinc-800">{detail.label}: </span>
                      {detail.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Coupon Display */}
          <div className="mb-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                <Ticket
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: offer.accent.badgeText }}
                />
                <span>Cupom</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <code className="px-2.5 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-900 font-mono text-xs font-bold tracking-wider select-all">
                  {offer.coupon}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  aria-label={`Copiar cupom ${offer.coupon} de ${offer.title}`}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 ${
                    copyStatus === 'copied'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
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
                className="mt-2 flex items-start gap-1.5 text-xs text-red-700 leading-relaxed"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Não foi possível copiar automaticamente. Selecione e copie o código {offer.coupon}.</span>
              </p>
            )}
            {offer.couponNote && (
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                {offer.couponNote}
              </p>
            )}
          </div>

          {/* Action Area */}
        <div className="pt-4 border-t border-zinc-100">
          {offer.modalities && offer.modalities.length > 0 ? (
            /* Multi-modality card (ex: Barbearias) */
            <div className="space-y-2.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Escolha a modalidade
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {offer.modalities.map((modality) => (
                  <div
                    key={modality.id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-zinc-800 mb-2">
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
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 bg-zinc-100 border border-zinc-200/70 cursor-not-allowed select-none"
                      >
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{modality.buttonText}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Single Action Card */
            <div>
              {offer.status === 'active' && offer.checkoutUrl ? (
                <a
                  href={offer.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-600 shadow-orange-glow hover:shadow-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <span>{offer.buttonText || 'Acessar oferta'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-zinc-400 bg-zinc-100 border border-zinc-200 cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  <Clock className="w-4 h-4 text-zinc-400" />
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

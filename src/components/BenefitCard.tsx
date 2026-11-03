import React from 'react';
import { ExternalLink, Clock, Sparkles } from 'lucide-react';
import type { BenefitOffer } from '../config/benefits';

interface BenefitCardProps {
  offer: BenefitOffer;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ offer }) => {
  return (
    <div className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-subtle hover:shadow-card hover:border-brand-200 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top bar: Category and Discount badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {offer.category}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand text-xs font-bold shrink-0">
            <Sparkles className="w-3 h-3 text-brand" />
            <span>{offer.discount}</span>
          </span>
        </div>

        {/* Title and optional Badge */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-zinc-900 group-hover:text-brand transition-colors">
            {offer.title}
          </h3>
          {offer.badge && (
            <span className="inline-block mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
              {offer.badge}
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-sm text-zinc-600 leading-relaxed mb-6">
          {offer.description}
        </p>
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
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-600 shadow-orange-glow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
  );
};

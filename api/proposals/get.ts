import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  computeServerCardTotalCents,
  computeServerPixPriceCents,
  findServerProposalAuthorized,
} from '../_lib/proposalsStore.js';

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const proposalId = url.searchParams.get('id') || '';
  const accessToken = url.searchParams.get('token') || undefined;
  const lookup = findServerProposalAuthorized(proposalId, accessToken);

  if (!('proposal' in lookup)) {
    res.statusCode = lookup.status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ error: lookup.error }));
    return;
  }

  const proposal = lookup.proposal;
  const pixFinalPriceCents = computeServerPixPriceCents(proposal);
  const cardInstallmentOptions = Array.from(
    { length: proposal.cardMaxInstallments },
    (_, index) => {
      const installments = index + 1;
      const totalAmountCents = computeServerCardTotalCents(proposal, installments);
      const installmentAmountCents = Math.round(totalAmountCents / installments);
      const interestRateMonthlyPercent =
        installments === 1 ? 0 : proposal.cardMonthlyInterestPercent;
      return {
        installments,
        installmentAmountCents,
        totalAmountCents,
        interestRateMonthlyPercent,
        label:
          installments === 1
            ? `1x de ${formatBRL(installmentAmountCents)} (sem encargos)`
            : `${installments}x de ${formatBRL(installmentAmountCents)} (total ${formatBRL(totalAmountCents)})`,
      };
    },
  );

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(
    JSON.stringify({
      id: proposal.id,
      clientDisplayName: proposal.clientDisplayName,
      businessSegment: proposal.businessSegment,
      demoReferenceUrl: proposal.demoReferenceUrl,
      validUntil: proposal.validUntil,
      basePriceCents: proposal.basePriceCents,
      pixDiscountPercent: proposal.pixDiscountPercent,
      pixFinalPriceCents,
      cardMaxInstallments: proposal.cardMaxInstallments,
      cardInstallmentOptions,
      includedItems: proposal.includedItems,
      contractVersion: proposal.contractVersion,
      isDemoPreview: Boolean(proposal.isDemoPreview),
    }),
  );
}

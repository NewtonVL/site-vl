export const MP_EXTERNAL_REFERENCE_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

const COMPACT_ACC_REGEX = /^acc_([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/i;
const FULL_ACC_UUID_REGEX = /^acc_([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i;

function sanitizeSegment(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
}

/**
 * Monta external_reference compatível com Mercado Pago Orders API (`^[a-zA-Z0-9_-]{1,64}$`),
 * preservando vínculo inequívoco com proposalId e acceptanceId.
 */
export function buildOrderExternalReference(proposalId: string, acceptanceId: string): string {
  const safeProposal = sanitizeSegment(proposalId);
  const safeAcceptance = sanitizeSegment(acceptanceId);
  if (!safeProposal || !safeAcceptance) {
    throw new Error('proposalId e acceptanceId são obrigatórios para external_reference.');
  }

  let candidate = `${safeProposal}__${safeAcceptance}`;
  if (candidate.length > 64) {
    const match = safeAcceptance.match(FULL_ACC_UUID_REGEX);
    if (match) {
      const compactAcc = `acc_${match[1]}${match[2]}${match[3]}${match[4]}${match[5]}`;
      candidate = `${safeProposal}__${compactAcc}`;
    }
  }

  if (!MP_EXTERNAL_REFERENCE_REGEX.test(candidate)) {
    throw new Error(`external_reference inválido para Orders API (${candidate.length} chars).`);
  }

  return candidate;
}

export function parseOrderExternalReference(externalRef?: string): {
  proposalId: string | null;
  acceptanceId: string | null;
} {
  if (!externalRef || typeof externalRef !== 'string') {
    return { proposalId: null, acceptanceId: null };
  }

  let rawProposal: string | undefined;
  let rawAcceptance: string | undefined;

  if (externalRef.includes('__')) {
    const idx = externalRef.indexOf('__');
    rawProposal = externalRef.slice(0, idx);
    rawAcceptance = externalRef.slice(idx + 2);
  } else if (externalRef.includes(':')) {
    const idx = externalRef.indexOf(':');
    rawProposal = externalRef.slice(0, idx);
    rawAcceptance = externalRef.slice(idx + 1);
  }

  if (!rawProposal || !rawAcceptance) {
    return { proposalId: null, acceptanceId: null };
  }

  const compactMatch = rawAcceptance.match(COMPACT_ACC_REGEX);
  const normalizedAcceptance = compactMatch
    ? `acc_${compactMatch[1]}-${compactMatch[2]}-${compactMatch[3]}-${compactMatch[4]}-${compactMatch[5]}`
    : rawAcceptance;

  return {
    proposalId: rawProposal,
    acceptanceId: normalizedAcceptance,
  };
}

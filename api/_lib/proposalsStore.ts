import { verifyAccessToken } from './crypto.js';

export interface ServerProposalRecord {
  id: string;
  accessTokenHash?: string;
  clientDisplayName: string;
  businessSegment: string;
  demoReferenceUrl?: string;
  validUntil: string;
  basePriceCents: number;
  pixDiscountPercent: number;
  cardMaxInstallments: number;
  cardMonthlyInterestPercent: number;
  includedItems: string[];
  contractVersion: string;
  isDemoPreview?: boolean;
}

export type ProposalLookupResult =
  | { ok: true; proposal: ServerProposalRecord }
  | { ok: false; status: 401 | 403 | 404; error: string };

const CONTRACT_VERSION = 'v1.3-minuta-2026-11';

const DEFAULT_INCLUDED_ITEMS = [
  'Site Profissional Premium (Engenharia NEWNEO)',
  'Kit Instagram com Personagem 3D (1 vídeo até 30s + 2 imagens)',
  'BioPro Link (acesso oficial incluído por 12 meses)',
  'Hospedagem profissional pela Vitrine Local incluída por 12 meses da entrega',
  'Orientação na escolha e apontamento técnico do domínio próprio do cliente',
  'Manutenção opcional (R$ 49,90/mês na entrega, se escolhida): até 2 alterações simples/mês',
];

const DEMO_PROPOSAL: ServerProposalRecord = {
  id: 'VL-DEMO-001',
  clientDisplayName: 'Empresa Demonstração Local Ltda (Exemplo Fictício)',
  businessSegment: 'Comércio & Serviços Locais',
  demoReferenceUrl: 'https://www.vitrinelocal.com.br/sites#portfolio',
  validUntil: '2026-12-31',
  basePriceCents: 249000,
  pixDiscountPercent: 20,
  cardMaxInstallments: 10,
  cardMonthlyInterestPercent: 1.99,
  includedItems: DEFAULT_INCLUDED_ITEMS,
  contractVersion: CONTRACT_VERSION,
  isDemoPreview: true,
};

export function isDemoProposalAllowed(): boolean {
  if (process.env.ALLOW_DEMO_PROPOSAL === 'true') return true;
  if (process.env.ALLOW_DEMO_PROPOSAL === 'false') return false;
  return process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production';
}

export function findServerProposalAuthorized(
  proposalId: string,
  accessToken?: string,
): ProposalLookupResult {
  const normalizedId = proposalId.trim().toUpperCase();
  if (!normalizedId) {
    return { ok: false, status: 404, error: 'Proposta não encontrada.' };
  }

  // 1. Proposta de demonstração isolada (dados estritamente fictícios, bloqueada em produção)
  if (normalizedId === DEMO_PROPOSAL.id) {
    if (!isDemoProposalAllowed()) {
      return {
        ok: false,
        status: 403,
        error: 'Proposta de demonstração desabilitada neste ambiente.',
      };
    }
    return { ok: true, proposal: DEMO_PROPOSAL };
  }

  // 2. Propostas reais carregadas do servidor (PROPOSALS_JSON / futuro banco) exigem token individual
  const rawProposalsEnv = process.env.PROPOSALS_JSON;
  if (rawProposalsEnv) {
    try {
      const parsed = JSON.parse(rawProposalsEnv) as ServerProposalRecord[];
      const match = parsed.find((p) => p.id.toUpperCase() === normalizedId && !p.isDemoPreview);
      if (match) {
        if (!verifyAccessToken(accessToken, match.accessTokenHash)) {
          return {
            ok: false,
            status: 401,
            error: 'Token de acesso individual inválido ou ausente para esta proposta.',
          };
        }
        return { ok: true, proposal: match };
      }
    } catch (err) {
      console.error('Erro ao interpretar PROPOSALS_JSON:', err);
    }
  }

  return { ok: false, status: 404, error: 'Proposta não encontrada ou expirada.' };
}

export function computeServerPixPriceCents(proposal: ServerProposalRecord): number {
  return Math.round(proposal.basePriceCents * (1 - proposal.pixDiscountPercent / 100));
}

export function computeServerCardTotalCents(
  proposal: ServerProposalRecord,
  installments: number,
): number {
  const n = Math.max(1, Math.min(installments, proposal.cardMaxInstallments));
  if (n === 1) return proposal.basePriceCents;
  const rate = proposal.cardMonthlyInterestPercent / 100;
  const factor = (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  const installmentAmountCents = Math.round(proposal.basePriceCents * factor);
  return installmentAmountCents * n;
}

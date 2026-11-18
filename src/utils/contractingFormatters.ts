import type { ProposalInstallmentOption, ProposalSummary } from '../types/contracting';
import { CONTRACT_DRAFT_VERSION } from '../config/contractDraft';

export function formatCurrencyBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeCnpj(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 14);
}

export function formatDocumentMask(raw: string, type: 'CPF' | 'CNPJ'): string {
  if (type === 'CPF') {
    const d = onlyDigits(raw).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  const d = normalizeCnpj(raw);
  return d
    .replace(/^([A-Z0-9]{2})([A-Z0-9])/, '$1.$2')
    .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})([A-Z0-9])/, '$1.$2.$3')
    .replace(/\.([A-Z0-9]{3})([A-Z0-9])/, '.$1/$2')
    .replace(/([A-Z0-9]{4})([0-9A-Z]{1,2})$/, '$1-$2');
}

export function isValidDocumentLength(raw: string, type: 'CPF' | 'CNPJ'): boolean {
  if (type === 'CPF') return onlyDigits(raw).length === 11;
  return normalizeCnpj(raw).length === 14;
}

export function isValidCnpj(raw: string): boolean {
  const normalized = normalizeCnpj(raw);
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(normalized)) return false;
  if (/^([A-Z0-9])\1{13}$/.test(normalized)) return false;

  const calcDigit = (base: string, weights: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, ch, idx) => acc + (ch.charCodeAt(0) - 48) * weights[idx], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calcDigit(normalized.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit(normalized.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return Number(normalized[12]) === d1 && Number(normalized[13]) === d2;
}

export function maskDocumentForReceipt(raw: string, type: 'CPF' | 'CNPJ'): string {
  if (type === 'CPF') {
    const digits = onlyDigits(raw);
    if (digits.length === 11) {
      return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
    }
    return '***';
  }
  const cnpj = normalizeCnpj(raw);
  if (cnpj.length === 14) {
    return `**.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-**`;
  }
  return '***';
}

export function formatPhoneMask(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function normalizeDomainInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

export function buildCardInstallmentOptions(
  basePriceCents: number,
  maxInstallments = 10,
  monthlyInterestPercent = 1.99,
): ProposalInstallmentOption[] {
  const options: ProposalInstallmentOption[] = [];
  for (let n = 1; n <= maxInstallments; n++) {
    if (n === 1) {
      options.push({
        installments: 1,
        installmentAmountCents: basePriceCents,
        totalAmountCents: basePriceCents,
        interestRateMonthlyPercent: 0,
        label: `1x de ${formatCurrencyBRL(basePriceCents)} (sem encargos)`,
      });
    } else {
      const rate = monthlyInterestPercent / 100;
      const factor = (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
      const installmentAmountCents = Math.round(basePriceCents * factor);
      const totalAmountCents = installmentAmountCents * n;
      options.push({
        installments: n,
        installmentAmountCents,
        totalAmountCents,
        interestRateMonthlyPercent: monthlyInterestPercent,
        label: `${n}x de ${formatCurrencyBRL(installmentAmountCents)} (total ${formatCurrencyBRL(totalAmountCents)})`,
      });
    }
  }
  return options;
}

/**
 * Proposta de demonstração exclusiva para revisão local em ambiente de desenvolvimento
 * quando as Serverless Functions (/api/*) não estão em execução no Vite dev server.
 */
export function getLocalDemoProposal(proposalId: string): ProposalSummary | null {
  if (proposalId.toUpperCase() !== 'VL-DEMO-001') {
    return null;
  }
  const basePriceCents = 249000; // Exemplo ilustrativo apenas para ambiente de teste local
  const pixDiscountPercent = 20;
  const pixFinalPriceCents = Math.round(basePriceCents * (1 - pixDiscountPercent / 100));
  return {
    id: 'VL-DEMO-001',
    clientDisplayName: 'Empresa Demonstração Local Ltda (Exemplo de Teste)',
    businessSegment: 'Comércio & Serviços Locais',
    demoReferenceUrl: 'https://www.vitrinelocal.com.br/sites#portfolio',
    validUntil: '2026-12-31',
    basePriceCents,
    pixDiscountPercent,
    pixFinalPriceCents,
    cardMaxInstallments: 10,
    cardInstallmentOptions: buildCardInstallmentOptions(basePriceCents, 10, 1.99),
    includedItems: [
      'Site Profissional Premium (Engenharia NEWNEO)',
      'Kit Instagram com Personagem 3D (1 vídeo até 30s + 2 imagens)',
      'BioPro Link (acesso oficial incluído por 12 meses)',
      'Hospedagem profissional pela Vitrine Local incluída por 12 meses da entrega',
      'Orientação na escolha e apontamento técnico do domínio próprio do cliente',
      'Manutenção opcional (R$ 49,90/mês na entrega, se escolhida): até 2 alterações simples/mês',
    ],
    contractVersion: CONTRACT_DRAFT_VERSION,
    isDemoPreview: true,
  };
}

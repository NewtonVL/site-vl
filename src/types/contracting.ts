export type DomainOption = 'existing' | 'register_own';

export type MaintenanceOption = 'none' | 'monthly_49_90';

export type PaymentMethodOption = 'pix' | 'card';

export interface ProposalInstallmentOption {
  installments: number;
  installmentAmountCents: number;
  totalAmountCents: number;
  interestRateMonthlyPercent: number;
  label: string;
}

export interface ProposalSummary {
  id: string;
  clientDisplayName: string;
  businessSegment: string;
  demoReferenceUrl?: string;
  validUntil: string;
  basePriceCents: number;
  pixDiscountPercent: number;
  pixFinalPriceCents: number;
  cardMaxInstallments: number;
  cardInstallmentOptions: ProposalInstallmentOption[];
  includedItems: string[];
  contractVersion: string;
  isDemoPreview?: boolean;
}

export interface ClientIdentification {
  legalName: string;
  tradeName?: string;
  companyAddress?: string;
  registrationStatus?: string;
  cnpjLookupSource?: string;
  documentType: 'CPF' | 'CNPJ';
  documentNumber: string;
  responsibleName: string;
  confirmedLegalPowers?: boolean;
  email: string;
  whatsapp: string;
}

export interface CnpjLookupResponse {
  razaoSocial: string;
  nomeFantasia: string | null;
  situacaoCadastral: string | null;
  endereco: string | null;
  source: string;
}

export interface ContractingSelections {
  domainOption: DomainOption | null;
  domainName: string;
  maintenanceOption: MaintenanceOption | null;
  paymentMethod: PaymentMethodOption | null;
  selectedInstallments: number;
}

export interface ContractAcceptancePayload {
  proposalId: string;
  contractVersion: string;
  client: ClientIdentification;
  selections: {
    domainOption: DomainOption;
    domainName: string;
    maintenanceOption: MaintenanceOption;
    paymentMethod: PaymentMethodOption;
    selectedInstallments: number;
  };
  consents: {
    acceptedContractDraft: boolean;
    acceptedMaintenanceSpecific: boolean;
    acceptedPrivacyNotice: boolean;
  };
}

export interface ContractAcceptanceReceipt {
  acceptanceId: string;
  proposalId: string;
  contractVersion: string;
  contractTextSha256: string;
  acceptedAt: string;
  domainOption: DomainOption;
  domainName: string;
  maintenanceOption: MaintenanceOption;
  maintenanceAccepted: boolean;
  paymentMethod: PaymentMethodOption;
  selectedInstallments: number;
  serverCalculatedAmountCents: number;
  clientDocumentMasked: string;
  integritySignature: string;
  storageMode: 'durable_postgres' | 'demo_ephemeral' | 'local_preview';
}

export interface MercadoPagoTestOrderResult {
  mode: 'sandbox_ready' | 'architecture_dry_run' | 'production_ready';
  provider: 'mercadopago_orders';
  environment: 'test' | 'production';
  verifiedTestUser?: boolean;
  orderId: string;
  checkoutUrl?: string;
  idempotencyKey?: string;
  externalReference: string;
  amountCents: number;
  paymentMethod: PaymentMethodOption;
  maxInstallments: number;
  message: string;
}

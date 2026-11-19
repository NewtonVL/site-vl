import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import {
  computeServerCardTotalCents,
  computeServerPixPriceCents,
  findServerProposalAuthorized,
} from '../_lib/proposalsStore.js';
import {
  hashSensitiveDocument,
  sha256Hex,
  signAcceptancePayload,
} from '../_lib/crypto.js';
import { getPersistenceAdapter } from '../_lib/persistence.js';
import {
  CONTRACT_DRAFT_CLAUSES,
  CONTRACT_DRAFT_METADATA,
} from '../../src/config/contractDraft.js';
import { isValidCnpjDigits, normalizeCnpjValue } from './cnpj-lookup.js';

interface AcceptRequestBody {
  proposalId?: string;
  accessToken?: string;
  contractVersion?: string;
  client?: {
    legalName?: string;
    tradeName?: string;
    companyAddress?: string;
    registrationStatus?: string;
    documentType?: 'CPF' | 'CNPJ';
    documentNumber?: string;
    responsibleName?: string;
    confirmedLegalPowers?: boolean;
    email?: string;
    whatsapp?: string;
  };
  selections?: {
    domainOption?: 'existing' | 'register_own';
    domainName?: string;
    maintenanceOption?: 'none' | 'monthly_49_90';
    paymentMethod?: 'pix' | 'card';
    selectedInstallments?: number;
  };
  consents?: {
    acceptedContractDraft?: boolean;
    acceptedMaintenanceSpecific?: boolean;
    acceptedPrivacyNotice?: boolean;
  };
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw || '{}') as T;
}

function maskDocument(raw: string, type: 'CPF' | 'CNPJ'): string {
  if (type === 'CPF') {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 11) {
      return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
    }
    return '***';
  }
  const cnpj = normalizeCnpjValue(raw);
  if (cnpj.length === 14) {
    return `**.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-**`;
  }
  return '***';
}

function buildCanonicalContractTextSnapshot(): string {
  const header = `${CONTRACT_DRAFT_METADATA.title}\nVersão: ${CONTRACT_DRAFT_METADATA.version}\nStatus: ${CONTRACT_DRAFT_METADATA.statusLabel}`;
  const body = CONTRACT_DRAFT_CLAUSES.map(
    (c) => `${c.number} - ${c.title}\n${c.paragraphs.join('\n')}`,
  ).join('\n\n');
  return `${header}\n\n${body}`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readJsonBody<AcceptRequestBody>(req);
    const lookup = findServerProposalAuthorized(body.proposalId || '', body.accessToken);

    if (!('proposal' in lookup)) {
      res.statusCode = lookup.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: lookup.error }));
      return;
    }

    const proposal = lookup.proposal;

    if (body.contractVersion !== proposal.contractVersion) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'A versão da minuta do contrato foi atualizada. Recarregue a página para revisar.',
        }),
      );
      return;
    }

    const docType = body.client?.documentType === 'CNPJ' ? 'CNPJ' : 'CPF';
    const docNormalized =
      docType === 'CNPJ'
        ? normalizeCnpjValue(body.client?.documentNumber || '')
        : (body.client?.documentNumber || '').replace(/\D/g, '');
    const validDoc =
      docType === 'CPF' ? docNormalized.length === 11 : isValidCnpjDigits(docNormalized);

    if (
      !body.client?.legalName?.trim() ||
      !body.client?.responsibleName?.trim() ||
      !body.client?.email?.includes('@') ||
      !validDoc ||
      (docType === 'CNPJ' && !body.client?.confirmedLegalPowers)
    ) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Dados de identificação do cliente inválidos ou incompletos.' }));
      return;
    }

    const domainOption = body.selections?.domainOption;
    const rawDomainName = (body.selections?.domainName || '').trim().toLowerCase();
    const domainName = rawDomainName || 'a_definir_na_implantacao';
    const maintenanceOption = body.selections?.maintenanceOption;
    const paymentMethod = body.selections?.paymentMethod;

    if (
      (domainOption !== 'existing' && domainOption !== 'register_own') ||
      (rawDomainName !== '' && !rawDomainName.includes('.')) ||
      (maintenanceOption !== 'none' && maintenanceOption !== 'monthly_49_90') ||
      (paymentMethod !== 'pix' && paymentMethod !== 'card')
    ) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Selecione explicitamente o domínio, a opção de manutenção e a forma de pagamento.',
        }),
      );
      return;
    }

    const maintenanceAccepted = maintenanceOption === 'monthly_49_90';
    if (
      !body.consents?.acceptedContractDraft ||
      !body.consents?.acceptedPrivacyNotice ||
      (maintenanceAccepted && !body.consents?.acceptedMaintenanceSpecific)
    ) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'O aceite explícito dos termos (e da manutenção opcional, se selecionada) é obrigatório.',
        }),
      );
      return;
    }

    const persistence = getPersistenceAdapter();
    if (!persistence && !proposal.isDemoPreview) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error:
            'Persistência durável não configurada no servidor. Contratação real bloqueada até ativar o banco de dados.',
        }),
      );
      return;
    }

    const selectedInstallments =
      paymentMethod === 'pix'
        ? 1
        : Math.max(1, Math.min(body.selections?.selectedInstallments || 1, proposal.cardMaxInstallments));

    const serverCalculatedAmountCents =
      paymentMethod === 'pix'
        ? computeServerPixPriceCents(proposal)
        : computeServerCardTotalCents(proposal, selectedInstallments);

    const acceptanceId = `acc_${randomUUID()}`;
    const acceptedAt = new Date().toISOString();
    const clientDocumentMasked = maskDocument(docNormalized, docType);
    const clientDocumentHash = hashSensitiveDocument(docNormalized);
    const contractTextSnapshot = buildCanonicalContractTextSnapshot();
    const contractTextSha256 = sha256Hex(contractTextSnapshot);

    const canonicalPayload = JSON.stringify({
      acceptanceId,
      proposalId: proposal.id,
      contractVersion: proposal.contractVersion,
      contractTextSha256,
      acceptedAt,
      domainOption,
      domainName,
      maintenanceOption,
      maintenanceAccepted,
      paymentMethod,
      selectedInstallments,
      serverCalculatedAmountCents,
      clientDocumentMasked,
    });

    const integritySignature = signAcceptancePayload(canonicalPayload);
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
    const userAgent = (req.headers['user-agent'] as string | undefined) || null;

    if (persistence) {
      await persistence.upsertContractVersion({
        version: proposal.contractVersion,
        status: 'draft',
        title: CONTRACT_DRAFT_METADATA.title,
        full_text_snapshot: contractTextSnapshot,
        sha256_hash: contractTextSha256,
      });

      await persistence.upsertProposal({
        id: proposal.id,
        access_token_hash: proposal.accessTokenHash || sha256Hex('demo-proposal'),
        client_display_name: proposal.clientDisplayName,
        business_segment: proposal.businessSegment,
        demo_reference_url: proposal.demoReferenceUrl || null,
        valid_until: proposal.validUntil,
        base_price_cents: proposal.basePriceCents,
        pix_discount_percent: proposal.pixDiscountPercent,
        card_max_installments: proposal.cardMaxInstallments,
        card_monthly_interest_percent: proposal.cardMonthlyInterestPercent,
        included_items_json: proposal.includedItems,
        contract_version: proposal.contractVersion,
        is_demo: Boolean(proposal.isDemoPreview),
      });

      await persistence.insertAcceptance({
        acceptance_id: acceptanceId,
        proposal_id: proposal.id,
        contract_version: proposal.contractVersion,
        contract_text_sha256: contractTextSha256,
        accepted_at: acceptedAt,
        client_legal_name: body.client.legalName.trim(),
        client_document_type: docType,
        client_document_hash: clientDocumentHash,
        client_document_masked: clientDocumentMasked,
        client_responsible_name: body.client.responsibleName.trim(),
        client_email: body.client.email.trim().toLowerCase(),
        client_whatsapp: (body.client.whatsapp || '').trim(),
        domain_option: domainOption,
        domain_name: domainName,
        maintenance_option: maintenanceOption,
        maintenance_accepted: maintenanceAccepted,
        payment_method: paymentMethod,
        selected_installments: selectedInstallments,
        server_calculated_amount_cents: serverCalculatedAmountCents,
        integrity_signature: integritySignature,
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        acceptanceId,
        proposalId: proposal.id,
        contractVersion: proposal.contractVersion,
        contractTextSha256,
        acceptedAt,
        domainOption,
        domainName,
        maintenanceOption,
        maintenanceAccepted,
        paymentMethod,
        selectedInstallments,
        serverCalculatedAmountCents,
        clientDocumentMasked,
        integritySignature,
        storageMode: persistence ? 'durable_postgres' : 'demo_ephemeral',
      }),
    );
  } catch (err) {
    console.error('Erro ao registrar aceite:', err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Requisição inválida ao registrar aceite.' }));
  }
}

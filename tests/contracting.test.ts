import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  computeServerCardTotalCents,
  computeServerPixPriceCents,
  findServerProposalAuthorized,
} from '../api/_lib/proposalsStore.js';
import { sha256Hex, signAcceptancePayload, verifyMercadoPagoWebhookSignature } from '../api/_lib/crypto.js';
import {
  __setPersistenceAdapterForTests,
  buildSupabaseHeaders,
  type PersistedAcceptanceRecord,
  type PersistedDeliveryRecord,
  type PersistedLifecycleStateRecord,
  type PersistedOrderRecord,
  type PersistedPaymentEventRecord,
} from '../api/_lib/persistence.js';
import acceptHandler from '../api/proposals/accept.js';
import confirmDeliveryHandler, { addMonthsClampedUtc } from '../api/proposals/confirm-delivery.js';
import createOrderHandler from '../api/mercadopago/create-order.js';
import cnpjLookupHandler, {
  __resetCnpjRateLimitForTests,
  __setCnpjLookupFetchForTests,
  isValidCnpjDigits,
} from '../api/proposals/cnpj-lookup.js';
import webhookHandler, { evaluatePaymentSettlementState } from '../api/mercadopago/webhook.js';
import {
  buildOrderExternalReference,
  MP_EXTERNAL_REFERENCE_REGEX,
  parseOrderExternalReference,
} from '../api/_lib/orderReference.js';

function createMockReq(options: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}): IncomingMessage {
  const payload = options.body !== undefined ? [Buffer.from(JSON.stringify(options.body), 'utf8')] : [];
  const stream = Readable.from(payload) as unknown as IncomingMessage;
  stream.method = options.method;
  stream.url = options.url;
  stream.headers = options.headers || {};
  stream.socket = { remoteAddress: '127.0.0.1' } as IncomingMessage['socket'];
  return stream;
}

function createMockRes(): {
  res: ServerResponse;
  getStatus: () => number;
  getJson: () => Record<string, unknown>;
} {
  let statusCode = 200;
  let rawBody = '';
  const headers: Record<string, string> = {};
  const res = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(code: number) {
      statusCode = code;
    },
    setHeader(key: string, val: string) {
      headers[key.toLowerCase()] = val;
      return this;
    },
    end(chunk?: string | Buffer) {
      if (chunk) rawBody += chunk.toString();
      return this;
    },
  } as unknown as ServerResponse;
  return {
    res,
    getStatus: () => statusCode,
    getJson: () => JSON.parse(rawBody || '{}') as Record<string, unknown>,
  };
}

test('Cálculo de preço no servidor aplica 20% no Pix e calcula até 10x no cartão', () => {
  const lookup = findServerProposalAuthorized('VL-DEMO-001');
  assert.equal(lookup.ok, true);
  if (!lookup.ok) return;

  assert.equal(computeServerPixPriceCents(lookup.proposal), 199200);
  assert.equal(computeServerCardTotalCents(lookup.proposal, 1), 249000);
  const total10x = computeServerCardTotalCents(lookup.proposal, 10);
  assert.ok(total10x > 249000);
});

test('Separação demo vs produção bloqueia VL-DEMO-001 quando ALLOW_DEMO_PROPOSAL=false e exige token para proposta real', () => {
  const prevAllow = process.env.ALLOW_DEMO_PROPOSAL;
  const prevProposals = process.env.PROPOSALS_JSON;
  try {
    process.env.ALLOW_DEMO_PROPOSAL = 'false';
    const demoBlocked = findServerProposalAuthorized('VL-DEMO-001');
    assert.equal(demoBlocked.ok, false);
    if (!demoBlocked.ok) {
      assert.equal(demoBlocked.status, 403);
    }

    const realToken = 'segredo-unico-cliente-01';
    process.env.PROPOSALS_JSON = JSON.stringify([
      {
        id: 'VL-2026-099',
        accessTokenHash: sha256Hex(realToken),
        clientDisplayName: 'Cliente Real Teste',
        businessSegment: 'Serviços',
        validUntil: '2026-12-31',
        basePriceCents: 300000,
        pixDiscountPercent: 20,
        cardMaxInstallments: 10,
        cardMonthlyInterestPercent: 1.99,
        includedItems: ['Site'],
        contractVersion: 'v1.3-minuta-2026-11',
        isDemoPreview: false,
      },
    ]);

    const withoutToken = findServerProposalAuthorized('VL-2026-099');
    assert.equal(withoutToken.ok, false);
    if (!withoutToken.ok) assert.equal(withoutToken.status, 401);

    const withToken = findServerProposalAuthorized('VL-2026-099', realToken);
    assert.equal(withToken.ok, true);
  } finally {
    process.env.ALLOW_DEMO_PROPOSAL = prevAllow;
    process.env.PROPOSALS_JSON = prevProposals;
  }
});

test('Aceite real falha fechado (503) sem banco configurado e persiste quando adaptador durável está ativo', async () => {
  const prevProposals = process.env.PROPOSALS_JSON;
  const realToken = 'token-persistencia-01';
  process.env.PROPOSALS_JSON = JSON.stringify([
    {
      id: 'VL-2026-100',
      accessTokenHash: sha256Hex(realToken),
      clientDisplayName: 'Cliente Persistência',
      businessSegment: 'Comércio',
      validUntil: '2026-12-31',
      basePriceCents: 200000,
      pixDiscountPercent: 20,
      cardMaxInstallments: 10,
      cardMonthlyInterestPercent: 1.99,
      includedItems: ['Site'],
      contractVersion: 'v1.3-minuta-2026-11',
      isDemoPreview: false,
    },
  ]);

  const validBody = {
    proposalId: 'VL-2026-100',
    accessToken: realToken,
    contractVersion: 'v1.3-minuta-2026-11',
    client: {
      legalName: 'Cliente Persistência Ltda',
      documentType: 'CNPJ',
      documentNumber: '11.222.333/0001-81',
      responsibleName: 'João Silva',
      confirmedLegalPowers: true,
      email: 'joao@empresa.com.br',
      whatsapp: '(61) 99999-0000',
    },
    selections: {
      domainOption: 'register_own',
      domainName: '',
      maintenanceOption: 'monthly_49_90',
      paymentMethod: 'card',
      selectedInstallments: 10,
    },
    consents: {
      acceptedContractDraft: true,
      acceptedMaintenanceSpecific: true,
      acceptedPrivacyNotice: true,
    },
  };

  try {
    __setPersistenceAdapterForTests(null);
    const reqNoDb = createMockReq({ method: 'POST', url: '/api/proposals/accept', body: validBody });
    const mockResNoDb = createMockRes();
    await acceptHandler(reqNoDb, mockResNoDb.res);
    assert.equal(mockResNoDb.getStatus(), 503);

    const savedAcceptances: PersistedAcceptanceRecord[] = [];
    __setPersistenceAdapterForTests({
      async upsertContractVersion() {},
      async upsertProposal() {},
      async insertAcceptance(record) {
        savedAcceptances.push(record);
      },
      async findAcceptanceById(id) {
        return savedAcceptances.find((a) => a.acceptance_id === id) ?? null;
      },
      async insertOrder() {},
      async findOrderById() {
        return null;
      },
      async insertPaymentEventIdempotent() {
        return { deduplicated: false };
      },
      async consumeCnpjLookupQuota() {
        return { allowed: true, retryAfterSeconds: 0 };
      },
      async confirmDeliveryAtomic(record) {
        return {
          already_delivered: false,
          delivery_id: record.delivery_id,
          delivered_at: record.delivered_at,
          confirmed_by: record.confirmed_by,
          notice_30d_due_at: record.notice_30d_due_at,
          month_12_ends_at: record.month_12_ends_at,
          grace_15d_ends_at: record.grace_15d_ends_at,
        };
      },
    });

    const reqWithDb = createMockReq({ method: 'POST', url: '/api/proposals/accept', body: validBody });
    const mockResWithDb = createMockRes();
    await acceptHandler(reqWithDb, mockResWithDb.res);
    assert.equal(mockResWithDb.getStatus(), 201);
    const json = mockResWithDb.getJson();
    assert.equal(json.storageMode, 'durable_postgres');
    assert.equal(savedAcceptances.length, 1);
    assert.equal(savedAcceptances[0].maintenance_accepted, true);
    assert.ok(savedAcceptances[0].contract_text_sha256);
  } finally {
    __setPersistenceAdapterForTests(null);
    process.env.PROPOSALS_JSON = prevProposals;
  }
});

test('Compra confirmada no cartão habilita transferência sem depender de faturas futuras; chargeback gera alerta', () => {
  const cardApproved = evaluatePaymentSettlementState({
    id: 1,
    status: 'approved',
    status_detail: 'accredited',
    payment_method_id: 'master',
    installments: 10,
  });
  assert.equal(cardApproved.allInstallmentsSettled, false);
  assert.equal(cardApproved.transferEligible, true);
  assert.equal(cardApproved.operationalAlert, false);

  const pixApproved = evaluatePaymentSettlementState({
    id: 2,
    status: 'approved',
    status_detail: 'accredited',
    payment_method_id: 'pix',
    installments: 1,
  });
  assert.equal(pixApproved.allInstallmentsSettled, true);
  assert.equal(pixApproved.transferEligible, true);

  const chargedBack = evaluatePaymentSettlementState({
    id: 3,
    status: 'charged_back',
    status_detail: 'settled',
    payment_method_id: 'master',
    installments: 10,
  });
  assert.equal(chargedBack.transferEligible, false);
  assert.equal(chargedBack.operationalAlert, true);
});

test('Webhook Mercado Pago valida HMAC x-signature e garante idempotência', async () => {
  const secret = 'mp-webhook-test-secret';
  const prevSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const prevToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  process.env.MERCADOPAGO_WEBHOOK_SECRET = secret;
  delete process.env.MERCADOPAGO_ACCESS_TOKEN;

  const seenKeys = new Set<string>();
  const savedEvents: PersistedPaymentEventRecord[] = [];
  __setPersistenceAdapterForTests({
    async upsertContractVersion() {},
    async upsertProposal() {},
    async insertAcceptance() {},
    async findAcceptanceById() {
      return null;
    },
    async insertOrder() {},
    async findOrderById() {
      return null;
    },
    async insertPaymentEventIdempotent(record) {
      if (seenKeys.has(record.idempotency_key)) {
        return { deduplicated: true };
      }
      seenKeys.add(record.idempotency_key);
      savedEvents.push(record);
      return { deduplicated: false };
    },
    async consumeCnpjLookupQuota() {
      return { allowed: true, retryAfterSeconds: 0 };
    },
    async confirmDeliveryAtomic(record) {
      return {
        already_delivered: false,
        delivery_id: record.delivery_id,
        delivered_at: record.delivered_at,
        confirmed_by: record.confirmed_by,
        notice_30d_due_at: record.notice_30d_due_at,
        month_12_ends_at: record.month_12_ends_at,
        grace_15d_ends_at: record.grace_15d_ends_at,
      };
    },
  });

  try {
    const dataId = '999888777';
    const requestId = 'req-abc-123';
    const ts = '1704908010';
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const v1 = createHmac('sha256', secret).update(manifest).digest('hex');

    assert.equal(
      verifyMercadoPagoWebhookSignature({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
        secret,
      }),
      true,
    );

    // Orders usam IDs maiúsculos: o HMAC deve preservar cada caractere do data.id.
    const orderDataId = 'ORDTST01M7TJZYGG0CNBZFAZVWWB30KB';
    const orderManifest = `id:${orderDataId};request-id:${requestId};ts:${ts};`;
    const orderSignature = createHmac('sha256', secret).update(orderManifest).digest('hex');
    assert.equal(
      verifyMercadoPagoWebhookSignature({
        xSignature: `ts=${ts},v1=${orderSignature}`,
        xRequestId: requestId,
        dataId: orderDataId,
        queryDataId: orderDataId,
        bodyDataId: orderDataId,
        secret,
      }),
      true,
    );
    assert.equal(
      verifyMercadoPagoWebhookSignature({
        xSignature: `ts=${ts},v1=${orderSignature}`,
        xRequestId: requestId,
        dataId: orderDataId.toLowerCase(),
        queryDataId: orderDataId.toLowerCase(),
        secret,
      }),
      false,
    );

    const req1 = createMockReq({
      method: 'POST',
      url: `/api/mercadopago/webhook?type=payment&data.id=${dataId}`,
      headers: {
        'x-signature': `ts=${ts},v1=${v1}`,
        'x-request-id': requestId,
      },
      body: { type: 'payment', action: 'payment.updated', data: { id: dataId } },
    });
    const res1 = createMockRes();
    await webhookHandler(req1, res1.res);
    assert.equal(res1.getStatus(), 200);
    assert.equal(res1.getJson().deduplicated, false);

    // Reenvio duplicado deve ser deduplicado
    const req2 = createMockReq({
      method: 'POST',
      url: `/api/mercadopago/webhook?type=payment&data.id=${dataId}`,
      headers: {
        'x-signature': `ts=${ts},v1=${v1}`,
        'x-request-id': requestId,
      },
      body: { type: 'payment', action: 'payment.updated', data: { id: dataId } },
    });
    const res2 = createMockRes();
    await webhookHandler(req2, res2.res);
    assert.equal(res2.getStatus(), 200);
    assert.equal(res2.getJson().deduplicated, true);
    assert.equal(savedEvents.length, 1);

    // Simulação sem ?data.id= na query string (manifest oficial omite id quando ausente na URL)
    const noQueryManifest = `request-id:${requestId};ts:${ts};`;
    const v1NoQuery = createHmac('sha256', secret).update(noQueryManifest).digest('hex');
    process.env.MERCADOPAGO_WEBHOOK_SECRET = `  ${secret}\n`;
    const reqNoQuery = createMockReq({
      method: 'POST',
      url: '/api/mercadopago/webhook',
      headers: {
        'x-signature': `ts=${ts},v1=${v1NoQuery}`,
        'x-request-id': requestId,
      },
      body: { type: 'payment', action: 'payment.updated', data: { id: '99999' } },
    });
    const resNoQuery = createMockRes();
    await webhookHandler(reqNoQuery, resNoQuery.res);
    assert.equal(resNoQuery.getStatus(), 200);

    // Assinatura com segredo errado deve continuar retornando 401
    const reqBadSig = createMockReq({
      method: 'POST',
      url: `/api/mercadopago/webhook?type=payment&data.id=${dataId}`,
      headers: {
        'x-signature': `ts=${ts},v1=${'0'.repeat(64)}`,
        'x-request-id': requestId,
      },
      body: { type: 'payment', action: 'payment.updated', data: { id: dataId } },
    });
    const resBadSig = createMockRes();
    await webhookHandler(reqBadSig, resBadSig.res);
    assert.equal(resBadSig.getStatus(), 401);
  } finally {
    __setPersistenceAdapterForTests(null);
    process.env.MERCADOPAGO_WEBHOOK_SECRET = prevSecret;
    if (prevToken) process.env.MERCADOPAGO_ACCESS_TOKEN = prevToken;
  }
});

test('Consulta de CNPJ: encontrado (minimizado), inválido, 404, 429, falha e ausência de chave', async () => {
  const prevKey = process.env.APIPJ_API_KEY;
  __resetCnpjRateLimitForTests();

  try {
    // 1. Ausência de chave -> 503 com fallbackManual
    delete process.env.APIPJ_API_KEY;
    const reqNoKey = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '11.222.333/0001-81' },
    });
    const resNoKey = createMockRes();
    await cnpjLookupHandler(reqNoKey, resNoKey.res);
    assert.equal(resNoKey.getStatus(), 503);
    assert.equal(resNoKey.getJson().fallbackManual, true);

    // 2. CNPJ inválido -> 400 sem chamar upstream
    process.env.APIPJ_API_KEY = 'apipj_test_key';
    const reqInvalid = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '11.111.111/1111-11' },
    });
    const resInvalid = createMockRes();
    await cnpjLookupHandler(reqInvalid, resInvalid.res);
    assert.equal(resInvalid.getStatus(), 400);
    assert.equal(resInvalid.getJson().fallbackManual, true);

    // 3. CNPJ encontrado -> retorna somente campos permitidos (ignora email/telefone/qsa/cpf)
    __setCnpjLookupFetchForTests(async () =>
      new Response(
        JSON.stringify({
          razao_social: 'PADARIA MODELO LTDA',
          nome_fantasia: 'PADARIA MODELO',
          situacao_cadastral: { descricao: 'ATIVA', data: '2020-01-10' },
          endereco: {
            logradouro: 'RUA DAS FLORES',
            numero: '123',
            bairro: 'CENTRO',
            municipio: 'Brasilia',
            uf: 'DF',
            cep: '70000000',
          },
          email: 'vazamento@nao-usar.com',
          telefone: '61999999999',
          qsa: [{ nome: 'Socio Secreto', cpf: '12345678900' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const reqOk = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '11.222.333/0001-81' },
    });
    const resOk = createMockRes();
    await cnpjLookupHandler(reqOk, resOk.res);
    assert.equal(resOk.getStatus(), 200);
    const okJson = resOk.getJson();
    assert.equal(okJson.razaoSocial, 'PADARIA MODELO LTDA');
    assert.equal(okJson.nomeFantasia, 'PADARIA MODELO');
    assert.equal(okJson.situacaoCadastral, 'ATIVA (desde 2020-01-10)');
    assert.ok(String(okJson.endereco).includes('RUA DAS FLORES, 123'));
    assert.equal('email' in okJson, false);
    assert.equal('telefone' in okJson, false);
    assert.equal('qsa' in okJson, false);

    // 4. CNPJ não encontrado -> 404 com fallbackManual
    __setCnpjLookupFetchForTests(async () => new Response('{}', { status: 404 }));
    const req404 = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '11.222.333/0001-81' },
    });
    const res404 = createMockRes();
    await cnpjLookupHandler(req404, res404.res);
    assert.equal(res404.getStatus(), 404);
    assert.equal(res404.getJson().fallbackManual, true);

    // 5. Upstream 429 respeitando Retry-After
    __setCnpjLookupFetchForTests(
      async () => new Response('{}', { status: 429, headers: { 'Retry-After': '45' } }),
    );
    const req429 = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '11.222.333/0001-81' },
    });
    const res429 = createMockRes();
    await cnpjLookupHandler(req429, res429.res);
    assert.equal(res429.getStatus(), 429);
    assert.equal(res429.getJson().retryAfterSeconds, 45);

    // 6. Falha de rede / upstream 500 -> 502 com fallbackManual
    __setCnpjLookupFetchForTests(async () => new Response('err', { status: 500 }));
    const req502 = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '11.222.333/0001-81' },
    });
    const res502 = createMockRes();
    await cnpjLookupHandler(req502, res502.res);
    assert.equal(res502.getStatus(), 502);
    assert.equal(res502.getJson().fallbackManual, true);
  } finally {
    __setCnpjLookupFetchForTests(null);
    __resetCnpjRateLimitForTests();
    if (prevKey !== undefined) {
      process.env.APIPJ_API_KEY = prevKey;
    } else {
      delete process.env.APIPJ_API_KEY;
    }
  }
});

function buildValidAlphanumericCnpj(base12: string): string {
  const calc = (s: string, w: number[]) => {
    const sum = s.split('').reduce((acc, ch, i) => acc + (ch.charCodeAt(0) - 48) * w[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const d1 = calc(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(`${base12}${d1}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return `${base12}${d1}${d2}`;
}

test('CNPJ alfanumérico: validação módulo 11 e consulta normalizada', async () => {
  const validAlpha = buildValidAlphanumericCnpj('12ABC3450001');
  const invalidAlpha = `${validAlpha.slice(0, 13)}${(Number(validAlpha[13]) + 1) % 10}`;
  assert.equal(isValidCnpjDigits(validAlpha), true);
  assert.equal(isValidCnpjDigits(invalidAlpha), false);

  const prevKey = process.env.APIPJ_API_KEY;
  process.env.APIPJ_API_KEY = 'apipj_test_key';
  __resetCnpjRateLimitForTests();

  let calledUrl = '';
  __setCnpjLookupFetchForTests(async (input) => {
    calledUrl = String(input);
    return new Response(
      JSON.stringify({
        razao_social: 'EMPRESA ALFANUMERICA LTDA',
        nome_fantasia: 'ALFA TECH',
        situacao_cadastral: { descricao: 'ATIVA' },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  });

  try {
    const maskedAlpha = `${validAlpha.slice(0, 2)}.${validAlpha.slice(2, 5)}.${validAlpha.slice(5, 8)}/${validAlpha.slice(8, 12)}-${validAlpha.slice(12)}`;
    const req = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: maskedAlpha.toLowerCase() },
    });
    const res = createMockRes();
    await cnpjLookupHandler(req, res.res);
    assert.equal(res.getStatus(), 200);
    assert.equal(calledUrl, `https://apipj.com.br/v1/cnpj/${validAlpha}`);
    assert.equal(res.getJson().razaoSocial, 'EMPRESA ALFANUMERICA LTDA');
  } finally {
    __setCnpjLookupFetchForTests(null);
    __resetCnpjRateLimitForTests();
    if (prevKey !== undefined) {
      process.env.APIPJ_API_KEY = prevKey;
    } else {
      delete process.env.APIPJ_API_KEY;
    }
  }
});

test('Rate limit persistente de CNPJ bloqueia chamadas repetidas e simultâneas (5/10min)', async () => {
  const prevKey = process.env.APIPJ_API_KEY;
  process.env.APIPJ_API_KEY = 'apipj_test_key';

  const sharedCounts = new Map<string, number>();
  __setPersistenceAdapterForTests({
    async upsertContractVersion() {},
    async upsertProposal() {},
    async insertAcceptance() {},
    async findAcceptanceById() {
      return null;
    },
    async insertOrder() {},
    async findOrderById() {
      return null;
    },
    async insertPaymentEventIdempotent() {
      return { deduplicated: false };
    },
    async consumeCnpjLookupQuota(proposalId, maxRequests) {
      const current = sharedCounts.get(proposalId) || 0;
      if (current >= maxRequests) {
        return { allowed: false, retryAfterSeconds: 600 };
      }
      sharedCounts.set(proposalId, current + 1);
      return { allowed: true, retryAfterSeconds: 0 };
    },
    async confirmDeliveryAtomic(record) {
      return {
        already_delivered: false,
        delivery_id: record.delivery_id,
        delivered_at: record.delivered_at,
        confirmed_by: record.confirmed_by,
        notice_30d_due_at: record.notice_30d_due_at,
        month_12_ends_at: record.month_12_ends_at,
        grace_15d_ends_at: record.grace_15d_ends_at,
      };
    },
  });

  __setCnpjLookupFetchForTests(async () =>
    new Response(JSON.stringify({ razao_social: 'EMPRESA RATE LIMIT LTDA' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  try {
    // 8 chamadas simultâneas -> exatamente 5 devem passar (200) e 3 devem receber 429
    const responses = await Promise.all(
      Array.from({ length: 8 }, async () => {
        const req = createMockReq({
          method: 'POST',
          url: '/api/proposals/cnpj-lookup',
          body: { proposalId: 'VL-DEMO-001', cnpj: '11.222.333/0001-81' },
        });
        const mockRes = createMockRes();
        await cnpjLookupHandler(req, mockRes.res);
        return mockRes.getStatus();
      }),
    );

    const okCount = responses.filter((s) => s === 200).length;
    const limitedCount = responses.filter((s) => s === 429).length;
    assert.equal(okCount, 5);
    assert.equal(limitedCount, 3);
  } finally {
    __setPersistenceAdapterForTests(null);
    __setCnpjLookupFetchForTests(null);
    if (prevKey !== undefined) {
      process.env.APIPJ_API_KEY = prevKey;
    } else {
      delete process.env.APIPJ_API_KEY;
    }
  }
});

test('CNPJ lookup: fallback de rate limit na demo VL-DEMO-001 e erro de rede no upstream', async () => {
  const prevKey = process.env.APIPJ_API_KEY;
  process.env.APIPJ_API_KEY = 'fake-apipj-key';
  __resetCnpjRateLimitForTests();

  __setPersistenceAdapterForTests({
    async upsertContractVersion() {},
    async upsertProposal() {},
    async insertAcceptance() {},
    async findAcceptanceById() {
      return null;
    },
    async insertOrder() {},
    async findOrderById() {
      return null;
    },
    async insertPaymentEventIdempotent() {
      return { deduplicated: false };
    },
    async consumeCnpjLookupQuota() {
      throw new Error('Falha ao verificar cota de consulta CNPJ: 500');
    },
    async confirmDeliveryAtomic() {
      throw new Error('not used');
    },
  });

  try {
    // 1. Falha no RPC de cota em VL-DEMO-001 -> fallback para memória e 200 OK
    __setCnpjLookupFetchForTests(async () =>
      new Response(
        JSON.stringify({
          razao_social: 'BANCO DO BRASIL SA',
          nome_fantasia: 'DIRECAO GERAL',
          situacao_cadastral: { descricao: 'ATIVA', data: '2005-11-03' },
          endereco: { municipio: 'BRASILIA', uf: 'DF' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const reqDemo = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '00.000.000/0001-91' },
    });
    const resDemo = createMockRes();
    await cnpjLookupHandler(reqDemo, resDemo.res);
    assert.equal(resDemo.getStatus(), 200);
    assert.equal(resDemo.getJson<{ razaoSocial: string }>().razaoSocial, 'BANCO DO BRASIL SA');

    // 2. Falha de rede/timeout no upstream -> 502 UPSTREAM_UNAVAILABLE com fallbackManual
    __setCnpjLookupFetchForTests(async () => {
      throw new Error('network timeout');
    });
    const reqTimeout = createMockReq({
      method: 'POST',
      url: '/api/proposals/cnpj-lookup',
      body: { proposalId: 'VL-DEMO-001', cnpj: '00.000.000/0001-91' },
    });
    const resTimeout = createMockRes();
    await cnpjLookupHandler(reqTimeout, resTimeout.res);
    assert.equal(resTimeout.getStatus(), 502);
    assert.equal(resTimeout.getJson<{ code: string; fallbackManual: boolean }>().code, 'UPSTREAM_UNAVAILABLE');
    assert.equal(resTimeout.getJson<{ fallbackManual: boolean }>().fallbackManual, true);
  } finally {
    __setPersistenceAdapterForTests(null);
    __setCnpjLookupFetchForTests(null);
    __resetCnpjRateLimitForTests();
    if (prevKey !== undefined) {
      process.env.APIPJ_API_KEY = prevKey;
    } else {
      delete process.env.APIPJ_API_KEY;
    }
  }
});

test('Confirmação de entrega: exige segredo interno, bloqueia data do cliente e inicializa marco de 12 meses', async () => {
  const prevSecret = process.env.DELIVERY_ADMIN_SECRET;
  process.env.DELIVERY_ADMIN_SECRET = 'internal-delivery-secret';

  const deliveries: PersistedDeliveryRecord[] = [];
  const lifecycles: PersistedLifecycleStateRecord[] = [];

  try {
    // 1. Sem autorização -> 401
    const reqUnauth = createMockReq({
      method: 'POST',
      url: '/api/proposals/confirm-delivery',
      body: { proposalId: 'VL-2026-100', acceptanceId: 'acc_1', confirmedBy: 'Operador VL' },
    });
    const resUnauth = createMockRes();
    await confirmDeliveryHandler(reqUnauth, resUnauth.res);
    assert.equal(resUnauth.getStatus(), 401);

    // 2. Tentativa de definir deliveredAt pelo cliente -> 400
    const reqClientDate = createMockReq({
      method: 'POST',
      url: '/api/proposals/confirm-delivery',
      headers: { authorization: 'Bearer internal-delivery-secret' },
      body: {
        proposalId: 'VL-2026-100',
        acceptanceId: 'acc_1',
        confirmedBy: 'Operador VL',
        deliveredAt: '2020-01-01T00:00:00.000Z',
      },
    });
    const resClientDate = createMockRes();
    await confirmDeliveryHandler(reqClientDate, resClientDate.res);
    assert.equal(resClientDate.getStatus(), 400);

    // 3. Sem banco durável -> 503
    __setPersistenceAdapterForTests(null);
    const reqNoDb = createMockReq({
      method: 'POST',
      url: '/api/proposals/confirm-delivery',
      headers: { authorization: 'Bearer internal-delivery-secret' },
      body: { proposalId: 'VL-2026-100', acceptanceId: 'acc_1', confirmedBy: 'Operador VL' },
    });
    const resNoDb = createMockRes();
    await confirmDeliveryHandler(reqNoDb, resNoDb.res);
    assert.equal(resNoDb.getStatus(), 503);

    // 4. Persistência durável ativa -> 201 e inicialização atômica de lifecycle
    __setPersistenceAdapterForTests({
      async upsertContractVersion() {},
      async upsertProposal() {},
      async insertAcceptance() {},
      async findAcceptanceById(id) {
        if (id !== 'acc_1') return null;
        return {
          acceptance_id: 'acc_1',
          proposal_id: 'VL-2026-100',
          contract_version: 'v1.3-minuta-2026-11',
          contract_text_sha256: 'hash',
          accepted_at: '2026-11-18T12:00:00.000Z',
          client_legal_name: 'Empresa Teste',
          client_document_type: 'CNPJ',
          client_document_hash: 'dochash',
          client_document_masked: '**.222.333/0001-**',
          client_responsible_name: 'Responsável',
          client_email: 'contato@empresa.com.br',
          client_whatsapp: '61999999999',
          domain_option: 'register_own',
          domain_name: 'empresa.com.br',
          maintenance_option: 'monthly_49_90',
          maintenance_accepted: true,
          payment_method: 'pix',
          selected_installments: 1,
          server_calculated_amount_cents: 199200,
          integrity_signature: 'sig',
          ip_address: '127.0.0.1',
          user_agent: 'test',
        };
      },
      async insertOrder() {},
      async findOrderById() {
        return null;
      },
      async insertPaymentEventIdempotent() {
        return { deduplicated: false };
      },
      async consumeCnpjLookupQuota() {
        return { allowed: true, retryAfterSeconds: 0 };
      },
      async confirmDeliveryAtomic(record) {
        const existing = deliveries.find((d) => d.proposal_id === record.proposal_id);
        if (existing) {
          return {
            already_delivered: true,
            delivery_id: existing.delivery_id,
            delivered_at: existing.delivered_at,
            confirmed_by: existing.confirmed_by,
            notice_30d_due_at: existing.notice_30d_due_at,
            month_12_ends_at: existing.month_12_ends_at,
            grace_15d_ends_at: existing.grace_15d_ends_at,
          };
        }
        deliveries.push(record);
        lifecycles.push({
          proposal_id: record.proposal_id,
          delivery_id: record.delivery_id,
          initial_acceptance_id: record.acceptance_id,
          delivered_at: record.delivered_at,
          notice_30d_due_at: record.notice_30d_due_at,
          month_12_ends_at: record.month_12_ends_at,
          grace_period_ends_at: record.grace_15d_ends_at,
          files_preserved: true,
          lifecycle_status: 'active_first_12m',
        });
        return {
          already_delivered: false,
          delivery_id: record.delivery_id,
          delivered_at: record.delivered_at,
          confirmed_by: record.confirmed_by,
          notice_30d_due_at: record.notice_30d_due_at,
          month_12_ends_at: record.month_12_ends_at,
          grace_15d_ends_at: record.grace_15d_ends_at,
        };
      },
    });

    const reqOk = createMockReq({
      method: 'POST',
      url: '/api/proposals/confirm-delivery',
      headers: { authorization: 'Bearer internal-delivery-secret' },
      body: {
        proposalId: 'VL-2026-100',
        acceptanceId: 'acc_1',
        confirmedBy: 'Newton VL',
        deliveryNotes: 'Site publicado no domínio do cliente',
      },
    });
    const resOk = createMockRes();
    await confirmDeliveryHandler(reqOk, resOk.res);
    assert.equal(resOk.getStatus(), 201);
    const okJson = resOk.getJson();
    assert.equal(okJson.lifecycleStatus, 'active_first_12m');
    assert.equal(okJson.filesPreserved, true);
    assert.equal(deliveries.length, 1);
    assert.equal(lifecycles.length, 1);
    assert.ok(new Date(deliveries[0].month_12_ends_at) > new Date(deliveries[0].delivered_at));
    assert.ok(new Date(deliveries[0].notice_30d_due_at) < new Date(deliveries[0].month_12_ends_at));
    assert.ok(new Date(deliveries[0].grace_15d_ends_at) > new Date(deliveries[0].month_12_ends_at));

    // 5. Entrega duplicada para mesma proposta -> 409 e mantém consistência atômica
    const reqDup = createMockReq({
      method: 'POST',
      url: '/api/proposals/confirm-delivery',
      headers: { authorization: 'Bearer internal-delivery-secret' },
      body: { proposalId: 'VL-2026-100', acceptanceId: 'acc_1', confirmedBy: 'Newton VL' },
    });
    const resDup = createMockRes();
    await confirmDeliveryHandler(reqDup, resDup.res);
    assert.equal(resDup.getStatus(), 409);
    assert.equal(lifecycles.length, 1);

    // 6. Clamping de ano bissexto (29/02 -> 28/02 no ano seguinte)
    assert.equal(
      addMonthsClampedUtc(new Date('2024-02-29T12:00:00.000Z'), 12).toISOString(),
      '2025-02-28T12:00:00.000Z',
    );

    // 7. Identidade derivada por token individual (DELIVERY_OPERATORS_JSON)
    const opToken = 'op-secret-newton-01';
    process.env.DELIVERY_OPERATORS_JSON = JSON.stringify([
      { id: 'op_newton', name: 'Newton VL', tokenHash: sha256Hex(opToken) },
    ]);
    const reqOpToken = createMockReq({
      method: 'POST',
      url: '/api/proposals/confirm-delivery',
      headers: { authorization: `Bearer ${opToken}` },
      body: {
        proposalId: 'VL-2026-100',
        acceptanceId: 'acc_1',
        confirmedBy: 'Nome Falsificado',
      },
    });
    const resOpToken = createMockRes();
    await confirmDeliveryHandler(reqOpToken, resOpToken.res);
    assert.equal(resOpToken.getStatus(), 409); // já entregue, mas autenticou o operador pelo token
  } finally {
    delete process.env.DELIVERY_OPERATORS_JSON;
    __setPersistenceAdapterForTests(null);
    if (prevSecret !== undefined) {
      process.env.DELIVERY_ADMIN_SECRET = prevSecret;
    } else {
      delete process.env.DELIVERY_ADMIN_SECRET;
    }
  }
});

test('Supabase sb_secret_... envia apenas apikey (sem Authorization Bearer) e legado envia ambos', () => {
  const modernHeaders = buildSupabaseHeaders('sb_secret_abc123', 'return=minimal');
  assert.equal(modernHeaders.apikey, 'sb_secret_abc123');
  assert.equal(modernHeaders.Authorization, undefined);
  assert.equal(modernHeaders.Prefer, 'return=minimal');

  const legacyHeaders = buildSupabaseHeaders('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy');
  assert.equal(legacyHeaders.apikey, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy');
  assert.equal(
    legacyHeaders.Authorization,
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy',
  );
});

test('Checkout Pro via Orders API: valida MP_TEST_ACCOUNT_ID antes de POST /v1/orders e bloqueia token de outra conta ou falha', async () => {
  const prevMpEnv = process.env.MP_ENVIRONMENT;
  const prevAllowReal = process.env.ALLOW_REAL_CHARGES;
  const prevMpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const prevTestAccountId = process.env.MP_TEST_ACCOUNT_ID;
  const prevFetch = globalThis.fetch;

  const savedOrders: PersistedOrderRecord[] = [];
  __setPersistenceAdapterForTests({
    async upsertContractVersion() {},
    async upsertProposal() {},
    async insertAcceptance() {},
    async findAcceptanceById() {
      return null;
    },
    async insertOrder(record) {
      savedOrders.push(record);
    },
    async findOrderById(orderId) {
      return savedOrders.find((o) => o.order_id === orderId) ?? null;
    },
    async insertPaymentEventIdempotent() {
      return { deduplicated: false };
    },
    async consumeCnpjLookupQuota() {
      return { allowed: true, retryAfterSeconds: 0 };
    },
    async confirmDeliveryAtomic(record) {
      return {
        already_delivered: false,
        delivery_id: record.delivery_id,
        delivered_at: record.delivered_at,
        confirmed_by: record.confirmed_by,
        notice_30d_due_at: record.notice_30d_due_at,
        month_12_ends_at: record.month_12_ends_at,
        grace_15d_ends_at: record.grace_15d_ends_at,
      };
    },
  });

  const receiptBody = {
    acceptanceId: 'acc_mp_1',
    proposalId: 'VL-DEMO-001',
    contractVersion: 'v1.3-minuta-2026-11',
    contractTextSha256: 'hash_mp',
    acceptedAt: '2026-11-18T12:00:00.000Z',
    domainOption: 'existing' as const,
    domainName: 'empresa.com.br',
    maintenanceOption: 'none' as const,
    maintenanceAccepted: false,
    paymentMethod: 'pix' as const,
    selectedInstallments: 1,
    serverCalculatedAmountCents: 199200,
    clientDocumentMasked: '**.222.333/0001-**',
  };
  const integritySignature = signAcceptancePayload(JSON.stringify(receiptBody));

  const callCreateOrder = async () => {
    const req = createMockReq({
      method: 'POST',
      url: '/api/mercadopago/create-order',
      body: {
        proposalId: 'VL-DEMO-001',
        payerEmail: 'cliente@empresa.com.br',
        acceptanceReceipt: { ...receiptBody, integritySignature },
      },
    });
    const res = createMockRes();
    await createOrderHandler(req, res.res);
    return res;
  };

  try {
    // 1. Produção bloqueada quando ALLOW_REAL_CHARGES !== 'true'
    process.env.MP_ENVIRONMENT = 'production';
    process.env.ALLOW_REAL_CHARGES = 'false';
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-prod-token';
    const resBlockedProd = await callCreateOrder();
    assert.equal(resBlockedProd.getStatus(), 403);

    // 2. Ausência de MP_TEST_ACCOUNT_ID em homologação -> 503 sem chamar POST /v1/orders
    process.env.MP_ENVIRONMENT = 'test';
    delete process.env.MP_TEST_ACCOUNT_ID;
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-sandbox-test-token';
    let postOrdersCalled = false;
    globalThis.fetch = (async () => {
      postOrdersCalled = true;
      return new Response('{}', { status: 201 });
    }) as typeof fetch;

    const resMissingId = await callCreateOrder();
    assert.equal(resMissingId.getStatus(), 503);
    assert.equal(postOrdersCalled, false);

    // 3. Falha na verificação /users/me -> 502 sem chamar POST /v1/orders
    process.env.MP_TEST_ACCOUNT_ID = '12345';
    globalThis.fetch = (async (input) => {
      if (String(input).endsWith('/v1/orders')) postOrdersCalled = true;
      return new Response('err', { status: 500 });
    }) as typeof fetch;

    const resVerifyFail = await callCreateOrder();
    assert.equal(resVerifyFail.getStatus(), 502);
    assert.equal(postOrdersCalled, false);

    // 4. Token de outra conta (id 99999 !== 12345) -> 403 sem chamar POST /v1/orders
    globalThis.fetch = (async (input) => {
      if (String(input).endsWith('/v1/orders')) postOrdersCalled = true;
      return new Response(JSON.stringify({ id: 99999, tags: ['normal'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    const resWrongAccount = await callCreateOrder();
    assert.equal(resWrongAccount.getStatus(), 403);
    assert.equal(postOrdersCalled, false);

    // 5. Token correto (id 12345 === MP_TEST_ACCOUNT_ID), mesmo com live_mode omitido -> 200 e cria Order
    let capturedOrderHeaders: Record<string, string> = {};
    let capturedOrderBody: Record<string, unknown> = {};

    globalThis.fetch = (async (input, init) => {
      const url = String(input);
      if (url.endsWith('/users/me')) {
        return new Response(JSON.stringify({ id: 12345, tags: ['normal'] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      capturedOrderHeaders = (init?.headers as Record<string, string>) || {};
      capturedOrderBody = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          id: 'ORD01TEST123',
          status: 'created',
          checkout_url: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=ORD01TEST123',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }) as typeof fetch;

    const resSandbox = await callCreateOrder();
    assert.equal(resSandbox.getStatus(), 200);
    const json = resSandbox.getJson();
    assert.equal(json.mode, 'sandbox_ready');
    assert.equal(json.orderId, 'ORD01TEST123');
    assert.ok(String(json.checkoutUrl).includes('ORD01TEST123'));
    assert.equal(capturedOrderBody.type, 'online');
    assert.equal(capturedOrderBody.processing_mode, 'manual');
    assert.equal(capturedOrderBody.total_amount, '1992.00');
    assert.match(String(capturedOrderBody.external_reference), MP_EXTERNAL_REFERENCE_REGEX);
    assert.equal(capturedOrderBody.external_reference, 'VL-DEMO-001__acc_mp_1');
    assert.equal(capturedOrderBody.back_urls, undefined);
    assert.equal(capturedOrderBody.auto_return, undefined);
    const onlineConfig = (capturedOrderBody.config as { online?: Record<string, string> } | undefined)?.online;
    assert.ok(onlineConfig?.success_url?.includes('mp_status=success'));
    assert.ok(onlineConfig?.pending_url?.includes('mp_status=pending'));
    assert.ok(onlineConfig?.failure_url?.includes('mp_status=failure'));
    assert.equal(onlineConfig?.auto_return, 'approved');
    assert.ok(capturedOrderHeaders['X-Idempotency-Key']);
    assert.equal(savedOrders.length, 1);
    assert.equal(savedOrders[0].order_id, 'ORD01TEST123');
    assert.equal(savedOrders[0].proposal_id, 'VL-DEMO-001');
    assert.equal(savedOrders[0].acceptance_id, 'acc_mp_1');
    assert.equal(savedOrders[0].external_reference, capturedOrderBody.external_reference);

    // 6. Erro 400 do Mercado Pago com array errors[] -> extrai code/message sem expor token
    globalThis.fetch = (async (input) => {
      if (String(input).endsWith('/users/me')) {
        return new Response(JSON.stringify({ id: 12345, tags: ['normal'] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({
          errors: [{ code: 'invalid_property', message: 'property back_urls is invalid' }],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }) as typeof fetch;
    const resMp400 = await callCreateOrder();
    assert.equal(resMp400.getStatus(), 502);
    assert.ok(String(resMp400.getJson().detail).includes('invalid_property'));
  } finally {
    __setPersistenceAdapterForTests(null);
    globalThis.fetch = prevFetch;
    if (prevMpEnv !== undefined) process.env.MP_ENVIRONMENT = prevMpEnv;
    else delete process.env.MP_ENVIRONMENT;
    if (prevAllowReal !== undefined) process.env.ALLOW_REAL_CHARGES = prevAllowReal;
    else delete process.env.ALLOW_REAL_CHARGES;
    if (prevMpToken !== undefined) process.env.MERCADOPAGO_ACCESS_TOKEN = prevMpToken;
    else delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (prevTestAccountId !== undefined) process.env.MP_TEST_ACCOUNT_ID = prevTestAccountId;
    else delete process.env.MP_TEST_ACCOUNT_ID;
  }
});

test('Webhook de evento Order: consulta GET /v1/orders/{id}, concilia valor/referência e bloqueia divergência', async () => {
  const secret = 'mp-order-webhook-secret';
  const prevSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const prevToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const prevFetch = globalThis.fetch;

  process.env.MERCADOPAGO_WEBHOOK_SECRET = secret;
  process.env.MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-sandbox-test-token';

  const seenKeys = new Set<string>();
  const savedEvents: PersistedPaymentEventRecord[] = [];
  const persistedOrders: PersistedOrderRecord[] = [
    {
      order_id: 'ORD_OK_1',
      proposal_id: 'VL-2026-100',
      acceptance_id: 'acc_100',
      external_reference: 'VL-2026-100__acc_100',
      expected_amount_cents: 199200,
      payment_method: 'pix',
      selected_installments: 1,
      environment: 'test',
      checkout_url: 'https://checkout.test/1',
      status: 'created',
      idempotency_key: 'idem_1',
    },
    {
      order_id: 'ORD_MISMATCH_2',
      proposal_id: 'VL-2026-100',
      acceptance_id: 'acc_100',
      external_reference: 'VL-2026-100__acc_100',
      expected_amount_cents: 199200,
      payment_method: 'pix',
      selected_installments: 1,
      environment: 'test',
      checkout_url: 'https://checkout.test/2',
      status: 'created',
      idempotency_key: 'idem_2',
    },
  ];

  __setPersistenceAdapterForTests({
    async upsertContractVersion() {},
    async upsertProposal() {},
    async insertAcceptance() {},
    async findAcceptanceById() {
      return null;
    },
    async insertOrder() {},
    async findOrderById(orderId) {
      return persistedOrders.find((o) => o.order_id === orderId) ?? null;
    },
    async insertPaymentEventIdempotent(record) {
      if (seenKeys.has(record.idempotency_key)) {
        return { deduplicated: true };
      }
      seenKeys.add(record.idempotency_key);
      savedEvents.push(record);
      return { deduplicated: false };
    },
    async consumeCnpjLookupQuota() {
      return { allowed: true, retryAfterSeconds: 0 };
    },
    async confirmDeliveryAtomic(record) {
      return {
        already_delivered: false,
        delivery_id: record.delivery_id,
        delivered_at: record.delivered_at,
        confirmed_by: record.confirmed_by,
        notice_30d_due_at: record.notice_30d_due_at,
        month_12_ends_at: record.month_12_ends_at,
        grace_15d_ends_at: record.grace_15d_ends_at,
      };
    },
  });

  const sign = (dataId: string, requestId: string, ts: string) =>
    createHmac('sha256', secret)
      .update(`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`)
      .digest('hex');

  try {
    // 1. Order conciliada com sucesso (status processed, valor e referência batem)
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          id: 'ORD_OK_1',
          status: 'processed',
          total_amount: '1992.00',
          external_reference: 'VL-2026-100__acc_100',
          transactions: {
            payments: [
              { id: 'PAY_1', status: 'processed', payment_method_id: 'pix', installments: 1 },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )) as typeof fetch;

    const reqOk = createMockReq({
      method: 'POST',
      url: '/api/mercadopago/webhook?type=order&data.id=ORD_OK_1',
      headers: {
        'x-signature': `ts=1704908010,v1=${sign('ORD_OK_1', 'req-1', '1704908010')}`,
        'x-request-id': 'req-1',
      },
      body: { type: 'order', action: 'order.processed', data: { id: 'ORD_OK_1' } },
    });
    const resOk = createMockRes();
    await webhookHandler(reqOk, resOk.res);
    assert.equal(resOk.getStatus(), 200);
    assert.equal(resOk.getJson().status, 'processed');
    assert.equal(resOk.getJson().transferEligible, true);
    assert.equal(resOk.getJson().deduplicated, false);

    // 1b. Reenvio duplicado da mesma Order -> deduplicado (idempotência)
    const reqOkDup = createMockReq({
      method: 'POST',
      url: '/api/mercadopago/webhook?type=order&data.id=ORD_OK_1',
      headers: {
        'x-signature': `ts=1704908010,v1=${sign('ORD_OK_1', 'req-1', '1704908010')}`,
        'x-request-id': 'req-1',
      },
      body: { type: 'order', action: 'order.processed', data: { id: 'ORD_OK_1' } },
    });
    const resOkDup = createMockRes();
    await webhookHandler(reqOkDup, resOkDup.res);
    assert.equal(resOkDup.getStatus(), 200);
    assert.equal(resOkDup.getJson().deduplicated, true);

    // 1c. Order recusada/falha (status failed) -> alerta operacional e sem transferência
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          id: 'ORD_OK_1',
          status: 'failed',
          total_amount: '1992.00',
          external_reference: 'VL-2026-100__acc_100',
          transactions: {
            payments: [{ id: 'PAY_FAIL', status: 'failed', payment_method_id: 'credit_card', installments: 10 }],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )) as typeof fetch;

    const reqFailed = createMockReq({
      method: 'POST',
      url: '/api/mercadopago/webhook?type=order&data.id=ORD_OK_1',
      headers: {
        'x-signature': `ts=1704908012,v1=${sign('ORD_OK_1', 'req-fail', '1704908012')}`,
        'x-request-id': 'req-fail',
      },
      body: { type: 'order', action: 'order.failed', data: { id: 'ORD_OK_1' } },
    });
    const resFailed = createMockRes();
    await webhookHandler(reqFailed, resFailed.res);
    assert.equal(resFailed.getStatus(), 200);
    assert.equal(resFailed.getJson().status, 'failed');
    assert.equal(resFailed.getJson().transferEligible, false);
    assert.equal(savedEvents[1].operational_alert, true);

    // 2. Divergência de valor -> bloqueia confirmação (reconciliationMismatch = true)
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          id: 'ORD_MISMATCH_2',
          status: 'processed',
          total_amount: '10.00',
          external_reference: 'VL-2026-100__acc_100',
          transactions: { payments: [{ id: 'PAY_2', status: 'processed' }] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )) as typeof fetch;

    const reqMismatch = createMockReq({
      method: 'POST',
      url: '/api/mercadopago/webhook?type=order&data.id=ORD_MISMATCH_2',
      headers: {
        'x-signature': `ts=1704908011,v1=${sign('ORD_MISMATCH_2', 'req-2', '1704908011')}`,
        'x-request-id': 'req-2',
      },
      body: { type: 'order', action: 'order.processed', data: { id: 'ORD_MISMATCH_2' } },
    });
    const resMismatch = createMockRes();
    await webhookHandler(reqMismatch, resMismatch.res);
    assert.equal(resMismatch.getStatus(), 200);
    assert.equal(resMismatch.getJson().reconciliationMismatch, true);
    assert.equal(resMismatch.getJson().transferEligible, false);
    assert.equal(savedEvents[2].operational_alert, true);
  } finally {
    __setPersistenceAdapterForTests(null);
    globalThis.fetch = prevFetch;
    process.env.MERCADOPAGO_WEBHOOK_SECRET = prevSecret;
    if (prevToken !== undefined) process.env.MERCADOPAGO_ACCESS_TOKEN = prevToken;
    else delete process.env.MERCADOPAGO_ACCESS_TOKEN;
  }
});

test('external_reference Orders API: respeita ^[a-zA-Z0-9_-]{1,64}$ e preserva conciliação com proposalId/acceptanceId', () => {
  const accUuid = 'acc_e7da6651-ce46-4266-baf7-61f0d77782c2';
  const refDemo = buildOrderExternalReference('VL-DEMO-001', accUuid);
  assert.match(refDemo, MP_EXTERNAL_REFERENCE_REGEX);
  assert.equal(refDemo, `VL-DEMO-001__${accUuid}`);
  assert.deepEqual(parseOrderExternalReference(refDemo), {
    proposalId: 'VL-DEMO-001',
    acceptanceId: accUuid,
  });

  // Proposta longa (25 chars) -> compacta hífens do UUID para caber em <= 64 chars e restaura na leitura
  const longProposal = 'VL-2026-EMPRESA-GRANDE-01';
  const refCompact = buildOrderExternalReference(longProposal, accUuid);
  assert.match(refCompact, MP_EXTERNAL_REFERENCE_REGEX);
  assert.ok(refCompact.length <= 64);
  assert.deepEqual(parseOrderExternalReference(refCompact), {
    proposalId: longProposal,
    acceptanceId: accUuid,
  });
});

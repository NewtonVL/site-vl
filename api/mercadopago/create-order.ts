import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  computeServerCardTotalCents,
  computeServerPixPriceCents,
  findServerProposalAuthorized,
} from '../_lib/proposalsStore.js';
import { verifyAcceptanceSignature } from '../_lib/crypto.js';
import { getPersistenceAdapter } from '../_lib/persistence.js';

interface CreateOrderBody {
  proposalId?: string;
  accessToken?: string;
  payerEmail?: string;
  acceptanceReceipt?: {
    acceptanceId: string;
    proposalId: string;
    contractVersion: string;
    contractTextSha256: string;
    acceptedAt: string;
    domainOption: 'existing' | 'register_own';
    domainName: string;
    maintenanceOption: 'none' | 'monthly_49_90';
    maintenanceAccepted: boolean;
    paymentMethod: 'pix' | 'card';
    selectedInstallments: number;
    serverCalculatedAmountCents: number;
    clientDocumentMasked: string;
    integritySignature: string;
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readJsonBody<CreateOrderBody>(req);
    const receipt = body.acceptanceReceipt;
    if (!receipt || !body.proposalId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Aceite prévio obrigatório antes de iniciar pagamento.' }));
      return;
    }

    const lookup = findServerProposalAuthorized(body.proposalId, body.accessToken);
    if (!('proposal' in lookup)) {
      res.statusCode = lookup.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: lookup.error }));
      return;
    }
    const proposal = lookup.proposal;

    const canonicalPayload = JSON.stringify({
      acceptanceId: receipt.acceptanceId,
      proposalId: receipt.proposalId,
      contractVersion: receipt.contractVersion,
      contractTextSha256: receipt.contractTextSha256,
      acceptedAt: receipt.acceptedAt,
      domainOption: receipt.domainOption,
      domainName: receipt.domainName,
      maintenanceOption: receipt.maintenanceOption,
      maintenanceAccepted: receipt.maintenanceAccepted,
      paymentMethod: receipt.paymentMethod,
      selectedInstallments: receipt.selectedInstallments,
      serverCalculatedAmountCents: receipt.serverCalculatedAmountCents,
      clientDocumentMasked: receipt.clientDocumentMasked,
    });

    if (!verifyAcceptanceSignature(canonicalPayload, receipt.integritySignature)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Assinatura de aceite inválida.' }));
      return;
    }

    const persistence = getPersistenceAdapter();
    if (!proposal.isDemoPreview) {
      if (!persistence) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Persistência durável obrigatória não configurada para proposta real.',
          }),
        );
        return;
      }
      const persistedAcceptance = await persistence.findAcceptanceById(receipt.acceptanceId);
      if (!persistedAcceptance || persistedAcceptance.proposal_id !== proposal.id) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Registro durável de aceite não encontrado.' }));
        return;
      }
    }

    // Valor sempre recalculado no servidor (nunca confiar em valor enviado pelo navegador)
    const serverAmountCents =
      receipt.paymentMethod === 'pix'
        ? computeServerPixPriceCents(proposal)
        : computeServerCardTotalCents(proposal, receipt.selectedInstallments);

    const totalAmountStr = (serverAmountCents / 100).toFixed(2);
    const externalReference = `${proposal.id}:${receipt.acceptanceId}`;
    const idempotencyKey = `ord_${proposal.id}_${receipt.acceptanceId}_${receipt.paymentMethod}_${receipt.selectedInstallments}`;
    const baseUrl = process.env.APP_PUBLIC_URL || 'http://localhost:5173';
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    const mpEnvironment = (process.env.MP_ENVIRONMENT || 'test').trim().toLowerCase();
    const allowRealCharges = process.env.ALLOW_REAL_CHARGES === 'true';

    if (mpEnvironment === 'production' && !allowRealCharges) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error:
            'Bloqueio de segurança ativo: cobranças reais em produção estão desabilitadas (ALLOW_REAL_CHARGES !== "true").',
        }),
      );
      return;
    }

    if (mpEnvironment !== 'test' && mpEnvironment !== 'production') {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'MP_ENVIRONMENT inválido (use "test" ou "production").' }));
      return;
    }

    // Em homologação, exige identificador esperado (MP_TEST_ACCOUNT_ID) e comprova
    // via GET /users/me ANTES de qualquer POST /v1/orders. Falha fechado se inconclusivo.
    let isTestUserAccount = false;
    let verifiedAccountId: string | null = null;
    if (mpEnvironment === 'test' && mpToken) {
      const expectedTestAccountId = process.env.MP_TEST_ACCOUNT_ID?.trim();
      if (!expectedTestAccountId) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error:
              'MP_TEST_ACCOUNT_ID obrigatório em homologação para validar a conta vendedora de teste antes de criar a Order.',
          }),
        );
        return;
      }

      let meRes: Response;
      try {
        meRes = await fetch('https://api.mercadopago.com/users/me', {
          headers: { Authorization: `Bearer ${mpToken}` },
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Falha ao consultar identidade da conta no Mercado Pago (/users/me). Order não criada.',
          }),
        );
        return;
      }

      if (!meRes.ok) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Verificação da conta em /users/me não foi conclusiva. Order não criada.',
          }),
        );
        return;
      }

      const meData = (await meRes.json()) as { id?: number | string; tags?: string[] };
      verifiedAccountId = meData.id !== undefined ? String(meData.id) : null;
      isTestUserAccount = Array.isArray(meData.tags) && meData.tags.includes('test_user');

      if (!verifiedAccountId || verifiedAccountId !== expectedTestAccountId) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error:
              'O Access Token informado não pertence à conta esperada em MP_TEST_ACCOUNT_ID. Order não criada.',
          }),
        );
        return;
      }

      if (process.env.MP_REQUIRE_TEST_USER_TAG === 'true' && !isTestUserAccount) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error:
              'MP_REQUIRE_TEST_USER_TAG=true exige token vinculado a uma conta com tag test_user. Order não criada.',
          }),
        );
        return;
      }
    }

    const orderPayload = {
      type: 'online',
      processing_mode: 'manual',
      total_amount: totalAmountStr,
      external_reference: externalReference,
      expiration_time: 'P1D',
      items: [
        {
          id: proposal.id,
          title: `Solução Vitrine Local /sites — Proposta ${proposal.id}`,
          description:
            receipt.paymentMethod === 'pix'
              ? `Pagamento via Pix (${proposal.pixDiscountPercent}% de desconto)`
              : `Pagamento no cartão (até ${proposal.cardMaxInstallments}x; selecionado ${receipt.selectedInstallments}x)`,
          quantity: 1,
          unit_price: totalAmountStr,
        },
      ],
      payer: body.payerEmail ? { email: body.payerEmail } : undefined,
      back_urls: {
        success: `${baseUrl}/sites/contratar?proposta=${encodeURIComponent(proposal.id)}&mp_status=success`,
        pending: `${baseUrl}/sites/contratar?proposta=${encodeURIComponent(proposal.id)}&mp_status=pending`,
        failure: `${baseUrl}/sites/contratar?proposta=${encodeURIComponent(proposal.id)}&mp_status=failure`,
      },
      auto_return: 'approved',
    };

    if (!mpToken) {
      console.warn('[MP_CREATE_ORDER_DRY_RUN]', {
        hasMpToken: false,
        mpEnvironment,
        hasExpectedTestAccountId: Boolean(process.env.MP_TEST_ACCOUNT_ID?.trim()),
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(
        JSON.stringify({
          mode: 'architecture_dry_run',
          provider: 'mercadopago_orders',
          environment: 'test',
          verifiedTestUser: false,
          orderId: `dryrun_ord_${receipt.acceptanceId}`,
          idempotencyKey,
          externalReference,
          amountCents: serverAmountCents,
          paymentMethod: receipt.paymentMethod,
          maxInstallments: receipt.paymentMethod === 'pix' ? 1 : proposal.cardMaxInstallments,
          message:
            'Order Checkout Pro calculada no servidor em modo dry-run (sem credencial configurada e sem cobrança real).',
          preparedPayloadPreview: orderPayload,
        }),
      );
      return;
    }

    const mpResponse = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpToken}`,
        'X-Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const mpData = (await mpResponse.json()) as {
      id?: string;
      status?: string;
      live_mode?: boolean;
      checkout_url?: string;
      message?: string;
    };

    if (!mpResponse.ok || !mpData.id || !mpData.checkout_url) {
      console.error('[MP_CREATE_ORDER_UPSTREAM_ERROR]', {
        status: mpResponse.status,
        hasId: Boolean(mpData.id),
        hasCheckoutUrl: Boolean(mpData.checkout_url),
        detail: (mpData.message || 'Unknown error').slice(0, 200),
      });
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Falha ao criar Order Checkout Pro no Mercado Pago.',
          detail: mpData.message || 'Unknown error',
        }),
      );
      return;
    }

    // Defesa adicional pós-criação: se live_mode vier explicitamente true em homologação,
    // bloqueia a persistência e não expõe checkoutUrl. (Não falha se live_mode vier ausente.)
    if (mpEnvironment === 'test' && mpData.live_mode === true) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error:
            'Bloqueio de segurança: a Order retornou live_mode=true em homologação. Verifique a credencial de teste.',
        }),
      );
      return;
    }

    if (persistence) {
      await persistence.insertOrder({
        order_id: mpData.id,
        proposal_id: proposal.id,
        acceptance_id: receipt.acceptanceId,
        external_reference: externalReference,
        expected_amount_cents: serverAmountCents,
        payment_method: receipt.paymentMethod,
        selected_installments: receipt.selectedInstallments,
        environment: mpEnvironment,
        checkout_url: mpData.checkout_url,
        status: mpData.status || 'created',
        idempotency_key: idempotencyKey,
      });
    }

    const canExposeCheckoutUrl =
      (mpEnvironment === 'test' && Boolean(verifiedAccountId) && mpData.live_mode !== true) ||
      (mpEnvironment === 'production' && allowRealCharges);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        mode: mpEnvironment === 'test' ? 'sandbox_ready' : 'production_ready',
        provider: 'mercadopago_orders',
        environment: mpEnvironment,
        liveMode: mpData.live_mode ?? null,
        verifiedTestUser: isTestUserAccount,
        orderId: mpData.id,
        checkoutUrl: canExposeCheckoutUrl ? mpData.checkout_url : undefined,
        idempotencyKey,
        externalReference,
        amountCents: serverAmountCents,
        paymentMethod: receipt.paymentMethod,
        maxInstallments: receipt.paymentMethod === 'pix' ? 1 : proposal.cardMaxInstallments,
        message:
          mpEnvironment === 'test'
            ? 'Order criada no Checkout Pro em homologação. Use comprador de teste em checkoutUrl.'
            : 'Order criada no Checkout Pro em Produção.',
      }),
    );
  } catch (err) {
    console.error('Erro em create-order:', err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Requisição inválida.' }));
  }
}

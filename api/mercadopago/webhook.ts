import type { IncomingMessage, ServerResponse } from 'node:http';
import { verifyMercadoPagoWebhookSignature } from '../_lib/crypto.js';
import { getPersistenceAdapter } from '../_lib/persistence.js';
import { parseOrderExternalReference } from '../_lib/orderReference.js';

interface WebhookBody {
  id?: string | number;
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
}

interface MercadoPagoPaymentDetails {
  id?: number | string;
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  installments?: number;
  external_reference?: string;
  money_release_status?: string;
  total_amount?: string | number;
}

interface MercadoPagoOrderDetails {
  id?: string;
  status?: string;
  status_detail?: string;
  live_mode?: boolean;
  total_amount?: string | number;
  external_reference?: string;
  transactions?: {
    payments?: MercadoPagoPaymentDetails[];
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

function toCents(amount: string | number | undefined): number | null {
  if (amount === undefined || amount === null || amount === '') return null;
  const num = Number(amount);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

export function evaluatePaymentSettlementState(payment: MercadoPagoPaymentDetails): {
  allInstallmentsSettled: boolean;
  transferEligible: boolean;
  operationalAlert: boolean;
} {
  const status = (payment.status || '').toLowerCase();
  const installments = payment.installments || 1;
  const isPix = payment.payment_method_id === 'pix';

  if (
    status === 'refunded' ||
    status === 'cancelled' ||
    status === 'charged_back' ||
    status === 'in_mediation' ||
    status === 'failed'
  ) {
    return {
      allInstallmentsSettled: false,
      transferEligible: false,
      operationalAlert: true,
    };
  }

  // Compra confirmada ("approved" ou "processed" em Orders) habilita entrega e transferência
  // sem condicionar ao pagamento das faturas futuras do cartão ao emissor.
  // Estornos/chargebacks são tratados separadamente via alerta operacional.
  if (status === 'approved' || status === 'processed') {
    return {
      allInstallmentsSettled: isPix && installments === 1,
      transferEligible: true,
      operationalAlert: false,
    };
  }

  return {
    allInstallmentsSettled: false,
    transferEligible: false,
    operationalAlert: false,
  };
}

/**
 * Webhook do Mercado Pago (Checkout Pro via Orders API + fallback de eventos)
 *
 * - Valida assinatura HMAC `x-signature`.
 * - Para eventos `order`, consulta `GET /v1/orders/{id}` e concilia `status`,
 *   `total_amount` e `external_reference` antes de registrar pagamento confirmado.
 * - Eventos repetidos são deduplicados via chave idempotente na tabela `payment_events`.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const body = await readJsonBody<WebhookBody>(req);
    const dataId =
      url.searchParams.get('data.id') ||
      (body.data?.id !== undefined ? String(body.data.id) : undefined);

    const xSignature = req.headers['x-signature'] as string | undefined;
    const xRequestId = req.headers['x-request-id'] as string | undefined;
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

    if (
      !verifyMercadoPagoWebhookSignature({
        xSignature,
        xRequestId,
        dataId,
        secret: webhookSecret,
      })
    ) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Assinatura x-signature inválida ou ausente.' }));
      return;
    }

    const persistence = getPersistenceAdapter();
    if (!persistence) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Persistência durável não configurada para registrar eventos de pagamento.',
        }),
      );
      return;
    }

    const rawTopic = url.searchParams.get('type') || body.type || '';
    const topic =
      rawTopic || (body.action?.startsWith('order.') ? 'order' : 'unknown');
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

    if (topic === 'order' && dataId) {
      if (!mpToken) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'MERCADOPAGO_ACCESS_TOKEN ausente para consultar Order na API.',
          }),
        );
        return;
      }

      const orderRes = await fetch(
        `https://api.mercadopago.com/v1/orders/${encodeURIComponent(dataId)}`,
        {
          headers: { Authorization: `Bearer ${mpToken}` },
        },
      );
      if (!orderRes.ok) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Falha ao consultar Order no Mercado Pago.' }));
        return;
      }

      const order = (await orderRes.json()) as MercadoPagoOrderDetails;
      const primaryPayment = order.transactions?.payments?.[0];
      const refs = parseOrderExternalReference(order.external_reference);
      const persistedOrder = await persistence.findOrderById(dataId);
      const persistedAcceptance = refs.acceptanceId
        ? await persistence.findAcceptanceById(refs.acceptanceId)
        : null;

      const orderAmountCents = toCents(order.total_amount);
      const expectedAmountCents =
        persistedOrder?.expected_amount_cents ??
        persistedAcceptance?.server_calculated_amount_cents ??
        null;

      const referenceMismatch =
        !refs.proposalId ||
        !refs.acceptanceId ||
        (persistedOrder !== null &&
          (persistedOrder.external_reference !== order.external_reference ||
            persistedOrder.proposal_id !== refs.proposalId ||
            persistedOrder.acceptance_id !== refs.acceptanceId)) ||
        (persistedAcceptance !== null && persistedAcceptance.proposal_id !== refs.proposalId);

      const amountMismatch =
        expectedAmountCents !== null &&
        orderAmountCents !== null &&
        orderAmountCents !== expectedAmountCents;

      const mpEnv = (process.env.MP_ENVIRONMENT || 'test').trim().toLowerCase();
      const liveModeMismatch = mpEnv === 'test' && order.live_mode === true;

      if (referenceMismatch || amountMismatch || liveModeMismatch) {
        const idempotencyKey = `mp:order:${dataId}:reconciliation_mismatch`;
        const { deduplicated } = await persistence.insertPaymentEventIdempotent({
          provider: 'mercadopago',
          idempotency_key: idempotencyKey,
          order_id: dataId,
          payment_id: primaryPayment?.id ? String(primaryPayment.id) : null,
          proposal_id: refs.proposalId,
          acceptance_id: refs.acceptanceId,
          topic: 'order',
          status: 'reconciliation_mismatch',
          status_detail: liveModeMismatch
            ? 'live_mode_mismatch'
            : referenceMismatch
              ? 'external_reference_mismatch'
              : 'amount_mismatch',
          payment_method_id: primaryPayment?.payment_method_id || null,
          installments: primaryPayment?.installments || 1,
          all_installments_settled: false,
          transfer_eligible: false,
          operational_alert: true,
          raw_payload_json: {
            action: body.action || null,
            orderId: dataId,
            orderStatus: order.status || null,
            orderAmountCents,
            expectedAmountCents,
            externalReference: order.external_reference || null,
          },
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            received: true,
            deduplicated,
            reconciliationMismatch: true,
            transferEligible: false,
          }),
        );
        return;
      }

      const effectiveStatus = order.status || primaryPayment?.status || 'unknown';
      const state = evaluatePaymentSettlementState({
        status: effectiveStatus,
        payment_method_id: primaryPayment?.payment_method_id,
        installments: primaryPayment?.installments,
      });

      const idempotencyKey = `mp:order:${dataId}:${effectiveStatus}:${primaryPayment?.id || 'none'}`;
      const { deduplicated } = await persistence.insertPaymentEventIdempotent({
        provider: 'mercadopago',
        idempotency_key: idempotencyKey,
        order_id: dataId,
        payment_id: primaryPayment?.id ? String(primaryPayment.id) : null,
        proposal_id: refs.proposalId,
        acceptance_id: refs.acceptanceId,
        topic: 'order',
        status: effectiveStatus,
        status_detail: order.status_detail || primaryPayment?.status_detail || null,
        payment_method_id: primaryPayment?.payment_method_id || null,
        installments: primaryPayment?.installments || 1,
        all_installments_settled: state.allInstallmentsSettled,
        transfer_eligible: state.transferEligible,
        operational_alert: state.operationalAlert,
        raw_payload_json: {
          action: body.action || null,
          orderId: dataId,
          orderStatus: order.status || null,
          orderAmountCents,
          paymentId: primaryPayment?.id || null,
          installments: primaryPayment?.installments || 1,
        },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          received: true,
          deduplicated,
          orderId: dataId,
          status: effectiveStatus,
          transferEligible: state.transferEligible,
        }),
      );
      return;
    }

    if (topic === 'payment' && dataId) {
      let payment: MercadoPagoPaymentDetails = {
        id: Number(dataId),
        status: 'pending_verification',
      };

      if (mpToken) {
        const paymentRes = await fetch(
          `https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`,
          {
            headers: { Authorization: `Bearer ${mpToken}` },
          },
        );
        if (!paymentRes.ok) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Falha ao consultar pagamento no Mercado Pago.' }));
          return;
        }
        payment = (await paymentRes.json()) as MercadoPagoPaymentDetails;
      }

      const state = evaluatePaymentSettlementState(payment);
      const refs = parseOrderExternalReference(payment.external_reference);
      const idempotencyKey = `mp:payment:${dataId}:${payment.status || 'unknown'}:${payment.status_detail || 'none'}`;

      const { deduplicated } = await persistence.insertPaymentEventIdempotent({
        provider: 'mercadopago',
        idempotency_key: idempotencyKey,
        order_id: null,
        payment_id: dataId,
        proposal_id: refs.proposalId,
        acceptance_id: refs.acceptanceId,
        topic: 'payment',
        status: payment.status || 'unknown',
        status_detail: payment.status_detail || null,
        payment_method_id: payment.payment_method_id || null,
        installments: payment.installments || 1,
        all_installments_settled: state.allInstallmentsSettled,
        transfer_eligible: state.transferEligible,
        operational_alert: state.operationalAlert,
        raw_payload_json: {
          action: body.action || null,
          paymentId: payment.id || dataId,
          status: payment.status || null,
          statusDetail: payment.status_detail || null,
          installments: payment.installments || 1,
          moneyReleaseStatus: payment.money_release_status || null,
        },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ received: true, deduplicated, transferEligible: state.transferEligible }));
      return;
    }

    if (topic === 'chargeback' && dataId) {
      const idempotencyKey = `mp:chargeback:${dataId}:${body.action || 'created'}`;
      const { deduplicated } = await persistence.insertPaymentEventIdempotent({
        provider: 'mercadopago',
        idempotency_key: idempotencyKey,
        order_id: null,
        payment_id: null,
        proposal_id: null,
        acceptance_id: null,
        topic: 'chargeback',
        status: 'charged_back',
        status_detail: body.action || 'chargeback_notification',
        payment_method_id: 'credit_card',
        installments: 1,
        all_installments_settled: false,
        transfer_eligible: false,
        operational_alert: true,
        raw_payload_json: {
          chargebackId: dataId,
          action: body.action || null,
        },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ received: true, deduplicated, operationalAlert: true }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, ignoredTopic: topic }));
  } catch (err) {
    console.error('Erro no webhook Mercado Pago:', err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid webhook payload' }));
  }
}

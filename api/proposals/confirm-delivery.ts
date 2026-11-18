import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { signAcceptancePayload, verifyAccessToken } from '../_lib/crypto.js';
import { getPersistenceAdapter } from '../_lib/persistence.js';

interface ConfirmDeliveryBody {
  proposalId?: string;
  acceptanceId?: string;
  confirmedBy?: string;
  deliveryNotes?: string;
  deliveredAt?: unknown;
  delivered_at?: unknown;
}

interface OperatorRecord {
  id: string;
  name: string;
  tokenHash: string;
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw || '{}') as T;
}

function authenticateOperator(
  authHeader: string | undefined,
  claimedConfirmedBy?: string,
):
  | { ok: true; confirmedBy: string; authMethod: 'operator_token' | 'admin_secret' }
  | { ok: false; status: 401 | 403; error: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      error: 'Autorização de operador interno inválida ou ausente.',
    };
  }
  const provided = authHeader.slice('Bearer '.length).trim();

  // 1. Preferencial: registro individual de operadores por token (identidade derivada no servidor)
  const operatorsRaw = process.env.DELIVERY_OPERATORS_JSON?.trim();
  if (operatorsRaw) {
    try {
      const operators = JSON.parse(operatorsRaw) as OperatorRecord[];
      const matched = operators.find((op) => verifyAccessToken(provided, op.tokenHash));
      if (!matched) {
        return { ok: false, status: 401, error: 'Token de operador interno inválido.' };
      }
      return {
        ok: true,
        confirmedBy: `${matched.name} (${matched.id})`,
        authMethod: 'operator_token',
      };
    } catch {
      return {
        ok: false,
        status: 401,
        error: 'Configuração de operadores internos inválida no servidor.',
      };
    }
  }

  // 2. Alternativa: segredo compartilhado + lista opcional de operadores permitidos
  const expected = process.env.DELIVERY_ADMIN_SECRET?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 401,
      error: 'Segredo de confirmação de entrega não configurado no servidor.',
    };
  }
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, status: 401, error: 'Autorização de operador interno inválida.' };
  }

  const confirmedBy = (claimedConfirmedBy || '').trim();
  if (confirmedBy.length < 3) {
    return {
      ok: false,
      status: 403,
      error: 'Identidade do responsável pela confirmação (confirmedBy) é obrigatória.',
    };
  }

  const allowedListRaw = process.env.DELIVERY_ALLOWED_OPERATORS?.trim();
  if (allowedListRaw) {
    const allowed = allowedListRaw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!allowed.includes(confirmedBy.toLowerCase())) {
      return {
        ok: false,
        status: 403,
        error: 'Operador não autorizado na lista DELIVERY_ALLOWED_OPERATORS.',
      };
    }
  }

  return { ok: true, confirmedBy, authMethod: 'admin_secret' };
}

export function addMonthsClampedUtc(date: Date, months: number): Date {
  const targetYear = date.getUTCFullYear();
  const targetMonthZero = date.getUTCMonth() + months;
  const normalizedYear = targetYear + Math.floor(targetMonthZero / 12);
  const normalizedMonth = ((targetMonthZero % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(normalizedYear, normalizedMonth + 1, 0),
  ).getUTCDate();
  const clampedDay = Math.min(date.getUTCDate(), lastDayOfTargetMonth);
  return new Date(
    Date.UTC(
      normalizedYear,
      normalizedMonth,
      clampedDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

function addDaysUtc(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readJsonBody<ConfirmDeliveryBody>(req);
    const auth = authenticateOperator(req.headers.authorization, body.confirmedBy);
    if (!auth.ok) {
      res.statusCode = auth.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: auth.error }));
      return;
    }

    // Garante que a data de entrega nunca possa ser definida pelo navegador/cliente
    if (body.deliveredAt !== undefined || body.delivered_at !== undefined) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error:
            'A data efetiva de entrega não pode ser informada pelo cliente; é gerada exclusivamente pelo servidor.',
        }),
      );
      return;
    }

    const proposalId = (body.proposalId || '').trim().toUpperCase();
    const acceptanceId = (body.acceptanceId || '').trim();
    const deliveryNotes = body.deliveryNotes?.trim() || null;

    if (!proposalId || !acceptanceId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Informe proposalId e acceptanceId.' }));
      return;
    }

    const persistence = getPersistenceAdapter();
    if (!persistence) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Persistência durável não configurada. Não é possível registrar a entrega.',
        }),
      );
      return;
    }

    const acceptance = await persistence.findAcceptanceById(acceptanceId);
    if (!acceptance || acceptance.proposal_id.toUpperCase() !== proposalId) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Aceite contratual correspondente à proposta não encontrado.',
        }),
      );
      return;
    }

    const now = new Date();
    const deliveredAt = now.toISOString();
    const month12Date = addMonthsClampedUtc(now, 12);
    const notice30dDate = addDaysUtc(month12Date, -30);
    const grace15dDate = addDaysUtc(month12Date, 15);

    const month12EndsAt = month12Date.toISOString();
    const notice30dDueAt = notice30dDate.toISOString();
    const grace15dEndsAt = grace15dDate.toISOString();
    const deliveryId = `del_${randomUUID()}`;

    const canonicalPayload = JSON.stringify({
      deliveryId,
      proposalId,
      acceptanceId,
      deliveredAt,
      confirmedBy: auth.confirmedBy,
      month12EndsAt,
      notice30dDueAt,
      grace15dEndsAt,
    });
    const integritySignature = signAcceptancePayload(canonicalPayload);

    const result = await persistence.confirmDeliveryAtomic({
      delivery_id: deliveryId,
      proposal_id: proposalId,
      acceptance_id: acceptanceId,
      delivered_at: deliveredAt,
      confirmed_by: auth.confirmedBy,
      auth_method: auth.authMethod,
      delivery_notes: deliveryNotes,
      month_12_ends_at: month12EndsAt,
      notice_30d_due_at: notice30dDueAt,
      grace_15d_ends_at: grace15dEndsAt,
      integrity_signature: integritySignature,
    });

    if (result.already_delivered) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'A entrega desta proposta já foi confirmada anteriormente.',
          deliveryId: result.delivery_id,
          deliveredAt: result.delivered_at,
          confirmedBy: result.confirmed_by,
          notice30dDueAt: result.notice_30d_due_at,
          month12EndsAt: result.month_12_ends_at,
          grace15dEndsAt: result.grace_15d_ends_at,
        }),
      );
      return;
    }

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        deliveryId: result.delivery_id,
        proposalId,
        acceptanceId,
        deliveredAt: result.delivered_at,
        confirmedBy: result.confirmed_by,
        authMethod: auth.authMethod,
        notice30dDueAt: result.notice_30d_due_at,
        month12EndsAt: result.month_12_ends_at,
        grace15dEndsAt: result.grace_15d_ends_at,
        filesPreserved: true,
        lifecycleStatus: 'active_first_12m',
        integritySignature,
      }),
    );
  } catch (err) {
    console.error('Erro ao confirmar entrega do site:', err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Requisição inválida ao registrar entrega.' }));
  }
}

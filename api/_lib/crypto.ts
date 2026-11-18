import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hashSensitiveDocument(digits: string): string {
  const salt = process.env.DOCUMENT_HASH_SALT || 'local-dev-doc-salt';
  return createHmac('sha256', salt).update(digits).digest('hex');
}

export function verifyAccessToken(rawToken: string | undefined, expectedHash: string | undefined): boolean {
  if (!rawToken || !expectedHash) return false;
  const computed = sha256Hex(rawToken.trim());
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(expectedHash.trim().toLowerCase(), 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function signAcceptancePayload(payload: string): string {
  const secret = process.env.PROPOSAL_SIGNING_SECRET || 'local-dev-non-production-secret';
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyAcceptanceSignature(payload: string, signatureHex: string): boolean {
  if (!signatureHex || !/^[a-f0-9]+$/i.test(signatureHex)) return false;
  const expected = signAcceptancePayload(payload);
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signatureHex, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Valida o cabeçalho x-signature enviado pelo Mercado Pago nos webhooks.
 * Formato esperado: "ts=1704908010,v1=..."
 * Manifest: "id:[data.id];request-id:[x-request-id];ts:[ts];"
 */
export function verifyMercadoPagoWebhookSignature(params: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string | undefined;
  secret: string | undefined;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;
  if (!xSignature || !xRequestId || !dataId || !secret) {
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map((segment) => {
      const [k, v] = segment.split('=');
      return [k?.trim(), v?.trim()];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !/^[a-f0-9]+$/i.test(v1)) {
    return false;
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const computed = createHmac('sha256', secret).update(manifest).digest('hex');

  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(v1, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

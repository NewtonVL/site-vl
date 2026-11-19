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
 * Manifest oficial: omite campos ausentes, ex.: "id:[data.id];request-id:[x-request-id];ts:[ts];"
 */
export function verifyMercadoPagoWebhookSignature(params: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string | undefined;
  queryDataId?: string | undefined;
  bodyDataId?: string | undefined;
  secret: string | undefined;
}): boolean {
  const { xSignature, xRequestId, dataId, queryDataId, bodyDataId } = params;
  const secret = params.secret?.trim();
  if (!xSignature || !secret) {
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map((segment) => {
      const eqIdx = segment.indexOf('=');
      if (eqIdx === -1) return [segment.trim(), ''];
      return [segment.slice(0, eqIdx).trim(), segment.slice(eqIdx + 1).trim()];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !/^[a-f0-9]+$/i.test(v1)) {
    return false;
  }

  const checkManifest = (manifest: string): boolean => {
    const computed = createHmac('sha256', secret).update(manifest).digest('hex');
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(v1, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  };

  const buildManifest = (idValue?: string): string => {
    const segments: string[] = [];
    if (idValue) segments.push(`id:${idValue.toLowerCase()}`);
    if (xRequestId) segments.push(`request-id:${xRequestId}`);
    segments.push(`ts:${ts}`);
    return `${segments.join(';')};`;
  };

  const primaryId = queryDataId !== undefined ? queryDataId : bodyDataId !== undefined ? undefined : dataId;
  if (checkManifest(buildManifest(primaryId))) {
    return true;
  }

  // Fallback seguro (ainda exige HMAC válido com secret): se query data.id veio ausente,
  // testa com body.data.id caso o simulador/evento tenha assinado usando o id do corpo.
  if (!queryDataId && bodyDataId && bodyDataId !== primaryId) {
    return checkManifest(buildManifest(bodyDataId));
  }

  return false;
}

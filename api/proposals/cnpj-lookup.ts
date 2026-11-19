import type { IncomingMessage, ServerResponse } from 'node:http';
import { findServerProposalAuthorized } from '../_lib/proposalsStore.js';
import { getPersistenceAdapter } from '../_lib/persistence.js';

interface LookupBody {
  proposalId?: string;
  accessToken?: string;
  cnpj?: string;
}

interface ApiPjRawResponse {
  razao_social?: string;
  nome_fantasia?: string | null;
  situacao_cadastral?: {
    descricao?: string;
    data?: string;
  } | null;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
  } | null;
}

const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000;
const RATE_LIMIT_MAX_PER_PROPOSAL = 5;
const demoMemoryRateLimits = new Map<string, number[]>();

type FetchLike = typeof fetch;
let customFetchForTests: FetchLike | null = null;

export function __setCnpjLookupFetchForTests(fn: FetchLike | null): void {
  customFetchForTests = fn;
}

export function __resetCnpjRateLimitForTests(): void {
  demoMemoryRateLimits.clear();
}

export function normalizeCnpjValue(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Valida CNPJ numérico ou alfanumérico conforme especificação oficial da Receita Federal:
 * - 12 primeiras posições alfanuméricas [A-Z0-9] + 2 dígitos verificadores numéricos [0-9]
 * - Cálculo módulo 11 usando valor ASCII - 48 ('0'->0 .. '9'->9, 'A'->17 .. 'Z'->42)
 */
export function isValidCnpjDigits(raw: string): boolean {
  const normalized = normalizeCnpjValue(raw);
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

function formatAddress(addr: ApiPjRawResponse['endereco']): string | null {
  if (!addr) return null;
  const line1 = [addr.logradouro, addr.numero, addr.complemento].filter(Boolean).join(', ');
  const line2 = [addr.bairro, addr.municipio && addr.uf ? `${addr.municipio}/${addr.uf}` : addr.municipio || addr.uf]
    .filter(Boolean)
    .join(' - ');
  const cep = addr.cep ? `CEP ${addr.cep}` : '';
  const combined = [line1, line2, cep].filter(Boolean).join(' • ');
  return combined || null;
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw || '{}') as T;
}

async function checkProposalRateLimit(
  proposalId: string,
  isDemoPreview?: boolean,
): Promise<{ allowed: boolean; retryAfterSeconds: number; unavailable?: boolean }> {
  const persistence = getPersistenceAdapter();
  if (persistence) {
    try {
      return await persistence.consumeCnpjLookupQuota(
        proposalId.toUpperCase(),
        RATE_LIMIT_MAX_PER_PROPOSAL,
        RATE_LIMIT_WINDOW_SECONDS,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown_error';
      console.warn('[CNPJ_LOOKUP_RATE_LIMIT_ERROR]', {
        isDemoPreview: Boolean(isDemoPreview),
        message: message.slice(0, 200),
      });
      if (!isDemoPreview) {
        return { allowed: false, retryAfterSeconds: 0, unavailable: true };
      }
    }
  }

  // Para propostas reais sem banco durável, falhar fechado para não depender de memória local
  if (!isDemoPreview) {
    return { allowed: false, retryAfterSeconds: 0, unavailable: true };
  }

  const now = Date.now();
  const key = proposalId.toUpperCase();
  const recent = (demoMemoryRateLimits.get(key) || []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX_PER_PROPOSAL) {
    const oldest = recent[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000));
    demoMemoryRateLimits.set(key, recent);
    return { allowed: false, retryAfterSeconds };
  }
  recent.push(now);
  demoMemoryRateLimits.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readJsonBody<LookupBody>(req);
    const lookup = findServerProposalAuthorized(body.proposalId || '', body.accessToken);
    if (!('proposal' in lookup)) {
      res.statusCode = lookup.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: lookup.error }));
      return;
    }

    const normalizedCnpj = normalizeCnpjValue(body.cnpj || '');
    if (!isValidCnpjDigits(normalizedCnpj)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'INVALID_CNPJ',
          error: 'CNPJ inválido. Verifique os dígitos informados ou preencha manualmente.',
        }),
      );
      return;
    }

    const rate = await checkProposalRateLimit(lookup.proposal.id, lookup.proposal.isDemoPreview);
    if (rate.unavailable) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'RATE_LIMIT_STORAGE_UNAVAILABLE',
          error: 'Consulta automática indisponível sem armazenamento durável. Preencha os dados manualmente.',
        }),
      );
      return;
    }
    if (!rate.allowed) {
      res.statusCode = 429;
      res.setHeader('Retry-After', String(rate.retryAfterSeconds));
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'RATE_LIMITED',
          retryAfterSeconds: rate.retryAfterSeconds,
          error: `Limite de consultas atingido para esta proposta. Aguarde ${rate.retryAfterSeconds}s ou preencha os dados manualmente.`,
        }),
      );
      return;
    }

    const apiKey = process.env.APIPJ_API_KEY?.trim();
    if (!apiKey) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'KEY_NOT_CONFIGURED',
          error: 'Consulta automática de CNPJ indisponível no momento. Preencha os dados da empresa manualmente.',
        }),
      );
      return;
    }

    const fetchFn = customFetchForTests || fetch;
    let upstreamRes: globalThis.Response;
    try {
      upstreamRes = await fetchFn(`https://apipj.com.br/v1/cnpj/${normalizedCnpj}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
          'User-Agent': 'VitrineLocal-Server/1.0',
        },
        signal: AbortSignal.timeout(10000),
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : 'Error';
      const message = err instanceof Error ? err.message : 'unknown_fetch_error';
      console.error('[CNPJ_LOOKUP_UPSTREAM_FETCH_ERROR]', {
        name,
        message: message.slice(0, 200),
      });
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'UPSTREAM_UNAVAILABLE',
          error: 'Não foi possível consultar o CNPJ agora. Preencha os dados da empresa manualmente.',
        }),
      );
      return;
    }

    if (upstreamRes.status === 404) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'CNPJ_NOT_FOUND',
          error: 'CNPJ não localizado na base cadastral. Continue preenchendo os dados manualmente.',
        }),
      );
      return;
    }

    if (upstreamRes.status === 429) {
      const upstreamRetry = upstreamRes.headers.get('Retry-After') || '60';
      res.statusCode = 429;
      res.setHeader('Retry-After', upstreamRetry);
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'UPSTREAM_RATE_LIMITED',
          retryAfterSeconds: Number(upstreamRetry) || 60,
          error: 'Serviço de consulta temporariamente ocupado. Preencha os dados manualmente.',
        }),
      );
      return;
    }

    if (!upstreamRes.ok) {
      console.error('[CNPJ_LOOKUP_UPSTREAM_STATUS]', { status: upstreamRes.status });
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'UPSTREAM_UNAVAILABLE',
          error: 'Não foi possível consultar o CNPJ agora. Preencha os dados da empresa manualmente.',
        }),
      );
      return;
    }

    let raw: ApiPjRawResponse;
    try {
      raw = (await upstreamRes.json()) as ApiPjRawResponse;
    } catch (err) {
      const name = err instanceof Error ? err.name : 'Error';
      console.error('[CNPJ_LOOKUP_UPSTREAM_PARSE_ERROR]', { name });
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          fallbackManual: true,
          code: 'UPSTREAM_UNAVAILABLE',
          error: 'Não foi possível consultar o CNPJ agora. Preencha os dados da empresa manualmente.',
        }),
      );
      return;
    }
    const situacaoDesc = raw.situacao_cadastral?.descricao?.trim() || null;
    const situacaoData = raw.situacao_cadastral?.data?.trim() || null;
    const situacaoCadastral = situacaoDesc
      ? situacaoData
        ? `${situacaoDesc} (desde ${situacaoData})`
        : situacaoDesc
      : null;

    // Projeção estrita: apenas razão social, nome fantasia, situação cadastral e endereço.
    // E-mail, telefone, QSA e CPF de sócios são propositalmente ignorados.
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        razaoSocial: (raw.razao_social || '').trim(),
        nomeFantasia: raw.nome_fantasia?.trim() || null,
        situacaoCadastral,
        endereco: formatAddress(raw.endereco),
        source: 'apipj.com.br (base mensal)',
      }),
    );
  } catch (err) {
    const name = err instanceof Error ? err.name : 'Error';
    console.error('[CNPJ_LOOKUP_HANDLER_ERROR]', { name });
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        fallbackManual: true,
        code: 'LOOKUP_FAILED',
        error: 'Consulta automática indisponível no momento. Continue com o preenchimento manual.',
      }),
    );
  }
}

export interface ContractVersionSnapshotRecord {
  version: string;
  status: 'draft' | 'active' | 'archived';
  title: string;
  full_text_snapshot: string;
  sha256_hash: string;
}

export interface PersistedProposalRecord {
  id: string;
  access_token_hash: string;
  client_display_name: string;
  business_segment: string;
  demo_reference_url: string | null;
  valid_until: string;
  base_price_cents: number;
  pix_discount_percent: number;
  card_max_installments: number;
  card_monthly_interest_percent: number;
  included_items_json: string[];
  contract_version: string;
  is_demo: boolean;
}

export interface PersistedAcceptanceRecord {
  acceptance_id: string;
  proposal_id: string;
  contract_version: string;
  contract_text_sha256: string;
  accepted_at: string;
  client_legal_name: string;
  client_document_type: 'CPF' | 'CNPJ';
  client_document_hash: string;
  client_document_masked: string;
  client_responsible_name: string;
  client_email: string;
  client_whatsapp: string;
  domain_option: 'existing' | 'register_own';
  domain_name: string;
  maintenance_option: 'none' | 'monthly_49_90';
  maintenance_accepted: boolean;
  payment_method: 'pix' | 'card';
  selected_installments: number;
  server_calculated_amount_cents: number;
  integrity_signature: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface PersistedOrderRecord {
  order_id: string;
  proposal_id: string;
  acceptance_id: string;
  external_reference: string;
  expected_amount_cents: number;
  payment_method: 'pix' | 'card';
  selected_installments: number;
  environment: 'test' | 'production';
  checkout_url: string | null;
  status: string;
  idempotency_key: string;
}

export interface PersistedPaymentEventRecord {
  provider: 'mercadopago';
  idempotency_key: string;
  order_id: string | null;
  payment_id: string | null;
  proposal_id: string | null;
  acceptance_id: string | null;
  topic: string;
  status: string;
  status_detail: string | null;
  payment_method_id: string | null;
  installments: number;
  all_installments_settled: boolean;
  transfer_eligible: boolean;
  operational_alert: boolean;
  raw_payload_json: Record<string, unknown>;
}

export interface PersistedDeliveryRecord {
  delivery_id: string;
  proposal_id: string;
  acceptance_id: string;
  delivered_at: string;
  confirmed_by: string;
  auth_method?: string;
  delivery_notes: string | null;
  month_12_ends_at: string;
  notice_30d_due_at: string;
  grace_15d_ends_at: string;
  integrity_signature: string;
}

export interface PersistedLifecycleStateRecord {
  proposal_id: string;
  delivery_id: string;
  initial_acceptance_id: string;
  delivered_at: string;
  notice_30d_due_at: string;
  month_12_ends_at: string;
  grace_period_ends_at: string;
  files_preserved: boolean;
  lifecycle_status:
    | 'active_first_12m'
    | 'notified_30d'
    | 'grace_15d_no_charge'
    | 'final_notice_sent'
    | 'suspended_files_preserved'
    | 'continued_with_express_acceptance'
    | 'transferred';
}

export interface AtomicDeliveryResult {
  already_delivered: boolean;
  delivery_id: string;
  delivered_at: string;
  confirmed_by: string;
  notice_30d_due_at: string;
  month_12_ends_at: string;
  grace_15d_ends_at: string;
}

export interface PersistenceAdapter {
  upsertContractVersion(record: ContractVersionSnapshotRecord): Promise<void>;
  upsertProposal(record: PersistedProposalRecord): Promise<void>;
  insertAcceptance(record: PersistedAcceptanceRecord): Promise<void>;
  findAcceptanceById(acceptanceId: string): Promise<PersistedAcceptanceRecord | null>;
  insertOrder(record: PersistedOrderRecord): Promise<void>;
  findOrderById(orderId: string): Promise<PersistedOrderRecord | null>;
  insertPaymentEventIdempotent(
    record: PersistedPaymentEventRecord,
  ): Promise<{ deduplicated: boolean }>;
  consumeCnpjLookupQuota(
    proposalId: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; retryAfterSeconds: number }>;
  confirmDeliveryAtomic(record: PersistedDeliveryRecord): Promise<AtomicDeliveryResult>;
}

function getSupabaseConfig(): { url: string; secretKey: string } | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !secretKey) return null;
  return { url, secretKey };
}

export function isDurablePersistenceConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

/**
 * Monta headers compatíveis com Supabase PostgREST:
 * - Chaves novas `sb_secret_...` NÃO são JWTs: devem ir apenas em `apikey` (sem `Authorization: Bearer`).
 * - Chaves legadas `service_role` (JWT `eyJ...`) usam `apikey` + `Authorization: Bearer`.
 */
export function buildSupabaseHeaders(secretKey: string, prefer?: string): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: secretKey,
    'Content-Type': 'application/json',
  };
  if (!secretKey.startsWith('sb_secret_')) {
    headers.Authorization = `Bearer ${secretKey}`;
  }
  if (prefer) {
    headers.Prefer = prefer;
  }
  return headers;
}

async function supabaseRequest(
  path: string,
  init: RequestInit & { prefer?: string },
): Promise<Response> {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY não configurados.');
  }
  const headers = buildSupabaseHeaders(cfg.secretKey, init.prefer);
  return fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

const supabaseAdapter: PersistenceAdapter = {
  async upsertContractVersion(record) {
    const res = await supabaseRequest('contract_versions?on_conflict=version', {
      method: 'POST',
      prefer: 'resolution=ignore-duplicates,return=minimal',
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      throw new Error(`Falha ao persistir versão do contrato: ${res.status}`);
    }
  },

  async upsertProposal(record) {
    const res = await supabaseRequest('proposals?on_conflict=id', {
      method: 'POST',
      prefer: 'resolution=ignore-duplicates,return=minimal',
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao persistir proposta: ${res.status} ${text}`);
    }
  },

  async insertAcceptance(record) {
    const res = await supabaseRequest('contract_acceptances', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao persistir aceite: ${res.status} ${text}`);
    }
  },

  async findAcceptanceById(acceptanceId) {
    const res = await supabaseRequest(
      `contract_acceptances?acceptance_id=eq.${encodeURIComponent(acceptanceId)}&limit=1`,
      { method: 'GET' },
    );
    if (!res.ok) {
      throw new Error(`Falha ao consultar aceite: ${res.status}`);
    }
    const rows = (await res.json()) as PersistedAcceptanceRecord[];
    return rows[0] ?? null;
  },

  async insertOrder(record) {
    const res = await supabaseRequest('mp_orders?on_conflict=idempotency_key', {
      method: 'POST',
      prefer: 'resolution=ignore-duplicates,return=minimal',
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao persistir order do Mercado Pago: ${res.status} ${text}`);
    }
  },

  async findOrderById(orderId) {
    const res = await supabaseRequest(
      `mp_orders?order_id=eq.${encodeURIComponent(orderId)}&limit=1`,
      { method: 'GET' },
    );
    if (!res.ok) {
      throw new Error(`Falha ao consultar order: ${res.status}`);
    }
    const rows = (await res.json()) as PersistedOrderRecord[];
    return rows[0] ?? null;
  },

  async insertPaymentEventIdempotent(record) {
    const res = await supabaseRequest('payment_events', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify(record),
    });
    if (res.status === 409) {
      return { deduplicated: true };
    }
    if (!res.ok) {
      const text = await res.text();
      if (text.includes('duplicate key') || text.includes('23505')) {
        return { deduplicated: true };
      }
      throw new Error(`Falha ao persistir evento de pagamento: ${res.status} ${text}`);
    }
    return { deduplicated: false };
  },

  async consumeCnpjLookupQuota(proposalId, maxRequests, windowSeconds) {
    const res = await supabaseRequest('rpc/consume_cnpj_lookup_quota', {
      method: 'POST',
      body: JSON.stringify({
        p_proposal_id: proposalId,
        p_max: maxRequests,
        p_window_seconds: windowSeconds,
      }),
    });
    if (!res.ok) {
      throw new Error(`Falha ao verificar cota de consulta CNPJ: ${res.status}`);
    }
    const rows = (await res.json()) as Array<{
      allowed: boolean;
      retry_after_seconds: number;
    }>;
    const row = rows[0];
    return {
      allowed: Boolean(row?.allowed),
      retryAfterSeconds: Number(row?.retry_after_seconds || 0),
    };
  },

  async confirmDeliveryAtomic(record) {
    const res = await supabaseRequest('rpc/confirm_site_delivery_atomic', {
      method: 'POST',
      body: JSON.stringify({
        p_delivery_id: record.delivery_id,
        p_proposal_id: record.proposal_id,
        p_acceptance_id: record.acceptance_id,
        p_delivered_at: record.delivered_at,
        p_confirmed_by: record.confirmed_by,
        p_auth_method: record.auth_method || 'admin_secret',
        p_delivery_notes: record.delivery_notes,
        p_month_12_ends_at: record.month_12_ends_at,
        p_notice_30d_due_at: record.notice_30d_due_at,
        p_grace_15d_ends_at: record.grace_15d_ends_at,
        p_integrity_signature: record.integrity_signature,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha na confirmação atômica de entrega: ${res.status} ${text}`);
    }
    const rows = (await res.json()) as AtomicDeliveryResult[];
    if (!rows[0]) {
      throw new Error('RPC confirm_site_delivery_atomic não retornou registro.');
    }
    return rows[0];
  },
};

let customTestAdapter: PersistenceAdapter | null = null;

export function __setPersistenceAdapterForTests(adapter: PersistenceAdapter | null): void {
  customTestAdapter = adapter;
}

export function getPersistenceAdapter(): PersistenceAdapter | null {
  if (customTestAdapter) return customTestAdapter;
  if (isDurablePersistenceConfigured()) return supabaseAdapter;
  return null;
}

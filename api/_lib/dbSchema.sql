-- Esquema PostgreSQL / Supabase para persistência durável da contratação /sites
-- Sobrevive a cold starts e novos deploys das funções serverless na Vercel.
-- Compatível com chaves secretas modernas `sb_secret_...` (papel `service_role` via PostgREST).

CREATE TABLE IF NOT EXISTS contract_versions (
  version TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  title TEXT NOT NULL,
  full_text_snapshot TEXT NOT NULL,
  sha256_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  access_token_hash TEXT NOT NULL,
  client_display_name TEXT NOT NULL,
  business_segment TEXT NOT NULL,
  demo_reference_url TEXT,
  valid_until DATE NOT NULL,
  base_price_cents INTEGER NOT NULL CHECK (base_price_cents > 0),
  pix_discount_percent INTEGER NOT NULL DEFAULT 20,
  card_max_installments INTEGER NOT NULL DEFAULT 10,
  card_monthly_interest_percent NUMERIC(5,2) NOT NULL DEFAULT 1.99,
  included_items_json JSONB NOT NULL,
  contract_version TEXT NOT NULL REFERENCES contract_versions(version),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contract_acceptances (
  acceptance_id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id),
  contract_version TEXT NOT NULL REFERENCES contract_versions(version),
  contract_text_sha256 TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL,
  client_legal_name TEXT NOT NULL,
  client_document_type TEXT NOT NULL CHECK (client_document_type IN ('CPF', 'CNPJ')),
  client_document_hash TEXT NOT NULL,
  client_document_masked TEXT NOT NULL,
  client_responsible_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_whatsapp TEXT NOT NULL,
  domain_option TEXT NOT NULL CHECK (domain_option IN ('existing', 'register_own')),
  domain_name TEXT NOT NULL,
  maintenance_option TEXT NOT NULL CHECK (maintenance_option IN ('none', 'monthly_49_90')),
  maintenance_accepted BOOLEAN NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card')),
  selected_installments INTEGER NOT NULL,
  server_calculated_amount_cents INTEGER NOT NULL,
  integrity_signature TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mp_orders (
  order_id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id),
  acceptance_id TEXT NOT NULL REFERENCES contract_acceptances(acceptance_id),
  external_reference TEXT NOT NULL,
  expected_amount_cents INTEGER NOT NULL CHECK (expected_amount_cents > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'card')),
  selected_installments INTEGER NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('test', 'production')),
  checkout_url TEXT,
  status TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  idempotency_key TEXT NOT NULL UNIQUE,
  order_id TEXT,
  payment_id TEXT,
  proposal_id TEXT REFERENCES proposals(id),
  acceptance_id TEXT REFERENCES contract_acceptances(acceptance_id),
  topic TEXT NOT NULL,
  status TEXT NOT NULL,
  status_detail TEXT,
  payment_method_id TEXT,
  installments INTEGER NOT NULL DEFAULT 1,
  all_installments_settled BOOLEAN NOT NULL DEFAULT FALSE,
  transfer_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  operational_alert BOOLEAN NOT NULL DEFAULT FALSE,
  operational_settlement_verified_at TIMESTAMPTZ,
  operational_settlement_verified_by TEXT,
  raw_payload_json JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_proposal ON payment_events(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id);

CREATE TABLE IF NOT EXISTS cnpj_lookup_rate_limits (
  proposal_id TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0
);

-- Registro durável da entrega efetiva do site (data/hora gerada exclusivamente no servidor)
CREATE TABLE IF NOT EXISTS site_deliveries (
  delivery_id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL UNIQUE REFERENCES proposals(id),
  acceptance_id TEXT NOT NULL REFERENCES contract_acceptances(acceptance_id),
  delivered_at TIMESTAMPTZ NOT NULL,
  confirmed_by TEXT NOT NULL,
  auth_method TEXT NOT NULL DEFAULT 'admin_secret',
  delivery_notes TEXT,
  month_12_ends_at TIMESTAMPTZ NOT NULL,
  notice_30d_due_at TIMESTAMPTZ NOT NULL,
  grace_15d_ends_at TIMESTAMPTZ NOT NULL,
  integrity_signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Controle de cobranças mensais individuais (Pix / Link), evitando duplicidade por competência
CREATE TABLE IF NOT EXISTS monthly_maintenance_invoices (
  invoice_id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id),
  competence_month TEXT NOT NULL, -- formato YYYY-MM
  plan_type TEXT NOT NULL CHECK (plan_type IN ('maintenance_49_90', 'standalone_29_90')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents IN (4990, 2990)),
  due_at DATE NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  external_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  issued_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (proposal_id, competence_month)
);

-- Registro de aceite expresso para continuidade após os 12 meses iniciais
CREATE TABLE IF NOT EXISTS post_12m_continuity_acceptances (
  continuity_acceptance_id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id),
  initial_acceptance_id TEXT NOT NULL REFERENCES contract_acceptances(acceptance_id),
  notified_at TIMESTAMPTZ NOT NULL,
  continuity_option TEXT NOT NULL CHECK (continuity_option IN ('standalone_29_90', 'maintenance_49_90', 'transfer_site')),
  contract_version TEXT NOT NULL REFERENCES contract_versions(version),
  express_accepted_at TIMESTAMPTZ NOT NULL,
  integrity_signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_12m_lifecycle_states (
  proposal_id TEXT PRIMARY KEY REFERENCES proposals(id),
  delivery_id TEXT NOT NULL REFERENCES site_deliveries(delivery_id),
  initial_acceptance_id TEXT NOT NULL REFERENCES contract_acceptances(acceptance_id),
  delivered_at TIMESTAMPTZ NOT NULL,
  notice_30d_due_at TIMESTAMPTZ NOT NULL,
  month_12_ends_at TIMESTAMPTZ NOT NULL,
  notice_30d_sent_at TIMESTAMPTZ,
  billing_ended_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ NOT NULL,
  final_notice_sent_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  files_preserved BOOLEAN NOT NULL DEFAULT TRUE,
  lifecycle_status TEXT NOT NULL CHECK (
    lifecycle_status IN (
      'active_first_12m',
      'notified_30d',
      'grace_15d_no_charge',
      'final_notice_sent',
      'suspended_files_preserved',
      'continued_with_express_acceptance',
      'transferred'
    )
  ),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- FUNÇÕES RPC ATÔMICAS (SECURITY DEFINER com search_path fixo)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.consume_cnpj_lookup_quota(
  p_proposal_id TEXT,
  p_max INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, retry_after_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := pg_catalog.now();
  v_row public.cnpj_lookup_rate_limits%ROWTYPE;
  v_elapsed INTEGER;
BEGIN
  INSERT INTO public.cnpj_lookup_rate_limits (proposal_id, window_started_at, request_count)
  VALUES (p_proposal_id, v_now, 0)
  ON CONFLICT (proposal_id) DO NOTHING;

  SELECT * INTO v_row
  FROM public.cnpj_lookup_rate_limits
  WHERE proposal_id = p_proposal_id
  FOR UPDATE;

  v_elapsed := pg_catalog.floor(EXTRACT(EPOCH FROM (v_now - v_row.window_started_at)))::INTEGER;

  IF v_elapsed >= p_window_seconds THEN
    UPDATE public.cnpj_lookup_rate_limits
    SET window_started_at = v_now, request_count = 1
    WHERE proposal_id = p_proposal_id;
    RETURN QUERY SELECT TRUE, 0;
    RETURN;
  END IF;

  IF v_row.request_count >= p_max THEN
    RETURN QUERY SELECT FALSE, pg_catalog.greatest(1, p_window_seconds - v_elapsed)::INTEGER;
    RETURN;
  END IF;

  UPDATE public.cnpj_lookup_rate_limits
  SET request_count = v_row.request_count + 1
  WHERE proposal_id = p_proposal_id;
  RETURN QUERY SELECT TRUE, 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_site_delivery_atomic(
  p_delivery_id TEXT,
  p_proposal_id TEXT,
  p_acceptance_id TEXT,
  p_delivered_at TIMESTAMPTZ,
  p_confirmed_by TEXT,
  p_auth_method TEXT,
  p_delivery_notes TEXT,
  p_month_12_ends_at TIMESTAMPTZ,
  p_notice_30d_due_at TIMESTAMPTZ,
  p_grace_15d_ends_at TIMESTAMPTZ,
  p_integrity_signature TEXT
)
RETURNS TABLE(
  already_delivered BOOLEAN,
  delivery_id TEXT,
  delivered_at TIMESTAMPTZ,
  confirmed_by TEXT,
  notice_30d_due_at TIMESTAMPTZ,
  month_12_ends_at TIMESTAMPTZ,
  grace_15d_ends_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing public.site_deliveries%ROWTYPE;
BEGIN
  SELECT * INTO v_existing
  FROM public.site_deliveries
  WHERE proposal_id = p_proposal_id
  FOR UPDATE;

  IF FOUND THEN
    INSERT INTO public.post_12m_lifecycle_states (
      proposal_id, delivery_id, initial_acceptance_id, delivered_at,
      notice_30d_due_at, month_12_ends_at, grace_period_ends_at,
      files_preserved, lifecycle_status
    )
    VALUES (
      v_existing.proposal_id, v_existing.delivery_id, v_existing.acceptance_id, v_existing.delivered_at,
      v_existing.notice_30d_due_at, v_existing.month_12_ends_at, v_existing.grace_15d_ends_at,
      TRUE, 'active_first_12m'
    )
    ON CONFLICT (proposal_id) DO NOTHING;

    RETURN QUERY SELECT
      TRUE,
      v_existing.delivery_id,
      v_existing.delivered_at,
      v_existing.confirmed_by,
      v_existing.notice_30d_due_at,
      v_existing.month_12_ends_at,
      v_existing.grace_15d_ends_at;
    RETURN;
  END IF;

  INSERT INTO public.site_deliveries (
    delivery_id, proposal_id, acceptance_id, delivered_at,
    confirmed_by, auth_method, delivery_notes,
    month_12_ends_at, notice_30d_due_at, grace_15d_ends_at, integrity_signature
  )
  VALUES (
    p_delivery_id, p_proposal_id, p_acceptance_id, p_delivered_at,
    p_confirmed_by, p_auth_method, p_delivery_notes,
    p_month_12_ends_at, p_notice_30d_due_at, p_grace_15d_ends_at, p_integrity_signature
  );

  INSERT INTO public.post_12m_lifecycle_states (
    proposal_id, delivery_id, initial_acceptance_id, delivered_at,
    notice_30d_due_at, month_12_ends_at, grace_period_ends_at,
    files_preserved, lifecycle_status
  )
  VALUES (
    p_proposal_id, p_delivery_id, p_acceptance_id, p_delivered_at,
    p_notice_30d_due_at, p_month_12_ends_at, p_grace_15d_ends_at,
    TRUE, 'active_first_12m'
  );

  RETURN QUERY SELECT
    FALSE,
    p_delivery_id,
    p_delivered_at,
    p_confirmed_by,
    p_notice_30d_due_at,
    p_month_12_ends_at,
    p_grace_15d_ends_at;
END;
$$;

-- ============================================================================
-- SEGURANÇA: RLS + PRIVILÉGIOS ESTRITOS (Somente service_role / sb_secret_...)
-- ============================================================================

ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnpj_lookup_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_maintenance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_12m_continuity_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_12m_lifecycle_states ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contract_versions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.proposals FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.contract_acceptances FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.mp_orders FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.payment_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.cnpj_lookup_rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.site_deliveries FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.monthly_maintenance_invoices FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.post_12m_continuity_acceptances FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.post_12m_lifecycle_states FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contract_versions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.proposals TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contract_acceptances TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mp_orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.payment_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cnpj_lookup_rate_limits TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_deliveries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.monthly_maintenance_invoices TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.post_12m_continuity_acceptances TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.post_12m_lifecycle_states TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

REVOKE ALL ON FUNCTION public.consume_cnpj_lookup_quota(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_cnpj_lookup_quota(TEXT, INTEGER, INTEGER) TO service_role;

REVOKE ALL ON FUNCTION public.confirm_site_delivery_atomic(
  TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_site_delivery_atomic(
  TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT
) TO service_role;

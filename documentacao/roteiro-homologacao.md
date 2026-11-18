# Roteiro Exato de Homologação (Checkout Pro via Orders API) — `/sites/contratar`

> **Segurança:** Nunca envie chaves secretas por chat e nunca exponha variáveis de servidor com prefixo `VITE_`. Todas as credenciais ficam apenas no servidor (`.env.local` em testes locais ou *Environment Variables* de *Preview* na Vercel).

---

## Ordem Obrigatória de Configuração

### Etapa 1 — Criar Banco no Supabase e Aplicar SQL
1. No painel do **Supabase**, crie o projeto de homologação.
2. Em **SQL Editor**, cole e execute integralmente [dbSchema.sql](file:///c:/Users/newto/OneDrive/00%20-%20Apps/site-vl/api/_lib/dbSchema.sql) (inclui `mp_orders`, `payment_events` com `order_id`, RLS e `SECURITY DEFINER` com `SET search_path = ''`).
3. Em **Project Settings → API Keys**, copie:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY` (`sb_secret_...`).

### Etapa 2 — Configurar Segredos Internos e Proposta Fictícia
1. Configure no servidor: `PROPOSAL_SIGNING_SECRET`, `DOCUMENT_HASH_SALT`, `DELIVERY_ADMIN_SECRET` (ou `DELIVERY_OPERATORS_JSON`).
2. Defina `ALLOW_DEMO_PROPOSAL=true` apenas em homologação (`false` em produção).

### Etapa 3 — Configurar APIPJ (`apipj.com.br`)
1. Gere e configure `APIPJ_API_KEY` nas variáveis de servidor.

### Etapa 4 — Configurar Aplicação Mercado Pago (Checkout Pro via Orders)
1. No painel **Mercado Pago Developers**:
   - Em **Suas integrações → Vitrine Local - Sites → Credenciais** (seletor em **Teste**), localize o **User ID** numérico da conta de teste exibido na seção **Conta de teste** (ou em **Contas de teste** no menu lateral da aplicação).
   - Copie o **Access Token de Teste** gerado para a aplicação (ou da conta vendedora de teste).
   - Confirme em *Configurações → Meios de pagamento → Checkout Pro* que **Pix** está ativo e o parcelamento máximo de **Cartão de Crédito** está configurado para **até 10x**.
2. Configure no servidor:
   - `MP_ENVIRONMENT=test`
   - `ALLOW_REAL_CHARGES=false`
   - `MP_TEST_ACCOUNT_ID=<User-ID-numerico-da-conta-de-teste>` *(obrigatório em homologação; validado em `GET /users/me` antes de qualquer `POST /v1/orders`)*
   - `MERCADOPAGO_ACCESS_TOKEN=<access-token-de-teste>`
   - `APP_PUBLIC_URL=https://<sua-url-homologacao>`
3. Em **Webhooks → Configurar notificações** no painel Mercado Pago:
   - URL: `https://<sua-url-homologacao>/api/mercadopago/webhook`
   - Eventos: marque **`Orders`** (`order`) e **`Chargebacks`** (`chargeback`) — opcionalmente `Payments` (`payment`).
   - Copie a **Chave secreta (Webhook Secret)** para `MERCADOPAGO_WEBHOOK_SECRET`.

### Etapa 5 — Executar Contratação Fictícia de Ponta a Ponta
1. Acesse `/sites/contratar?proposta=VL-DEMO-001`.
2. Teste CNPJ, domínio, manutenção opcional (não pré-selecionada) e registre o aceite (`contract_versions` + `contract_acceptances`).
3. Clique em **“Simular Order Checkout Pro (Ambiente de Teste)”**: o servidor comprovará `test_user` em `/users/me`, chamará `POST /v1/orders` com `X-Idempotency-Key`, gravará a Order em `mp_orders` e exibirá o link `checkout_url`.
4. Abra o `checkout_url` logado com a conta **Comprador de teste** e teste pagamento com cartão de teste (até 10x) e/ou Pix de teste.
5. Confirme no Supabase em `payment_events` que o webhook `order` foi validado por HMAC, conciliado em valor e `external_reference`, e gravado de forma idempotente.
6. Como operador interno, execute `POST /api/proposals/confirm-delivery` com `Authorization: Bearer <DELIVERY_ADMIN_SECRET>` e verifique `site_deliveries` e `post_12m_lifecycle_states`.

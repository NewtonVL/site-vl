# Arquitetura Mercado Pago (Checkout Pro via Orders API) — Solução `/sites`

> **Status:** Arquitetura e código de homologação local (sem credenciais reais no repositório, sem cobrança real e sem deploy em produção).

---

## 1. Visão Geral da Arquitetura (Checkout Pro + Orders API)

1. **Fonte de verdade no servidor:**
   - Os valores de cada proposta individual (`basePriceCents`, desconto de 20% no Pix, encargos por parcela no cartão até 10x) residem exclusivamente no servidor (`api/_lib/proposalsStore.ts` / banco PostgreSQL).
   - O navegador nunca define preço, desconto ou valor enviado ao Mercado Pago.

2. **Aceite explícito antes do pagamento:**
   - `POST /api/proposals/accept` valida identificação, domínio, manutenção opcional (sem pré-seleção) e aceites obrigatórios, persistindo em `contract_versions` e `contract_acceptances`.

3. **Criação da Order no Servidor (`POST /api/mercadopago/create-order` → `POST /v1/orders`):**
   - Implementado em [create-order.ts](file:///c:/Users/newto/OneDrive/00%20-%20Apps/site-vl/api/mercadopago/create-order.ts).
   - Envia `type: "online"`, `processing_mode: "manual"`, `total_amount` calculado exclusivamente no servidor, `external_reference: "${proposalId}:${acceptanceId}"` e cabeçalho `X-Idempotency-Key`.
   - Persiste `order_id`, `expected_amount_cents`, `checkout_url` e `idempotency_key` na tabela `mp_orders`.
   - **Isolamento do ambiente de teste:**
     - Em `MP_ENVIRONMENT=test`, o servidor **comprova previamente** via `GET /users/me` que o Access Token pertence a uma conta `test_user` (aceitando tokens `APP_USR-...` ou `TEST-...` de teste; rejeitando com `403` qualquer token sem tag `test_user`).
     - Apenas após comprovar `test_user` (ou em produção com `ALLOW_REAL_CHARGES=true`) o `checkout_url` é retornado para redirecionamento.

4. **Comportamento de Pix e Parcelamento em até 10x no Checkout Pro via Orders:**
   - Na API de Orders do Checkout Pro (`POST /v1/orders`), a exibição dos meios de pagamento e o limite de parcelas são controlados pela **configuração da conta no Painel do Mercado Pago** (*Configurações → Meios de pagamento → Checkout Pro*):
     - **Pix (20% de desconto):** fica disponível automaticamente no checkout desde que a conta vendedora tenha chave Pix ativa. O servidor cria a Order com o valor já descontado em 20% quando o cliente seleciona Pix.
     - **Cartão (até 10x):** o painel do Mercado Pago deve estar configurado para aceitar parcelamento até **10x** (com os encargos alinhados à tabela exibida na proposta).
   - **Conciliação defensiva no servidor:** como o Checkout Pro pode exibir outros meios ativos na conta caso não haja restrição na interface do painel, o webhook concilia `total_amount` e `external_reference` da Order contra `mp_orders` / `contract_acceptances` antes de confirmar o pagamento.

5. **Webhook de Evento `order` (`api/mercadopago/webhook.ts`):**
   - Valida a assinatura HMAC `x-signature` contra `MERCADOPAGO_WEBHOOK_SECRET`.
   - Para eventos `order` (`type === "order"` ou `action` iniciado por `order.`), consulta `GET https://api.mercadopago.com/v1/orders/{id}`.
   - Concilia `external_reference` e `total_amount` (em centavos) antes de registrar pagamento confirmado (`status === "processed"`). Divergências geram `reconciliation_mismatch` + `operational_alert = true` + `transfer_eligible = false`.
   - Persiste tudo de forma idempotente em `payment_events`.

---

## 2. Transferência do Site e Ocorrências Financeiras
- **Compra confirmada (`processed` / `approved`) e entrega:** Preserva a possibilidade de transferência do site após a entrega, sem condicioná-la ao pagamento das faturas futuras do cartão ao emissor.
- **Estornos, cancelamentos e contestações (`refunded`, `cancelled`, `charged_back`, `in_mediation` e tópico `chargeback`):** Tratados separadamente (`transfer_eligible = false`, `operational_alert = true`).

# Procedimento Operacional Manual — Cobrança Mensal Individual (Pix / Link)

> **Modelo adotado:** Cobrança mensal **INDIVIDUAL** por **Pix ou link de pagamento** para os planos de **R$ 49,90/mês** e **R$ 29,90/mês**. **Não** existe assinatura recorrente nem cobrança automática. O pagamento do site continua sendo uma transação separada. Este procedimento é **manual e verificável** para os primeiros clientes (não é automação).

---

## 1. Regras de Emissão, Vencimento, Conferência e Prevenção de Duplicidade

| Regra | Plano R$ 49,90/mês (Manutenção) | Hospedagem Avulsa R$ 29,90/mês |
| :--- | :--- | :--- |
| **Quem emite cada cobrança** | Operador Financeiro / Comercial da Vitrine Local | Operador Financeiro / Comercial da Vitrine Local |
| **Quando pode começar** | **Se escolhido na contratação:** 1ª mensalidade devida a partir da entrega efetiva (`delivered_at` em `site_deliveries`). **Se escolhido após os 12 meses:** somente após registro de aceite expresso. | **Somente após os 12 meses** (`month_12_ends_at`) **e após registro de aceite expresso** em `post_12m_continuity_acceptances`. Nunca cobrar junto com R$ 49,90 nos primeiros 12 meses. |
| **Data de vencimento mensal** | Dia-base correspondente ao dia de `delivered_at` (ex.: entrega dia 18 -> vencimento todo dia 18, ou próximo dia útil), competência `YYYY-MM`. | Dia-base após o término dos 12 meses e aceite expresso, competência `YYYY-MM`. |
| **Como evitar cobrança duplicada** | Consultar antes a tabela `monthly_maintenance_invoices` / controle por chave única `(proposal_id, competence_month)`. A restrição `UNIQUE (proposal_id, competence_month)` no banco impede duas faturas para o mesmo mês. | Mesma chave única `(proposal_id, competence_month)` em `monthly_maintenance_invoices`. |
| **Como conferir e registrar o pagamento** | Conferir no painel Mercado Pago / extrato bancário o `external_payment_id` (Pix ou Link), atualizar `payment_status = 'paid'`, `paid_at` e `external_payment_id`. | Mesma conferência de compensação e registro de `external_payment_id` + `paid_at`. |
| **Regra do mês 12 (sem novo aceite)** | Encerrar emissões ao fim do 12º mês se não houver novo aceite expresso após aviso prévio de 30 dias. | Não iniciar cobrança sem aceite expresso. |

---

## 2. Fluxo Mensal de Conferência (Passo a Passo Manual)

1. **Semana 1 a 4 — Verificação de entregas e vencimentos:**
   - Consultar `site_deliveries` (`delivered_at`) para identificar clientes que optaram por `monthly_49_90` na contratação e clientes próximos de `notice_30d_due_at`, `month_12_ends_at` ou `grace_15d_ends_at`.
2. **Emissão da cobrança mensal individual:**
   - Antes de gerar o Pix ou Link de Pagamento avulso no Mercado Pago, verificar se já existe registro para `(proposal_id, YYYY-MM)` em `monthly_maintenance_invoices`.
   - Registrar a fatura como `pending` com `issued_by`, `due_at` e `competence_month` antes de enviar ao cliente via WhatsApp/e-mail.
3. **Baixa após pagamento:**
   - Ao confirmar o recebimento no painel do Mercado Pago, gravar `payment_status = 'paid'`, `paid_at` e `external_payment_id`.
4. **Marco de 12 meses (aviso de 30 dias + tolerância de 15 dias):**
   - Enviar aviso prévio com 30 dias de antecedência (`notice_30d_due_at`), inclusive para quem paga R$ 49,90/mês.
   - Sem aceite expresso até `month_12_ends_at`: encerrar emissões/cobranças, manter o site disponível por 15 dias corridos sem cobrança e sem alterações de conteúdo, e enviar último aviso antes de eventual suspensão (preservando os arquivos).

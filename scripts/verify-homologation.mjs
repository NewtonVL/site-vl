/**
 * Script de verificação ponta a ponta contra a URL HTTPS da Preview de homologação.
 * Uso:
 *   $env:HOMOLOGATION_BASE_URL="https://site-vl-git-homologacao-...vercel.app"
 *   node scripts/verify-homologation.mjs
 *
 * Não imprime segredos nem cria cobranças reais.
 */

const baseUrl = (process.env.HOMOLOGATION_BASE_URL || '').trim().replace(/\/+$/, '');
if (!baseUrl || !baseUrl.startsWith('https://')) {
  console.error('Defina HOMOLOGATION_BASE_URL com uma URL HTTPS válida da Preview.');
  process.exit(1);
}

async function run() {
  console.log(`1. Consultando proposta fictícia VL-DEMO-001 em ${baseUrl}...`);
  const propRes = await fetch(`${baseUrl}/api/proposals/get?id=VL-DEMO-001`);
  if (!propRes.ok) {
    throw new Error(`Falha em GET /api/proposals/get: HTTP ${propRes.status}`);
  }
  const proposal = await propRes.json();
  console.log(`   OK: proposta ${proposal.id}, versão ${proposal.contractVersion}`);

  console.log('2. Registrando aceite explícito no Supabase de homologação...');
  const acceptRes = await fetch(`${baseUrl}/api/proposals/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposalId: proposal.id,
      contractVersion: proposal.contractVersion,
      client: {
        legalName: 'Empresa Teste Homologação Ltda',
        documentType: 'CNPJ',
        documentNumber: '11.222.333/0001-81',
        responsibleName: 'Responsável Teste',
        confirmedLegalPowers: true,
        email: 'teste-homologacao@exemplo.com.br',
        whatsapp: '(61) 99999-0000',
      },
      selections: {
        domainOption: 'register_own',
        domainName: 'teste-homologacao.com.br',
        maintenanceOption: 'none',
        paymentMethod: 'pix',
        selectedInstallments: 1,
      },
      consents: {
        acceptedContractDraft: true,
        acceptedMaintenanceSpecific: false,
        acceptedPrivacyNotice: true,
      },
    }),
  });
  if (!acceptRes.ok) {
    const errText = await acceptRes.text();
    throw new Error(`Falha em POST /api/proposals/accept: HTTP ${acceptRes.status} ${errText}`);
  }
  const receipt = await acceptRes.json();
  if (receipt.storageMode !== 'durable_postgres') {
    throw new Error(`Esperado storageMode=durable_postgres, recebido=${receipt.storageMode}`);
  }
  console.log(`   OK: aceite ${receipt.acceptanceId} persistido (${receipt.storageMode})`);

  console.log('3. Criando Order Checkout Pro de teste (validando MP_TEST_ACCOUNT_ID)...');
  const orderRes = await fetch(`${baseUrl}/api/mercadopago/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposalId: proposal.id,
      payerEmail: 'comprador-teste@exemplo.com.br',
      acceptanceReceipt: receipt,
    }),
  });
  if (!orderRes.ok) {
    const errText = await orderRes.text();
    throw new Error(`Falha em POST /api/mercadopago/create-order: HTTP ${orderRes.status} ${errText}`);
  }
  const order = await orderRes.json();
  console.log(
    `   OK: Order ${order.orderId} criada em modo ${order.mode} (checkoutUrl presente: ${Boolean(order.checkoutUrl)})`,
  );

  console.log('4. Verificando rejeição de webhook sem assinatura válida (401)...');
  const webhookUnauth = await fetch(`${baseUrl}/api/mercadopago/webhook?type=order&data.id=${encodeURIComponent(order.orderId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'order', action: 'order.processed', data: { id: order.orderId } }),
  });
  if (webhookUnauth.status !== 401) {
    throw new Error(`Esperado 401 para webhook sem assinatura, recebido ${webhookUnauth.status}`);
  }
  console.log('   OK: webhook sem assinatura rejeitado com HTTP 401 (endpoint acessível externamente).');
  console.log('\nPróximo passo manual: abra checkoutUrl com o Comprador de Teste para testar pagamento aprovado/recusado.');
}

run().catch((err) => {
  console.error('Erro na verificação de homologação:', err.message);
  process.exit(1);
});

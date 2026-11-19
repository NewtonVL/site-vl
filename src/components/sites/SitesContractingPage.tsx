import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Globe,
  Lock,
  Mail,
  MessageCircle,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  CONTRACT_DRAFT_CLAUSES,
  CONTRACT_DRAFT_METADATA,
  CONTRACT_DRAFT_VERSION,
} from '../../config/contractDraft';
import { buildWhatsAppLink } from '../../config/sitesLanding';
import type {
  ClientIdentification,
  CnpjLookupResponse,
  ContractAcceptanceReceipt,
  DomainOption,
  MaintenanceOption,
  MercadoPagoTestOrderResult,
  PaymentMethodOption,
  ProposalSummary,
} from '../../types/contracting';
import {
  formatCurrencyBRL,
  formatDocumentMask,
  formatPhoneMask,
  getLocalDemoProposal,
  isValidCnpj,
  isValidDocumentLength,
  maskDocumentForReceipt,
  normalizeCnpj,
  normalizeDomainInput,
} from '../../utils/contractingFormatters';

interface SitesContractingPageProps {
  onNavigateSites: () => void;
}

export const SitesContractingPage: React.FC<SitesContractingPageProps> = ({
  onNavigateSites,
}) => {
  const initialProposalId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return (params.get('proposta') || params.get('p') || '').trim();
  }, []);

  const initialAccessToken = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return (params.get('token') || '').trim();
  }, []);

  const mpReturnStatus = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('mp_status');
  }, []);

  const [proposalCodeInput, setProposalCodeInput] = useState(initialProposalId);
  const [accessTokenInput, setAccessTokenInput] = useState(initialAccessToken);
  const [proposal, setProposal] = useState<ProposalSummary | null>(null);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Etapa 2: Identificação do cliente
  const [client, setClient] = useState<ClientIdentification>({
    legalName: '',
    tradeName: '',
    companyAddress: '',
    registrationStatus: '',
    cnpjLookupSource: '',
    documentType: 'CNPJ',
    documentNumber: '',
    responsibleName: '',
    confirmedLegalPowers: false,
    email: '',
    whatsapp: '',
  });
  const [lookingUpCnpj, setLookingUpCnpj] = useState(false);
  const [cnpjLookupNotice, setCnpjLookupNotice] = useState<{
    type: 'info' | 'warning';
    text: string;
  } | null>(null);

  // Etapa 3: Domínio
  const [domainOption, setDomainOption] = useState<DomainOption | null>(null);
  const [domainName, setDomainName] = useState('');

  // Etapa 4: Manutenção (NUNCA pré-selecionada)
  const [maintenanceOption, setMaintenanceOption] = useState<MaintenanceOption | null>(null);

  // Etapa 5: Pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | null>(null);
  const [selectedInstallments, setSelectedInstallments] = useState<number>(10);

  // Etapa 6: Contrato Digital & Aceites explícitos
  const [showContractModal, setShowContractModal] = useState(false);
  const [acceptedContractDraft, setAcceptedContractDraft] = useState(false);
  const [acceptedMaintenanceSpecific, setAcceptedMaintenanceSpecific] = useState(false);
  const [acceptedPrivacyNotice, setAcceptedPrivacyNotice] = useState(false);

  // Submissão e Checkout de Teste
  const [submittingAcceptance, setSubmittingAcceptance] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [acceptanceReceipt, setAcceptanceReceipt] = useState<ContractAcceptanceReceipt | null>(
    null,
  );
  const [preparingCheckout, setPreparingCheckout] = useState(false);
  const [mpOrderResult, setMpOrderResult] =
    useState<MercadoPagoTestOrderResult | null>(null);

  useEffect(() => {
    document.title = 'Contratação Individual | Vitrine Local & NEWNEO';
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const createdRobots = !metaRobots;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    const prev = metaRobots.content;
    metaRobots.content = 'noindex, nofollow';

    return () => {
      if (createdRobots && metaRobots?.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      } else if (metaRobots) {
        metaRobots.content = prev || 'index, follow';
      }
    };
  }, []);

  const loadProposalById = async (rawId: string, rawToken = accessTokenInput) => {
    const cleanId = rawId.trim().toUpperCase();
    const cleanToken = rawToken.trim();
    if (!cleanId) {
      setProposalError('Informe o código da sua proposta individual.');
      return;
    }

    setLoadingProposal(true);
    setProposalError(null);
    setAcceptanceReceipt(null);
    setMpOrderResult(null);

    try {
      const qs = new URLSearchParams({ id: cleanId });
      if (cleanToken) qs.set('token', cleanToken);
      const response = await fetch(`/api/proposals/get?${qs.toString()}`);
      const contentType = response.headers.get('content-type') || '';

      if (response.ok && contentType.includes('application/json')) {
        const data = (await response.json()) as ProposalSummary;
        setProposal(data);
        setSelectedInstallments(data.cardMaxInstallments);
        setLoadingProposal(false);
        return;
      }

      if (response.status >= 400 && response.status < 500 && contentType.includes('application/json')) {
        const errData = (await response.json()) as { error?: string };
        setProposal(null);
        setProposalError(errData.error || 'Acesso não autorizado ou proposta não encontrada.');
        setLoadingProposal(false);
        return;
      }

      // Fallback estritamente restrito a VL-DEMO-001 em ambiente de desenvolvimento local
      const localDemo =
        import.meta.env.DEV && cleanId === 'VL-DEMO-001' ? getLocalDemoProposal(cleanId) : null;
      if (localDemo) {
        setProposal(localDemo);
        setSelectedInstallments(localDemo.cardMaxInstallments);
      } else {
        setProposal(null);
        setProposalError(
          'Proposta não encontrada ou servidor indisponível. Solicite seu link completo com token no WhatsApp.',
        );
      }
    } catch {
      const localDemo =
        import.meta.env.DEV && cleanId === 'VL-DEMO-001' ? getLocalDemoProposal(cleanId) : null;
      if (localDemo) {
        setProposal(localDemo);
        setSelectedInstallments(localDemo.cardMaxInstallments);
      } else {
        setProposalError('Não foi possível consultar a proposta no servidor.');
      }
    } finally {
      setLoadingProposal(false);
    }
  };

  useEffect(() => {
    if (!initialProposalId) return;
    let active = true;
    const fetchInitial = async () => {
      const cleanId = initialProposalId.trim().toUpperCase();
      try {
        const qs = new URLSearchParams({ id: cleanId });
        if (initialAccessToken) qs.set('token', initialAccessToken);
        const response = await fetch(`/api/proposals/get?${qs.toString()}`);
        const contentType = response.headers.get('content-type') || '';
        if (active && response.ok && contentType.includes('application/json')) {
          const data = (await response.json()) as ProposalSummary;
          setProposal(data);
          setSelectedInstallments(data.cardMaxInstallments);
          return;
        }
        if (active && response.status >= 400 && response.status < 500 && contentType.includes('application/json')) {
          const errData = (await response.json()) as { error?: string };
          setProposalError(errData.error || 'Acesso não autorizado à proposta.');
          return;
        }
      } catch {
        // Fallback apenas para VL-DEMO-001 em ambiente dev local
      }
      if (!active) return;
      const localDemo =
        import.meta.env.DEV && cleanId === 'VL-DEMO-001' ? getLocalDemoProposal(cleanId) : null;
      if (localDemo) {
        setProposal(localDemo);
        setSelectedInstallments(localDemo.cardMaxInstallments);
      } else {
        setProposalError(
          'Proposta não encontrada ou token inválido. Verifique o link enviado pela Vitrine Local.',
        );
      }
    };
    void fetchInitial();
    return () => {
      active = false;
    };
  }, [initialProposalId, initialAccessToken]);

  const selectedInstallmentInfo = useMemo(() => {
    if (!proposal) return null;
    return (
      proposal.cardInstallmentOptions.find((o) => o.installments === selectedInstallments) ||
      proposal.cardInstallmentOptions[proposal.cardInstallmentOptions.length - 1]
    );
  }, [proposal, selectedInstallments]);

  const currentCalculatedAmountCents = useMemo(() => {
    if (!proposal || !paymentMethod) return null;
    if (paymentMethod === 'pix') return proposal.pixFinalPriceCents;
    return selectedInstallmentInfo?.totalAmountCents ?? proposal.basePriceCents;
  }, [proposal, paymentMethod, selectedInstallmentInfo]);

  const normalizedDomain = normalizeDomainInput(domainName);
  const cnpjDigitsCount = normalizeCnpj(client.documentNumber).length;
  const isCnpjValid = client.documentType === 'CNPJ' && isValidCnpj(client.documentNumber);
  const isDocumentValid =
    client.documentType === 'CPF'
      ? isValidDocumentLength(client.documentNumber, 'CPF')
      : isCnpjValid;

  const isClientValid =
    client.legalName.trim().length >= 3 &&
    client.responsibleName.trim().length >= 3 &&
    client.email.includes('@') &&
    client.whatsapp.replace(/\D/g, '').length >= 10 &&
    isDocumentValid &&
    (client.documentType !== 'CNPJ' || Boolean(client.confirmedLegalPowers));

  const isDomainValid =
    domainOption !== null && (normalizedDomain === '' || normalizedDomain.includes('.'));
  const isMaintenanceValid = maintenanceOption !== null;
  const isPaymentValid = paymentMethod !== null;
  const isConsentsValid =
    acceptedContractDraft &&
    acceptedPrivacyNotice &&
    (maintenanceOption !== 'monthly_49_90' || acceptedMaintenanceSpecific);

  const canSubmitAcceptance =
    Boolean(proposal) &&
    isClientValid &&
    isDomainValid &&
    isMaintenanceValid &&
    isPaymentValid &&
    isConsentsValid;

  const handleCnpjLookup = async () => {
    if (!proposal || !isCnpjValid) return;
    setLookingUpCnpj(true);
    setCnpjLookupNotice(null);

    try {
      const response = await fetch('/api/proposals/cnpj-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.id,
          accessToken: accessTokenInput || undefined,
          cnpj: client.documentNumber,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = (await response.json()) as CnpjLookupResponse;
        setClient((prev) => ({
          ...prev,
          legalName: data.razaoSocial || prev.legalName,
          tradeName: data.nomeFantasia || '',
          companyAddress: data.endereco || '',
          registrationStatus: data.situacaoCadastral || '',
          cnpjLookupSource: data.source,
        }));
        setCnpjLookupNotice({
          type: 'info',
          text: `Dados preenchidos com auxílio de ${data.source}. Confira e corrija se necessário antes do aceite; a base é mensal e não substitui validação de identidade ou representação legal.`,
        });
        return;
      }

      if (contentType.includes('application/json')) {
        const errData = (await response.json()) as { error?: string };
        setCnpjLookupNotice({
          type: 'warning',
          text:
            errData.error ||
            'Consulta automática indisponível no momento. Preencha os dados manualmente.',
        });
        return;
      }

      setCnpjLookupNotice({
        type: 'warning',
        text: 'Consulta automática indisponível neste ambiente local. Preencha os dados da empresa manualmente.',
      });
    } catch {
      setCnpjLookupNotice({
        type: 'warning',
        text: 'Não foi possível consultar o CNPJ agora. Continue preenchendo os dados manualmente.',
      });
    } finally {
      setLookingUpCnpj(false);
    }
  };

  const handleRecordAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal || !canSubmitAcceptance || !domainOption || !maintenanceOption || !paymentMethod) {
      setSubmitError('Preencha todos os campos obrigatórios e confirme os aceites explícitos.');
      return;
    }

    setSubmittingAcceptance(true);
    setSubmitError(null);

    const payload = {
      proposalId: proposal.id,
      accessToken: accessTokenInput || undefined,
      contractVersion: proposal.contractVersion,
      client,
      selections: {
        domainOption,
        domainName: normalizedDomain || 'a_definir_na_implantacao',
        maintenanceOption,
        paymentMethod,
        selectedInstallments: paymentMethod === 'pix' ? 1 : selectedInstallments,
      },
      consents: {
        acceptedContractDraft,
        acceptedMaintenanceSpecific:
          maintenanceOption === 'monthly_49_90' ? acceptedMaintenanceSpecific : false,
        acceptedPrivacyNotice,
      },
    };

    try {
      const response = await fetch('/api/proposals/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const receipt = (await response.json()) as ContractAcceptanceReceipt;
        setAcceptanceReceipt(receipt);
        setSubmittingAcceptance(false);
        return;
      }

      if (response.status >= 400 && contentType.includes('application/json')) {
        const errData = (await response.json()) as { error?: string };
        setSubmitError(errData.error || 'Erro ao validar ou persistir o aceite.');
        setSubmittingAcceptance(false);
        return;
      }

      // Nunca registrar aceite falso no navegador para propostas reais; apenas VL-DEMO-001 em dev local
      if (!(import.meta.env.DEV && proposal.isDemoPreview && proposal.id === 'VL-DEMO-001')) {
        setSubmitError(
          'Servidor de persistência indisponível. Não é possível registrar aceite real sem banco de dados.',
        );
        setSubmittingAcceptance(false);
        return;
      }

      const localReceipt: ContractAcceptanceReceipt = {
        acceptanceId: `acc_demo_${Date.now()}`,
        proposalId: proposal.id,
        contractVersion: proposal.contractVersion,
        contractTextSha256: 'demo-local-preview-hash',
        acceptedAt: new Date().toISOString(),
        domainOption,
        domainName: normalizedDomain || 'a_definir_na_implantacao',
        maintenanceOption,
        maintenanceAccepted: maintenanceOption === 'monthly_49_90',
        paymentMethod,
        selectedInstallments: paymentMethod === 'pix' ? 1 : selectedInstallments,
        serverCalculatedAmountCents: currentCalculatedAmountCents ?? proposal.basePriceCents,
        clientDocumentMasked: maskDocumentForReceipt(client.documentNumber, client.documentType),
        integritySignature: 'demo-local-preview-not-persisted',
        storageMode: 'local_preview',
      };
      setAcceptanceReceipt(localReceipt);
    } catch {
      if (!(import.meta.env.DEV && proposal.isDemoPreview && proposal.id === 'VL-DEMO-001')) {
        setSubmitError(
          'Falha de conexão com o servidor. Nenhum aceite real foi registrado.',
        );
        setSubmittingAcceptance(false);
        return;
      }
      const localReceipt: ContractAcceptanceReceipt = {
        acceptanceId: `acc_demo_${Date.now()}`,
        proposalId: proposal.id,
        contractVersion: proposal.contractVersion,
        contractTextSha256: 'demo-local-preview-hash',
        acceptedAt: new Date().toISOString(),
        domainOption,
        domainName: normalizedDomain || 'a_definir_na_implantacao',
        maintenanceOption,
        maintenanceAccepted: maintenanceOption === 'monthly_49_90',
        paymentMethod,
        selectedInstallments: paymentMethod === 'pix' ? 1 : selectedInstallments,
        serverCalculatedAmountCents: currentCalculatedAmountCents ?? proposal.basePriceCents,
        clientDocumentMasked: maskDocumentForReceipt(client.documentNumber, client.documentType),
        integritySignature: 'demo-local-preview-not-persisted',
        storageMode: 'local_preview',
      };
      setAcceptanceReceipt(localReceipt);
    } finally {
      setSubmittingAcceptance(false);
    }
  };

  const handlePrepareTestCheckout = async () => {
    if (!proposal || !acceptanceReceipt) return;
    setPreparingCheckout(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/mercadopago/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.id,
          accessToken: accessTokenInput || undefined,
          payerEmail: client.email,
          acceptanceReceipt,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const result = (await response.json()) as MercadoPagoTestOrderResult;
        setMpOrderResult(result);
        setPreparingCheckout(false);
        return;
      }

      if (contentType.includes('application/json')) {
        const errData = (await response.json()) as { error?: string; detail?: string };
        const detailSuffix = errData.detail ? ` (${errData.detail})` : '';
        setSubmitError(
          `${errData.error || `Falha ao preparar Order (${response.status}).`}${detailSuffix}`,
        );
        setPreparingCheckout(false);
        return;
      }

      if (!(import.meta.env.DEV && proposal.isDemoPreview && proposal.id === 'VL-DEMO-001')) {
        setSubmitError(
          `Não foi possível preparar a Order no servidor (HTTP ${response.status}).`,
        );
        setPreparingCheckout(false);
        return;
      }

      setMpOrderResult({
        mode: 'architecture_dry_run',
        provider: 'mercadopago_orders',
        environment: 'test',
        orderId: `dryrun_ord_${acceptanceReceipt.acceptanceId}`,
        externalReference: `${proposal.id}:${acceptanceReceipt.acceptanceId}`,
        amountCents: acceptanceReceipt.serverCalculatedAmountCents,
        paymentMethod: acceptanceReceipt.paymentMethod,
        maxInstallments:
          acceptanceReceipt.paymentMethod === 'pix' ? 1 : proposal.cardMaxInstallments,
        message:
          'Simulação local concluída: Order Checkout Pro estruturada sem cobrança real e sem credenciais expostas no navegador.',
      });
    } catch {
      if (!(import.meta.env.DEV && proposal.isDemoPreview && proposal.id === 'VL-DEMO-001')) {
        setSubmitError('Erro de conexão ao preparar a Order Checkout Pro.');
        setPreparingCheckout(false);
        return;
      }
      setMpOrderResult({
        mode: 'architecture_dry_run',
        provider: 'mercadopago_orders',
        environment: 'test',
        orderId: `dryrun_ord_${acceptanceReceipt.acceptanceId}`,
        externalReference: `${proposal.id}:${acceptanceReceipt.acceptanceId}`,
        amountCents: acceptanceReceipt.serverCalculatedAmountCents,
        paymentMethod: acceptanceReceipt.paymentMethod,
        maxInstallments:
          acceptanceReceipt.paymentMethod === 'pix' ? 1 : proposal.cardMaxInstallments,
        message:
          'Simulação local concluída: Order Checkout Pro estruturada sem cobrança real e sem credenciais expostas no navegador.',
      });
    } finally {
      setPreparingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white font-sans antialiased selection:bg-brand selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090C]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onNavigateSites}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-brand" />
            <span>Voltar para /sites</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-brand" />
            <span>Ambiente de Proposta Individual & Teste</span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Aviso de status de retorno Mercado Pago (se houver) */}
        {mpReturnStatus && (
          <div className="mb-6 rounded-xl border border-brand/30 bg-brand/10 p-4 text-xs sm:text-sm text-zinc-200">
            Retorno do ambiente de teste Mercado Pago: <strong>{mpReturnStatus}</strong>. Nenhuma
            transferência definitiva é liberada apenas pelo retorno visual; o servidor valida o
            webhook e a quitação conforme contrato.
          </div>
        )}

        {/* Cabeçalho */}
        <div className="mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contratação Individual • Sem Preço Público Genérico</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Proposta & Contratação Digital
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
            Revise o escopo personalizado da sua proposta, defina domínio e manutenção opcional,
            leia a minuta do contrato versionado e registre seu aceite explícito antes do
            pagamento.
          </p>
        </div>

        {/* Gate de Proposta Individual */}
        {!proposal && (
          <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              Acesse sua proposta individual
            </h2>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              Como cada projeto da Vitrine Local & NEWNEO possui escopo e condições
              personalizadas, não exibimos tabela genérica pública. Informe o código da sua
              proposta recebido no atendimento.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={proposalCodeInput}
                onChange={(e) => setProposalCodeInput(e.target.value)}
                placeholder="Código (ex.: VL-2026-001)"
                aria-label="Código da proposta"
                className="flex-1 rounded-xl border border-white/15 bg-[#08090C] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
              />
              <input
                type="password"
                value={accessTokenInput}
                onChange={(e) => setAccessTokenInput(e.target.value)}
                placeholder="Token individual da proposta"
                aria-label="Token individual da proposta"
                className="flex-1 rounded-xl border border-white/15 bg-[#08090C] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                disabled={loadingProposal}
                onClick={() => void loadProposalById(proposalCodeInput, accessTokenInput)}
                className="rounded-xl bg-brand hover:bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              >
                {loadingProposal ? 'Carregando...' : 'Abrir Proposta'}
              </button>
            </div>

            {proposalError && (
              <p className="mt-3 text-xs sm:text-sm text-red-400">{proposalError}</p>
            )}

            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {import.meta.env.DEV ? (
                <button
                  type="button"
                  onClick={() => {
                    setProposalCodeInput('VL-DEMO-001');
                    setAccessTokenInput('');
                    void loadProposalById('VL-DEMO-001', '');
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-brand hover:bg-brand/15 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Carregar demonstração fictícia local (VL-DEMO-001)</span>
                </button>
              ) : (
                <span className="text-xs text-zinc-400">
                  Acesso restrito a propostas individuais com código e token válidos.
                </span>
              )}

              <a
                href={buildWhatsAppLink('commercial_contract')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-brand" />
                <span>Solicitar proposta no WhatsApp</span>
              </a>
            </div>
          </section>
        )}

        {/* Fluxo completo quando uma proposta individual está carregada */}
        {proposal && (
          <form onSubmit={handleRecordAcceptance} className="space-y-8">
            {/* Banner de Minuta / Ambiente de Teste */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                <strong className="block text-amber-300">
                  {CONTRACT_DRAFT_METADATA.statusLabel}
                </strong>
                <span>
                  Fluxo local em ambiente de teste. Nenhuma cobrança real será efetuada nesta
                  etapa.
                </span>
              </div>
            </div>

            {/* Etapa 1: Escopo e Valor da Proposta Individual */}
            <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-brand">
                    Etapa 01 • Proposta {proposal.id}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {proposal.clientDisplayName}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Segmento: {proposal.businessSegment} • Validade: {proposal.validUntil}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-zinc-400 block">Valor base da proposta</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrencyBRL(proposal.basePriceCents)}
                  </span>
                  <span className="text-xs text-emerald-400 block">
                    Pix à vista ({proposal.pixDiscountPercent}% off):{' '}
                    {formatCurrencyBRL(proposal.pixFinalPriceCents)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-5 border-t border-white/10">
                {proposal.includedItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Etapa 2: Identificação do Cliente */}
            <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 sm:p-8">
              <span className="text-xs font-mono uppercase tracking-wider text-brand">
                Etapa 02 • Identificação do Contratante
              </span>
              <h2 className="text-xl font-bold text-white mt-1 mb-5">
                Dados para contrato e titularidade do domínio
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Tipo de Documento *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['CNPJ', 'CPF'] as const).map((docType) => (
                      <button
                        key={docType}
                        type="button"
                        onClick={() => {
                          setCnpjLookupNotice(null);
                          setClient({
                            ...client,
                            documentType: docType,
                            documentNumber: '',
                            tradeName: '',
                            companyAddress: '',
                            registrationStatus: '',
                            cnpjLookupSource: '',
                            confirmedLegalPowers: false,
                          });
                        }}
                        className={`rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                          client.documentType === docType
                            ? 'border-brand bg-brand/15 text-white'
                            : 'border-white/15 bg-[#08090C] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {docType}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    {client.documentType} *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      value={client.documentNumber}
                      onChange={(e) => {
                        setCnpjLookupNotice(null);
                        setClient({
                          ...client,
                          documentNumber: formatDocumentMask(e.target.value, client.documentType),
                        });
                      }}
                      placeholder={
                        client.documentType === 'CNPJ'
                          ? '00.000.000/0000-00 ou AA.AAA.AAA/AAAA-00'
                          : '000.000.000-00'
                      }
                      className="flex-1 rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                    />
                    {client.documentType === 'CNPJ' && isCnpjValid && (
                      <button
                        type="button"
                        disabled={lookingUpCnpj}
                        onClick={() => void handleCnpjLookup()}
                        className="shrink-0 rounded-xl border border-brand/40 bg-brand/15 hover:bg-brand/25 px-4 py-2.5 text-xs font-semibold text-white transition-colors disabled:opacity-60"
                      >
                        {lookingUpCnpj ? 'Buscando...' : 'Buscar dados da empresa'}
                      </button>
                    )}
                  </div>
                  {client.documentType === 'CNPJ' && cnpjDigitsCount === 14 && !isCnpjValid && (
                    <p className="mt-1.5 text-xs text-red-400">
                      CNPJ inválido — verifique os dígitos informados.
                    </p>
                  )}
                  {client.documentType === 'CPF' && (
                    <p className="mt-1.5 text-[11px] text-zinc-400">
                      Contratação em CPF utiliza preenchimento manual.
                    </p>
                  )}
                </div>

                {cnpjLookupNotice && (
                  <div
                    className={`sm:col-span-2 rounded-xl border p-3.5 text-xs leading-relaxed ${
                      cnpjLookupNotice.type === 'info'
                        ? 'border-brand/30 bg-brand/10 text-zinc-200'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    }`}
                  >
                    {cnpjLookupNotice.text}
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    {client.documentType === 'CNPJ' ? 'Razão Social *' : 'Nome Completo *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={client.legalName}
                    onChange={(e) => setClient({ ...client, legalName: e.target.value })}
                    placeholder={
                      client.documentType === 'CNPJ'
                        ? 'Ex.: Padaria Modelo Ltda'
                        : 'Ex.: Maria da Silva'
                    }
                    className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                  />
                </div>

                {client.documentType === 'CNPJ' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Nome Fantasia (opcional)
                      </label>
                      <input
                        type="text"
                        value={client.tradeName || ''}
                        onChange={(e) => setClient({ ...client, tradeName: e.target.value })}
                        placeholder="Nome comercial da empresa"
                        className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Situação Cadastral (referência auxiliar)
                      </label>
                      <input
                        type="text"
                        value={client.registrationStatus || ''}
                        onChange={(e) =>
                          setClient({ ...client, registrationStatus: e.target.value })
                        }
                        placeholder="Ex.: ATIVA (opcional)"
                        className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Endereço da Empresa (opcional / editável)
                      </label>
                      <input
                        type="text"
                        value={client.companyAddress || ''}
                        onChange={(e) => setClient({ ...client, companyAddress: e.target.value })}
                        placeholder="Logradouro, número, bairro, município/UF, CEP"
                        className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Nome do Responsável pela Contratação *
                  </label>
                  <input
                    type="text"
                    required
                    value={client.responsibleName}
                    onChange={(e) => setClient({ ...client, responsibleName: e.target.value })}
                    placeholder="Nome completo de quem assina/aprova"
                    className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    WhatsApp de Contato *
                  </label>
                  <input
                    type="tel"
                    required
                    value={client.whatsapp}
                    onChange={(e) =>
                      setClient({ ...client, whatsapp: formatPhoneMask(e.target.value) })
                    }
                    placeholder="(61) 99999-9999"
                    className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    E-mail Principal para Notificações e Comprovante *
                  </label>
                  <input
                    type="email"
                    required
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                    placeholder="contato@suaempresa.com.br"
                    className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                  />
                </div>

                {client.documentType === 'CNPJ' && (
                  <div className="sm:col-span-2 pt-2">
                    <label className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(client.confirmedLegalPowers)}
                        onChange={(e) =>
                          setClient({ ...client, confirmedLegalPowers: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-[#08090C] accent-brand"
                      />
                      <span>
                        Confirmo os dados empresariais acima e declaro que o responsável indicado
                        possui poderes legais para representar e contratar em nome deste CNPJ.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* Etapa 3: Domínio */}
            <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 sm:p-8">
              <span className="text-xs font-mono uppercase tracking-wider text-brand">
                Etapa 03 • Domínio do Projeto
              </span>
              <h2 className="text-xl font-bold text-white mt-1 mb-5">
                Escolha como utilizaremos seu endereço na internet
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <button
                  type="button"
                  onClick={() => setDomainOption('existing')}
                  className={`flex flex-col justify-start text-left rounded-xl border p-4 transition-all ${
                    domainOption === 'existing'
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-[#08090C] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-white">
                    <Globe className="w-4 h-4 text-brand shrink-0" />
                    <span>Já tenho domínio</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                    Utilizaremos o endereço que você já possui. A Vitrine Local orientará e fará a
                    configuração técnica do apontamento para o site, preservando eventuais serviços
                    já ativos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDomainOption('register_own')}
                  className={`flex flex-col justify-start text-left rounded-xl border p-4 transition-all ${
                    domainOption === 'register_own'
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-[#08090C] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-white">
                    <Globe className="w-4 h-4 text-brand shrink-0" />
                    <span>Vou registrar um domínio em meu nome</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                    Você registrará o domínio diretamente no seu CPF/CNPJ (registro e renovações
                    pagos diretamente por você). Não precisa tê-lo pronto agora: pode providenciar
                    durante a implantação, com nossa orientação e apontamento técnico.
                  </p>
                </button>
              </div>

              {domainOption && (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    {domainOption === 'existing'
                      ? 'Informe seu domínio atual (opcional — pode confirmar na implantação)'
                      : 'Domínio pretendido (opcional — você pode escolher e registrar na implantação)'}
                  </label>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="suaempresa.com.br (opcional)"
                    className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                  />
                </div>
              )}
            </section>

            {/* Etapa 4: Manutenção Opcional (NUNCA pré-selecionada) */}
            <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 sm:p-8">
              <span className="text-xs font-mono uppercase tracking-wider text-brand">
                Etapa 04 • Manutenção Mensal Opcional (Escolha Obrigatória)
              </span>
              <h2 className="text-xl font-bold text-white mt-1 mb-2">
                Deseja contratar o plano de manutenção desde a entrega?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mb-5">
                Nenhuma opção vem pré-selecionada. A hospedagem inicial pela Vitrine Local
                permanece incluída pelos primeiros 12 meses a partir da entrega do site, mesmo sem
                plano mensal. Em qualquer opção, avisaremos com pelo menos 30 dias de antecedência
                do fim dos 12 meses; sem novo aceite expresso até o fim do 12º mês, nenhuma
                cobrança é iniciada ou continuada (inclusive o plano de R$ 49,90/mês é encerrado),
                o site segue disponível por mais 15 dias sem cobrança e sem novas alterações para
                decisão ou transferência, e há um último aviso antes de qualquer suspensão (sem
                exclusão automática dos arquivos).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setMaintenanceOption('none');
                    setAcceptedMaintenanceSpecific(false);
                  }}
                  className={`flex flex-col justify-start text-left rounded-xl border p-5 transition-all ${
                    maintenanceOption === 'none'
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-[#08090C] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 w-full">
                    <span className="text-sm font-bold text-white">
                      Sem mensalidade de manutenção
                    </span>
                    <span className="text-xs font-mono text-zinc-400 whitespace-nowrap shrink-0">
                      R$ 0,00/mês
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Inclui 12 meses de hospedagem pela Vitrine Local. Ao final dos 12 meses (com
                    aviso de 30 dias e aceite expresso), você escolhe: hospedagem avulsa por R$
                    29,90/mês, plano de manutenção por R$ 49,90/mês ou transferência do site.
                  </p>
                  <p className="mt-2.5 pt-2.5 border-t border-white/10 text-[11px] text-zinc-400">
                    Alterações no site exigem orçamento prévio e aceite expresso separados.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMaintenanceOption('monthly_49_90')}
                  className={`flex flex-col justify-start text-left rounded-xl border p-5 transition-all ${
                    maintenanceOption === 'monthly_49_90'
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-[#08090C] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 w-full">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      <Wrench className="w-4 h-4 text-brand shrink-0" />
                      <span>Plano de Hospedagem e Manutenção</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-brand whitespace-nowrap shrink-0">
                      R$ 49,90/mês
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Se escolhido expressamente, inicia na entrega do site (sem cobrar os R$ 29,90
                    de hospedagem avulsa nos primeiros 12 meses). Inclui até 2 solicitações de
                    alterações simples por mês, não cumulativas: ajuste de textos curtos, troca de
                    até 2 imagens fornecidas por você ou atualização de links no layout existente.
                  </p>
                  <p className="mt-2.5 pt-2.5 border-t border-white/10 text-[11px] text-zinc-400 leading-relaxed">
                    Prazos: confirmação em até 1 dia útil e conclusão em até 5 dias úteis após
                    recebimento de todos os materiais. Novas páginas, mudanças de layout, integrações
                    e extras exigem orçamento prévio e aceite. Ao fim dos 12 meses, também haverá
                    aviso de 30 dias e registro de aceite expresso para continuidade.
                  </p>
                </button>
              </div>
            </section>

            {/* Etapa 5: Forma de Pagamento */}
            <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 sm:p-8">
              <span className="text-xs font-mono uppercase tracking-wider text-brand">
                Etapa 05 • Condição de Pagamento
              </span>
              <h2 className="text-xl font-bold text-white mt-1 mb-5">
                Escolha entre Pix com desconto ou Cartão em até {proposal.cardMaxInstallments}x
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`text-left rounded-xl border p-5 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-[#08090C] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      Pix à vista
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
                      {proposal.pixDiscountPercent}% de desconto
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {formatCurrencyBRL(proposal.pixFinalPriceCents)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Quitação imediata após confirmação bancária.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`text-left rounded-xl border p-5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand bg-brand/10'
                      : 'border-white/10 bg-[#08090C] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                      <CreditCard className="w-4 h-4 text-brand" />
                      Cartão de Crédito
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      até {proposal.cardMaxInstallments}x
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    Base {formatCurrencyBRL(proposal.basePriceCents)} (com encargos conforme
                    parcela)
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Transferência do site preservada após compra confirmada e entrega.
                  </p>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-5">
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Quantidade de parcelas (encargos transparentes)
                  </label>
                  <select
                    value={selectedInstallments}
                    onChange={(e) => setSelectedInstallments(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-[#08090C] px-4 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
                  >
                    {proposal.cardInstallmentOptions.map((opt) => (
                      <option key={opt.installments} value={opt.installments}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2.5 text-xs text-zinc-300 leading-relaxed">
                    Após a compra confirmada e a entrega, preserva-se a possibilidade de
                    transferência do site, sem condicioná-la ao pagamento das faturas futuras do
                    cartão ao emissor. Eventuais estornos ou contestações são tratados
                    separadamente conforme contrato.
                  </p>
                </div>
              )}
            </section>

            {/* Etapa 6: Resumo, Contrato Digital Versionado e Aceite Explícito */}
            <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-brand">
                    Etapa 06 • Resumo & Aceite Digital ({CONTRACT_DRAFT_VERSION})
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Conferência final e minuta contratual
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowContractModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/35 bg-brand/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-brand hover:bg-brand/15 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ler Minuta do Contrato ({CONTRACT_DRAFT_VERSION})</span>
                </button>
              </div>

              {/* Resumo das Condições */}
              <div className="rounded-xl border border-white/10 bg-[#08090C] p-4 sm:p-5 text-xs sm:text-sm space-y-2 mb-6">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Domínio (pago pelo cliente):</span>
                  <span className="text-white font-medium text-right">
                    {domainOption === 'existing'
                      ? `Já tenho domínio (${normalizedDomain || 'a confirmar na implantação'})`
                      : domainOption === 'register_own'
                        ? `Vou registrar em meu nome (${normalizedDomain || 'a definir na implantação'})`
                        : 'Não selecionado'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Hospedagem inicial:</span>
                  <span className="text-white font-medium text-right">
                    Incluída por 12 meses a partir da entrega
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Manutenção opcional:</span>
                  <span className="text-white font-medium text-right">
                    {maintenanceOption === 'monthly_49_90'
                      ? 'R$ 49,90/mês na entrega (até 2 alterações simples/mês, não cumulativas; 1d útil recebimento / 5d úteis conclusão; sem cobrança simultânea de R$ 29,90)'
                      : maintenanceOption === 'none'
                        ? 'Sem mensalidade (alterações mediante orçamento e aceite)'
                        : 'Não selecionada'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-400">Marco de 12 meses (aviso de 30 dias):</span>
                  <span className="text-white font-medium text-right">
                    Novo aceite expresso obrigatório • Sem resposta: encerra eventual cobrança de R$
                    49,90, mantém 15 dias grátis (sem edições) e envia último aviso antes de
                    suspender (sem excluir arquivos)
                  </span>
                </div>
                <div className="flex justify-between gap-4 pt-2 border-t border-white/10">
                  <span className="text-zinc-300 font-semibold">Total da proposta:</span>
                  <span className="text-brand font-bold text-right">
                    {currentCalculatedAmountCents !== null
                      ? formatCurrencyBRL(currentCalculatedAmountCents)
                      : 'Selecione a forma de pagamento'}
                  </span>
                </div>
              </div>

              {/* Checkboxes de aceite explícito (desmarcados por padrão) */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedContractDraft}
                    onChange={(e) => setAcceptedContractDraft(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-[#08090C] accent-brand"
                  />
                  <span>
                    Li e concordo com os termos da proposta individual e com a{' '}
                    <strong>Minuta do Contrato Digital ({proposal.contractVersion})</strong>,
                    incluindo as regras de domínio próprio, hospedagem por 12 meses, opções após o
                    primeiro ano e transferência após compra confirmada e entrega.
                  </span>
                </label>

                {maintenanceOption === 'monthly_49_90' && (
                  <label className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedMaintenanceSpecific}
                      onChange={(e) => setAcceptedMaintenanceSpecific(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-[#08090C] accent-brand"
                    />
                    <span>
                      Aceito especificamente a contratação opcional do{' '}
                      <strong>Plano de Manutenção Mensal (R$ 49,90/mês)</strong>, com início na
                      entrega do site e sem cobrança adicional da hospedagem avulsa de R$ 29,90 nos
                      primeiros 12 meses.
                    </span>
                  </label>
                )}

                <label className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacyNotice}
                    onChange={(e) => setAcceptedPrivacyNotice(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-[#08090C] accent-brand"
                  />
                  <span>
                    Autorizo o tratamento dos meus dados pessoais (LGPD) exclusivamente para
                    formalização do aceite, apontamento técnico de domínio e execução dos serviços.
                  </span>
                </label>
              </div>

              {submitError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs sm:text-sm text-red-300">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmitAcceptance || submittingAcceptance}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-600 px-7 py-3.5 text-sm font-bold text-white transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {submittingAcceptance
                    ? 'Registrando aceite...'
                    : 'Registrar Aceite e Preparar Pagamento (Teste)'}
                </span>
              </button>
            </section>

            {/* Comprovante Técnico de Aceite + Checkout Teste Mercado Pago */}
            {acceptanceReceipt && (
              <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8 space-y-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Aceite Técnico Registrado com Sucesso
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                      Versão {acceptanceReceipt.contractVersion} vinculada à proposta{' '}
                      {acceptanceReceipt.proposalId}.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#08090C] p-4 font-mono text-xs text-zinc-300 space-y-1.5 overflow-x-auto">
                  <div>acceptanceId: {acceptanceReceipt.acceptanceId}</div>
                  <div>acceptedAt: {acceptanceReceipt.acceptedAt}</div>
                  <div>contractVersion: {acceptanceReceipt.contractVersion}</div>
                  <div>contractTextSha256: {acceptanceReceipt.contractTextSha256}</div>
                  <div>maintenanceOption: {acceptanceReceipt.maintenanceOption}</div>
                  <div>clientDocumentMasked: {acceptanceReceipt.clientDocumentMasked}</div>
                  <div>
                    serverAmount:{' '}
                    {formatCurrencyBRL(acceptanceReceipt.serverCalculatedAmountCents)}
                  </div>
                  <div>storageMode: {acceptanceReceipt.storageMode}</div>
                </div>
                {acceptanceReceipt.storageMode !== 'durable_postgres' && (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    Aviso: este registro foi executado em modo de demonstração (
                    {acceptanceReceipt.storageMode}) sem persistência em banco de dados. Não possui
                    validade para contratação real.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="button"
                    disabled={preparingCheckout}
                    onClick={() => void handlePrepareTestCheckout()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand bg-brand/15 hover:bg-brand/25 px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  >
                    <Mail className="w-4 h-4 text-brand" />
                    <span>
                      {preparingCheckout
                        ? 'Preparando Order...'
                        : 'Simular Order Checkout Pro (Ambiente de Teste)'}
                    </span>
                  </button>
                </div>

                {mpOrderResult && (
                  <div className="rounded-xl border border-brand/30 bg-[#08090C] p-4 text-xs sm:text-sm text-zinc-200 space-y-2">
                    <div className="font-semibold text-brand">
                      Mercado Pago Orders • {mpOrderResult.environment.toUpperCase()} (
                      {mpOrderResult.mode})
                    </div>
                    <p>{mpOrderResult.message}</p>
                    <div className="font-mono text-xs text-zinc-400">
                      orderId: {mpOrderResult.orderId} | externalReference:{' '}
                      {mpOrderResult.externalReference}
                    </div>
                    {mpOrderResult.checkoutUrl && (
                      <a
                        href={mpOrderResult.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-brand/40 bg-brand/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand/25 transition-colors"
                      >
                        Abrir Checkout Pro de Teste (checkout_url)
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}
          </form>
        )}
      </main>

      {/* Modal da Minuta do Contrato Digital Versionado */}
      {showContractModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contract-modal-title"
        >
          <div className="max-w-3xl w-full max-h-[85vh] flex flex-col rounded-2xl border border-white/15 bg-[#0F1115] shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-300 mb-2">
                  {CONTRACT_DRAFT_METADATA.statusLabel}
                </span>
                <h2 id="contract-modal-title" className="text-lg font-bold text-white">
                  {CONTRACT_DRAFT_METADATA.title}
                </h2>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Versão: {CONTRACT_DRAFT_METADATA.version} • Atualizada em{' '}
                  {CONTRACT_DRAFT_METADATA.updatedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5"
              >
                Fechar
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {CONTRACT_DRAFT_CLAUSES.map((clause) => (
                <div key={clause.number} className="space-y-2 pb-4 border-b border-white/5">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {clause.number} — {clause.title}
                  </h3>
                  {clause.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                  {clause.legalReviewNote && (
                    <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                      {clause.legalReviewNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

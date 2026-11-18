export const CONTRACT_DRAFT_VERSION = 'v1.3-minuta-2026-11';

export interface ContractClause {
  number: string;
  title: string;
  paragraphs: string[];
  legalReviewNote?: string;
}

export const CONTRACT_DRAFT_METADATA = {
  version: CONTRACT_DRAFT_VERSION,
  statusLabel: 'MINUTA SUJEITA À REVISÃO JURÍDICA — NÃO UTILIZAR COMO CONTRATO DEFINITIVO',
  title: 'Minuta de Instrumento Particular de Prestação de Serviços Digitais — Solução /sites',
  updatedAt: '2026-11-18',
};

export const CONTRACT_DRAFT_CLAUSES: ContractClause[] = [
  {
    number: 'Cláusula 1ª',
    title: 'Do Objeto e Escopo Incluído',
    paragraphs: [
      'O presente instrumento tem por objeto o desenvolvimento, personalização e disponibilização da Solução Integrada de Presença Digital composta por: (i) Site Profissional Premium desenvolvido com tecnologia NEWNEO; (ii) Kit Instagram com Personagem 3D (1 vídeo de até 30 segundos e 2 imagens personalizadas); e (iii) Acesso oficial à plataforma BioPro Link pelo período de 12 (doze) meses.',
      'Está incluída no valor da contratação do site, pelo período de 12 (doze) meses contados da entrega efetiva, a hospedagem profissional do site pela Vitrine Local, independentemente da contratação do plano opcional de manutenção mensal.',
      'Não estão incluídos na oferta o registro ou renovação de domínio nem o fornecimento, gestão ou licença de caixas de e-mail profissional.',
    ],
  },
  {
    number: 'Cláusula 2ª',
    title: 'Do Domínio e Apontamento Técnico',
    paragraphs: [
      'O CONTRATANTE utilizará um domínio próprio que já possua ou providenciará o registro de um novo domínio diretamente em seu CPF ou CNPJ, arcando diretamente com os respectivos custos de registro e renovações anuais junto ao órgão registrador.',
      'Não é obrigatório que o domínio esteja previamente registrado no momento da solicitação da proposta, podendo ser providenciado durante a implantação do projeto.',
      'A Vitrine Local orientará a escolha do endereço e realizará a configuração técnica do apontamento (DNS) do domínio para o site desenvolvido, adotando cautela na conferência prévia dos registros existentes para evitar interferência em outros serviços ativos do CONTRATANTE.',
    ],
  },
  {
    number: 'Cláusula 3ª',
    title: 'Da Hospedagem por 12 Meses, Continuidade e Ausência de Resposta',
    paragraphs: [
      'A hospedagem inicial do site pela Vitrine Local permanece incluída durante os primeiros 12 (doze) meses contados da entrega do site. Não haverá renovação ou cobrança automática sem aceite expresso do CONTRATANTE.',
      'Com antecedência mínima de 30 (trinta) dias antes do encerramento dos 12 (doze) meses iniciais — inclusive para o CONTRATANTE que tenha aderido ao plano opcional de R$ 49,90/mês na contratação — a Vitrine Local comunicará formalmente o marco de encerramento e apresentará as três opções de continuidade: (a) hospedagem avulsa com a Vitrine Local por R$ 29,90/mês, sem alterações de conteúdo incluídas; (b) plano de hospedagem e manutenção por R$ 49,90/mês, com até 2 (duas) solicitações de alterações simples por mês; ou (c) transferência do site para hospedagem compatível escolhida pelo CONTRATANTE.',
      'Qualquer renovação, continuidade ou mudança de condições após os 12 (doze) meses exige registro eletrônico prévio de aceite expresso do CONTRATANTE, vinculando a opção escolhida, versão dos termos e data/hora do consentimento.',
      'Caso não haja aceite expresso até o fim do 12º mês: (i) não será iniciada nem continuada qualquer cobrança de hospedagem ou manutenção — encerrando-se inclusive a cobrança de R$ 49,90/mês ao fim do 12º mês caso o CONTRATANTE já estivesse pagando esse plano; (ii) o site permanecerá disponível por mais 15 (quinze) dias corridos, sem cobrança, para que o CONTRATANTE escolha uma das opções ou solicite a transferência, período em que não estarão incluídas novas alterações de conteúdo; e (iii) ao término desses 15 (quinze) dias, antes de qualquer suspensão do site, a Vitrine Local enviará um último aviso, não havendo exclusão automática do site ou dos respectivos arquivos.',
    ],
    legalReviewNote: 'Sinalização jurídica: validar os prazos de guarda/arquivamento após a suspensão sem exclusão automática e o fluxo de disponibilização dos arquivos para transferência.',
  },
  {
    number: 'Cláusula 4ª',
    title: 'Do Plano Opcional de Manutenção Mensal (R$ 49,90/mês)',
    paragraphs: [
      'Caso deseje suporte contínuo para pequenas atualizações, o CONTRATANTE poderá optar, de forma facultativa e mediante aceite específico (sem pré-seleção), pelo Plano de Hospedagem e Manutenção no valor de R$ 49,90 (quarenta e nove reais e noventa centavos) por mês.',
      'Quando escolhido expressamente na contratação, a mensalidade de R$ 49,90/mês inicia-se a partir da entrega efetiva do site. Durante os primeiros 12 (doze) meses, não será cobrada simultaneamente a hospedagem avulsa de R$ 29,90/mês. Ao fim do 12º mês, a continuidade da cobrança também depende de novo aceite expresso após a notificação prévia de 30 (trinta) dias, nos termos da Cláusula 3ª.',
      'O plano inclui a continuidade da hospedagem do site e até 2 (duas) solicitações de alterações simples por mês, não cumulativas para meses seguintes. Cada solicitação pode abranger ajuste de textos curtos, troca de até 2 (duas) imagens fornecidas pelo CONTRATANTE ou atualização de links dentro do layout existente.',
      'A Vitrine Local confirmará o recebimento de cada solicitação em até 1 (um) dia útil e concluirá o atendimento em até 5 (cinco) dias úteis após o recebimento de todos os materiais e informações necessários.',
      'Novas páginas, mudanças de layout, integrações e quaisquer pedidos fora desse escopo ou acima do limite mensal — bem como solicitações feitas por clientes que não aderirem ao plano mensal — exigem orçamento prévio e aceite expresso do CONTRATANTE.',
    ],
  },
  {
    number: 'Cláusula 5ª',
    title: 'Do Preço, Pagamento, Transferência do Site e Ocorrências Financeiras',
    paragraphs: [
      'O valor do projeto é o constante da Proposta Individual vinculada ao aceite eletrônico, com opção de pagamento via Pix (20% de desconto comercial) ou cartão de crédito em até 10 (dez) parcelas, conforme encargos informados previamente ao CONTRATANTE.',
      'Após a confirmação da compra e a entrega do projeto, preserva-se a possibilidade de transferência do site ao CONTRATANTE, não ficando a transferência condicionada ao pagamento das faturas futuras do cartão de crédito junto ao banco emissor.',
      'Eventuais estornos, cancelamentos, contestações (chargeback) ou inadimplementos ocorridos junto ao meio de pagamento serão tratados de forma autônoma, sujeitando-se às medidas contratuais, operacionais e legais cabíveis.',
    ],
    legalReviewNote: 'Sinalização jurídica: validar as cláusulas de responsabilidade e remédios aplicáveis em caso de chargeback/estorno após entrega ou transferência.',
  },
  {
    number: 'Cláusula 6ª',
    title: 'Da Proteção de Dados Pessoais (LGPD)',
    paragraphs: [
      'Os dados pessoais coletados (identificação do contratante, CPF/CNPJ, nome do responsável, e-mail de contato, WhatsApp e registros técnicos do aceite eletrônico com versão, data e hora) serão tratados exclusivamente para formalização da proposta, execução do contrato e comunicações operacionais, em conformidade com a Lei nº 13.709/2018 (LGPD).',
    ],
  },
];

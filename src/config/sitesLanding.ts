/**
 * Configuração da Landing Page Premium de Venda de Sites (/sites)
 * Marcas: Vitrine Local (Comercial) & NEWNEO (Tecnologia) & BioPro (Parceria)
 */

export const SITES_CONFIG = {
  // WhatsApp Business oficial confirmado para todos os CTAs da LP
  whatsapp: {
    phoneNumber: "5561996202519", // WhatsApp Business oficial: +55 61 99620-2519
    // Mensagem para quem já recebeu a demonstração personalizada
    alreadyReceivedDemoMessage:
      "Olá! Já recebi uma demonstração do meu site e gostaria de conversar sobre as condições de contratação.",
    // Mensagem para visitante espontâneo que quer conversar sobre seu site
    spontaneousVisitorMessage:
      "Olá! Visitei a página da Vitrine Local e gostaria de conversar sobre a criação de um site para o meu negócio.",
    // Mensagem para a seção de condições comerciais (#contratar)
    commercialContractMessage:
      "Olá! Gostaria de conhecer as condições de contratação e parcelamento em até 10x no cartão para o meu site profissional.",
    // Mensagem para botão geral do header
    headerMessage:
      "Olá! Gostaria de conversar com a equipe da Vitrine Local sobre um site profissional para meu negócio.",
  },

  // Campanha Sazonal (isolada para fácil ativação/desativação posterior)
  seasonalCampaign: {
    active: true,
    tag: "Campanha 2026 / 2027",
    headline: "Termine 2026 em evidência. Comece 2027 com seu negócio em outro nível.",
  },

  hero: {
    badge: "Diferencial Exclusivo Vitrine Local & NEWNEO",
    mainHeadline: "CONHEÇA SEU SITE ANTES DE CONTRATAR",
    supportHeadline: "Seu negócio merece um site extraordinário.",
    description:
      "Sites profissionais, cinematográficos e personalizados para elevar a imagem da sua empresa e facilitar o contato com seus clientes. Para clientes prospectados, apresentamos uma demonstração visual antes da sua decisão.",
    primaryCtaText: "Conversar no WhatsApp",
    secondaryCtaText: "Ver Projetos de Demonstração",
    guaranteeNote: "Demonstração visual antes de decidir • Contratação facilitada em até 10x",
  },

  // Nichos atendidos (prova de abrangência para diferentes segmentos)
  niches: {
    tag: "Segmentos Atendidos",
    title: "Projetos desenhados para a realidade de cada negócio",
    items: [
      { id: "gastronomia", label: "Restaurantes & Gastronomia", icon: "Utensils" },
      { id: "beleza", label: "Barbearias, Salões & Clínicas", icon: "Scissors" },
      { id: "servicos", label: "Serviços Automotivos & Especializados", icon: "Shield" },
      { id: "comercio", label: "Comércio Local & Lojas Físicas", icon: "Store" },
      { id: "profissionais", label: "Profissionais Liberais & PMEs", icon: "Briefcase" },
    ],
  },

  diferencial: {
    tag: "Nosso Grande Diferencial",
    title: "Você não precisa imaginar como será seu novo site.",
    highlightText: "Nós mostramos antes de você contratar.",
    description:
      "Diferente do modelo tradicional onde você contrata no escuro sem ver o resultado, nós desenvolvemos uma demonstração personalizada baseada nas informações públicas do seu negócio para que você conheça a proposta antes de decidir.",
    traditionalModel: {
      title: "Modelo Tradicional de Mercado",
      items: [
        "Contratação no escuro sem saber como o site vai ficar",
        "Semanas de espera para visualizar a primeira prévia",
        "Incerteza sobre a qualidade visual e o acabamento final",
        "Processos burocráticos e cobranças extras imprevisíveis",
      ],
    },
    ourModel: {
      title: "Modelo Vitrine Local + NEWNEO",
      items: [
        "Demonstração visual apresentada antes de qualquer decisão",
        "Você conhece a proposta estética criada para a sua marca",
        "Personalização e ajustes finos definidos após a contratação",
        "Facilidade de parcelamento em até 10 vezes no cartão",
      ],
    },
    demoDisclaimer:
      "A demonstração personalizada é uma proposta conceitual navegável criada a partir de dados públicos do negócio para validação visual. Após a contratação, todos os detalhes, catálogo, canais oficiais e integrações são definidos e finalizados no site definitivo.",
  },

  // Seção 3 do briefing: Muito mais que um site
  moreThanASite: {
    tag: "Posicionamento & Valor",
    title: "Muito mais que um site: uma nova presença digital",
    subtitle:
      "Transformamos recursos tecnológicos modernos em benefícios comerciais concretos para a sua empresa.",
    pillars: [
      {
        id: "credibilidade",
        title: "Credibilidade e Autoridade",
        description:
          "Um site cinematográfico e moderno passa segurança instantânea para quem pesquisa sua empresa pela primeira vez, eliminando a imagem amadora.",
        icon: "ShieldCheck",
      },
      {
        id: "contato",
        title: "Facilidade Imediata de Contato",
        description:
          "Botões estratégicos de WhatsApp e localização no Google Maps reduzem etapas e facilitam a comunicação direta entre o cliente e seu atendimento.",
        icon: "MessageCircle",
      },
      {
        id: "diferenciacao",
        title: "Diferenciação dos Concorrentes",
        description:
          "Enquanto seus concorrentes dependem apenas de perfis em redes sociais, seu negócio se posiciona com uma presença própria, completa e memorável.",
        icon: "Sparkles",
      },
      {
        id: "preparacao",
        title: "Pronto para Divulgação e Marketing",
        description:
          "Estrutura veloz e responsiva, pronta para receber tráfego de anúncios, divulgações em redes sociais e pesquisas locais na internet.",
        icon: "TrendingUp",
      },
    ],
  },

  offer: {
    tag: "Solução Completa",
    title: "Os três componentes da sua presença digital",
    subtitle:
      "Uma solução integrada que une design cinematográfico, engajamento em redes sociais e organização de links.",
    items: [
      {
        id: "site",
        number: "01",
        title: "Site Profissional Premium",
        subtitle: "Desenvolvimento tecnológico NEWNEO",
        description:
          "Design personalizado e cinematográfico criado sob medida para o seu nicho. Navegação confortável e veloz em celulares, tablets e computadores.",
        features: [
          "Design exclusivo e 100% responsivo para smartphone e desktop",
          "Carregamento rápido e otimização de desempenho",
          "Botões estratégicos de conversão direta para o WhatsApp",
          "Integração com redes sociais e canais oficiais de contato",
          "Estrutura inicial com boas práticas de SEO para mecanismos de busca",
          "Apresentação organizada de produtos, serviços e informações",
          "Integração com Google Maps para estabelecimentos com endereço físico",
          "Boas práticas de segurança digital e certificado HTTPS",
        ],
        highlight: "Tecnologia NEWNEO",
      },
      {
        id: "kit-instagram",
        number: "02",
        title: "Kit Instagram com Personagem 3D",
        subtitle: "Material de alto impacto para seu perfil",
        description:
          "Três materiais estratégicos para fixar no perfil do Instagram e fortalecer a comunicação visual do seu negócio.",
        features: [
          "2 imagens profissionais personalizadas para fixar no perfil",
          "1 vídeo de até 30 segundos com personagem 3D",
          "Personagem 3D em formato de boneco estilizado",
          "Possibilidade de avatar realístico do proprietário*",
          "Roteiro persuasivo com foco nos pontos fortes da empresa",
        ],
        note: "*O avatar realístico do proprietário é realizado estritamente mediante autorização expressa e fornecimento de referências visuais adequadas.",
        highlight: "Exclusividade Visual",
      },
      {
        id: "biopro",
        number: "03",
        title: "BioPro — 12 Meses Incluídos",
        subtitle: "Benefício complementar oficial",
        description:
          "12 meses de acesso à plataforma oficial BioPro para reunir os principais canais, contatos e links do seu negócio em uma página rápida e personalizada.",
        features: [
          "12 meses de acesso completo à plataforma BioPro incluídos",
          "Página rápida para reunir seus principais canais em um único link",
          "Painel de edição simples para atualizar seus links sempre que quiser",
          "Botão de WhatsApp destacado e integração facilitada",
          "Visual profissional para usar na bio do Instagram",
        ],
        highlight: "Produto Oficial BioPro",
      },
    ],
  },

  portfolio: {
    tag: "Portfólio & Demonstrações Reais",
    title: "Projetos de demonstração e referências do ecossistema",
    subtitle:
      "Confira demonstrações navegáveis desenvolvidas pela NEWNEO e soluções parceiras, cada uma identificada conforme sua natureza real.",
    items: [
      {
        id: "premium-burger",
        name: "Premium Burger",
        category: "Demonstração para Gastronomia & Delivery",
        tagline: "Hambúrguer 100% Angus • Artur Nogueira/SP",
        description:
          "Demonstração interativa desenvolvida com foco em apetite visual, cardápio digital dinâmico e fluxo ágil de pedidos direto pelo WhatsApp.",
        url: "https://premium-burguer.newneo.com.br/",
        image: "/assets/portfolio/premium-burger.webp",
        natureText: "Demonstração conceitual para o segmento gastronômico",
        highlights: ["Design Dark Sofisticado", "Cardápio Visual", "Botão Pedido WhatsApp"],
        badge: "Demonstração Gastronômica",
      },
      {
        id: "titanium-blindagens",
        name: "Titanium Blindagens",
        category: "Projeto Institucional & Alta Engenharia",
        tagline: "Proteção, Engenharia e Discrição • São Paulo/SP",
        description:
          "Website institucional corporativo desenvolvido para serviços de blindagem de alto padrão, transmitindo solidez, sofisticação e padrão técnico internacional.",
        url: "https://titanium-blindagens.newneo.com.br/",
        image: "/assets/portfolio/titanium-blindagens.webp",
        natureText: "Website institucional de engenharia e blindagem",
        highlights: ["Posicionamento Corporativo", "Acabamento Premium", "Apresentação Técnica"],
        badge: "Corporativo & Serviços",
      },
      {
        id: "biopro-showcase",
        name: "BioPro Link",
        category: "Produto Parceiro Incluído no Pacote",
        tagline: "Sua vida inteira em um só link",
        description:
          "Produto oficial de centralização de links de alta velocidade, incluído por 12 meses na contratação como benefício complementar da oferta.",
        url: "https://bioprolink.com.br/",
        image: "/assets/portfolio/biopro.webp",
        natureText: "Produto oficial incluído por 12 meses",
        highlights: ["12 Meses Incluídos", "Carregamento Rápido", "Design Minimalista"],
        badge: "Benefício Incluído",
      },
      {
        id: "bonequinhas-virais",
        name: "Bonequinhas Virais",
        category: "Projeto Relacionado ao Ecossistema",
        tagline: "Criação de Personagens 3D e Vídeos com IA",
        description:
          "Projeto do ecossistema criativo focado na criação de personagens 3D e animações com inteligência artificial, servindo como referência da técnica visual.",
        url: "https://bv.packfiguras.com.br/",
        image: "/assets/portfolio/bonequinhas-virais.webp",
        natureText: "Projeto relacionado ao ecossistema criativo 3D com IA (os valores visíveis na imagem referem-se estritamente ao produto digital externo daquele projeto, sem qualquer relação com os serviços de sites da Vitrine Local)",
        highlights: ["Modelagem 3D", "Animação com IA", "Engajamento Visual"],
        badge: "Ecossistema Criativo",
      },
    ],
  },

  howItWorks: {
    tag: "Como Funciona",
    title: "Etapas simples e transparentes até seu site no ar",
    subtitle:
      "Caminhos claros tanto para quem já conheceu uma demonstração quanto para quem está iniciando o contato agora.",
    branches: {
      prospect: {
        title: "Já recebeu uma demonstração por WhatsApp?",
        description: "Se nossa equipe já apresentou uma proposta visual exclusiva para o seu negócio:",
        steps: [
          {
            number: "01",
            title: "Você já conheceu a demonstração",
            description: "Você avaliou a proposta visual inicial criada pela nossa equipe para seu negócio.",
          },
          {
            number: "02",
            title: "Alinhamento do modelo",
            description: "Confirmamos os detalhes, cardápio, produtos ou serviços a serem integrados.",
          },
          {
            number: "03",
            title: "Contratação facilitada em até 10x",
            description: "Condições comerciais definidas com opção de parcelamento em até 10 vezes no cartão.",
          },
          {
            number: "04",
            title: "Finalização e entrega do site oficial",
            description: "A NEWNEO customiza os dados definitivos e entrega o site no ar com todos os canais conectados.",
          },
        ],
        ctaText: "Já Vi Minha Demonstração e Quero Contratar",
      },
      visitor: {
        title: "Ainda não tem uma demonstração personalizada?",
        description: "Se você chegou espontaneamente à nossa página e quer um site para seu negócio:",
        steps: [
          {
            number: "01",
            title: "Fale com nosso atendimento",
            description: "Clique no botão de WhatsApp e informe o nome e o segmento do seu estabelecimento.",
          },
          {
            number: "02",
            title: "Análise da sua marca",
            description: "Nossa equipe pesquisa as informações públicas do seu negócio para conceber a proposta.",
          },
          {
            number: "03",
            title: "Apresentação da demonstração",
            description: "Enviamos o link da proposta visual navegável para você ver o potencial antes de contratar.",
          },
          {
            number: "04",
            title: "Contratação e personalização definitiva",
            description: "Aprovou a proposta? Definimos os detalhes e iniciamos o desenvolvimento do site final.",
          },
        ],
        ctaText: "Quero Conversar Sobre Meu Site no WhatsApp",
      },
    },
  },

  commercial: {
    tag: "Condições Comerciais",
    title: "Investimento personalizado para o tamanho da sua empresa",
    subtitle:
      "O investimento varia conforme o nicho, o modelo escolhido e a complexidade das funcionalidades. Consulte as condições com nossa equipe comercial.",
    highlightBadge: "CONDIÇÃO COMERCIAL FACILITADA",
    highlightMain: "PARCELE EM ATÉ 10 VEZES NO CARTÃO",
    highlightDescription:
      "Invista na imagem profissional do seu negócio com condições acessíveis, parcelando o valor em até 10 vezes no cartão de crédito.",
    ctaText: "Quero Conhecer as Condições no WhatsApp",
  },

  faq: {
    tag: "Perguntas Frequentes",
    title: "Tire suas dúvidas sobre a contratação",
    subtitle: "Esclarecimentos objetivos sobre como funciona cada etapa do processo.",
    items: [
      {
        question: "Meu site já está pronto?",
        answer:
          "Não. A demonstração apresentada antes da contratação é uma proposta conceitual navegável criada para que você avalie o padrão visual e tecnológico. O site final contratado é desenvolvido e customizado após o fechamento, incluindo suas informações oficiais, fotos definitivas, catálogo completo e canais integrados.",
      },
      {
        question: "Posso conhecer uma demonstração antes de contratar?",
        answer:
          "Sim! Para potenciais clientes prospectados, desenvolvemos uma demonstração personalizada com base nas informações públicas do negócio. O cliente vê a proposta antes de decidir. Para visitantes espontâneos, basta entrar em contato para iniciar o atendimento comercial.",
      },
      {
        question: "O site funciona bem em celulares?",
        answer:
          "Sim. Todos os projetos são desenvolvidos com tecnologia responsiva e mobile-first, garantindo carregamento rápido, boa legibilidade e botões confortáveis em qualquer tamanho de tela.",
      },
      {
        question: "Posso integrar meu WhatsApp e redes sociais?",
        answer:
          "Sim. O site é entregue com botões de conversão direta para o seu WhatsApp comercial, links para suas redes sociais e integração com o Google Maps quando aplicável.",
      },
      {
        question: "Como funciona o pagamento? Posso parcelar?",
        answer:
          "Sim. Oferecemos a facilidade de parcelamento em até 10 vezes no cartão de crédito. Os valores exatos dependem do modelo e das particularidades do seu projeto e são informados pelo WhatsApp comercial.",
      },
      {
        question: "O que está incluído no Kit Instagram com Personagem 3D?",
        answer:
          "Você recebe 2 imagens profissionais personalizadas com a marca do seu negócio e 1 vídeo de até 30 segundos com personagem 3D. O personagem pode ser em formato de boneco estilizado ou um avatar 3D do proprietário (este último mediante fornecimento de fotos de referência e autorização expressa).",
      },
      {
        question: "Como funciona o acesso ao BioPro?",
        answer:
          "O pacote inclui 12 meses de acesso à plataforma oficial BioPro para você reunir os principais canais e contatos da sua empresa em uma página personalizada para a bio do seu Instagram.",
      },
    ],
  },

  ctaFinal: {
    headline: "Seu negócio está pronto para um novo nível?",
    subheadline:
      "Termine 2026 em evidência e comece 2027 com uma presença digital cinematográfica à altura da qualidade do seu estabelecimento.",
    ctaButtonText: "QUERO MEU SITE PROFISSIONAL",
    footnote: "Demonstração visual antes de decidir • Parcelamento em até 10x no cartão",
  },
};

/**
 * Função utilitária para gerar links oficiais do WhatsApp (wa.me/5561996202519)
 */
export function buildWhatsAppLink(
  type: "received_demo" | "spontaneous_visitor" | "commercial_contract" | "header" | "custom",
  customText?: string,
  context?: { demoId?: string; clientName?: string }
): string {
  const number = SITES_CONFIG.whatsapp.phoneNumber; // 5561996202519
  let message: string;

  switch (type) {
    case "received_demo":
      message = SITES_CONFIG.whatsapp.alreadyReceivedDemoMessage;
      break;
    case "spontaneous_visitor":
      message = SITES_CONFIG.whatsapp.spontaneousVisitorMessage;
      break;
    case "commercial_contract":
      message = SITES_CONFIG.whatsapp.commercialContractMessage;
      break;
    case "header":
      message = SITES_CONFIG.whatsapp.headerMessage;
      break;
    case "custom":
    default:
      message = customText || SITES_CONFIG.whatsapp.spontaneousVisitorMessage;
      break;
  }

  if (context?.clientName) {
    message += ` (Empresa: ${context.clientName})`;
  }
  if (context?.demoId) {
    message += ` [Ref. Demonstração: ${context.demoId}]`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

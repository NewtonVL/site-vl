/**
 * Configuração centralizada da página de benefícios exclusivos (White Label).
 * Altere aqui textos, descontos, estados de botões e links de checkout sem tocar no código visual.
 */

export interface BenefitModality {
  id: string;
  name: string;
  buttonText: string;
  status: 'active' | 'coming_soon';
  checkoutUrl?: string;
}

export interface BenefitOffer {
  id: string;
  title: string;
  badge?: string;
  category: string;
  description: string;
  discount: string; // Ex: "30% OFF"
  modalities?: BenefitModality[];
  buttonText?: string;
  status?: 'active' | 'coming_soon';
  checkoutUrl?: string;
}

export const benefitsConfig = {
  partner: {
    name: "Benefícios Exclusivos",
    tagline: "Condições especiais para você",
  },

  hero: {
    tag: "Benefícios Exclusivos • Condições Especiais para Você",
    title: "Benefícios digitais para fortalecer seus projetos e negócios",
    subtitle:
      "Aproveite benefícios exclusivos e condições especiais para você nas soluções digitais da Vitrine Local. Escolha a ferramenta ideal para dar visibilidade, profissionalismo e escala à sua atuação.",
    stepsTitle: "Como aproveitar o seu benefício",
    steps: [
      {
        number: "01",
        title: "Escolha a solução",
        description: "Encontre a ferramenta ideal para o seu momento e projeto.",
      },
      {
        number: "02",
        title: "Acesse o checkout",
        description: "Clique no botão da oferta para ir à página segura de pagamento.",
      },
      {
        number: "03",
        title: "Aplique seu cupom",
        description: "Aplique no checkout o cupom recebido no canal pelo qual você conheceu o benefício.",
      },
    ],
  },

  offers: [
    {
      id: "bonequinhas-virais",
      title: "Método Bonequinhas Virais",
      category: "Conteúdo & Inteligência Artificial",
      description: "Criação de conteúdo estratégico e magnético com inteligência artificial para engajamento e vendas.",
      discount: "30% OFF",
      status: "active" as const,
      buttonText: "Acessar oferta",
      checkoutUrl: "https://pay.cakto.com.br/trxkms9_882985",
    },
    {
      id: "biopro",
      title: "BioPro",
      badge: "Somente plano anual",
      category: "Página Profissional de Links",
      description: "Página de alta performance para apresentar seus links, contatos e serviços de forma profissional e veloz.",
      discount: "30% OFF",
      status: "coming_soon" as const,
      buttonText: "Disponível em breve",
      checkoutUrl: undefined,
    },
    {
      id: "figurinhas-instagram",
      title: "Figurinhas para Instagram",
      category: "Design & Mídias Sociais",
      description: "Elementos gráficos exclusivos e dinâmicos para valorizar seus Stories e conteúdos diários.",
      discount: "20% OFF",
      status: "active" as const,
      buttonText: "Acessar oferta",
      checkoutUrl: "https://pay.cakto.com.br/3b8mbdw_463667",
    },
    {
      id: "pack-grid-boss",
      title: "Pack Grid Boss",
      category: "Templates Estratégicos",
      description: "Templates modernos e estruturados para organizar o feed e posicionar sua marca com autoridade visual.",
      discount: "30% OFF",
      status: "active" as const,
      buttonText: "Acessar oferta",
      checkoutUrl: "https://pay.cakto.com.br/47cg26j_1001991",
    },
    {
      id: "barbearias",
      title: "VitrineLocal para Barbearias",
      category: "Presença Digital & Organização",
      description: "Solução completa para estruturar a presença online, organizar atendimentos e atrair clientes no seu bairro.",
      discount: "20% OFF",
      modalities: [
        {
          id: "autonomia",
          name: "Autonomia",
          buttonText: "Disponível em breve",
          status: "coming_soon" as const,
          checkoutUrl: undefined,
        },
        {
          id: "implantacao-completa",
          name: "Implantação Completa",
          buttonText: "Disponível em breve",
          status: "coming_soon" as const,
          checkoutUrl: undefined,
        },
      ],
    },
  ] satisfies BenefitOffer[],

  rules: {
    title: "Condições resumidas do benefício",
    items: [
      "Benefícios exclusivos com condições especiais para você nas soluções digitais selecionadas.",
      "O desconto percentual é aplicado sobre o preço público vigente no momento da contratação.",
      "Desconto não cumulativo com outras promoções, cupons ou campanhas vigentes.",
      "Oferta sujeita às regras, termos e disponibilidade de cada solução no momento da compra.",
      "Aplique no checkout o cupom recebido no canal pelo qual você conheceu o benefício.",
    ],
  },
};

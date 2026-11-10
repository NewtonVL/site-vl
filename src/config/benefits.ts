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

export interface BenefitAccent {
  topBar: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export interface BenefitDetail {
  label: string;
  text: string;
}

export interface BenefitOffer {
  id: string;
  title: string;
  badge?: string;
  category: string;
  description: string;
  details: BenefitDetail[];
  discount: string; // Ex: "30% OFF"
  coupon: string;
  couponNote?: string;
  accent: BenefitAccent;
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
        description: "Encontre a ferramenta ideal para o seu momento e confira o código do cupom no card.",
      },
      {
        number: "02",
        title: "Acesse a oferta",
        description: "Clique em “Acessar oferta” para ir à página de destino da solução escolhida.",
      },
      {
        number: "03",
        title: "Confira o desconto",
        description: "Verifique o desconto no destino e, caso não apareça automaticamente, informe o código do cupom.",
      },
    ],
  },

  offers: [
    {
      id: "bonequinhas-virais",
      title: "Método Bonequinhas Virais",
      category: "Conteúdo & Inteligência Artificial",
      description: "Criação de conteúdo estratégico e magnético com inteligência artificial para engajamento e vendas.",
      details: [
        {
          label: "O que você recebe",
          text: "Método para iniciantes, 100% pelo celular e com acesso vitalício, para criar personagem 3D com IA e dar voz e movimento em cenas de vídeo.",
        },
        {
          label: "Indicado para",
          text: "Quem quer produzir conteúdos para TikTok, Instagram, Reels e Shorts, ou divulgar produtos e marcas sem aparecer nem saber editar.",
        },
      ],
      discount: "30% OFF",
      coupon: "RPVL30",
      couponNote: "Confira o desconto no destino. Caso não apareça automaticamente, informe o código acima.",
      accent: {
        topBar: "linear-gradient(90deg, #F90078 0%, #7A21E8 100%)",
        badgeBg: "#FDF2F8",
        badgeBorder: "#FBCFE8",
        badgeText: "#BE185D",
      },
      status: "active" as const,
      buttonText: "Acessar oferta",
      checkoutUrl: "https://pay.kiwify.com.br/JVXZlFH?coupon=RPVL30",
    },
    {
      id: "biopro",
      title: "BioPro",
      badge: "Plano anual",
      category: "Página Profissional de Links",
      description: "Página de alta performance para apresentar seus links, contatos e serviços de forma profissional e veloz.",
      details: [
        {
          label: "O que você recebe",
          text: "Página profissional no plano anual (12 meses) com links ilimitados, painel de edição, botão de WhatsApp destacado, domínio próprio e métricas em tempo real.",
        },
        {
          label: "Indicado para",
          text: "Empreendedores, prestadores de serviço, lojas locais, criadores e profissionais que querem reunir links, contatos e ofertas em um só lugar.",
        },
      ],
      discount: "30% OFF",
      coupon: "RPVL30",
      couponNote: "Confira o desconto no destino. Caso não apareça automaticamente, informe o código acima.",
      accent: {
        topBar: "linear-gradient(90deg, #0F172B 0%, #3080FF 100%)",
        badgeBg: "#EFF6FF",
        badgeBorder: "#BFDBFE",
        badgeText: "#1D4ED8",
      },
      status: "active" as const,
      buttonText: "Acessar oferta",
      checkoutUrl: "https://bioprolink.com.br/?cupom=RPVL30",
    },
    {
      id: "figurinhas-instagram",
      title: "Figurinhas para Instagram",
      category: "Design & Mídias Sociais",
      description: "Elementos gráficos exclusivos e dinâmicos para valorizar seus Stories e conteúdos diários.",
      details: [
        {
          label: "O que você recebe",
          text: "Biblioteca com mais de 30.000 figurinhas prontas por temas e estilos, com acesso imediato, vitalício e atualizações sem custo adicional.",
        },
        {
          label: "Indicado para",
          text: "Criadores, negócios e profissionais que produzem Stories no Instagram e querem conteúdos mais criativos sem criar tudo do zero.",
        },
      ],
      discount: "20% OFF",
      coupon: "RPVL20",
      couponNote: "Confira o desconto no destino. Caso não apareça automaticamente, informe o código acima.",
      accent: {
        topBar: "linear-gradient(90deg, #FF146A 0%, #171717 100%)",
        badgeBg: "#FFF1F5",
        badgeBorder: "#FECDD9",
        badgeText: "#CC0E54",
      },
      status: "active" as const,
      buttonText: "Acessar oferta",
      checkoutUrl: "https://pay.kiwify.com.br/vfXpSqA",
    },
    {
      id: "pack-grid-boss",
      title: "Pack Grid Boss",
      category: "Templates Estratégicos",
      description: "Templates modernos e estruturados para organizar o feed e posicionar sua marca com autoridade visual.",
      details: [
        {
          label: "O que você recebe",
          text: "Coleção digital de templates de Feed, Stories e carrosséis editáveis na versão gratuita do Canva, com acesso vitalício e atualizações.",
        },
        {
          label: "Indicado para",
          text: "Criadores e negócios que buscam manter padrão visual consistente e transformar o feed do Instagram em vitrine profissional.",
        },
      ],
      discount: "30% OFF",
      coupon: "RPVL30",
      couponNote: "Confira o desconto no destino. Caso não apareça automaticamente, informe o código acima.",
      accent: {
        topBar: "linear-gradient(90deg, #F45489 0%, #E7B8C9 100%)",
        badgeBg: "#FAF7F8",
        badgeBorder: "#E9DCE2",
        badgeText: "#C93B6B",
      },
      status: "active" as const,
      buttonText: "Acessar oferta",
      checkoutUrl: "https://pay.cakto.com.br/47cg26j_1289649",
    },
    {
      id: "bonequinhas-cristas",
      title: "Bonequinhas Cristãs",
      category: "Fé & conteúdo",
      description: "Figurinhas PNG cristãs para criar Stories com fé e criatividade, com licença PLR para revenda.",
      details: [
        {
          label: "O que você recebe",
          text: "Mais de 3.000 figurinhas PNG para usar no Instagram, WhatsApp, Telegram e Canva, com acesso digital e licença PLR para revenda.",
        },
        {
          label: "Indicado para",
          text: "Mulheres cristãs, criadoras, líderes de ministérios e quem deseja compartilhar mensagens de fé ou revender conteúdos cristãos.",
        },
      ],
      discount: "26% OFF",
      coupon: "RPVL26",
      accent: {
        topBar: "linear-gradient(90deg, #0C090A 0%, #E71367 100%)",
        badgeBg: "#FDF2F6",
        badgeBorder: "#F8D7E4",
        badgeText: "#C81059",
      },
      status: "coming_soon" as const,
      buttonText: "Disponível em breve",
      checkoutUrl: undefined,
    },
    {
      id: "barbearias",
      title: "VitrineLocal para Barbearias",
      category: "Presença Digital & Organização",
      description: "Solução completa para estruturar a presença online, organizar atendimentos e atrair clientes no seu bairro.",
      details: [
        {
          label: "Modalidades previstas",
          text: "Estão previstas as opções Autonomia e Implantação Completa, ainda em liberação (os detalhes de cada modalidade serão informados quando a oferta for ativada).",
        },
        {
          label: "Indicado para",
          text: "Barbearias que buscam estruturar a presença online, organizar atendimentos e atrair clientes no próprio bairro.",
        },
      ],
      discount: "20% OFF",
      coupon: "RPVL20",
      accent: {
        topBar: "linear-gradient(90deg, #18181B 0%, #FA4B00 100%)",
        badgeBg: "#FFF4EE",
        badgeBorder: "#FFD4BF",
        badgeText: "#D94100",
      },
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
      "Oferta sujeita às regras, termos e disponibilidade de cada solução no momento da contratação.",
      "Confira o desconto no destino e, caso não apareça automaticamente, informe o código do cupom indicado no card da oferta.",
    ],
  },
};

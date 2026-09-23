/**
 * Configurações institucionais do site Vitrine Local.
 * Centraliza e-mails de contato, textos institucionais e navegação
 * facilitando qualquer manutenção ou alteração futura.
 */

export const siteConfig = {
  brand: {
    name: "Vitrine Local",
    shortName: "VL",
    title: "VL — Vitrine Local",
    institutionalTag: "Iniciativa Institucional",
  },

  // E-mail institucional de contato (fácil de trocar)
  contact: {
    email: "comercial@vitrinelocal.com.br",
    label: "Fale com a Vitrine Local",
    helpText: "Para dúvidas institucionais e contato direto com nossa equipe.",
  },

  hero: {
    title: "Conectando pessoas, negócios e oportunidades.",
    subtitle: "A Vitrine Local aproxima pessoas de empresas e profissionais que fazem parte da vida em suas comunidades.",
    primaryCta: {
      text: "Conheça nosso propósito",
      href: "#proposito",
    },
    secondaryCta: {
      text: "Fale conosco",
      href: "#contato",
    },
  },

  about: {
    sectionTag: "Sobre Nós",
    title: "Aproximando quem faz a comunidade acontecer",
    paragraphs: [
      "A Vitrine Local é uma iniciativa dedicada a dar visibilidade aos negócios locais e criar conexões entre pessoas, empresas e prestadores de serviços.",
      "Nosso propósito é valorizar quem empreende em cada comunidade, aproximando as pessoas das empresas e dos profissionais que fazem parte do seu dia a dia.",
    ],
  },

  purpose: {
    sectionTag: "Nosso Propósito",
    title: "Três pilares que movem a nossa atuação",
    subtitle: "Princípios claros que orientam a aproximação entre pessoas e negócios locais.",
    pillars: [
      {
        id: "visibilidade",
        title: "Visibilidade",
        description: "Dar destaque e presença institucional clara aos negócios e profissionais que movimentam o dia a dia de cada localidade.",
      },
      {
        id: "conexao",
        title: "Conexão",
        description: "Encurtar distâncias e aproximar pessoas e empresas por meio de relações diretas, humanas e fundamentadas na confiança mútua.",
      },
      {
        id: "valorizacao",
        title: "Valorização do comércio local",
        description: "Fortalecer o ecossistema econômico de cada comunidade, reconhecendo o valor indispensável de quem empreende perto de você.",
      },
    ],
  },

  closing: {
    quote: "O local ganha força quando as pessoas se conectam.",
  },

  navigation: [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Propósito", href: "#proposito" },
    { label: "Contato", href: "#contato" },
  ],
};

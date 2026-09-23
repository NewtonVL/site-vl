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
    label: "Canal Institucional & Comercial",
    helpText: "Para dúvidas institucionais, parcerias e contato direto com nossa equipe.",
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
      "A Vitrine Local é uma iniciativa dedicada a dar visibilidade aos negócios locais e criar conexões autênticas entre pessoas, empresas e prestadores de serviços.",
      "Acreditamos que os estabelecimentos e os profissionais de cada bairro e região são o verdadeiro coração de uma economia dinâmica e humana. Ao proporcionar um espaço institucional claro e confiável, valorizamos quem empreende e facilitamos o acesso de quem busca soluções próximas do seu dia a dia.",
      "Nosso compromisso é fortalecer essa rede de convivência, promovendo a integração entre a comunidade e aqueles que constroem a história local.",
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

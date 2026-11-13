# Guia de Direção de Arte, UX/UI e Validação Visual — Vitrine Local

Este documento define princípios permanentes de direção visual, boas práticas de front-end e um processo de revisão para as Landing Pages do projeto `site-vl`. Ele atua como um guia de critérios de qualidade e consistência, sem impor um modelo visual idêntico para todas as páginas.

---

## 1. Identidade da Marca & Flexibilidade Visual

A **Vitrine Local** conecta pessoas, negócios e oportunidades com credibilidade e proximidade. Cada Landing Page deve transmitir solidez institucional e clareza imediata da proposta de valor.

* **Identidade Comercial:** A cor institucional primária é o Laranja Vitrine Local (`#FA4B00` / `brand-500` e sua escala de `50` a `900` em `tailwind.config.js`). Ela deve ser usada estrategicamente para direcionar a atenção, em chamadas para ação (CTAs), badges e pontos focais de conversão.
* **Atmosfera Adaptável:** A composição, o tom visual (Light, Dark, clean ou editorial) e a densidade de conteúdo devem ser adaptados conforme o nicho da oferta, o público-alvo e a proposta comercial de cada página.
* **Justificativa Visual:** Não existem proibições genéricas a cores, efeitos ou gradientes; no entanto, qualquer elemento visual (como transparências, sombras, degradês ou bordas) deve ter justificativa explícita associada à identidade da marca ou à clareza da mensagem, evitando recursos visuais gratuitos ou puramente decorativos ("AI-slop").
* **Padrão de Acabamento:** Ter como referência a clareza, o cuidado espacial e a atenção aos detalhes observados em produtos como Apple, Stripe, Linear, Framer, Vercel e Raycast, preservando sempre a personalidade da Vitrine Local.

---

## 2. Tipografia & Composição Adaptáveis

A hierarquia visual orienta a navegação e facilita a tomada de decisão:

* **Tipografia Base:** A família `Montserrat` é a fonte padrão do projeto. Tipografias complementares podem ser aplicadas quando o contexto da oferta justificar, desde que carregadas de forma otimizada e sem penalizar o carregamento.
* **Escalas Adaptáveis:** Trate tamanhos de fonte e espaçamentos como referências adaptáveis, priorizando a **leitura confortável no celular**.
  * Títulos e Headlines: devem possuir contraste claro de peso em relação ao corpo de texto e espaçamento entrelinhas ajustado, prevenindo quebras de linha desagradáveis em telas menores.
  * Textos Corridos: devem manter entrelinhas arejado (`leading-relaxed`) e contraste adequado com o fundo em qualquer iluminação.
* **Espaçamento e Ritmo:** Alterne momentos de respiro visual com blocos de maior densidade de informação. Respeite margens confortáveis no mobile (evitando que o texto encoste nas bordas laterais da tela).
* **Acessibilidade e Contraste:** Mantenha contraste legível de acordo com as recomendações de acessibilidade (WCAG AA) para textos informativos e botões de ação.

---

## 3. Movimento, Microinterações & Performance

O movimento deve servir para guiar a atenção ou confirmar uma ação, nunca para atrasar a leitura:

* **Propriedades Específicas:** Evite aplicar `transition-all` indiscriminadamente. Anime apenas propriedades específicas onde houver propósito claro (por exemplo: `transition-colors`, `transition-transform` ou `transition-opacity`), prevenindo recálculos pesados de layout.
* **Respeito a `prefers-reduced-motion`:** Todo elemento com animação, transição ou deslocamento visual deve respeitar a preferência de redução de movimento do usuário no sistema operacional, aplicando comportamentos estáticos (`motion-reduce:transform-none motion-reduce:transition-none`).
* **Verificação Prática no Celular:** Verifique o comportamento real da rolagem e dos toques em dispositivos móveis. Evite o uso de filtros pesados (como múltiplos blurs em camadas) que possam comprometer a fluidez da navegação.
* **Critério para GSAP & ScrollTrigger:**
  * Para a vasta maioria das páginas, as transições nativas em CSS e utilitários Tailwind são suficientes e têm custo zero de JavaScript.
  * O GSAP e o ScrollTrigger devem ser instalados apenas quando uma página específica tiver um requisito concreto de narrativa por rolagem (*scrollytelling*), como travamento sincronizado de seções (*pinning*) ou animações sequenciais complexas. Nesses casos, o carregamento deve ser pontual para não afetar as demais rotas.

---

## 4. Classificação dos Recursos de Apoio

Para manter clareza sobre o que está ativo no projeto e o que serve apenas como guia conceitual:

### A. Princípios e Métodos Adotados (Resumos Conceituais)
* **Impeccable (`impeccable.style`):** Seus conceitos de vocabulário de tokens de design, coerência espacial e prevenção de estilos genéricos de IA foram sintetizados neste guia. Não constitui ferramenta ou dependência instalada no projeto.
* **UI Skills (`ui-skills.com`):** Suas heurísticas de acessibilidade, contraste, performance de animação e checklist de UI orientam o processo de auditoria de código e layout do agente.

### B. Ferramentas Efetivamente Disponíveis ao Agente
* **Ambiente de Desenvolvimento Local:** Node.js, compilador TypeScript (`tsc`), empacotador Vite, Tailwind CSS e biblioteca de ícones `lucide-react`, executados via terminal local.
* **Subagente de Navegador:** Quando habilitado pela plataforma Antigravity, utilizado para carregar a aplicação em servidor local, inspecionar a interface e capturar telas em viewports desktop e mobile.

### C. Recursos Consultáveis sob Demanda
* **Better Icons:** Catálogo de ícones para eventual consulta caso um ícone de nicho não esteja presente no conjunto nativo do `lucide-react`.
* **GSAP Skills:** Documentação de referência para padrões de implementação de timelines e ScrollTrigger, a ser consultada apenas se houver necessidade técnica aprovada.

---

## 5. Isolamento de Rotas e Integridade do Projeto

* **Preservação do Site Existente:** As páginas `/` (institucional principal) e `/beneficios` (benefícios digitais) são estáveis e devem ser preservadas integralmente em qualquer nova implementação, mantendo seus textos, links, aparência e comportamento.
* **Arquitetura Modular:** Cada nova Landing Page deve residir em componentes próprios, isolados das páginas existentes.
* **Verificação de Não-Regressão:** Qualquer alteração no roteamento exige a verificação explícita do funcionamento de `/`, `/beneficios`, da nova rota e da execução com sucesso de `npm run build`.

---

## 6. Processo de Revisão e Validação Visual

Antes de considerar uma Landing Page pronta, deve ser executado o seguinte processo de revisão:

1. **Inspeção Visual:**
   * Visualizar a página em ambiente local nos formatos **Desktop** e **Mobile**.
   * Avaliar a integridade visual da página inteira, verificando ausência de rolagem horizontal indevida e quebras de layout.
2. **Revisão de Direção de Arte e UX:**
   * **Hierarquia e Clareza:** A mensagem principal e o diferencial da página estão imediatamente compreensíveis?
   * **Tipografia e Ritmo:** A leitura é agradável no celular? Os títulos quebram de maneira natural?
   * **Estados Interativos:** Botões e links possuem respostas visuais para `:hover`, `:active` e anel de foco acessível (`:focus-visible`) para navegação por teclado?
   * **Caminho de Conversão:** Os links para WhatsApp possuem mensagens pré-preenchidas contextualizadas e utilizam o número comercial correto?
   * **Movimento:** Os efeitos respeitam a redução de movimento (`prefers-reduced-motion`)?
3. **Validação Técnica de Build:**
   * Executar `npm run build` para garantir que o TypeScript e o empacotamento passem sem erros.
   * Registrar medições de tempo de compilação ou peso de arquivos apenas quando forem úteis para avaliar o impacto de uma alteração técnica relevante.

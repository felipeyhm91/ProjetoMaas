# Interação 4 — Carteira corporativa e Portal RH

## Objetivo
Conectar visualmente planejamento, benefício corporativo, políticas, empresa e sustentabilidade sem alterar o Score, a explicação por IA, os cálculos financeiros ou as integrações atuais.

## Implementação

### 1. Minha carteira
- Criar a página `/carteira` e adicioná-la à navegação do colaborador.
- Usar a carteira de demonstração já existente para mostrar saldo disponível, valor utilizado, limite mensal e período atual, sempre identificados como demonstração.
- Exibir uso recente com as transações mock já existentes relacionadas ao colaborador de demonstração, preservando seus únicos status disponíveis: confirmada, pendente e estornada.
- Mostrar a política já existente (limite, modais permitidos, horários e teto por viagem), campanha de cashback e impacto sustentável disponíveis nos mocks atuais.
- Incluir estados de carregamento, ausência de dados e erro com tentativa novamente, mantendo leitura simples em vez de um painel excessivamente complexo.

### 2. Viagem + política + carteira
- Evoluir os cartões de rota para destacar “Política corporativa” e os estados reais já calculados: elegível ou não elegível, com o motivo disponível.
- Nos detalhes da rota, mostrar custo, saldo atual e saldo após a viagem somente com a lógica existente e marcar o cálculo como demonstração.
- Não alterar pesos, critérios ou seleção determinística do Score; saldo e política continuam apenas nos critérios já suportados.

### 3. Portal RH
- Ajustar o cabeçalho para “Gestão de mobilidade” e o subtítulo solicitado.
- Reorganizar a visão geral para priorizar gasto no período, colaboradores, viagens e CO₂ usando exclusivamente os mocks atuais.
- Manter visualizações simples de gasto por período e modal.
- Acrescentar uma leitura consolidada de conformidade baseada nas transações/políticas já existentes, identificada como demonstração, sem inventar novos estados.
- Resumir utilização e sustentabilidade com links para as páginas detalhadas já existentes, preservando recursos, permissões e navegação do Portal RH.

### 4. Dados e arquitetura
- Criar um serviço de apresentação da carteira que reutiliza a camada mock atual; componentes não acessarão mocks diretamente.
- Reutilizar cards, botões, badges, estados, tabelas e tokens existentes; nenhuma nova paleta, tipografia, API, banco ou autenticação.
- Corrigir rótulos de origem simulada para linguagem humana consistente (“Simulação” / “Dados de demonstração”).

### 5. Validação
- Conferir Home, planejador, carteira, Portal RH e navegação.
- Testar 390×844, 768×1024, 1440×900 e 1920×1080, incluindo tabelas, foco e conteúdo recolhível.
- Executar as verificações automáticas disponíveis e revisar erros do navegador.

## Entregável
Uma experiência corporativa conectada para colaborador e RH, baseada apenas nos dados e regras já presentes. A integração financeira real, autenticação, provedores externos, novas APIs, novo Score e alterações no Gemini permanecem fora desta etapa.

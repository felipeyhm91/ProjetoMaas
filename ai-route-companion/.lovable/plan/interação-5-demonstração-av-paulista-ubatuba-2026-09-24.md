# Interação 5 — demonstração Av. Paulista → Ubatuba

## Objetivo
Preparar uma demonstração fluida e tecnicamente honesta do fluxo completo, preservando o planejador, o Score determinístico, a explicação por IA, a carteira e as regras corporativas existentes.

## Implementação

1. **Corrigir a transparência dos dados**
   - Consolidar os estados de fonte em dados reais/oficiais, estimativa, demonstração e indisponível.
   - Remover alegações imprecisas de “tempo real”, fontes ou atualização quando a informação não vier do provedor.
   - Exibir “Não disponível” em vez de traço ou valor inferido quando um critério não existir.

2. **Preparar o cenário principal**
   - Tornar Av. Paulista → Ubatuba o cenário sugerido na Home e no planejador, mantendo a seleção real pelo Google Places.
   - Validar a rota rodoviária com Google Routes quando a conexão estiver disponível.
   - Se Google Maps não estiver conectado ou a rota falhar, mostrar uma mensagem específica e não fabricar distância ou duração.

3. **Tornar alternativas simuladas coerentes**
   - Marcar claramente Uber, 99, transporte público, bicicleta e combinações locais como demonstração.
   - Não apresentar modais incompatíveis com o trajeto longo como opções disponíveis.
   - Manter valores simulados apenas onde já fazem parte da demonstração e identificá-los junto aos cartões, carteira e política.

4. **Aprimorar resultados e explicabilidade**
   - Ajustar comparação, recomendação e Score para considerar somente informações disponíveis.
   - Separar visualmente “Como a rota foi avaliada” de “Por que esta rota foi recomendada”.
   - Preservar integralmente o algoritmo atual e deixar explícito que a IA apenas redige a explicação.
   - Melhorar a timeline para mostrar origem, segmentos existentes e destino.

5. **Completar o fluxo de apresentação**
   - Adicionar uma ação simples de “Planejar outra viagem”.
   - Revisar loading, erros, ausência de resultados e dados incompletos sem atrasos artificiais.
   - Manter Home, carteira e Portal RH alinhados com o mesmo vocabulário de demonstração.

6. **Validar sem regressões**
   - Testar Home, planejador, resultados, Score, explicação, carteira e RH nos seis tamanhos solicitados.
   - Verificar teclado, foco, nomes acessíveis, hierarquia de títulos, chamadas duplicadas e console.
   - Executar lint, verificação de tipos, build e os testes disponíveis; corrigir problemas introduzidos nesta fase.

## Detalhes técnicos
- A busca de endereços e a rota continuarão no servidor pela conexão Google Maps existente; nenhuma chave irá para o navegador.
- O primeiro teste encontrou o Google Maps desconectado neste ambiente. A implementação manterá uma falha honesta e a validação real dependerá de vincular uma conexão disponível ao projeto.
- Não serão adicionados banco, autenticação, APIs de Uber/99/GTFS, novo algoritmo de Score ou nova lógica financeira.

## Entrega
Relatório final com resultado do cenário, fontes reais e simuladas, limitações, validações executadas e pendências externas para a apresentação.

# PortalNutri Platform

# Master Application

**Versão:** 1.0

**Status:** Documento Mestre da Camada de Aplicação

---

# 00. Objetivo do Documento

Este documento define oficialmente a Camada de Aplicação do PortalNutri.

A Camada de Aplicação é responsável por coordenar os Casos de Uso da plataforma.

Ela não contém regras de negócio.

Seu papel é orquestrar Aggregates, Application Services, Eventos e mecanismos externos, preservando a integridade do domínio.

---

## Este documento define

- Camada de Aplicação;
- Commands;
- Queries;
- Application Services;
- Orquestrações;
- Transações;
- DTOs;
- Integrações;
- APIs;
- Jobs;
- Webhooks.

---

## Este documento NÃO define

- regras de negócio;
- banco de dados;
- entidades;
- APIs específicas;
- frameworks.

Esses conceitos pertencem aos demais Documentos Mestres.

---

# 01. Responsabilidade da Camada de Aplicação

A Camada de Aplicação representa a porta de entrada oficial das capacidades da plataforma.

Toda interação deverá ocorrer através de um Caso de Uso.

Nenhuma interface poderá acessar diretamente o Domínio.

---

## Fontes de entrada

A Camada de Aplicação poderá ser acionada por:

- Frontend;
- Mobile;
- APIs REST;
- GraphQL;
- Inteligência Artificial;
- Jobs;
- Eventos;
- Webhooks;
- Integrações externas.

Todos utilizarão exatamente os mesmos Casos de Uso.

---

# 02. Commands

Commands representam solicitações que alteram o estado da plataforma.

Todo Command executará exatamente um Caso de Uso.

---

## Exemplos

RegistrarPessoaCommand

CriarProntuarioCommand

AgendarConsultaCommand

PublicarPlanoAlimentarCommand

AplicarProtocoloCommand

ContratarAssinaturaCommand

CriarPedidoCommand

EnviarNotificacaoCommand

---

## Princípios

Commands:

- alteram estado;
- podem produzir Eventos;
- possuem validações;
- possuem autorização;
- podem iniciar transações.

---

# 03. Queries

Queries representam consultas.

Queries nunca alteram o estado da plataforma.

---

## Exemplos

ConsultarProntuarioQuery

ConsultarAgendaQuery

ConsultarPedidosQuery

ConsultarMarketplaceQuery

ConsultarIndicadoresQuery

ConsultarHistoricoClinicoQuery

---

## Princípios

Queries:

- nunca modificam dados;
- nunca publicam Eventos;
- podem utilizar projeções;
- podem utilizar caches;
- poderão utilizar mecanismos específicos de leitura.

---

# 04. Application Services

A implementação poderá utilizar Handlers específicos por Caso de Uso, seguindo os princípios de Vertical Slice Architecture.

Nesse modelo, cada Command, Query ou Workflow possuirá seu próprio Handler, evitando Application Services genéricos e excessivamente centralizados.

Application Services coordenam a execução dos Casos de Uso.

Eles não implementam regras de negócio.

As regras permanecem exclusivamente nos Aggregates.

---

## Responsabilidades

Os Application Services poderão:

- validar autorização;
- iniciar transações;
- carregar Aggregates;
- executar Casos de Uso;
- persistir alterações;
- publicar Eventos;
- acionar integrações;
- retornar resultados.

---

## Não poderão

- implementar regras clínicas;
- implementar regras financeiras;
- implementar regras comerciais;
- acessar diretamente outros Aggregates sem utilizar contratos oficiais.

---

## Organização

Cada Bounded Context possuirá seus próprios Application Services.

Exemplo

IAM

↓

PessoaApplicationService

↓

RegistrarPessoa

↓

Pessoa Aggregate

---

Care

↓

StartClinicalEncounter (Command)

↓

ClinicalEncounter Aggregate

---

Marketplace

↓

PedidoApplicationService

↓

CriarPedido

↓

Pedido Aggregate

---

# 05. Data Transfer Objects (DTO)

DTOs representam contratos entre a Camada de Aplicação e seus consumidores.

DTOs não representam entidades do domínio.

---

## Tipos

Input DTO

↓

Application Service

↓

Output DTO

---

## Princípios

DTOs:

- são imutáveis;
- não possuem regras de negócio;
- representam contratos públicos;
- podem evoluir independentemente do domínio.

---

# Princípio Fundamental

A Camada de Aplicação coordena.

O Domínio decide.

A Infraestrutura executa.

Essa separação deverá ser preservada em toda a plataforma.

# 06. Workflows e Orquestrações

Workflows representam Casos de Uso Compostos que coordenam múltiplos Commands, Queries ou Eventos entre diferentes Bounded Contexts.

Alguns Casos de Uso exigirem a colaboração entre múltiplos Bounded Contexts.

Esses fluxos serão coordenados pela Camada de Aplicação.

A Camada de Aplicação nunca implementará regras de negócio.

Sua responsabilidade será exclusivamente coordenar a execução dos Casos de Uso pertencentes aos respectivos Aggregates.

---

## Exemplo

Finalizar Consulta

↓

Care

↓

Eventos de Domínio

↓

AI

↓

Communication

↓

Analytics

Cada Contexto continuará responsável apenas pelo seu próprio domínio.

---

## Responsabilidades

As Orquestrações poderão:

- executar múltiplos Casos de Uso;
- coordenar transações distribuídas;
- publicar Eventos;
- acionar integrações;
- controlar fluxo de execução.

---

# 07. Transações

Toda transação deverá possuir um Aggregate Principal.

Sempre que possível, apenas um Aggregate será modificado por transação.

Quando múltiplos Aggregates participarem da mesma operação, deverá ser utilizada consistência eventual.

---

## Princípios

Uma transação deverá:

- iniciar;
- validar autorização;
- executar o Caso de Uso;
- persistir alterações;
- publicar Eventos;
- finalizar.

---

## Proibido

Não será permitido:

- atualizar múltiplos Aggregates diretamente;
- compartilhar transações entre Contextos;
- executar lógica de domínio na infraestrutura.

---

# 08. Eventos

A Camada de Aplicação será responsável pela publicação dos Eventos produzidos pelos Aggregates.

A decisão de publicar um Evento pertence ao Domínio.

A publicação pertence à Camada de Aplicação.

---

## Fluxo

Command

↓

Aggregate

↓

Evento

↓

Application Layer

↓

Event Bus

↓

Consumidores

Eventos não deverão ser publicados diretamente por controllers, componentes de interface, integrações externas ou infraestrutura.

A publicação deverá ocorrer após a execução bem-sucedida do Caso de Uso correspondente.

---

# 09. APIs

As APIs representam apenas um mecanismo de acesso aos Casos de Uso.

Nenhuma regra de negócio deverá existir nas APIs.

---

## Responsabilidades

As APIs poderão:

- validar autenticação;
- validar autorização;
- receber DTOs;
- executar Commands;
- executar Queries;
- devolver DTOs.

---

## Não poderão

- implementar regras clínicas;
- implementar regras financeiras;
- alterar Aggregates diretamente.

---

## Organização

As APIs deverão ser organizadas por Bounded Context.

Exemplo

/api/iam

/api/care

/api/marketplace

/api/business

/api/ai

/api/communication

/api/analytics

/api/platform

---

# 10. Integrações

Integrações representam comunicação com sistemas externos.

Toda integração deverá ocorrer através da Camada de Aplicação.

---

## Exemplos

Stripe

Mercado Pago

Google Calendar

WhatsApp

E-mail

OpenAI

Anthropic

Gemini

---

## Princípios

Integrações:

- nunca acessarão Aggregates diretamente;
- nunca alterarão o Domínio diretamente;
- sempre executarão Casos de Uso oficiais.

---

# 11. Inteligência Artificial

A IA consumirá exatamente a mesma Camada de Aplicação utilizada pelo Frontend, Mobile e APIs.

Não existirão atalhos arquiteturais para IA.

---

## A IA poderá

executar:

- Commands autorizados;
- Queries autorizadas;
- Casos de Uso autorizados.

---

## A IA nunca poderá

acessar diretamente:

- banco de dados;
- Aggregates;
- entidades;
- infraestrutura.

Toda atuação ocorrerá através da Camada de Aplicação.

---

## Fluxo

Pergunta

↓

Authorization Engine

↓

Application Layer

↓

Query ou Command

↓

Domínio

↓

Resposta

---

# Princípio Fundamental

Todos os consumidores da plataforma utilizarão exatamente a mesma Camada de Aplicação.

Não existirão caminhos alternativos para acesso ao domínio.

Isso garante:

- consistência;
- segurança;
- rastreabilidade;
- reutilização;
- baixo acoplamento.

# 12. Background Processing

Nem todos os Casos de Uso deverão ser executados de forma síncrona.

Operações de longa duração poderão ser processadas em segundo plano.

---

## Background Jobs

Os Background Jobs representam tarefas executadas de forma assíncrona.

Exemplos:

- envio de e-mails;
- envio de WhatsApp;
- processamento de IA;
- geração de relatórios;
- geração de dashboards;
- processamento de indicadores;
- importações;
- exportações.

---

## Princípios

Todo Job deverá:

- possuir identificação única;
- registrar início;
- registrar conclusão;
- registrar falhas;
- permitir reprocessamento;
- permitir monitoramento.

---

# 13. Scheduler

O Scheduler representa a execução automática de tarefas programadas.

---

## Exemplos

- renovação de assinaturas;
- encerramento de campanhas;
- atualização de indicadores;
- limpeza de dados temporários;
- sincronização de integrações;
- reprocessamento de filas.

---

## Princípios

Toda tarefa agendada deverá:

- possuir periodicidade definida;
- permitir auditoria;
- registrar execução;
- registrar falhas.

---

# 14. Webhooks

Webhooks representam eventos publicados para sistemas externos.

---

## Objetivos

Permitir que parceiros sejam notificados automaticamente quando eventos relevantes ocorrerem.

---

## Exemplos

- Pedido Criado;
- Pagamento Confirmado;
- Consulta Finalizada;
- Plano Alimentar Publicado;
- Documento Clínico Compartilhado;
- Assinatura Renovada.

---

## Princípios

Todo Webhook deverá:

- possuir assinatura digital;
- permitir reenvio;
- possuir versionamento;
- registrar entregas;
- registrar falhas.

---

# 15. Idempotência

Commands deverão ser idempotentes sempre que houver possibilidade de reexecução.

Operações críticas deverão produzir exatamente um único resultado lógico, mesmo quando executadas mais de uma vez.

---

## Exemplos

- Confirmar Pagamento;
- Contratar Assinatura;
- Criar Pedido;
- Registrar Pessoa;
- Emitir Prescrição.

---

# 16. Tratamento de Erros

A Camada de Aplicação deverá tratar erros de forma consistente.

---

## Categorias

Erros poderão ser classificados como:

- Validação;
- Autorização;
- Regra de Negócio;
- Integração;
- Infraestrutura;
- Processamento.

---

## Princípios

Nenhum erro técnico deverá expor detalhes internos da plataforma.

Toda falha deverá possuir:

- código;
- descrição;
- rastreabilidade;
- contexto.

---

# 17. Observabilidade

Toda execução da Camada de Aplicação deverá ser observável.

---

## Registro

A plataforma deverá registrar:

- início da execução;
- término;
- duração;
- usuário;
- origem;
- Caso de Uso executado;
- Aggregate principal;
- Eventos publicados.

---

## Objetivos

A observabilidade permitirá:

- monitoramento;
- auditoria;
- diagnóstico;
- métricas;
- rastreamento.

---

# 18. Governança

Toda funcionalidade da plataforma deverá obrigatoriamente seguir a seguinte sequência:

Interface

↓

Application Layer

↓

Caso de Uso

↓

Aggregate

↓

Evento

↓

Consumidores

Nenhum componente poderá ignorar esse fluxo.

---

## Evolução

Novos Commands, Queries e Workflows poderão ser adicionados desde que:

- respeitem os Bounded Contexts;
- respeitem os Aggregates;
- respeitem os Casos de Uso;
- respeitem o Modelo de Permissões.

---

# Princípios Fundamentais

A Camada de Aplicação representa o ponto oficial de entrada para todas as capacidades do PortalNutri.

Ela coordena o domínio, preserva a arquitetura e garante que todas as interfaces utilizem exatamente os mesmos Casos de Uso.

Essa abordagem assegura:

- baixo acoplamento;
- alta reutilização;
- consistência;
- escalabilidade;
- rastreabilidade;
- facilidade de manutenção.

---

# Conclusão

A Camada de Aplicação constitui a ponte entre os consumidores da plataforma e o domínio de negócio.

Toda interação com o PortalNutri deverá ocorrer através desta camada.

Em conjunto com os Documentos Mestres de Projeto, Modelo de Domínio, Eventos, Bounded Contexts, Aggregates, Casos de Uso e Permissões, este documento estabelece a arquitetura oficial da aplicação.

Toda implementação futura deverá respeitar os princípios aqui definidos.


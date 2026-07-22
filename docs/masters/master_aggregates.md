# PortalNutri Platform

# Master Aggregates

**Versão:** 1.1

**Status:** Documento Mestre de Aggregates

**Última reconciliação arquitetural:** 2026-07-22 (pós FEATURE-039)

---

# 00. Objetivo do Documento

Este documento define oficialmente os Aggregates do PortalNutri Platform.

Aggregates representam agrupamentos consistentes de entidades e regras de negócio que devem evoluir juntas dentro de um mesmo limite transacional.

Este documento não define:

- Banco de Dados;
- APIs;
- Estrutura física do código;
- Frameworks;
- Persistência.

Este documento define:

- Quais Aggregates existem;
- Qual é a Aggregate Root;
- Quais entidades pertencem ao Aggregate;
- Quais regras devem permanecer consistentes;
- Quais Eventos normalmente são produzidos.

---

## Objetivo Final

Os Aggregates definidos neste documento servirão como base para:

- Casos de Uso;
- Application Services;
- Camada de Aplicação;
- Banco de Dados;
- Eventos de Domínio;
- Organização do Código;
- Testes de Domínio.

---

# 01. O que é um Aggregate

Um Aggregate representa um limite de consistência dentro do domínio.

Todas as entidades pertencentes ao mesmo Aggregate deverão permanecer consistentes ao término de uma operação de negócio.

Cada Aggregate possuirá exatamente uma Aggregate Root.

A Aggregate Root será a única entidade acessível diretamente pelos demais componentes da plataforma.

Nenhuma entidade interna poderá ser modificada diretamente por componentes externos ao Aggregate.

---

## Aggregate Root

A Aggregate Root possui as seguintes responsabilidades:

- proteger as regras do domínio;
- garantir consistência;
- controlar alterações internas;
- publicar Eventos de Domínio;
- impedir violações das regras do Aggregate.

---

# 02. Princípios Gerais

Todos os Aggregates do PortalNutri deverão seguir os seguintes princípios:

- possuir uma única Aggregate Root;
- proteger as regras de negócio;
- minimizar dependências externas;
- publicar Eventos quando fatos relevantes ocorrerem;
- manter baixo acoplamento;
- preservar alta coesão.

Sempre que possível, um Caso de Uso deverá modificar apenas um Aggregate por transação.

Quando múltiplos Aggregates precisarem colaborar, essa colaboração deverá ocorrer por meio de Eventos de Domínio ou mecanismos oficiais definidos pela arquitetura.

---

# 03. Aggregate IAM

O Aggregate IAM é responsável pela identidade digital dos participantes da plataforma.

Ele representa o núcleo da autenticação, autorização e relacionamentos entre Pessoas.

---

## Aggregates do Contexto IAM

O Contexto IAM possui os seguintes Aggregates **implementados**:

- **Person** (`Person`)
- **Tenant** (`Tenant`)
- **Membership** (`Membership` — Vínculo)
- **Credential** (`Credential`)
- **Session** (`Session`)
- **Role** (`Role`)
- **RoleAssignment** (`RoleAssignment`)
- **Permission** (`Permission`)
- **PermissionAssignment** (`PermissionAssignment`)

Aggregates **ainda não implementados**:

- Unidade Organizacional

---

## Responsabilidades

O Aggregate IAM é responsável por:

- criar Pessoas;
- atribuir Papéis;
- remover Papéis;
- estabelecer Vínculos;
- encerrar Vínculos;
- conceder Permissões;
- revogar Permissões.

---

## Regras de Consistência

Uma Pessoa poderá possuir múltiplos Papéis.

Uma Pessoa poderá possuir múltiplos Vínculos.

Permissões deverão respeitar os Papéis atribuídos.

Nenhuma alteração poderá violar as regras de identidade definidas pelo domínio.

---

## Eventos normalmente publicados

- Pessoa Criada
- Pessoa Atualizada
- Pessoa Inativada
- Papel Atribuído
- Papel Revogado
- Vínculo Criado
- Vínculo Atualizado
- Vínculo Encerrado
- Permissão Concedida
- Permissão Revogada

---

## Contextos consumidores

- Care
- Marketplace
- Business
- AI
- Communication
- Analytics
- Platform

---

# 04. Bounded Context Care — Modelo de Escrita Multi-Aggregate

O Bounded Context **Care** representa toda a jornada clínica do paciente.

A versão 1.0 deste documento descrevia um único Aggregate Root `Prontuário` englobando todas as entidades clínicas. **Esse modelo foi superseded** pelas decisões ADR-0016 a ADR-0022 e pela implementação concluída até FEATURE-039.

## Supersessão do modelo monolítico

| Conceito legado (v1.0) | Modelo atual (implementado) |
|------------------------|----------------------------|
| `Prontuário` como Aggregate Root de escrita | **Não implementado** como AR de escrita |
| Prontuário englobando todas as entidades | Múltiplos Aggregate Roots independentes no módulo `clinical/` |
| Visão unificada do prontuário | `ClinicalChart` — **Read Model query-side** (ADR-0019; FEATURE-040; não implementado) |

> **`ClinicalChart` não é Aggregate Root.** É um compositor de leitura que agregará timeline clínica a partir de queries sobre os aggregates de escrita existentes. Não possui commands, lifecycle próprio ou persistência independente.

---

## Implementação física do Care BC

O Care BC é implementado em módulos físicos que **não representam Bounded Contexts independentes**:

| Módulo | Aggregates implementados | Papel |
|--------|---------------------------|-------|
| `clinical/` | 10 ARs clínicos (ver abaixo) | Núcleo do modelo de escrita clínico |
| `patient/` | `Patient`, `PatientNutritionistAssignment` | Cadastro e vínculo clínico do paciente |
| `nutrition/` | `Nutritionist` | Perfil profissional do nutricionista |
| `appointment/` | `Appointment` | Agendamento operacional (pré-sessão) |

Comunicação cross-módulo ocorre via **directory ports** (anti-corruption layer) na camada de aplicação — nunca via acesso direto ao domínio de outro módulo.

---

## Clusters de Aggregate Roots (ADR-0016)

### Cluster session-bound (vinculados à sessão clínica)

Registros cujo contexto de registro está ancorado a um `ClinicalEncounter` (Encontro Clínico / Consulta em curso).

| Aggregate Root | Termo de negócio (PT) | Lifecycle | Responsabilidade |
|----------------|----------------------|-----------|------------------|
| **ClinicalEncounter** | Encontro Clínico / Consulta em curso | `OPEN → FINISHED \| CANCELLED` | Ancora a sessão clínica; registra notas clínicas |
| **Anamnesis** | Anamnese | `DRAFT → COMPLETED` | Coleta estruturada por seções durante a sessão |
| **AnthropometricAssessment** | Avaliação Antropométrica | Registro imutável (`record`) | Medidas antropométricas; classificação IMC via policy |
| **BodyCompositionAssessment** | Avaliação de Composição Corporal | Registro imutável (`record`) | Composição corporal; consistência via policy |
| **ClinicalEvolution** | Evolução Clínica | `DRAFT → FINALIZED \| CANCELLED` | Narrativa longitudinal intermomentos (Model B — ADR-0021) |

**ClinicalEvolution** descreve e narra a mudança clínica. Conteúdo `FINALIZED` é imutável; retificações futuras exigem novo registro (BACKLOG-013).

### Cluster patient-scoped (escopo do paciente)

Registros de acompanhamento longitudinal independentes de uma sessão específica.

| Aggregate Root | Termo de negócio (PT) | Lifecycle | Responsabilidade |
|----------------|----------------------|-----------|------------------|
| **NutritionDiagnosis** | Diagnóstico Nutricional | `DRAFT → CONFIRMED \| CANCELLED` | Diagnóstico nutricional estruturado |
| **ClinicalObjective** | Objetivo Clínico | `DRAFT → ACTIVE ⇄ PAUSED → COMPLETED \| CANCELLED` | Meta terapêutica com critérios de sucesso |
| **MealPlan** | Plano Alimentar | `DRAFT → ACTIVE \| CANCELLED` | Estratégia alimentar prática |
| **Prescription** | Prescrição Nutricional | `DRAFT → ISSUED \| CANCELLED` | Instruções terapêuticas emitidas (`emit()`) |
| **OutcomeTracking** | Acompanhamento de Resultado | `DRAFT → RECORDED \| CANCELLED` | Julgamento clínico estruturado sobre progresso (ADR-0022) |

**OutcomeTracking** avalia progresso em direção a um `ClinicalObjective`. `GOAL_ACHIEVED` é um valor de `OutcomeAssessment` — **não completa automaticamente** o `ClinicalObjective` e **não dispara writes cross-aggregate**.

---

## Entidades subordinadas (não são Aggregate Roots)

| Entidade | Pertence a | Descrição |
|----------|-----------|-----------|
| **MealPlanMeal** | `MealPlan` | Refeição individual dentro de um plano alimentar |
| **PrescriptionLine** | `Prescription` | Linha de instrução terapêutica dentro de uma prescrição |

Entidades subordinadas só são modificadas através da Aggregate Root pai.

---

## Aggregates relacionados (módulos satélite do Care BC)

| Módulo | Aggregate Root | Lifecycle | Responsabilidade |
|--------|---------------|-----------|------------------|
| `patient/` | **Patient** | `ACTIVE \| INACTIVE` | Identidade clínica do paciente no tenant |
| `patient/` | **PatientNutritionistAssignment** | `ACTIVE \| REMOVED` | Vínculo paciente–nutricionista |
| `nutrition/` | **Nutritionist** | `ACTIVE \| INACTIVE` | Perfil profissional do nutricionista |
| `appointment/` | **Appointment** | `SCHEDULED → CONFIRMED → COMPLETED \| CANCELLED \| NO_SHOW` | Agendamento operacional |

### Appointment vs ClinicalEncounter

| Conceito | Aggregate | Papel |
|----------|-----------|-------|
| **Appointment** | `appointment/` | Agendamento administrativo/operacional (pré-atendimento) |
| **ClinicalEncounter** | `clinical/` | Sessão clínica em curso ou finalizada (atendimento propriamente dito) |

São aggregates distintos com lifecycles e responsabilidades separadas.

---

## ClinicalChart — Read Model (não implementado)

Conforme ADR-0019:

- **Tipo:** compositor query-side / read model
- **Feature planejada:** FEATURE-040
- **Backlog:** BACKLOG-007
- **Persistência:** nenhuma tabela própria; compõe dados de queries existentes
- **Responsabilidade:** timeline clínica unificada para UI, relatórios e contexto de IA

---

## Regras de consistência (modelo multi-aggregate)

- Todo registro clínico pertence a um `tenantId` e `patientId` válidos.
- Registros session-bound referenciam `clinicalEncounterId` quando aplicável (obrigatório em v1 para `ClinicalEvolution`).
- Registros patient-scoped referenciam `clinicalObjectiveId` quando aplicável (obrigatório para `OutcomeTracking`).
- Proveniência opcional: `originClinicalEncounterId`, `originAnamnesisId`.
- Um Caso de Uso modifica **apenas um Aggregate Root por transação** (ADR-0016).
- Colaboração entre aggregates ocorre via validação read-only (directory ports) ou Eventos de Domínio — nunca via mutação direta cross-aggregate.
- Registros publicados (`COMPLETED`, `FINALIZED`, `RECORDED`, `ISSUED`, `ACTIVE`) são imutáveis conforme ADR-0017.

---

## Eventos normalmente publicados (aggregates implementados)

**ClinicalEncounter:** Started, Finished, Cancelled, NotesUpdated

**Anamnesis:** Started, SectionUpdated, Completed

**AnthropometricAssessment / BodyCompositionAssessment:** Recorded

**ClinicalEvolution:** Started, Updated, Finalized, Cancelled, ResponsibleNutritionistChanged

**ClinicalObjective:** Created, Activated, Paused, Resumed, Completed, Cancelled, Updated, ResponsibleNutritionistChanged

**NutritionDiagnosis:** Created, Updated, Confirmed, Cancelled, ResponsibleNutritionistChanged

**MealPlan:** Created, Updated, Activated, Cancelled, ResponsibleNutritionistChanged

**Prescription:** Created, Updated, Issued, Cancelled, ResponsibleNutritionistChanged

**OutcomeTracking:** Started, Updated, Recorded, Cancelled, ResponsibleNutritionistChanged

---

## Conceitos Care ainda não implementados

- Protocolo Aplicado
- Solicitação de Exame / Resultado de Exame
- Indicador Clínico (como aggregate standalone)
- ClinicalChart (read model — FEATURE-040)

---

## Contextos consumidores

- AI
- Analytics
- Communication
- Business

---

## Princípio Fundamental

Toda informação clínica do PortalNutri nasce, evolui e permanece protegida dentro dos Aggregate Roots do Bounded Context Care.

Nenhum outro Bounded Context poderá alterar diretamente qualquer registro clínico. A visão unificada do prontuário será composta query-side por `ClinicalChart`, nunca por um aggregate monolítico de escrita.

# 05. Aggregate Marketplace

O Aggregate Marketplace representa o núcleo das operações comerciais relacionadas à oferta de produtos, serviços e conteúdos disponibilizados dentro do PortalNutri.

---

## Aggregates do Contexto Marketplace

O Contexto Marketplace poderá possuir múltiplos Aggregates:

- Loja
- Produto
- Pedido
- Campanha
- Cupom
- Avaliação Comercial

---

## Responsabilidades

O Aggregate Marketplace é responsável por:

- administrar Lojas;
- publicar Produtos;
- publicar Serviços;
- publicar Conteúdos;
- administrar Ofertas;
- administrar Cupons;
- administrar Campanhas;
- criar Pedidos;
- registrar Avaliações.

---

## Regras de Consistência

Todo Produto deverá pertencer a uma Loja.

Todo Pedido deverá possuir pelo menos um Item.

Toda Avaliação deverá estar vinculada a um Produto ou Serviço existente.

Ofertas e Cupons deverão respeitar suas regras de validade.

---

## Eventos normalmente publicados

- Loja Publicada
- Loja Atualizada
- Loja Suspensa
- Produto Publicado
- Produto Atualizado
- Produto Despublicado
- Serviço Publicado
- Conteúdo Publicado
- Oferta Criada
- Oferta Atualizada
- Oferta Encerrada
- Campanha Iniciada
- Campanha Encerrada
- Cupom Criado
- Cupom Utilizado
- Pedido Criado
- Compra Confirmada
- Avaliação Publicada

---

## Contextos consumidores

- Business
- Analytics
- AI
- Communication

---

# 06. Aggregate Business

O Aggregate Business representa todas as regras financeiras e comerciais da plataforma.

---

## Aggregates do Contexto Business

O Contexto Business poderá possuir múltiplos Aggregates:

- Assinatura
- Cobrança
- Pagamento
- Comissão
- Repasse Financeiro
- Documento Fiscal

---

## Responsabilidades

O Aggregate Business é responsável por:

- administrar Assinaturas;
- gerar Cobranças;
- confirmar Pagamentos;
- calcular Comissões;
- realizar Repasses;
- controlar faturamento.

---

## Regras de Consistência

Nenhum Pagamento poderá existir sem uma Cobrança correspondente.

Toda Comissão deverá estar vinculada a uma operação comercial válida.

Todo Repasse dependerá da confirmação financeira.

---

## Eventos normalmente publicados

- Cobrança Gerada
- Cobrança Cancelada
- Pagamento Recebido
- Pagamento Confirmado
- Pagamento Estornado
- Reembolso Efetuado
- Assinatura Contratada
- Assinatura Renovada
- Assinatura Alterada
- Assinatura Cancelada
- Comissão Calculada
- Comissão Liberada
- Repasse Financeiro Efetuado
- Nota Fiscal Emitida

---

## Contextos consumidores

- Marketplace
- Analytics
- AI
- Communication

---

# 07. Aggregate AI

O Aggregate AI representa a atuação dos Agentes Inteligentes da plataforma.

Seu objetivo é apoiar os demais Contextos sem assumir responsabilidade sobre os conceitos de negócio pertencentes a eles.

---

## Aggregate Root

Agente Inteligente

---

## Entidades pertencentes

- Contexto Inteligente
- Memória Inteligente
- Sessão Inteligente
- Base Oficial de Conhecimento
- Ferramentas
- Feedback

---

## Responsabilidades

O Aggregate AI é responsável por:

- executar Agentes;
- construir Contexto;
- consultar Conhecimento;
- consultar Memória;
- gerar Respostas;
- gerar Sugestões;
- registrar Feedback.

---

## Regras de Consistência

Nenhum Agente poderá alterar diretamente informações pertencentes a outro Aggregate.

Toda sugestão produzida dependerá de validação quando envolver decisões clínicas, financeiras ou administrativas.

---

## Eventos normalmente publicados

- Agente Acionado
- Contexto Inteligente Construído
- Conhecimento Consultado
- Memória Consultada
- Resposta Gerada
- Sugestão Clínica Gerada
- Protocolo Sugerido
- Plano Alimentar Sugerido
- Prescrição Sugerida
- Resumo Inteligente Gerado
- Explicação Gerada
- Feedback Recebido
- Aprendizado Registrado

---

## Contextos consumidores

Todos os demais Contextos.

---

# 08. Aggregate Communication

O Aggregate Communication representa toda comunicação realizada pela plataforma.

---

## Aggregate Root

Mensagem

---

## Entidades pertencentes

- Notificação
- Convite
- Compartilhamento
- Canal de Comunicação

---

## Responsabilidades

O Aggregate Communication é responsável por:

- enviar mensagens;
- enviar notificações;
- administrar convites;
- registrar compartilhamentos.

---

## Regras de Consistência

Toda comunicação deverá possuir destinatário válido.

Compartilhamentos deverão respeitar as regras de autorização definidas pelo domínio.

---

## Eventos normalmente publicados

- Notificação Enviada
- Notificação Visualizada
- Convite Enviado
- Convite Aceito
- Convite Recusado
- Documento Compartilhado
- Documento Removido do Compartilhamento

---

## Contextos consumidores

Todos os Contextos.

---

# 09. Aggregate Analytics

O Aggregate Analytics representa o conjunto de indicadores e análises produzidos pela plataforma.

---

## Aggregate Root

Dashboard

---

## Entidades pertencentes

- KPI
- Indicador Estratégico
- Relatório
- Métrica

---

## Responsabilidades

O Aggregate Analytics é responsável por:

- consolidar informações;
- produzir indicadores;
- gerar dashboards;
- gerar relatórios.

---

## Regras de Consistência

Analytics nunca será proprietário dos dados de origem.

Toda informação analítica deverá ser derivada dos Eventos publicados pelos demais Aggregates.

---

## Eventos normalmente publicados

- Dashboard Atualizado
- Indicador Estratégico Calculado
- Relatório Gerado

---

## Contextos consumidores

Todos os Contextos.

---

# 10. Aggregate Platform

O Aggregate Platform representa os serviços transversais utilizados por toda a plataforma.

---

## Aggregate Root

Configuração Global

---

## Entidades pertencentes

- Parametrização
- Feature Flag
- Auditoria
- Configuração Sistêmica

---

## Responsabilidades

O Aggregate Platform é responsável por:

- administrar configurações globais;
- controlar parametrizações;
- administrar Feature Flags;
- registrar auditorias.

---

## Regras de Consistência

Alterações globais deverão respeitar as políticas de governança da plataforma.

Nenhum Aggregate poderá modificar configurações pertencentes ao Aggregate Platform.

---

## Eventos normalmente publicados

- Configuração Alterada
- Feature Flag Atualizada
- Auditoria Registrada

---

## Contextos consumidores

Todos os Contextos.

# 11. Comunicação entre Aggregates

Os Aggregates do PortalNutri deverão permanecer independentes.

Nenhum Aggregate poderá modificar diretamente o estado interno de outro Aggregate.

Toda colaboração entre Aggregates deverá ocorrer por meio de mecanismos oficialmente definidos pela arquitetura.

---

## Formas de Comunicação

Os Aggregates poderão colaborar através de:

- Eventos de Domínio;
- Application Services;
- APIs públicas;
- Consultas autorizadas;
- Mensageria;
- Outros contratos definidos pela arquitetura.

A escolha do mecanismo de comunicação será uma decisão de implementação e não altera os limites conceituais definidos neste documento.

---

## Colaboração entre Aggregates

Quando uma operação envolver múltiplos Aggregates, cada Aggregate continuará sendo responsável apenas pelas suas próprias regras de negócio.

Exemplo:

Consulta Finalizada

↓

Aggregate Care publica:

• Consulta Finalizada

↓

Aggregate AI consome

↓

Aggregate Analytics consome

↓

Aggregate Communication consome

↓

Aggregate Business poderá consumir, quando aplicável.

Cada Aggregate reage ao Evento sem alterar diretamente o estado interno do Aggregate Care.

---

# 12. Consistência Transacional

Cada Aggregate representa um limite de consistência.

Sempre que possível, uma transação deverá alterar apenas um Aggregate.

Quando múltiplos Aggregates precisarem participar de um mesmo fluxo de negócio, a consistência deverá ser obtida por meio de Eventos de Domínio ou mecanismos equivalentes.

---

## Princípio

Consistência forte dentro do Aggregate.

Consistência eventual entre Aggregates.

Esse princípio reduz acoplamento e aumenta a escalabilidade da plataforma.

---

# 13. Eventos entre Aggregates

Todo Aggregate poderá publicar Eventos de Domínio relacionados aos conceitos sob sua responsabilidade.

Esses Eventos poderão ser consumidos pelos demais Aggregates.

Entretanto:

- publicar um Evento não transfere responsabilidade;
- consumir um Evento não concede propriedade sobre os dados.

Cada Aggregate continuará sendo o único responsável pelos conceitos sob sua administração.

---

## Exemplo

Aggregate Care

↓

publica

↓

Plano Alimentar Publicado

↓

Aggregate AI

gera sugestões futuras.

↓

Aggregate Analytics

atualiza indicadores.

↓

Aggregate Communication

envia notificação ao paciente.

Nenhum desses Aggregates altera diretamente o Plano Alimentar.

---

# 14. Regras Arquiteturais

Todos os Aggregates deverão obedecer às seguintes regras.

---

## Aggregate Root

Todo Aggregate possuirá exatamente uma Aggregate Root.

---

## Encapsulamento

Entidades internas nunca deverão ser manipuladas diretamente por componentes externos.

---

## Responsabilidade Única

Cada Aggregate deverá proteger apenas os conceitos pertencentes ao seu domínio.

---

## Baixo Acoplamento

Os Aggregates deverão depender apenas de contratos públicos.

---

## Alta Coesão

As entidades pertencentes ao mesmo Aggregate deverão evoluir juntas.

---

## Publicação de Eventos

Eventos deverão representar fatos relevantes ocorridos dentro do Aggregate.

---

## Independência

Cada Aggregate poderá evoluir independentemente dos demais.

---

# 15. Governança dos Aggregates

Os Aggregates representam um dos principais mecanismos de proteção do domínio do PortalNutri.

Sua estrutura deverá permanecer estável ao longo da evolução da plataforma.

Novos Aggregates poderão ser criados quando surgir um novo domínio de negócio claramente delimitado.

Entretanto, a simples necessidade técnica não justifica a criação de um novo Aggregate.

---

## Alterações

Qualquer alteração estrutural em um Aggregate deverá responder às seguintes perguntas:

- Qual problema de negócio está sendo resolvido?
- Qual Aggregate será afetado?
- Existe violação de responsabilidade?
- Existe impacto em Eventos publicados?
- Existe impacto em outros Bounded Contexts?

Caso essas perguntas não possam ser respondidas de forma objetiva, a alteração deverá ser reavaliada antes da implementação.

---

# 16. Princípios Fundamentais

Os Aggregates representam as fronteiras oficiais de consistência do domínio do PortalNutri.

Cada Aggregate possui:

- uma única Aggregate Root;
- responsabilidade claramente definida;
- regras próprias;
- Eventos próprios;
- autonomia para evoluir.

A preservação desses limites garante:

- baixo acoplamento;
- alta coesão;
- escalabilidade;
- facilidade de manutenção;
- evolução contínua da plataforma;
- alinhamento com os princípios de Domain-Driven Design.

---

# Conclusão

Os Aggregates definidos neste documento representam a implementação conceitual das regras de negócio do PortalNutri.

Em conjunto com os Documentos Mestres de Projeto, Modelo de Domínio, Modelo Conceitual, Eventos e Bounded Contexts, constituem a base arquitetural oficial da plataforma.

Toda implementação futura deverá respeitar os limites definidos neste documento, preservando a integridade do domínio e garantindo uma arquitetura sustentável, modular e preparada para evoluir ao longo do tempo.


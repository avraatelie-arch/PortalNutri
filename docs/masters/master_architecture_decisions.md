# PortalNutri Platform

# Master Architecture Decisions

**Versão:** 1.0

**Status:** Documento Mestre de Decisões Arquiteturais

---

# Objetivo

Este documento registra oficialmente as principais decisões arquiteturais do PortalNutri Platform.

Seu objetivo é preservar o histórico das decisões que moldaram a arquitetura da plataforma, evitando a perda de contexto ao longo da evolução do sistema.

Cada decisão documenta:

- contexto;
- decisão tomada;
- justificativa;
- impacto arquitetural.

Este documento deverá ser atualizado sempre que uma nova decisão arquitetural relevante for aprovada.

---

# Escopo

Este documento registra exclusivamente decisões arquiteturais permanentes.

Decisões de implementação, tecnologia, linguagem de programação, bibliotecas, frameworks ou infraestrutura operacional não deverão ser registradas neste documento.

Seu foco é preservar decisões que influenciam diretamente a arquitetura de longo prazo da plataforma.

---

# ADR-0001

## Pessoa é a Identidade Única da Plataforma

### Contexto

Inicialmente o domínio utilizava entidades distintas para Paciente, Nutricionista, Secretária e Administrador.

### Decisão

Toda identidade da plataforma será representada pela entidade Pessoa.

Paciente, Nutricionista, Secretária, Administrador e demais funções serão representados como Papéis.

### Justificativa

- reduz duplicação;
- simplifica relacionamentos;
- facilita evolução da plataforma;
- permite múltiplos papéis por Pessoa.

---

# ADR-0002

## Papéis não representam Permissões

### Contexto

Sistemas tradicionais associam permissões diretamente aos papéis.

### Decisão

O PortalNutri adotará um modelo híbrido composto por:

- Pessoa;
- Papéis;
- Permissões;
- Escopos;
- Políticas;
- Vínculos;
- Consentimentos.

### Justificativa

Esse modelo suporta cenários complexos e está alinhado aos princípios de RBAC + ABAC.

---

# ADR-0003

## Vínculo Clínico como base da autorização

### Contexto

O acesso às informações clínicas depende do relacionamento entre os participantes.

### Decisão

O Vínculo Clínico constitui um requisito obrigatório para acesso às informações clínicas, salvo exceções administrativas previstas pela plataforma.

### Justificativa

- menor exposição de dados;
- aderência à LGPD;
- segurança.

---

# ADR-0004

## Bounded Contexts Oficiais

### Decisão

A plataforma será dividida nos seguintes Bounded Contexts:

- IAM;
- Care;
- Marketplace;
- Business;
- AI;
- Communication;
- Analytics;
- Platform.

### Justificativa

Separação clara de responsabilidades e baixo acoplamento.

---

# ADR-0005

## Modular Monolith First

### Contexto

Foi avaliada a utilização de Microservices.

### Decisão

A primeira versão será implementada como Modular Monolith.

### Justificativa

- menor complexidade;
- maior produtividade;
- evolução gradual;
- possibilidade futura de extração de módulos.

---

# ADR-0006

## Application Layer como ponto único de entrada

### Decisão

Toda interação ocorrerá através da Camada de Aplicação.

Nenhum consumidor acessará diretamente o domínio.

### Consumidores

- Frontend;
- Mobile;
- APIs;
- IA;
- Jobs;
- Webhooks;
- Integrações.

---

# ADR-0007

## Commands, Queries e Workflows

### Decisão

A Camada de Aplicação utilizará três mecanismos principais:

- Commands;
- Queries;
- Workflows.

### Justificativa

Separação clara entre leitura, escrita e orquestrações.

---

# ADR-0008

## Vertical Slice Architecture

### Decisão

Cada Caso de Uso possuirá implementação independente.

Não existirão serviços genéricos concentrando regras de negócio.

### Benefícios

- baixo acoplamento;
- alta coesão;
- facilidade de evolução.

---

# ADR-0009

## Authorization Engine Centralizado

### Decisão

Toda autorização será realizada por um mecanismo centralizado.

Nenhum módulo implementará regras próprias de autorização.

### Justificativa

Consistência e segurança.

---

# ADR-0010

## IA como Consumidora da Camada de Aplicação

### Decisão

A Inteligência Artificial utilizará exatamente os mesmos Casos de Uso disponíveis aos demais consumidores.

A IA nunca acessará diretamente:

- banco de dados;
- entidades;
- Aggregates;
- repositórios.

---

# ADR-0011

## Human in the Loop

### Decisão

A IA nunca substituirá a decisão profissional.

Ela poderá:

- sugerir;
- resumir;
- explicar;
- recomendar.

A decisão final permanecerá sob responsabilidade humana.

---

# ADR-0012

## Eventos como mecanismo oficial de integração

### Decisão

A comunicação assíncrona ocorrerá prioritariamente através de Eventos.

Cada Bounded Context reagirá aos Eventos preservando sua autonomia.

---

# ADR-0013

## Segurança por padrão

### Decisão

Toda funcionalidade deverá respeitar:

- autenticação;
- autorização;
- auditoria;
- criptografia;
- LGPD.

Nenhuma exceção será implementada fora desses mecanismos.

---

# ADR-0014

## Base Oficial de Conhecimento

### Decisão

A IA utilizará uma Base Oficial de Conhecimento distinta da Memória Inteligente.

### Justificativa

Evitar que memórias temporárias alterem o conhecimento institucional da plataforma.

---

# ADR-0015

## Documentos Mestres como Fonte Oficial da Arquitetura

### Decisão

Os Documentos Mestres representam a única fonte oficial da arquitetura do PortalNutri.

Toda alteração arquitetural deverá ser refletida nesses documentos antes da implementação.

### Impacto

Os Documentos Mestres constituem a fonte oficial da arquitetura.

Em caso de divergência entre documentação e implementação, a documentação prevalecerá até que uma nova decisão arquitetural seja oficialmente registrada.

---

# ADR-0016

## Registros Clínicos Vinculados à Sessão vs Escopo do Paciente

### Contexto

O módulo Clinical contém aggregates com diferentes graus de acoplamento temporal e de proveniência.

### Decisão

O módulo Clinical adota dois clusters arquiteturais complementares:

**Registros vinculados à sessão (session-bound):**

- `ClinicalEncounter` — unidade temporal de atendimento (OPEN → FINISHED/CANCELLED)
- `Anamnesis` — 1:1 com encounter; coleta estruturada durante a sessão
- `AnthropometricAssessment` e `BodyCompositionAssessment` — registros imutáveis capturados durante anamnese DRAFT + encounter OPEN

**Registros de escopo do paciente (patient-scoped):**

- `ClinicalObjective`, `NutritionDiagnosis`, `MealPlan` — aggregates independentes, indexados por tenant + patient
- Referências de origem (`originClinicalEncounterId`, `originAnamnesisId`) são opcionais e servem apenas como proveniência; não criam acoplamento de lifecycle

### Justificativa

- Separa o fluxo de coleta clínica momentânea da evolução longitudinal do paciente
- Permite criar objetivos, diagnósticos e planos fora de uma sessão ativa
- Mantém integridade referencial sem impor FKs rígidas entre lifecycles distintos

### Status

Aprovado — Implementado (Consolidation Sprint, FEATURE-037 prep)

---

# ADR-0017

## Política de Mutação de Registros Publicados no Módulo Clinical

### Contexto

Aggregates patient-scoped possuem estados publicados com regras de edição distintas, identificadas na revisão de consolidação arquitetural.

### Decisão

A política de mutação após publicação é **intencionalmente distinta por aggregate**:

| Aggregate | Estado publicado | Edição de conteúdo | Evolução clínica |
|-----------|------------------|--------------------|------------------|
| `ClinicalObjective` | ACTIVE (e PAUSED) | **Permitida** — objetivos evoluem durante tratamento | Pause/resume/complete/cancel |
| `NutritionDiagnosis` | CONFIRMED | **Proibida** — registro imutável após confirmação | Nova diagnosis; cancel excepcional |
| `MealPlan` | ACTIVE | **Proibida** — plano imutável após ativação | Novo plano; cancel excepcional |

Esta divergência **não é inconsistência acidental**. Reflete semânticas de domínio distintas:

- Objetivos clínicos são metas evolutivas que podem ser refinadas
- Diagnósticos nutricionais confirmados são decisões clínicas registradas
- Planos alimentares ativos são prescrições entregues ao paciente

### Justificativa

- Preserva rastreabilidade clínica onde imutabilidade é requisito legal/profissional
- Permite flexibilidade terapêutica onde o domínio exige ajuste contínuo
- Evita unificação artificial de regras incompatíveis

### Status

Aprovado — Implementado (Consolidation Sprint, FEATURE-037 prep)

---

# ADR-0018

## Vocabulário de Lifecycle Específico por Aggregate Clinical

### Contexto

O módulo Clinical utiliza verbos e estados distintos para marcar a publicação ou conclusão de registros clínicos.

### Decisão

Os verbos de lifecycle são **específicos de domínio** e **não devem ser artificialmente unificados**:

| Verbo | Aggregates | Significado clínico |
|-------|------------|---------------------|
| **Activate** | ClinicalObjective, MealPlan | Torna o registro operacional/visível no tratamento |
| **Confirm** | NutritionDiagnosis | Registra decisão profissional formal |
| **Complete** | Anamnesis, ClinicalObjective | Encerra coleta ou atinge meta |
| **Finish** | ClinicalEncounter | Encerra sessão de atendimento |

Estados correspondentes (`ACTIVE`, `CONFIRMED`, `COMPLETED`, `FINISHED`) mantêm significado próprio e não serão normalizados para um estado genérico `PUBLISHED`.

### Justificativa

- Respeita a linguagem ubíqua de cada conceito clínico
- Evita perda semântica em normalizações prematuras
- Facilita comunicação com profissionais de saúde e documentação regulatória

### Status

Aprovado — Implementado (Consolidation Sprint, FEATURE-037 prep)

---

# ADR-0019

## ClinicalChart como Read Model de Consulta

### Contexto

O domínio Care define Prontuário como conceito proprietário, mas o módulo Clinical implementa múltiplos aggregates independentes sem um aggregate de escrita unificado.

### Decisão

`ClinicalChart` (Prontuário na camada de consulta) será implementado como **Read Model query-side**, não como Aggregate Root de escrita.

Responsabilidades:

- Compor timeline clínica do paciente a partir de queries existentes
- Agregar dados de session-bound e patient-scoped records para UI, relatórios e contexto de IA
- **Não** possuir commands, lifecycle próprio ou persistência independente

Aggregates de escrita permanecem independentes. ClinicalChart consome seus query handlers ou projeções futuras.

### Justificativa

- Evita aggregate monolítico que violaria bounded contexts internos
- Alinha com CQRS — escrita distribuída, leitura composta
- Prepara integração AI (ADR-0010) via casos de uso de consulta

### Status

Aprovado — Proposto (implementação deferida; BACKLOG-007)

---

# ADR-0020

## Prescription como Aggregate Root Independente no Clinical

### Contexto

O domínio Care e o `master_database` descrevem Protocolos com itens de prescrição estruturados. FEATURE-037 introduz Prescrição no módulo Clinical como registro patient-scoped emitido pelo nutricionista.

### Decisão

`Prescription` será implementado como **Aggregate Root independente** no Bounded Context Clinical, **não** como entidade filha de Protocol (Catalog/Protocols BC).

Semânticas v1:

- Lifecycle: `DRAFT → ISSUED → CANCELLED`; verbo de publicação **`emit()`** (não `activate()`)
- `ISSUED` imutável; `issuedAt` marca emissão
- Linhas (`PrescriptionLine`) são instruções terapêuticas textuais — sem FK de produto, categoria ou protocolo aplicado
- Dose = `DoseQuantity` + `DoseUnit`; `OTHER` exige `customDisplay`
- Frequency = `displayText` obrigatório na emissão + `timesPerDay`/`intervalHours` opcionais

Integração futura com Templates/Protocolos permanece via BACKLOG-008 (cópia de linhas para draft), sem acoplamento de persistência cross-BC.

### Justificativa

- Preserva isolamento de BCs e lifecycles distintos (template reutilizável vs prescrição emitida ao paciente)
- Alinha com padrão patient-scoped já estabelecido (ClinicalObjective, NutritionDiagnosis, MealPlan)
- Evita FK rígida com catálogo de produtos inexistente em v1

### Status

Aprovado — Implementado (FEATURE-037)

---

# ADR-0021

## ClinicalEvolution como Aggregate Root Session-Bound com Significado Longitudinal (Model B)

### Contexto

FEATURE-038 introduz Evolução Clínica no módulo Clinical. O domínio Care define Evolução Clínica como registro cronológico do tratamento (`master_database` §13). O módulo Clinical adota aggregates independentes com clusters session-bound e patient-scoped (ADR-0016).

### Decisão

> **ClinicalEvolution is session-bound by registration context and longitudinal by clinical meaning.**

`ClinicalEvolution` será implementado como **Aggregate Root independente**, cluster **session-bound**:

- Relacionamento **obrigatório 1:1** com `ClinicalEncounter` em v1
- Lifecycle: **`DRAFT → FINALIZED`** via **`finalize()`**; **`DRAFT → CANCELLED`** via **`cancel()`**
- **`FINALIZED` imutável** para conteúdo; retificações futuras exigem novo registro (BACKLOG-013)
- **`clinicalEncounterId` identifica onde a evolução foi registrada** — não reduz o aggregate a nota genérica da consulta
- Conteúdo representa **delta intermomentos** desde a evolução finalizada anterior
- Evolução anterior resolvida **query-side** — sem `previousClinicalEvolutionId` em v1
- **`clinicalMomentAt`** = snapshot imutável de `encounter.startedAt` na criação; define cronologia clínica longitudinal (não `finalizedAt`)
- Ordenação longitudinal: `clinicalMomentAt` → `clinicalEncounterId` → `finalizedAt` → `createdAt` → `id`
- Finalização exige evidência de evolução (≥1 seção subjetiva/observação/resposta) **e** conclusão profissional (≥1 observação profissional/conduta)
- **Não obrigatório** para `FinishClinicalEncounter` em v1
- Sem FKs para objetivo, plano, prescrição ou evolução anterior

### Justificativa

- Preserva Model B: contexto de registro na sessão, significado clínico longitudinal
- Evita linked list rígida e acoplamento prematuro
- Protege integridade quando registros antigos são finalizados tardiamente
- Alinha com ADR-0018 (`finalize()` distinto de `complete()`/`finish()`/`emit()`)

### Status

Aprovado — Implementado (FEATURE-038)

---

# ADR-0022

## OutcomeTracking como julgamento clínico estruturado ancorado a ClinicalObjective

### Contexto

FEATURE-039 introduz Outcome Tracking no módulo Clinical. O domínio Care define acompanhamento de resultados como avaliação estruturada de efetividade terapêutica (`master_database` §16). ClinicalEvolution (FEATURE-038, ADR-0021) registra narrativa longitudinal intermomentos; OutcomeTracking formaliza **conclusão clínica estruturada** sobre progresso de um objetivo específico.

### Decisão

> **OutcomeTracking records a single clinical conclusion about therapeutic progress for a ClinicalObjective.**

`OutcomeTracking` será implementado como **Aggregate Root independente**, cluster **patient-scoped**:

- Relacionamento **obrigatório** com `ClinicalObjective` via `clinicalObjectiveId`
- Lifecycle: **`DRAFT → RECORDED`** via **`record()`**; **`DRAFT → CANCELLED`** via **`cancel()`**
- **`RECORDED` imutável** para conteúdo clínico; retificações futuras exigem novo registro (BACKLOG-014)
- **`OutcomeAssessment`** único veredito clínico: `ON_TRACK`, `PARTIAL`, `STABLE`, `STALLED`, `REGRESSED`, `GOAL_ACHIEVED`, `NOT_EVALUABLE`
- **`AdherenceFactor`** opcional e subordinado: `FULL`, `PARTIAL`, `LOW`, `UNKNOWN`
- **`GOAL_ACHIEVED`** distingue veredito avaliativo momentâneo de `ClinicalObjective.complete()` / status `COMPLETED`
- Proveniência opcional: `originClinicalEncounterId`, `originAnamnesisId`, `clinicalMomentAt`
- **Sem referências a evidências** no write model; composição query-side (ADR-0019, BACKLOG-017)
- Ordenação cronológica: `evaluatedAt` → `recordedAt` → `createdAt` → `id`
- **`record()` não produz side-effects** em `ClinicalObjective` em v1
- `NOT_EVALUABLE` exige `professionalRationale` na policy de gravação

### Justificativa

- Preserva separação semântica: ClinicalEvolution explica; OutcomeTracking conclui
- Evita combinações clinicamente incoerentes de múltiplos enums independentes
- Alinha com padrão patient-scoped (ClinicalObjective, MealPlan, ADR-0016)
- Protege lifecycle distinto de objetivo (ACTIVE/COMPLETED) vs veredito momentâneo (GOAL_ACHIEVED)

### Status

Aprovado — Implementado (FEATURE-039)

---

# Governança

Toda nova decisão arquitetural deverá receber um novo ADR.

Os ADRs são imutáveis.

Caso uma decisão seja substituída, um novo ADR deverá ser criado referenciando a decisão anterior.

---

# Convenção

Os ADRs utilizarão a seguinte identificação:

ADR-0001

ADR-0002

ADR-0003

...

A numeração nunca deverá ser reutilizada.

---

# Ciclo de Vida dos ADRs

Todo ADR deverá seguir o seguinte ciclo de vida:

Proposto

↓

Em Discussão

↓

Aprovado

↓

Implementado

↓

Substituído (quando aplicável)

ADRs aprovados nunca deverão ser removidos.

Caso uma decisão deixe de ser válida, um novo ADR deverá substituí-la, preservando o histórico da arquitetura.

---

# Conclusão

Este documento preserva o histórico das decisões arquiteturais do PortalNutri.

Seu objetivo é garantir que a evolução da plataforma permaneça consistente com os princípios estabelecidos desde sua concepção, reduzindo ambiguidades, preservando o contexto das decisões e facilitando a continuidade do desenvolvimento ao longo dos anos.
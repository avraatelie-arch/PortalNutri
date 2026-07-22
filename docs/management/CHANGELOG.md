# Changelog

Todas as mudanças notáveis do PortalNutri Platform serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

**Regra de rastreabilidade:** cada entrada deve ser verificável por commit Git (`git log`), ADR em `master_architecture_decisions.md`, ou item em `BACKLOG.md`. Números de feature (FEATURE-0xx) somente quando constam nesses artefatos.

---

## [Unreleased]

### Planejado

- ClinicalChart read model (ADR-0019; BACKLOG-007; FEATURE-040)
- PMO Foundation — `docs/management/` (BACKLOG: PMO Foundation, em progresso)

### Added

Entradas abaixo referenciam commits verificáveis via `git log`. Agrupamento temático; datas de commit disponíveis no histórico Git.

#### Core & Infraestrutura

- Event bus in-process (`3776578`)
- Audit log foundation (`fa1c745`)
- CI backend GitHub Actions (`0f02bf9`)
- Structured logging e request correlation (`92bf639`)
- Health readiness/liveness endpoints (`5271ee8`)
- OpenAPI documentation (`ac676ab`)

#### IAM & Auth

- Prisma Person repository e schema alinhado ao domínio (`a00f11f`, `ac38ab8`)
- UpdatePerson, DeactivatePerson (`45fb348`, `8cf1dc1`)
- Person HTTP API e testes de integração HTTP (`5d8af3e`, `a08f55f`)
- Credential registration (`df27377`)
- Session e token foundation (`28889b7`)
- Authentication API e global auth hook (`1df0228`)
- Tenant foundation (`0be261a`)
- Membership foundation (`68fc7b8`)
- Role assignment foundation (`c80c659`)
- Permission foundation (`870e408`)
- Authorization engine e self-access policies (`043a95f`, `2fa8723`)
- Tenant session binding (`f36a3c5`)
- HTTP APIs: Tenant, Membership, Role, Permission (`3c5a293`, `0fc2cbf`, `38a5f1a`)

#### Care BC — módulos físicos satélite

- Nutritionist aggregate (`4ba3ebb`)
- Patient aggregate (`f2d6e21`)
- PatientNutritionistAssignment aggregate (`2f72699`)
- Appointment aggregate (`c70be3e`)

#### Care BC — módulo físico `clinical/` (write model)

- ClinicalEncounter foundation (`9a334d3`)
- Anamnesis foundation (`2cb5843`)
- AnthropometricAssessment foundation (`b4e4357`)
- BodyCompositionAssessment foundation (`c3c3cb8`)
- Shared integration fixture e record preconditions (`28199d5`)
- ClinicalObjective aggregate com lifecycle e edit commands (`5ddbe6d`)
- NutritionDiagnosis aggregate com confirm lifecycle (`d3ab3c0`)
- MealPlan aggregate com activate lifecycle (`0583f78`)
- Consolidação de utilities de aplicação; ADR-0016–0019 (`d84a644`)
- Prescription aggregate com emit lifecycle (`8b791b3`; ADR-0020)
- ClinicalEvolution aggregate Model B finalize lifecycle (`79c7597`; ADR-0021)
- OutcomeTracking aggregate com OutcomeAssessment judgment (`f4a9502`; ADR-0022)

### Changed (documentação — unreleased)

- Reconciliação arquitetural: master documents alinhados ao write model multi-aggregate Care BC; ADR-0021 status atualizado; BACKLOG-007 restaurado; PROJECT_STATUS e CHANGELOG atualizados

---

## [0.1.0] - 2026-07-10

Primeira versão registrada. Consolida a fase **Foundation** e o início do Bounded Context **IAM**.

Registrada no commit de tag/release correspondente a `2026-07-10` no histórico do repositório.

### Added

#### Foundation

- Bootstrap do repositório monorepo (`.gitignore`, `.editorconfig`, `.gitattributes`, `README.md`)
- Integração do frontend Next.js como pasta do monorepo
- Estrutura modular do backend com 8 Bounded Contexts
- Bootstrap Fastify com CORS, validação Zod global e prefixo `/api`
- Endpoint `GET /api/health`
- Padronização pnpm (`pnpm-lock.yaml`, `pnpm-workspace.yaml`)
- Docker Compose com PostgreSQL 16
- 15 Documentos Mestres em `docs/masters/`

#### IAM

- Estrutura interna do módulo IAM (application, domain, infrastructure, contracts)
- Aggregate Person com Value Objects: `PersonId`, `FullName`, `Email`, `Phone`, `Document`, `BirthDate`, `PersonStatus`, `PreferredName`
- Eventos de domínio: `PersonCreated`, `PersonUpdated`, `PersonActivated`, `PersonDeactivated`
- Interface `PersonRepository` e `AggregateRoot` com `pullDomainEvents()`
- CreatePerson — command, request, response, handler e testes
- FindPersonById — query, result, handler e testes
- Erros de aplicação: `ApplicationError`, `PersonNotFoundError`
- Repositório `InMemoryPersonRepository`
- 37 testes automatizados (domínio + handlers)

### Changed

- Health check movido para `/api/health` com payload estruturado
- Frontend reindexado como parte do monorepo unificado

---

[Unreleased]: https://github.com/avraatelie-arch/PortalNutri/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/avraatelie-arch/PortalNutri/releases/tag/v0.1.0

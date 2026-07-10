# Changelog

Todas as mudanças notáveis do PortalNutri Platform serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Planejado

- PMO Foundation (`docs/management/`)
- UpdatePerson
- PrismaPersonRepository e migrations
- Rotas HTTP IAM
- Event Bus interno

---

## [0.1.0] - 2026-07-10

Primeira versão registrada. Consolida a fase **Foundation** e o início do Bounded Context **IAM**.

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
- **Aggregate Person** com Value Objects: `PersonId`, `FullName`, `Email`, `Phone`, `Document`, `BirthDate`, `PersonStatus`, `PreferredName`
- Eventos de domínio: `PersonCreated`, `PersonUpdated`, `PersonActivated`, `PersonDeactivated`
- Interface `PersonRepository` e `AggregateRoot` com `pullDomainEvents()`
- **CreatePerson** — command, request, response, handler e testes
- **FindPersonById** — query, result, handler e testes
- Erros de aplicação: `ApplicationError`, `PersonNotFoundError`
- Repositório `InMemoryPersonRepository`
- 37 testes automatizados (domínio + handlers)

### Changed

- Health check movido para `/api/health` com payload estruturado
- Frontend reindexado como parte do monorepo unificado

---

[Unreleased]: https://github.com/avraatelie-arch/PortalNutri/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/avraatelie-arch/PortalNutri/releases/tag/v0.1.0

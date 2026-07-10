# Projeto

| Campo | Valor |
|-------|-------|
| **Nome** | PortalNutri Platform |
| **Versão atual** | 0.1.0 |
| **Status** | Foundation concluída — Sprint 1 (IAM) em andamento |

---

# Sprint Atual

| Campo | Valor |
|-------|-------|
| **Sprint** | Sprint 1 — IAM |
| **Objetivo** | Implementar o núcleo de identidade digital: aggregate Person e casos de uso iniciais |
| **Início** | 2026-07-08 |
| **Status** | Em andamento (~25% do escopo IAM) |

---

# Features concluídas

| Feature | Status | Data |
|---------|--------|------|
| Foundation — Bootstrap do repositório | ✅ Concluída | 2026-07-08 |
| Foundation — Integração frontend no monorepo | ✅ Concluída | 2026-07-08 |
| Foundation — Estrutura modular backend (8 BCs) | ✅ Concluída | 2026-07-08 |
| Foundation — Bootstrap Fastify (`/api/health`) | ✅ Concluída | 2026-07-08 |
| Foundation — Padronização pnpm | ✅ Concluída | 2026-07-09 |
| IAM — Estrutura interna do módulo | ✅ Concluída | 2026-07-09 |
| IAM — Aggregate Person | ✅ Concluída | 2026-07-09 |
| IAM — CreatePerson | ✅ Concluída | 2026-07-10 |
| IAM — FindPersonById | ✅ Concluída | 2026-07-10 |
| IAM — PreferredName (VO opcional) | ✅ Concluída | 2026-07-10 |

---

# Próxima Feature

**UpdatePerson** — caso de uso para atualizar cadastro da Pessoa, alinhado ao caso de uso *Atualizar Cadastro da Pessoa* (`docs/masters/master_use_cases.md`).

---

# Estado do Projeto

| Área | Status | Detalhe |
|------|--------|---------|
| **Arquitetura** | ✅ Consolidada | 15 Documentos Mestres em `docs/masters/`, 8 Bounded Contexts, ADR-0001 a ADR-0015 |
| **Backend** | 🔄 Em progresso | Fastify operacional; módulo IAM com domínio e 2 casos de uso; demais BCs com estrutura física apenas |
| **Frontend** | ⏳ Scaffold | Next.js integrado ao monorepo; sem telas de negócio |
| **Infraestrutura** | 🔄 Parcial | Docker Compose (PostgreSQL 16); sem CI/CD; Prisma legado divergente do domínio |
| **Testes** | ✅ Ativos | 37 testes passando (`pnpm test` no backend) |

---

# Indicadores

| Indicador | Valor |
|-----------|-------|
| **Features concluídas** | 10 |
| **Testes** | 37 passando / 0 falhas |
| **Cobertura conhecida** | Não medida (sem ferramenta de coverage configurada) |
| **Último commit** | `c332695` — feat(iam): implement find person by id use case |
| **Última atualização** | 2026-07-10 |

# PortalNutri — Backlog

Backlog de features do PortalNutri Platform. Atualizado conforme evolução do desenvolvimento.

**Última atualização:** 2026-07-10

---

## Legenda

| Status | Significado |
|--------|-------------|
| ✅ Concluído | Implementado e testado |
| 🔄 Em progresso | Desenvolvimento ativo |
| ⏳ Backlog | Priorizado, não iniciado |
| 📋 Proposto | Identificado, aguardando priorização |

| Prioridade | Significado |
|------------|-------------|
| P0 | Crítico — próximo ciclo |
| P1 | Alta |
| P2 | Média |
| P3 | Baixa |

---

## Backlog

| Epic | Feature | Prioridade | Status | Dependências |
|------|---------|------------|--------|--------------|
| Foundation | Bootstrap do repositório | — | ✅ Concluído | — |
| Foundation | Integração frontend no monorepo | — | ✅ Concluído | — |
| Foundation | Estrutura modular backend (8 BCs) | — | ✅ Concluído | — |
| Foundation | Bootstrap Fastify | — | ✅ Concluído | — |
| Foundation | Padronização pnpm | — | ✅ Concluído | — |
| Foundation | PMO Foundation (`docs/management/`) | P1 | 🔄 Em progresso | — |
| Foundation | CI/CD pipelines | P1 | ⏳ Backlog | Bootstrap |
| IAM | Estrutura interna do módulo | — | ✅ Concluído | Foundation |
| IAM | Aggregate Person | — | ✅ Concluído | Estrutura IAM |
| IAM | CreatePerson | — | ✅ Concluído | Aggregate Person |
| IAM | FindPersonById | — | ✅ Concluído | Aggregate Person |
| IAM | PreferredName (VO opcional) | — | ✅ Concluído | Aggregate Person |
| IAM | UpdatePerson | P0 | ⏳ Backlog | CreatePerson |
| IAM | ActivatePerson / DeactivatePerson | P1 | ⏳ Backlog | UpdatePerson |
| IAM | PrismaPersonRepository + migrations | P0 | ⏳ Backlog | Aggregate Person |
| IAM | Rotas HTTP — Person | P1 | ⏳ Backlog | CreatePerson, FindPersonById |
| IAM | Event Bus interno | P1 | ⏳ Backlog | — |
| IAM | Aggregate Tenant | P1 | ⏳ Backlog | Person |
| IAM | CreateTenant | P1 | ⏳ Backlog | Aggregate Tenant |
| IAM | Aggregate Membership (Vínculos) | P1 | ⏳ Backlog | Person, Tenant |
| IAM | CreateMembership | P1 | ⏳ Backlog | Aggregate Membership |
| IAM | Aggregate Role | P1 | ⏳ Backlog | Person |
| IAM | AssignRole / RevokeRole | P1 | ⏳ Backlog | Aggregate Role |
| IAM | Modelo de Permissão | P1 | ⏳ Backlog | Role, Membership |
| IAM | GrantPermission / RevokePermission | P1 | ⏳ Backlog | Modelo de Permissão |
| IAM | Authorization Engine | P1 | ⏳ Backlog | Permissões |
| IAM | Autenticação (registro, login, JWT) | P1 | ⏳ Backlog | Person, Permissões |
| IAM | Telas login/cadastro (frontend) | P2 | ⏳ Backlog | Autenticação |
| Care | Aggregate Prontuário | P2 | 📋 Proposto | IAM completo |
| Care | Criar Prontuário | P2 | 📋 Proposto | Aggregate Prontuário |
| Care | Agendar Consulta | P2 | 📋 Proposto | Prontuário |
| Marketplace | Aggregate Loja | P3 | 📋 Proposto | Tenant |
| Marketplace | Publicar Produto | P3 | 📋 Proposto | Loja |
| Business | Contratar Assinatura | P3 | 📋 Proposto | Tenant |
| AI | AI Gateway | P3 | 📋 Proposto | Application Layer |
| Analytics | Coleta de eventos | P3 | 📋 Proposto | Event Bus |
| Communication | Notificações transacionais | P3 | 📋 Proposto | Event Bus, IAM |
| Infraestrutura | Mensageria (broker) | P2 | 📋 Proposto | Event Bus |
| Infraestrutura | Ambiente de staging | P2 | 📋 Proposto | CI/CD |

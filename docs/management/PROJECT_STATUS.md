# Projeto

| Campo | Valor |
|-------|-------|
| **Nome** | PortalNutri Platform |
| **Versão atual** | 0.1.0 |
| **Status** | Care BC write model concluído (FEATURE-039) — ClinicalChart (FEATURE-040) não iniciado |

---

# Fase Atual do Projeto

| Fase | Status |
|------|--------|
| Foundation | ✔ |
| Clinical Write Model | ✔ |
| Architecture Audit | ✔ |
| Documentation Reconciliation | ✔ |
| Clinical Read Model (FEATURE-040) | → **Next** |

---

# Sprint Atual

| Campo | Valor |
|-------|-------|
| **Fase** | Documentação reconciliada pós-auditoria arquitetural |
| **Objetivo** | Alinhar documentação com implementação FEATURE-039; preparar FEATURE-040 (ClinicalChart) |
| **Última feature concluída** | FEATURE-039 — OutcomeTracking |
| **Próxima feature** | FEATURE-040 — ClinicalChart (read model; ADR-0019; BACKLOG-007) — **não iniciada** |

---

# Features concluídas (backend)

## Foundation & Core

| Feature | Status | Commit (referência) |
|---------|--------|---------------------|
| Bootstrap do repositório | ✅ | — |
| Estrutura modular backend | ✅ | — |
| Bootstrap Fastify | ✅ | — |
| CI backend (GitHub Actions) | ✅ | `0f02bf9` |
| Event bus in-process | ✅ | `3776578` |
| Audit log foundation | ✅ | `fa1c745` |

## IAM

| Feature | Status | Commit (referência) |
|---------|--------|---------------------|
| Tenant, Membership, Person | ✅ | `0be261a`–`68fc7b8` |
| Role, Permission, Assignments | ✅ | `870e408`–`c80c659` |
| Authorization engine | ✅ | `043a95f`, `2fa8723` |
| Auth (Credential, Session, JWT) | ✅ | `f36a3c5` |
| HTTP APIs (Tenant, Membership, Role, Permission) | ✅ | `3c5a293`–`38a5f1a` |

## Care BC — módulos satélite

| Feature | Status | Commit (referência) |
|---------|--------|---------------------|
| Nutritionist | ✅ | `4ba3ebb` |
| Patient + PatientNutritionistAssignment | ✅ | `f2d6e21`, `2f72699` |
| Appointment | ✅ | `c70be3e` |

## Care BC — módulo clinical (write model)

| Feature | Aggregate / escopo | Status | Commit (referência) |
|---------|-------------------|--------|---------------------|
| ClinicalEncounter foundation | Session-bound | ✅ | `9a334d3` |
| Anamnesis foundation | Session-bound | ✅ | `2cb5843` |
| AnthropometricAssessment | Session-bound | ✅ | `b4e4357` |
| BodyCompositionAssessment | Session-bound | ✅ | `c3c3cb8` |
| ClinicalObjective + lifecycle | Patient-scoped | ✅ | `5ddbe6d` |
| NutritionDiagnosis | Patient-scoped | ✅ | `d3ab3c0` |
| MealPlan + activate lifecycle | Patient-scoped | ✅ | `0583f78` |
| Consolidation + ADR-0016–0019 | Policies, ports | ✅ | `d84a644` |
| Prescription + emit lifecycle | Patient-scoped | ✅ | `8b791b3` |
| ClinicalEvolution Model B | Session-bound | ✅ | `79c7597` |
| OutcomeTracking + OutcomeAssessment | Patient-scoped | ✅ | `f4a9502` |

---

# Validação baseline (FEATURE-039)

| Check | Resultado |
|-------|-----------|
| `npx prisma validate` | OK |
| `npx prisma generate` | OK |
| `npm test` (unit) | **1016 / 1016** passando |
| `npm run test:integration` | **313 / 313** passando |

**Último commit:** `f4a9502` — `feat(clinical): add OutcomeTracking aggregate with single OutcomeAssessment judgment`

---

# Estado do Projeto

| Área | Status | Detalhe |
|------|--------|---------|
| **Arquitetura** | ✅ Consolidada | 22 ADRs (ADR-0001–0022); modelo multi-aggregate Care; ClinicalChart deferido (ADR-0019) |
| **Backend — IAM** | ✅ Implementado | 9 aggregates; HTTP APIs expostas; authorization engine |
| **Backend — Care write model** | ✅ Implementado | 10 ARs clínicos + Patient + Nutritionist + Appointment; 75 clinical handlers |
| **Backend — Care read model** | ⏳ Não iniciado | ClinicalChart (FEATURE-040; BACKLOG-007) |
| **Backend — HTTP Clinical** | ⏳ Não exposto | `registerClinicalModule()` stub; casos de uso internos apenas |
| **Frontend** | ⏳ Scaffold | Next.js integrado; sem telas de negócio clínico |
| **Infraestrutura** | 🔄 Parcial | Docker Compose (PostgreSQL 16); CI backend ativo |
| **Testes** | ✅ Ativos | 1016 unit + 313 integration |

---

# Aggregates implementados (23 total)

| BC | Módulo | Aggregates |
|----|--------|------------|
| IAM | `iam/` | Person, Tenant, Credential, Session, Membership, Role, RoleAssignment, Permission, PermissionAssignment |
| Care | `clinical/` | ClinicalEncounter, Anamnesis, AnthropometricAssessment, BodyCompositionAssessment, ClinicalEvolution, NutritionDiagnosis, ClinicalObjective, MealPlan, Prescription, OutcomeTracking |
| Care | `patient/` | Patient, PatientNutritionistAssignment |
| Care | `nutrition/` | Nutritionist |
| Care | `appointment/` | Appointment |

Entidades subordinadas: `MealPlanMeal` (MealPlan), `PrescriptionLine` (Prescription).

---

# Indicadores

| Indicador | Valor |
|-----------|-------|
| **Features clínicas concluídas** | FEATURE-039 (OutcomeTracking) |
| **Testes unitários** | 1016 passando |
| **Testes de integração** | 313 passando |
| **ADRs implementados** | ADR-0016–0018, ADR-0020–0022 |
| **ADRs propostos/deferidos** | ADR-0019 (ClinicalChart) |
| **Última atualização deste documento** | 2026-07-22 |

# PortalNutri Platform

Plataforma enterprise de nutrição e saúde que conecta profissionais, pacientes, empresas e inteligência artificial em um único ecossistema digital.

O PortalNutri é construído como um **modular monolith** orientado a domínios, com arquitetura limpa, Vertical Slice Architecture e comunicação orientada a eventos.

## Stack oficial

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | TypeScript, Fastify, Prisma |
| **Frontend** | TypeScript, Next.js, React, Tailwind CSS |
| **Banco de dados** | PostgreSQL |
| **Infraestrutura local** | Docker, Docker Compose |
| **Gerenciador de pacotes** | pnpm |

### Princípios arquiteturais

- Domain Driven Design (DDD)
- Clean Architecture
- Vertical Slice Architecture
- Modular Monolith
- Event Driven Architecture

## Estrutura do repositório

```
PortalNutri/
├── backend/           # API e camada de aplicação do backend
├── frontend/          # Aplicação web (Next.js)
├── database/          # Schema, migrations, seeds e diagramas
├── docker/            # Configurações Docker adicionais
├── docs/              # Documentação da plataforma
│   └── masters/       # Documentos Mestres (fonte oficial)
├── infrastructure/    # Deploy, Terraform, Nginx e configurações de ambiente
├── scripts/           # Scripts de automação e utilitários
├── tests/             # Testes de integração e end-to-end
├── .github/           # Workflows de CI/CD
├── .cursor/           # Regras de workspace do Cursor
└── docker-compose.yml # Infraestrutura local (PostgreSQL)
```

Diretórios adicionais na raiz representam módulos e capacidades da plataforma organizados por domínio de negócio (por exemplo: `ai/`, `analytics/`, `commerce/`, `marketplace/`, `notifications/`).

## Como rodar (futuramente)

> O ambiente de desenvolvimento ainda está em fase de bootstrap. Os passos abaixo descrevem o fluxo previsto após a conclusão do setup inicial.

### Pré-requisitos

- Node.js (LTS)
- pnpm
- Docker e Docker Compose

### 1. Infraestrutura local

```bash
docker compose up -d
```

Isso sobe o PostgreSQL definido em `docker-compose.yml` (porta `5432`).

### 2. Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

A aplicação web ficará disponível em `http://localhost:3000`.

## Documentos Mestres

A arquitetura, o modelo de domínio e as decisões oficiais da plataforma estão em **`docs/masters/`**.

Esses documentos são a **fonte oficial** do projeto e prevalecem sobre qualquer outra instrução ou documentação auxiliar. Antes de implementar qualquer funcionalidade, consulte:

- `docs/masters/master_project.md`
- `docs/masters/master_domain_model.md`
- `docs/masters/master_architecture.md`
- `docs/masters/master_application.md`
- `docs/masters/master_bounded_contexts.md`

## Licença

Propriedade de DATI Inovação e Tecnologia. Todos os direitos reservados.

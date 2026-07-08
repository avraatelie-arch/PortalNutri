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
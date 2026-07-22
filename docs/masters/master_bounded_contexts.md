# PortalNutri Platform

# Master Bounded Contexts

**Versão:** 1.1

**Status:** Documento Mestre de Bounded Contexts

**Última reconciliação arquitetural:** 2026-07-22 (pós FEATURE-039)

---

# 00. Objetivo do Documento

Este documento define oficialmente os Bounded Contexts do PortalNutri Platform.

Cada Bounded Context representa um limite de negócio claramente definido, responsável por um conjunto coeso de conceitos, regras, responsabilidades e eventos do domínio.

Este documento não define:

- Banco de Dados;
- APIs;
- Microserviços;
- Estrutura de código;
- Frameworks;
- Infraestrutura.

Seu objetivo é estabelecer os limites conceituais do domínio, garantindo alta coesão, baixo acoplamento e evolução independente entre os diferentes componentes da plataforma.

---

## Princípio Fundamental

Cada conceito do PortalNutri deverá possuir um único dono.

Não deverá existir duplicidade de responsabilidades entre Bounded Contexts.

Toda comunicação entre Contextos deverá ocorrer através de contratos explícitos, Eventos de Domínio ou interfaces oficialmente definidas pela arquitetura.

---

## Objetivo Final

Este documento será a principal referência para organização da arquitetura do PortalNutri.

A partir dele serão derivados:

- Camada de Aplicação;
- Aggregates;
- Casos de Uso;
- Permissões;
- Banco de Dados;
- Arquitetura de Software;
- Arquitetura de Segurança;
- Arquitetura de IA;
- Integrações entre Contextos.

Os Bounded Contexts representam a divisão oficial do domínio do PortalNutri.

# 01. Mapa Oficial dos Bounded Contexts

O PortalNutri será organizado em Bounded Contexts independentes.

Cada Contexto representa um domínio de negócio com responsabilidades próprias, linguagem ubíqua específica e autonomia para evoluir de forma independente.

Nenhum Contexto deverá assumir responsabilidades pertencentes a outro Contexto.

---

## Mapa Oficial

O PortalNutri será composto inicialmente pelos seguintes Bounded Contexts:

```text
PortalNutri Platform

├── IAM
│
├── Care
│
├── Marketplace
│
├── Business
│
├── AI
│
├── Communication
│
├── Analytics
│
└── Platform
```

---

## Descrição Geral dos Contextos

### IAM

Responsável pela identidade digital dos participantes da plataforma.

Este Contexto administra:

- Pessoas
- Papéis
- Vínculos
- Permissões
- Autenticação
- Autorização
- Tenant
- Unidade Organizacional

---

### Care

Responsável por toda a jornada clínica do paciente.

Este Contexto administra (conceitualmente):

- Prontuário (visão de negócio — composta query-side por ClinicalChart; ADR-0019)
- Objetivos Clínicos (`ClinicalObjective`)
- Consultas / Encontros Clínicos (`ClinicalEncounter`; distinto de `Appointment`)
- Avaliações Nutricionais (`Anamnesis`, `AnthropometricAssessment`, `BodyCompositionAssessment`)
- Diagnósticos Nutricionais (`NutritionDiagnosis`)
- Evoluções Clínicas (`ClinicalEvolution`)
- Acompanhamento de Resultados (`OutcomeTracking`)
- Protocolos Aplicados *(não implementado)*
- Planos Alimentares (`MealPlan`)
- Prescrições Nutricionais (`Prescription`)
- Solicitações de Exames *(não implementado)*
- Resultados de Exames *(não implementado)*
- Indicadores Clínicos *(não implementado como aggregate standalone)*

**Implementação física:** ver §08. Os módulos `clinical/`, `patient/`, `nutrition/` e `appointment/` são **módulos físicos dentro da implementação atual do Care BC** — não Bounded Contexts independentes.

---

### Marketplace

Responsável pelas operações comerciais do ecossistema.

Este Contexto administra:

- Produtos
- Serviços
- Protocolos Modelo
- Cursos
- E-books
- Lojas
- Pedidos
- Carrinho
- Avaliações
- Cupons
- Campanhas

---

### Business

Responsável pelas regras financeiras e comerciais da plataforma.

Este Contexto administra:

- Assinaturas
- Cobranças
- Pagamentos
- Comissões
- Repasses
- Planos
- Faturamento

---

### AI

Responsável por toda a Inteligência Artificial do PortalNutri.

Este Contexto administra:

- Orquestrador
- Agentes Inteligentes
- Memória Inteligente
- Base Oficial de Conhecimento
- Contexto Inteligente
- Explicabilidade
- Governança da IA

---

### Communication

Responsável pela comunicação entre participantes.

Este Contexto administra:

- Chat
- Notificações
- E-mails
- WhatsApp
- SMS
- Push
- Compartilhamentos
- Convites

---

### Analytics

Responsável pelos indicadores e análises da plataforma.

Este Contexto administra:

- Dashboards
- KPIs
- Métricas
- Relatórios
- Indicadores Estratégicos
- Business Intelligence

---

### Platform

Responsável pelos serviços transversais da plataforma.

Este Contexto administra:

- Configurações Globais
- Auditoria
- Parametrizações
- Feature Flags
- Versionamento
- Configurações Sistêmicas

# 02. Responsabilidades dos Bounded Contexts

Cada Bounded Context possui responsabilidade exclusiva sobre um conjunto de conceitos do domínio.

Nenhum Contexto poderá modificar diretamente informações pertencentes a outro Contexto.

Quando um Contexto necessitar de informações de outro, deverá utilizar contratos explícitos, APIs, Eventos de Domínio ou mecanismos oficiais definidos pela arquitetura.

---

## IAM

É o único Contexto responsável por identidade.

É proprietário de:

- Pessoa
- Papel
- Vínculo
- Permissão
- Tenant
- Unidade Organizacional
- Autenticação
- Autorização

Nenhum outro Contexto poderá alterar essas informações diretamente.

---

## Care

É o único Contexto responsável pela jornada clínica.

É proprietário de (implementados até FEATURE-039):

- Objetivo Clínico (`ClinicalObjective`)
- Encontro Clínico (`ClinicalEncounter`)
- Anamnese (`Anamnesis`)
- Avaliações Antropométrica e de Composição Corporal
- Diagnóstico Nutricional (`NutritionDiagnosis`)
- Evolução Clínica (`ClinicalEvolution`)
- Acompanhamento de Resultado (`OutcomeTracking`)
- Plano Alimentar (`MealPlan`)
- Prescrição Nutricional (`Prescription`)
- Paciente e vínculo clínico (`Patient`, `PatientNutritionistAssignment`)
- Nutricionista (`Nutritionist`)
- Agendamento (`Appointment`)

**Prontuário / ClinicalChart:** o termo Prontuário permanece na linguagem de negócio. A visão unificada será composta query-side por **ClinicalChart** (read model — ADR-0019; FEATURE-040). Não existe Aggregate Root de escrita `Prontuário`.

Nenhum outro Contexto poderá alterar informações clínicas diretamente.

> **Implementação física (não confundir com BCs):** `clinical/`, `patient/`, `nutrition/` e `appointment/` são módulos de código dentro do **mesmo** Bounded Context Care. Eles organizam o código por responsabilidade técnica, mas **não** representam Bounded Contexts oficiais separados. Ver §08.

---

## Marketplace

É o único Contexto responsável pelo catálogo comercial.

É proprietário de:

- Produto
- Serviço
- Loja
- Pedido
- Carrinho
- Cupom
- Campanha
- Avaliação Comercial
- Conteúdo Comercial

Nenhum outro Contexto poderá alterar essas informações diretamente.

---

## Business

É o único Contexto responsável pelas regras financeiras.

É proprietário de:

- Assinaturas
- Cobranças
- Pagamentos
- Comissões
- Repasses
- Planos
- Faturamento

Nenhum outro Contexto poderá modificar movimentações financeiras.

---

## AI

É o único Contexto responsável pelos Agentes Inteligentes.

É proprietário de:

- Orquestrador
- Agentes
- Memória Inteligente
- Base Oficial de Conhecimento
- Contexto Inteligente
- Explicabilidade
- Governança da IA

Os demais Contextos poderão solicitar serviços da IA, mas nunca administrar sua estrutura interna.

---

## Communication

É o único Contexto responsável pela comunicação entre participantes.

É proprietário de:

- Chat
- Notificações
- E-mails
- WhatsApp
- SMS
- Push
- Convites
- Compartilhamentos

---

## Analytics

É o único Contexto responsável pela produção de indicadores analíticos.

É proprietário de:

- Dashboards
- KPIs
- Métricas
- Relatórios
- Indicadores Estratégicos

O Analytics nunca será proprietário dos dados de origem.

Ele apenas consolida informações produzidas pelos demais Contextos.

---

## Platform

É o único Contexto responsável pelos serviços transversais.

É proprietário de:

- Configurações Globais
- Parametrizações
- Auditoria
- Feature Flags
- Versionamento
- Configurações Sistêmicas

---

## Princípio Fundamental

Todo conceito do PortalNutri possui um único Bounded Context responsável.

Quando houver dúvida sobre quem pode alterar determinada informação, a resposta deverá ser sempre:

"O Contexto proprietário daquele conceito."

# 03. Comunicação entre os Bounded Contexts

Os Bounded Contexts do PortalNutri deverão permanecer independentes entre si.

A comunicação entre Contextos ocorrerá exclusivamente por mecanismos oficialmente definidos pela arquitetura, preservando baixo acoplamento, alta coesão e evolução independente dos domínios.

Nenhum Contexto deverá acessar diretamente estruturas internas pertencentes a outro Contexto.

---

## Formas Oficiais de Comunicação

A comunicação entre Contextos poderá ocorrer através de:

- Commands;
- Queries;
- Workflows;
- Eventos de Domínio;
- Mensageria;
- Webhooks.

Todos esses mecanismos serão disponibilizados pela Camada de Aplicação, conforme definido em `master_application.md`.

Os Bounded Contexts nunca deverão se comunicar diretamente por meio de chamadas às camadas de Domínio ou Infraestrutura.

Cada Contexto será responsável por decidir como expor suas capacidades aos demais Contextos.

---

## Eventos de Domínio

Os Eventos de Domínio constituem o principal mecanismo de integração entre os Contextos.

Cada Contexto poderá publicar Eventos relacionados aos conceitos sob sua responsabilidade.

Os demais Contextos poderão consumir esses Eventos sempre que necessário.

O Contexto consumidor nunca deverá alterar informações pertencentes ao Contexto publicador.

---

## Camada de Aplicação

Quando uma operação exigir comunicação síncrona, os Contextos deverão utilizar a Camada de Aplicação.

A Camada de Aplicação disponibilizará Commands, Queries e Workflows, preservando a independência entre os Contextos e evitando o acesso direto às estruturas internas do Domínio.

---

## Compartilhamento de Informações

Sempre que um Contexto necessitar de informações pertencentes a outro Contexto, deverá utilizar um mecanismo oficial de integração.

A duplicação de regras de negócio entre Contextos deverá ser evitada.

Quando necessário, apenas dados de referência poderão ser replicados para otimizar desempenho ou disponibilidade, preservando a autoridade do Contexto proprietário.

---

## Evolução Independente

Cada Contexto deverá evoluir de forma independente.

Alterações internas não deverão impactar outros Contextos, desde que os contratos oficiais permaneçam compatíveis.

Essa independência reduz o acoplamento e facilita a evolução contínua da plataforma.

---

## Princípio Fundamental

Os Bounded Contexts colaboram entre si, mas permanecem independentes.

A comunicação sempre ocorrerá por contratos explícitos, nunca por dependências internas ou acesso direto às estruturas de outro Contexto.

# 04. Dependências entre os Bounded Contexts

Os Bounded Contexts do PortalNutri deverão preservar sua independência funcional e conceitual.

As dependências entre Contextos deverão ocorrer apenas quando estritamente necessárias para o funcionamento do negócio.

Sempre que possível, os Contextos deverão depender apenas de contratos públicos e Eventos de Domínio.

---

## Princípios Gerais

As dependências deverão obedecer aos seguintes princípios:

- Um Contexto nunca deverá conhecer a implementação interna de outro.
- Um Contexto poderá consumir informações, mas não controlar outro Contexto.
- Cada Contexto continuará sendo o único proprietário de seus conceitos.
- As regras de negócio permanecerão dentro do Contexto proprietário.

---

## Dependências Permitidas

### IAM

O Contexto IAM não depende de nenhum outro Contexto para exercer suas responsabilidades.

Todos os demais Contextos poderão consultar informações de identidade através dos mecanismos oficiais definidos pela arquitetura.

---

### Care

O Contexto Care poderá depender do IAM para obtenção de informações relacionadas à identidade, papéis, permissões e vínculos.

Também poderá consumir serviços disponibilizados pelo Contexto AI para apoio à decisão clínica.

---

### Marketplace

O Contexto Marketplace poderá depender do IAM para identificação dos participantes e do Business para validação das operações comerciais e financeiras.

---

### Business

O Contexto Business poderá depender do IAM para identificação dos participantes envolvidos nas operações financeiras.

Também poderá consumir eventos publicados pelo Marketplace relacionados às vendas realizadas.

---

### AI

O Contexto AI poderá consumir informações produzidas por qualquer Contexto, desde que autorizado pelas regras de segurança, privacidade e LGPD.

Entretanto, a Inteligência Artificial nunca será proprietária das informações consumidas.

Seu papel será apoiar os demais Contextos por meio da geração de conhecimento, sugestões e automações.

Toda interação da IA deverá respeitar o Authorization Engine antes da execução de qualquer Caso de Uso.

---

### Communication

O Contexto Communication poderá consumir eventos publicados pelos demais Contextos para realizar notificações, convites, mensagens e comunicações aos participantes da plataforma.

---

### Analytics

O Contexto Analytics poderá consumir eventos e informações produzidas por todos os demais Contextos.

Entretanto, nunca será responsável pela manutenção dos dados de origem.

Seu papel será exclusivamente consolidar informações para geração de indicadores, métricas e análises.

---

### Platform

O Contexto Platform fornecerá serviços transversais aos demais Contextos, como auditoria, parametrizações e configurações globais.

Os demais Contextos poderão utilizar esses serviços sem transferir a responsabilidade sobre seus próprios conceitos.

---

## Dependências Proibidas

Não serão permitidas dependências que:

- transfiram responsabilidades entre Contextos;
- permitam acesso direto às estruturas internas de outro Contexto;
- gerem dependências circulares;
- dupliquem regras de negócio;
- violem os limites definidos neste documento.

---

## Princípio Fundamental

As dependências entre Contextos existem para permitir colaboração, nunca para compartilhar responsabilidades.

Cada Bounded Context deverá permanecer autônomo, evoluindo de forma independente e preservando sua autoridade sobre os conceitos do domínio sob sua responsabilidade.

# 05. Linguagem Ubíqua entre os Bounded Contexts

Todos os Bounded Contexts do PortalNutri deverão utilizar uma Linguagem Ubíqua comum, garantindo consistência conceitual em toda a plataforma.

Os conceitos oficiais do domínio serão definidos pelos Documentos Mestres e deverão ser utilizados de forma uniforme por todos os Contextos.

Nenhum Contexto poderá redefinir o significado de um conceito pertencente ao domínio oficial.

---

## Conceitos Compartilhados

Os seguintes conceitos possuem significado único em toda a plataforma:

- Pessoa
- Papel
- Vínculo
- Tenant
- Unidade Organizacional
- Prontuário (visão de negócio; composição query-side via ClinicalChart)
- Objetivo Clínico (`ClinicalObjective`)
- Encontro Clínico (`ClinicalEncounter`)
- Avaliação Nutricional (`Anamnesis`, medidas antropométricas, composição corporal)
- Diagnóstico Nutricional (`NutritionDiagnosis`)
- Evolução Clínica (`ClinicalEvolution`)
- Acompanhamento de Resultado (`OutcomeTracking`)
- Protocolo Modelo
- Protocolo Aplicado
- Plano Alimentar (`MealPlan`)
- Prescrição Nutricional (`Prescription`)
- Solicitação de Exame
- Resultado de Exame
- Indicador Clínico
- Agendamento (`Appointment`)
- Produto
- Serviço
- Pedido
- Pagamento
- Assinatura
- Organização
- Consentimento
- Caso de Uso
- Command
- Query
- Workflow

Todos os Contextos deverão utilizar esses conceitos exatamente conforme definidos nos Documentos Mestres.

---

## Evolução da Linguagem

Novos conceitos poderão ser incorporados à Linguagem Ubíqua à medida que o PortalNutri evoluir.

Toda inclusão deverá ocorrer primeiramente nos Documentos Mestres e, somente depois, ser utilizada pelos demais Contextos.

---

## Consistência Terminológica

Um mesmo conceito não poderá receber nomes diferentes em Contextos distintos.

Exemplos:

✓ Pessoa

✗ Usuário
✗ Cliente
✗ Cadastro

---

✓ Prontuário

✗ Ficha
✗ Histórico
✗ Registro Clínico

---

✓ Objetivo Clínico

✗ Meta
✗ Objetivo do Paciente
✗ Objetivo Nutricional

---

A Linguagem Ubíqua deverá permanecer consistente em:

- documentação;
- banco de dados;
- APIs;
- eventos;
- interfaces;
- Inteligência Artificial;
- documentação técnica.

---

## Princípio Fundamental

A Linguagem Ubíqua representa um dos principais ativos arquiteturais do PortalNutri.

Sua consistência garante comunicação clara entre negócio, desenvolvimento, Inteligência Artificial e demais participantes do ecossistema, reduzindo ambiguidades e preservando a evolução sustentável da plataforma.

# 06. Governança dos Bounded Contexts

Os Bounded Contexts constituem a divisão oficial do domínio do PortalNutri.

Toda evolução da plataforma deverá respeitar os limites definidos neste documento, preservando a autonomia, a coesão e a independência de cada Contexto.

---

## Evolução dos Contextos

Novos Bounded Contexts poderão ser criados quando houver necessidade de representar um novo domínio de negócio claramente distinto.

A criação de novos Contextos deverá ocorrer apenas quando:

- existir linguagem ubíqua própria;
- existir conjunto próprio de regras de negócio;
- existir responsabilidade claramente delimitada;
- houver benefício arquitetural em sua separação.

A simples necessidade técnica não justifica a criação de um novo Bounded Context.

---

## Alteração de Responsabilidades

A transferência de responsabilidades entre Contextos deverá ocorrer apenas mediante revisão dos Documentos Mestres.

Nenhum Contexto poderá assumir responsabilidades pertencentes a outro sem atualização formal da arquitetura.

---

## Contratos entre Contextos

Toda comunicação entre Contextos deverá ocorrer por contratos oficialmente definidos.

Esses contratos deverão preservar:

- independência entre Contextos;
- baixo acoplamento;
- compatibilidade evolutiva;
- rastreabilidade;
- governança.

Os contratos deverão ser versionados e compatíveis com evolução incremental.

Mudanças incompatíveis deverão ser precedidas por um novo contrato ou por uma nova versão do contrato existente.

---

## Independência Tecnológica

Os Bounded Contexts representam limites do domínio e não dependem da tecnologia utilizada para implementação.

A plataforma poderá evoluir sua arquitetura técnica sem alterar os limites conceituais estabelecidos neste documento.

---

## Auditoria Arquitetural

Toda nova funcionalidade deverá responder às seguintes perguntas antes de sua implementação:

1. A qual Bounded Context pertence?
2. Qual Contexto é proprietário desse conceito?
3. Quais Eventos de Domínio serão publicados?
4. Quais Contextos irão consumir esses Eventos?
5. Existe alguma violação dos limites arquiteturais?

Caso essas perguntas não possam ser respondidas de forma clara, a arquitetura deverá ser revisada antes do desenvolvimento.

---

## Princípio Fundamental

Os Bounded Contexts representam a divisão oficial das responsabilidades do PortalNutri.

Sua preservação garante uma arquitetura sustentável, escalável, de baixo acoplamento e preparada para evoluir continuamente sem comprometer a consistência do domínio.

---

# 07. Relação com os Demais Documentos Mestres

Os Bounded Contexts representam a divisão oficial das responsabilidades da plataforma.

Sua implementação deverá observar obrigatoriamente:

- master_domain_model.md
- master_aggregates.md
- master_use_cases.md
- master_application.md
- master_permissions.md
- master_architecture.md

Nenhuma implementação poderá violar os limites definidos neste documento.

---

# 08. Decomposição Física do Care BC (Implementação)

O Bounded Context **Care** possui um único proprietário conceitual e um único limite de negócio. Na implementação atual do backend, esse contexto está **distribuído em módulos físicos de código** — não em Bounded Contexts adicionais.

## Princípio explícito

Os diretórios abaixo são **módulos físicos dentro da implementação do Care BC**. Eles **não** são Bounded Contexts independentes, **não** possuem limites de negócio próprios e **não** devem ser tratados como contextos delimitados separados na documentação ou na governança arquitetural.

| Módulo físico | Papel dentro do Care BC | É Bounded Context? |
|---------------|-------------------------|--------------------|
| `clinical/` | Núcleo de escrita clínica — 10 Aggregate Roots | **Não** — módulo físico |
| `patient/` | Cadastro e vínculo clínico do paciente | **Não** — módulo físico |
| `nutrition/` | Perfil profissional do nutricionista | **Não** — módulo físico |
| `appointment/` | Agendamento operacional | **Não** — módulo físico |

A existência desses módulos **não altera** o mapa oficial de Bounded Contexts (§01). O Care BC continua sendo **um único** contexto delimitado.

## Mapa módulo → responsabilidade

```text
Care BC (conceitual — um único Bounded Context)
├── clinical/     → módulo físico: 10 Aggregate Roots de escrita clínica
├── patient/      → módulo físico: Patient, PatientNutritionistAssignment
├── nutrition/    → módulo físico: Nutritionist
└── appointment/  → módulo físico: Appointment
```

O diretório `care/` existe como placeholder estrutural; a lógica clínica reside em `clinical/`.

## Anti-corruption entre módulos

O módulo `clinical/` consome dados de `patient/`, `nutrition/` e `appointment/` exclusivamente via **directory ports** na camada de aplicação:

- `TenantDirectoryPort`, `PatientDirectoryPort`, `PatientClinicalDirectoryPort`
- `NutritionistDirectoryPort`, `AppointmentDirectoryPort`
- `ClinicalEncounterDirectoryPort`, `AnamnesisDirectoryPort`
- `AnthropometricAssessmentDirectoryPort`

Implementações Prisma em `clinical/infrastructure/adapters/`. **Nenhum import de domínio cross-módulo.**

## ClinicalChart (próxima fase)

Read model query-side (ADR-0019; FEATURE-040; BACKLOG-007). Comporá timeline clínica a partir de query handlers existentes. **Não é Aggregate Root.**


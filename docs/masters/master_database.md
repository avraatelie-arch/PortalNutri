# Master Database

## Objetivo

O Master Database estabelece os princípios que orientam a Arquitetura de Dados do PortalNutri Platform.

Seu objetivo é garantir que a persistência das informações preserve o Modelo de Domínio, a integridade dos dados, a evolução histórica, a rastreabilidade, a segurança e a conformidade legal.

Este documento define conceitos arquiteturais.

Ele não descreve tecnologias, bancos de dados específicos, tabelas ou detalhes de implementação.

Toda decisão de persistência deverá respeitar os princípios estabelecidos pelos Documentos Mestres da plataforma.

---

# 01. Filosofia da Informação

A Arquitetura de Dados do PortalNutri é orientada pela informação, e não pela tecnologia utilizada para armazená-la.

Toda informação persistida deverá representar um fato, um estado ou um relacionamento relevante para o Modelo de Domínio da plataforma.

A persistência existe para preservar o conhecimento produzido pelo negócio, garantindo sua integridade, rastreabilidade, evolução histórica e disponibilidade durante todo o seu ciclo de vida.

O Modelo de Domínio constitui a única fonte oficial da verdade.

A Arquitetura de Dados deverá refletir esse modelo, jamais influenciá-lo ou modificá-lo em função de limitações técnicas ou escolhas de implementação.

Somente informações relevantes para o domínio deverão fazer parte da Arquitetura de Dados.

Informações transitórias, temporárias ou exclusivamente técnicas pertencem à infraestrutura da plataforma e não ao seu patrimônio informacional.

Toda informação deverá possuir um ciclo de vida claramente definido, contemplando sua criação, utilização, evolução, compartilhamento, auditoria, retenção e eventual anonimização ou descarte, quando permitido pela legislação aplicável.

---

## Princípio Fundamental

A Arquitetura de Dados do PortalNutri deverá preservar o patrimônio informacional da plataforma, garantindo que toda informação relevante permaneça íntegra, consistente, rastreável e fiel ao Modelo de Domínio durante todo o seu ciclo de vida.

---

# 02. Classificação das Informações

Toda informação persistida pelo PortalNutri deverá pertencer obrigatoriamente a uma das categorias definidas por esta arquitetura.

Essa classificação tem como objetivo estabelecer claramente a responsabilidade, o contexto, o ciclo de vida e as regras de acesso de cada informação.

---

## Informações Globais

Representam informações independentes de qualquer Tenant e compartilhadas por toda a plataforma.

Exemplos:

- Pessoa
- País
- Estado
- Cidade
- Idioma
- Moeda

As Informações Globais poderão existir sem qualquer vínculo com um Tenant.

---

## Informações do Tenant

Representam informações pertencentes exclusivamente a um Tenant.

Exemplos:

- Clínica
- Agenda
- Equipe
- Financeiro
- Configurações
- Planos
- Recursos habilitados

Seu acesso deverá respeitar integralmente as regras de isolamento definidas para Multi-tenancy.

---

## Informações do Vínculo

Representam informações produzidas durante o relacionamento entre uma Pessoa e um Tenant.

Exemplos:

- Prontuário
- Consultas
- Avaliações
- Protocolos
- Prescrições
- Exames
- Evolução Clínica

O Paciente permanece como titular dessas informações, enquanto o Vínculo define seu contexto clínico.

---

## Informações de Sistema

Representam informações necessárias ao funcionamento da plataforma.

Exemplos:

- Auditoria
- Eventos de Domínio
- Logs
- Notificações
- Configurações Globais
- Permissões

Essas informações suportam a operação da plataforma e não representam diretamente dados do negócio.

---

## Princípio Fundamental

Toda informação deverá possuir uma categoria claramente definida.

Essa classificação orientará sua persistência, proteção, compartilhamento, auditoria, retenção e ciclo de vida, preservando a coerência do Modelo de Domínio e da Arquitetura da Plataforma.

---

# 03. Entidade Pessoa

A Pessoa representa a identidade global de um usuário dentro do PortalNutri Platform.

Ela é uma Informação Global e poderá existir independentemente de qualquer Tenant, Papel ou Vínculo.

A Pessoa não deverá ser confundida com Paciente, Nutricionista, Secretária, Administrador ou qualquer outro papel exercido na plataforma.

Esses papéis representam formas de atuação da Pessoa em contextos específicos.

---

## Responsabilidade

A Entidade Pessoa será responsável por preservar a identidade única do usuário dentro da plataforma.

Uma mesma Pessoa poderá:

- Exercer múltiplos papéis.
- Possuir múltiplos vínculos.
- Participar de diferentes Tenants.
- Utilizar diferentes áreas da plataforma.

---

## Identificador Global

Toda Pessoa deverá possuir um Identificador Global Único.

Esse identificador:

- Não poderá ser alterado.
- Não poderá ser reutilizado.
- Não dependerá de CPF, e-mail, telefone, Tenant ou qualquer outro atributo.
- Representará a identidade permanente da Pessoa dentro do PortalNutri.

---

## Dados Mínimos de Identidade

A arquitetura permitirá a criação de uma Pessoa com dados mínimos, preservando flexibilidade para pré-cadastros, integrações, convites, importações e fluxos futuros.

Dados mínimos recomendados:

- Nome.
- Tipo da Pessoa.
- Pelo menos um meio de contato.

O CPF não será obrigatório para a existência arquitetural de uma Pessoa.

Quando informado, deverá ser validado, único e auditável.

---

## Cadastro Clínico

Embora a arquitetura permita criação com dados mínimos, fluxos clínicos poderão exigir informações adicionais.

Para iniciar um atendimento clínico, o PortalNutri Care poderá exigir:

- Nome.
- Papel exercido no contexto clínico.
- CPF.
- Data de nascimento.
- Sexo.
- Pelo menos um meio de contato.

Essas exigências representam regras do contexto clínico, não limitações da Entidade Pessoa.

---

## Alteração de Dados

Dados de identidade poderão ser atualizados conforme regras de negócio, permissões e auditoria.

O Identificador Global da Pessoa nunca poderá ser alterado.

Alterações em documentos oficiais, como CPF, deverão exigir processo controlado, justificativa e registro de auditoria.

---

## Princípio Fundamental

A Pessoa representa a identidade única e permanente do usuário dentro do PortalNutri Platform.

Papéis, Vínculos, Tenants e permissões poderão mudar ao longo do tempo, mas a identidade da Pessoa deverá permanecer preservada durante todo o ciclo de vida da plataforma.

---

# 04. Entidade Tenant

O Tenant representa a unidade lógica de organização e isolamento do PortalNutri Platform.

Cada Tenant corresponde a uma organização independente que utiliza a plataforma para executar suas atividades, possuindo seu próprio contexto de negócio, configurações, usuários, vínculos, processos e informações operacionais.

O Tenant não representa necessariamente uma Clínica.

Ele representa qualquer organização capaz de operar dentro do ecossistema PortalNutri.

Exemplos:

- Clínica
- Consultório
- Nutricionista Autônomo
- Hospital
- Universidade
- Empresa
- Academia
- Franquia
- Outras organizações compatíveis com a plataforma

---

## Responsabilidade

O Tenant será responsável por concentrar todas as informações operacionais pertencentes ao seu contexto de negócio.

Entre elas:

- Usuários vinculados.
- Equipe.
- Agenda.
- Configurações.
- Financeiro.
- Recursos contratados.
- Integrações.
- Processos internos.

---

## Isolamento

Cada Tenant representa um ambiente independente.

As informações pertencentes a um Tenant não poderão ser acessadas por outro Tenant, salvo quando houver mecanismos explícitos de compartilhamento previstos pela plataforma.

O isolamento entre Tenants constitui um dos princípios fundamentais da arquitetura.

---

## Relação com a Pessoa

Uma Pessoa poderá participar de um ou mais Tenants simultaneamente.

Essa participação ocorrerá sempre por meio de um Vínculo.

O Tenant nunca será proprietário da identidade da Pessoa.

A identidade permanece global dentro da plataforma.

---

## Ciclo de Vida

O Tenant possuirá ciclo de vida próprio.

Estados mínimos recomendados:

- Em implantação.
- Ativo.
- Suspenso.
- Encerrado.

O encerramento de um Tenant não implicará na remoção automática das informações sob sua responsabilidade, respeitando as políticas de retenção, auditoria e legislação aplicável.

---

## Princípio Fundamental

O Tenant representa o limite organizacional e de isolamento da plataforma.

Ele organiza o contexto operacional de cada organização sem assumir a propriedade da identidade das Pessoas nem das informações produzidas pelos Vínculos Clínicos.

---

# 05. Entidade Unidade Organizacional

A Unidade Organizacional representa uma subdivisão operacional de um Tenant.

Ela permite que uma mesma organização opere por meio de múltiplas unidades, preservando uma administração centralizada e compartilhando a identidade organizacional.

Exemplos:

- Matriz
- Filial
- Unidade de Atendimento
- Ambulatório
- Campus
- Polo
- Unidade Móvel

---

## Responsabilidade

Cada Unidade Organizacional poderá possuir:

- Nome.
- Endereço.
- Contatos.
- CNPJ próprio, quando aplicável.
- Responsável técnico.
- Horário de funcionamento.
- Configurações operacionais.

Todas as Unidades Organizacionais pertencem obrigatoriamente a um único Tenant.

---

## Relação com Pessoas

Uma Pessoa poderá atuar em uma ou mais Unidades Organizacionais pertencentes ao mesmo Tenant.

A associação será controlada por meio do Vínculo e das permissões atribuídas.

---

## Relação com Pacientes

Os Pacientes pertencem ao Tenant.

A Unidade Organizacional representa apenas o local onde o atendimento é realizado.

Essa abordagem permite que um mesmo Paciente seja atendido em diferentes Unidades Organizacionais sem duplicação de cadastro, preservando um único histórico clínico dentro do Tenant.

---

## Princípio Fundamental

A Unidade Organizacional representa uma estrutura operacional do Tenant.

Ela organiza pessoas, recursos e atendimentos sem alterar a identidade das Pessoas nem a titularidade das informações clínicas.

---

# 06. Entidade Vínculo

O Vínculo representa o relacionamento formal entre uma Pessoa e um Tenant dentro do PortalNutri Platform.

Ele é a entidade responsável por definir em qual contexto organizacional uma Pessoa atua, participa ou recebe atendimento.

A Pessoa representa a identidade global.

O Tenant representa o ambiente organizacional.

O Vínculo representa a atuação da Pessoa dentro desse ambiente.

---

## Responsabilidade

O Vínculo será responsável por preservar o contexto organizacional da Pessoa dentro de um Tenant.

Ele deverá possuir:

- Identificador próprio.
- Pessoa vinculada.
- Tenant vinculado.
- Status.
- Data de início.
- Data de encerramento, quando aplicável.
- Motivo de encerramento, quando aplicável.

---

## Ciclo de Vida

Todo Vínculo possuirá ciclo de vida próprio.

Estados mínimos:

- Pendente.
- Ativo.
- Suspenso.
- Encerrado.

Quando uma Pessoa encerrar sua relação com um Tenant, o Vínculo deverá ser encerrado, e não removido.

Caso a Pessoa retorne futuramente ao mesmo Tenant, um novo Vínculo deverá ser criado.

---

## Papéis e Permissões

Papéis e Permissões não deverão ser armazenados diretamente dentro do Vínculo.

Eles deverão ser representados por entidades próprias relacionadas ao Vínculo.

Essa separação permitirá evolução histórica, controle granular de acesso e múltiplas atuações simultâneas.

---

## Unidades Organizacionais

Um Vínculo poderá estar associado a uma ou mais Unidades Organizacionais pertencentes ao mesmo Tenant.

Essa associação permitirá que uma Pessoa atue em diferentes unidades sem duplicação de identidade ou criação de múltiplos vínculos desnecessários.

---

## Princípio Fundamental

O Vínculo representa o contexto de atuação da Pessoa dentro de um Tenant.

Toda funcionalidade dependente de contexto organizacional deverá referenciar o Vínculo, preservando a separação entre identidade, organização, atuação, papéis e permissões.

---

# 07. Entidade Papel

O Papel representa a função exercida por uma Pessoa dentro de um determinado Vínculo.

Enquanto o Vínculo estabelece o relacionamento entre uma Pessoa e um Tenant, o Papel define como essa Pessoa atua naquele contexto.

Uma mesma Pessoa poderá exercer diferentes Papéis ao longo do tempo ou simultaneamente dentro do mesmo Vínculo.

---

## Classificação

O PortalNutri adotará um modelo híbrido para definição de Papéis.

### Papéis do Sistema

Representam funções padronizadas disponibilizadas pela plataforma.

Exemplos:

- Paciente
- Nutricionista
- Secretária
- Administrador
- Médico
- Parceiro

Esses Papéis possuem significado funcional conhecido pela plataforma.

### Papéis Personalizados

Cada Tenant poderá criar Papéis específicos para atender às suas necessidades organizacionais.

Exemplos:

- Coordenador Clínico
- Supervisor
- Recepcionista Líder
- Estagiário
- Consultor

Os Papéis personalizados pertencem exclusivamente ao Tenant que os criou.

---

## Ciclo de Vida

Cada Papel possuirá ciclo de vida próprio.

No mínimo deverão ser registrados:

- Data de início.
- Data de encerramento, quando aplicável.
- Status.

O encerramento de um Papel não implicará no encerramento do Vínculo.

---

## Múltiplos Papéis

Um mesmo Vínculo poderá possuir múltiplos Papéis ativos simultaneamente.

Essa abordagem permite que uma Pessoa exerça diferentes responsabilidades dentro da mesma organização sem necessidade de criação de novos Vínculos.

---

## Relação com Permissões

Os Papéis representam funções organizacionais.

As Permissões representam as autorizações concedidas a essas funções.

Papéis e Permissões deverão permanecer desacoplados, permitindo maior flexibilidade na administração da plataforma.

---

## Princípio Fundamental

O Papel define a forma como uma Pessoa atua dentro de um determinado Vínculo.

Ele representa responsabilidades organizacionais e deverá possuir identidade e ciclo de vida próprios, preservando a evolução histórica das funções exercidas na plataforma.

---

# 08. Entidade Atribuição de Papel

A Atribuição de Papel representa a associação entre um Vínculo e um Papel dentro do PortalNutri Platform.

Ela define quando, onde e em quais condições uma Pessoa passa a exercer determinada função dentro de um Tenant.

Essa entidade preserva o histórico da atuação da Pessoa e permite que Papéis sejam concedidos, alterados e encerrados independentemente do ciclo de vida do Vínculo.

---

## Responsabilidade

A Atribuição de Papel deverá registrar:

- Vínculo.
- Papel.
- Unidade Organizacional, quando aplicável.
- Data de início.
- Data de encerramento, quando aplicável.
- Status.
- Vínculo responsável pela concessão.
- Data da concessão.
- Motivo da concessão ou encerramento, quando aplicável.

---

## Múltiplas Atribuições

Um mesmo Vínculo poderá possuir múltiplas Atribuições de Papel simultaneamente.

Cada Atribuição possuirá ciclo de vida próprio e independente.

---

## Temporalidade

Uma Atribuição poderá ser permanente ou temporária.

A vigência será controlada pelas datas de início e encerramento, permitindo substituições, cargos temporários e mudanças organizacionais sem perda do histórico.

---

## Auditoria

Toda concessão, alteração, suspensão ou encerramento de uma Atribuição deverá preservar rastreabilidade completa.

O responsável pela concessão será identificado pelo Vínculo que realizou a ação, preservando o contexto organizacional da decisão.

---

## Princípio Fundamental

A Atribuição de Papel representa a autorização formal para que um Vínculo exerça determinada função dentro da organização.

Ela preserva a evolução histórica das responsabilidades da Pessoa e garante rastreabilidade completa das decisões organizacionais.

---

# 09. Entidade Permissão

A Permissão representa a autorização para executar uma ação sobre um recurso da plataforma dentro de um determinado contexto organizacional.

As Permissões não serão atribuídas diretamente às Pessoas.

Elas serão concedidas aos Papéis e, consequentemente, herdadas pelos Vínculos que exercerem esses Papéis, podendo receber ajustes específicos quando permitido pelas regras da plataforma.

---

## Responsabilidade

Cada Permissão deverá definir:

- O recurso protegido.
- A ação autorizada.
- O contexto onde poderá ser utilizada.

Exemplos:

- Visualizar Paciente.
- Editar Paciente.
- Criar Consulta.
- Cancelar Consulta.
- Registrar Evolução Clínica.
- Gerenciar Agenda.
- Gerenciar Financeiro.

---

## Organização

As Permissões deverão ser organizadas conforme os Bounded Contexts e capacidades oficiais da plataforma.

### IAM
- Pessoas
- Papéis
- Vínculos
- Permissões

### Care
- Prontuários
- Consultas
- Avaliações
- Protocolos Aplicados

### Marketplace
- Produtos
- Pedidos
- Lojas
- Catálogo

### Business
- Assinaturas
- Cobranças
- Pagamentos
- Comissões

### AI
- Agentes Inteligentes
- Memória Inteligente
- Base Oficial de Conhecimento

Essa organização mantém coerência entre a Arquitetura de Dados, a Arquitetura da Plataforma e os Domínios de Negócio.

---

## Relação com Papéis

As Permissões serão atribuídas aos Papéis.

Os Papéis serão atribuídos aos Vínculos por meio da Entidade Atribuição de Papel.

Os Vínculos representarão o contexto organizacional em que essas Permissões poderão ser exercidas.

---

## Restrições

As Permissões poderão sofrer restrições adicionais conforme:

- Tenant.
- Unidade Organizacional.
- Configurações da organização.
- Políticas da plataforma.

---

## Princípio Fundamental

As Permissões representam autorizações para execução de ações sobre recursos da plataforma.

Elas deverão permanecer desacopladas das Pessoas, sendo concedidas por meio dos Papéis e exercidas no contexto definido pelo Vínculo, preservando simplicidade, escalabilidade e consistência arquitetural.

---

# 10. Entidade Prontuário

O Prontuário representa o conjunto organizado de informações clínicas produzidas dentro de um Vínculo Clínico.

> **Modelo de persistência implementado (FEATURE-039):** o Prontuário **não é uma tabela nem um Aggregate Root de escrita**. Registros clínicos são persistidos por múltiplos Aggregate Roots independentes (ver §10.1). A visão unificada será composta query-side por **ClinicalChart** (ADR-0019; FEATURE-040).

## Responsabilidade (conceito de negócio)

O Prontuário deverá organizar:

- Objetivos Clínicos (`ClinicalObjective`).
- Encontros Clínicos (`ClinicalEncounter`) e Agendamentos (`Appointment`).
- Avaliações Nutricionais (`Anamnesis`, medidas antropométricas, composição corporal).
- Diagnósticos Nutricionais (`NutritionDiagnosis`).
- Evoluções Clínicas (`ClinicalEvolution`).
- Acompanhamentos de Resultado (`OutcomeTracking`).
- Protocolos Aplicados *(não implementado)*.
- Planos Alimentares (`MealPlan` + `MealPlanMeal`).
- Prescrições Nutricionais (`Prescription` + `PrescriptionLine`).
- Solicitações e Resultados de Exames *(não implementado)*.
- Indicadores Clínicos *(não implementado como aggregate standalone)*.

## Relação com o Vínculo Clínico

Todo registro clínico deverá pertencer a um Vínculo Clínico válido (`tenantId` + `patientId` + profissional responsável).

## Princípio Fundamental

O Prontuário é o centro organizador **conceitual** da jornada clínica. Na implementação, a consistência transacional reside nos Aggregate Roots individuais; a composição visual e analítica reside no read model **ClinicalChart**.

---

# 10.1. Persistência do Modelo Clínico Implementado

Esta seção descreve o mapeamento Prisma dos Aggregate Roots implementados até FEATURE-039. Não replica o schema completo — consultar `backend/prisma/schema.prisma`.

## Tabelas Aggregate Root (módulo clinical)

| Modelo Prisma | Aggregate Root | Cluster |
|---------------|---------------|---------|
| `clinical_encounters` | ClinicalEncounter | session-bound |
| `anamneses` | Anamnesis | session-bound |
| `anthropometric_assessments` | AnthropometricAssessment | session-bound |
| `body_composition_assessments` | BodyCompositionAssessment | session-bound |
| `clinical_evolutions` | ClinicalEvolution | session-bound |
| `nutrition_diagnoses` | NutritionDiagnosis | patient-scoped |
| `clinical_objectives` | ClinicalObjective | patient-scoped |
| `meal_plans` | MealPlan | patient-scoped |
| `prescriptions` | Prescription | patient-scoped |
| `outcome_trackings` | OutcomeTracking | patient-scoped |

## Entidades subordinadas (child tables)

| Modelo Prisma | Pertence a | Cascade |
|---------------|-----------|---------|
| `meal_plan_meals` | MealPlan | delete cascade |
| `prescription_lines` | Prescription | delete cascade |

## OutcomeTracking — ausência de evidências no write model

Conforme ADR-0022: a tabela `outcome_trackings` persiste julgamento clínico (`outcome_assessment`, `adherence_factor`, textos profissionais, cronologia). **Não possui colunas de referência a evidências** — composição query-side deferida (BACKLOG-017).

## Módulos satélite Care BC

| Modelo Prisma | Módulo | Aggregate Root |
|---------------|--------|---------------|
| `patients` | patient | Patient |
| `patient_nutritionist_assignments` | patient | PatientNutritionistAssignment |
| `nutritionists` | nutrition | Nutritionist |
| `appointments` | appointment | Appointment |

---

# 11. Entidade Consulta

A Consulta representa um encontro clínico realizado entre um Profissional e um Paciente dentro do contexto de um Vínculo Clínico.

Seu objetivo é registrar um atendimento e produzir informações que passarão a compor o Prontuário.

A Consulta não representa o histórico clínico do Paciente.

Ela representa um evento clínico que gera novos registros para esse histórico.

---

## Responsabilidade

Cada Consulta deverá registrar, no mínimo:

- Prontuário.
- Objetivo Clínico relacionado.
- Paciente.
- Profissional responsável.
- Data e horário.
- Modalidade do atendimento.
- Status.

---

## Produtos da Consulta

Uma Consulta poderá produzir:

- Avaliações Nutricionais.
- Evoluções Clínicas.
- Prescrições Nutricionais.
- Solicitações de Exames.

Além disso, durante uma Consulta o profissional poderá criar, iniciar, alterar, suspender ou encerrar Protocolos Aplicados vinculados ao Objetivo Clínico correspondente.

Nem todos esses registros são obrigatórios em uma Consulta.

---

## Ciclo de Vida

Toda Consulta possuirá ciclo de vida próprio.

Estados mínimos:

- Agendada.
- Em andamento.
- Finalizada.
- Cancelada.

Uma Consulta finalizada não poderá ser excluída, apenas retificada conforme regras de auditoria.

---

## Princípio Fundamental

A Consulta representa um evento clínico que produz informações para o Prontuário, preservando a rastreabilidade do atendimento e a autoria dos registros realizados.

---

# 12. Entidade Avaliação Nutricional

A Avaliação Nutricional representa o conjunto de informações coletadas e analisadas durante uma Consulta com o objetivo de compreender o estado clínico e nutricional do Paciente.

Ela sempre deverá estar vinculada a uma Consulta, preservando o contexto em que foi realizada.

---

## Responsabilidade

Uma Avaliação poderá registrar, entre outras informações:

- Dados antropométricos.
- Composição corporal.
- Sinais clínicos.
- Hábitos alimentares.
- Histórico clínico complementar.
- Diagnóstico nutricional.
- Indicadores calculados.
- Observações do profissional.

---

## Relação com a Consulta

Cada Avaliação pertence a uma única Consulta.

Uma Consulta poderá conter nenhuma, uma ou várias Avaliações, conforme a necessidade clínica.

---

## Evolução Histórica

Nenhuma Avaliação substituirá outra.

Cada nova Avaliação representará um novo registro histórico da evolução do Paciente.

---

## Princípio Fundamental

A Avaliação Nutricional representa um registro técnico produzido durante uma Consulta, preservando a evolução clínica do Paciente ao longo do tempo.

---

# 13. Entidade Evolução Clínica

A Evolução Clínica representa o registro cronológico das observações, análises, decisões e acompanhamentos realizados pelo profissional durante o tratamento do Paciente.

Ela constitui um dos principais componentes do Prontuário, preservando a história clínica do acompanhamento.

---

## Responsabilidade

Uma Evolução Clínica poderá registrar:

- Observações do profissional.
- Interpretações clínicas.
- Resposta ao tratamento.
- Condutas adotadas.
- Orientações fornecidas.
- Reavaliações.
- Informações complementares relevantes.

---

## Relação com a Consulta

A Evolução Clínica normalmente será produzida durante uma Consulta.

Entretanto, poderá ser registrada posteriormente, desde que preserve o vínculo com o Prontuário, a autoria, a data e o motivo do registro.

---

## Evolução Histórica

Nenhuma Evolução Clínica poderá substituir outra.

Cada registro representa um novo evento clínico, preservando integralmente a linha do tempo do Prontuário.

Retificações deverão gerar novos registros, mantendo a rastreabilidade das alterações.

---

## Princípio Fundamental

A Evolução Clínica representa o registro cronológico da história do tratamento, preservando a continuidade do cuidado, a autoria das informações e a integridade do Prontuário.

---

# 14. Entidade Protocolo Modelo e Protocolo Aplicado

O PortalNutri distingue dois conceitos relacionados aos Protocolos: Protocolo Modelo e Protocolo Aplicado.

Essa separação permite reutilização, comercialização, versionamento e preservação do histórico clínico.

---

## Protocolo Modelo

O Protocolo Modelo representa um ativo de conhecimento estruturado utilizado como base para tratamentos nutricionais.

Ele poderá ser:

- Criado por uma Nutricionista.
- Pertencer a um Tenant.
- Disponibilizado oficialmente pela Plataforma.
- Comercializado ou compartilhado por meio do Marketplace.

Todo Protocolo Modelo deverá possuir controle de versão.

Novas versões não poderão alterar Protocolos já aplicados aos Pacientes.

---

## Protocolo Aplicado

O Protocolo Aplicado representa a utilização de um Protocolo Modelo em um determinado Prontuário.

Cada aplicação preservará integralmente a versão utilizada no momento da prescrição clínica.

Após aplicado, o Protocolo poderá ser personalizado conforme as necessidades do Paciente sem modificar o Protocolo Modelo original.

---

## Conteúdo

Um Protocolo poderá conter, entre outros elementos:

- Objetivos clínicos.
- Plano alimentar.
- Prescrições.
- Orientações.
- Materiais de apoio.
- Metas.
- Critérios de acompanhamento.

---

## Versionamento

Todo Protocolo Modelo deverá possuir versionamento.

O Protocolo Aplicado permanecerá vinculado permanentemente à versão utilizada durante sua aplicação.

Atualizações futuras do Modelo não alterarão tratamentos já iniciados.

---

## Princípio Fundamental

O Protocolo representa conhecimento estruturado.

O Modelo constitui um ativo reutilizável da plataforma.

O Protocolo Aplicado constitui parte integrante da história clínica do Paciente.

---

# 15. Entidade Plano Alimentar

O Plano Alimentar representa a estratégia nutricional operacional definida para execução de um Protocolo Aplicado.

Ele descreve a organização prática da alimentação do Paciente durante determinada fase do tratamento.

O Plano Alimentar não constitui uma entidade independente.

Ele sempre pertence a um Protocolo Aplicado.

---

## Responsabilidade

Um Plano Alimentar poderá conter, entre outras informações:

- Refeições.
- Alimentos.
- Quantidades.
- Substituições.
- Horários.
- Observações.
- Recomendações.
- Materiais complementares.

---

## Relação com o Protocolo

Todo Plano Alimentar pertence obrigatoriamente a um Protocolo Aplicado.

Um mesmo Protocolo poderá possuir um ou mais Planos Alimentares, permitindo diferentes estratégias nutricionais durante o tratamento.

Exemplos:

- Plano inicial.
- Plano de manutenção.
- Plano para dias úteis.
- Plano para finais de semana.
- Plano para viagens.
- Plano por fases do tratamento.

---

## Evolução

Novas versões do Plano Alimentar não substituirão as anteriores.

Cada alteração representará uma nova evolução do tratamento, preservando o histórico clínico do Paciente.

Todas as versões deverão permanecer vinculadas ao mesmo Protocolo Aplicado, garantindo rastreabilidade completa da evolução nutricional.

---

## Princípio Fundamental

O Plano Alimentar representa a execução prática da estratégia definida pelo Protocolo, preservando a evolução nutricional do Paciente e a rastreabilidade das condutas adotadas.

---

# 16. Entidade Objetivo Clínico

O Objetivo Clínico representa o resultado terapêutico que se pretende alcançar durante o acompanhamento do Paciente.

Ele organiza a jornada clínica dentro do Prontuário, permitindo que Consultas, Protocolos, Evoluções, Prescrições e Exames sejam agrupados conforme a finalidade do tratamento.

O Objetivo Clínico representa o contexto clínico do acompanhamento, e não apenas uma meta descritiva.

---

## Responsabilidade

Um Objetivo Clínico deverá possuir, no mínimo:

- Nome.
- Descrição.
- Categoria.
- Prioridade.
- Status.
- Data de início.
- Data prevista para conclusão.
- Data de conclusão, quando aplicável.
- Resultado esperado.
- Critérios de sucesso.

---

## Relação com o Prontuário

Todo Objetivo Clínico pertence obrigatoriamente a um único Prontuário.

Um mesmo Prontuário poderá possuir vários Objetivos Clínicos ativos ou concluídos simultaneamente.

Exemplos:

- Emagrecimento.
- Hipertrofia.
- Gestação.
- Reeducação Alimentar.
- Controle de Diabetes.
- Performance Esportiva.

---

## Relação com outras Entidades

Um Objetivo Clínico organiza toda a jornada terapêutica do Paciente.

Dentro de um Objetivo Clínico poderão ocorrer uma ou mais Consultas.

Cada Consulta poderá produzir:

- Avaliações Nutricionais.
- Evoluções Clínicas.
- Prescrições Nutricionais.
- Solicitações de Exames.

Além disso, um Objetivo Clínico poderá possuir um ou mais Protocolos Aplicados.

Cada Protocolo Aplicado poderá conter um ou mais Planos Alimentares.

Essa organização preserva a rastreabilidade entre a intenção terapêutica, os atendimentos realizados e as condutas adotadas.

---

## Ciclo de Vida

Todo Objetivo Clínico possuirá ciclo de vida próprio.

Estados mínimos:

- Planejado.
- Ativo.
- Suspenso.
- Concluído.
- Cancelado.

O encerramento de um Objetivo não encerra o Prontuário.

---

## Princípio Fundamental

O Objetivo Clínico representa a finalidade terapêutica do acompanhamento nutricional.

Ele organiza toda a jornada clínica do Paciente, preservando contexto, rastreabilidade e evolução histórica do tratamento.

---

# 17. Entidade Prescrição Nutricional

A Prescrição Nutricional representa a conduta nutricional formal definida pelo profissional para execução de um Protocolo Aplicado.

Ela traduz as decisões clínicas em orientações práticas destinadas ao Paciente.

A Prescrição Nutricional não constitui uma entidade independente.

Ela sempre pertence a um Protocolo Aplicado.

---

## Responsabilidade

Uma Prescrição Nutricional poderá conter, entre outras informações:

- Suplementos.
- Fitoterápicos.
- Manipulados.
- Recomendações alimentares.
- Orientações de consumo.
- Dosagens.
- Frequência de utilização.
- Duração prevista.
- Observações do profissional.

---

## Relação com o Protocolo

Toda Prescrição Nutricional pertence obrigatoriamente a um Protocolo Aplicado.

Um mesmo Protocolo poderá possuir uma ou mais Prescrições Nutricionais durante sua evolução.

Novas Prescrições não substituem automaticamente as anteriores.

Cada alteração representa uma nova etapa da conduta terapêutica.

---

## Relação com a Consulta

A Prescrição normalmente será criada ou alterada durante uma Consulta.

A Consulta registra a decisão clínica.

A Prescrição representa a conduta terapêutica vigente.

---

## Evolução

Toda alteração deverá preservar o histórico.

O Paciente deverá possuir acesso à versão vigente, enquanto versões anteriores permanecerão disponíveis para auditoria e acompanhamento clínico.

---

## Princípio Fundamental

A Prescrição Nutricional representa a formalização da conduta definida pelo profissional para execução do tratamento estabelecido no Protocolo Aplicado, preservando histórico, rastreabilidade e segurança clínica.

---

# 18. Entidade Solicitação de Exame

A Solicitação de Exame representa o registro formal da decisão clínica do profissional em solicitar exames complementares para apoiar o acompanhamento nutricional do Paciente.

Ela sempre deverá ser originada durante uma Consulta, preservando o contexto em que foi solicitada.

---

## Responsabilidade

Uma Solicitação de Exame poderá registrar, entre outras informações:

- Exame solicitado.
- Justificativa clínica.
- Data da solicitação.
- Prioridade.
- Observações do profissional.
- Status.

---

## Relação com a Consulta

Toda Solicitação de Exame deverá estar vinculada a uma Consulta.

Uma Consulta poderá gerar nenhuma, uma ou várias Solicitações de Exame.

---

## Evolução

Após sua emissão, uma Solicitação poderá:

- Permanecer pendente.
- Ser cancelada.
- Ser atendida.
- Receber um ou mais Resultados de Exame.

O histórico deverá ser preservado integralmente.

---

## Princípio Fundamental

A Solicitação de Exame representa uma decisão clínica tomada durante uma Consulta com o objetivo de obter informações complementares para o acompanhamento do Paciente.

---

# 19. Entidade Resultado de Exame

O Resultado de Exame representa a resposta obtida a partir de uma Solicitação de Exame realizada durante o acompanhamento clínico do Paciente.

Ele constitui um registro clínico do Prontuário e fornece informações objetivas para subsidiar decisões terapêuticas.

---

## Responsabilidade

Um Resultado de Exame poderá registrar, entre outras informações:

- Solicitação de Exame correspondente.
- Data da realização.
- Data do resultado.
- Laboratório responsável.
- Arquivo ou documento do exame.
- Valores obtidos.
- Unidade de medida.
- Valores de referência.
- Observações.

---

## Relação com a Solicitação de Exame

Todo Resultado de Exame pertence obrigatoriamente a uma Solicitação de Exame.

Uma Solicitação poderá possuir nenhum, um ou vários Resultados, conforme a natureza do exame.

---

## Relação com a Consulta

O Resultado de Exame poderá ser analisado em uma ou mais Consultas.

A Consulta registra a interpretação clínica do profissional.

O Resultado permanece como um registro objetivo e permanente do Prontuário.

---

## Evolução

Novos Resultados nunca substituirão resultados anteriores.

Cada exame representa um novo registro histórico, permitindo acompanhar a evolução clínica do Paciente ao longo do tempo.

---

## Princípio Fundamental

O Resultado de Exame representa uma evidência clínica objetiva produzida a partir de uma Solicitação de Exame, preservando histórico, rastreabilidade e suporte às decisões terapêuticas.

---

# 20. Entidade Indicador Clínico

O Indicador Clínico representa uma variável clínica mensurável utilizada para acompanhar a evolução do Paciente durante o tratamento.

Ele constitui uma informação objetiva do Prontuário e poderá ser originado por diferentes eventos clínicos, preservando histórico completo de sua evolução.

O Indicador Clínico representa um conceito transversal do domínio, sendo utilizado por diversos módulos da plataforma.

---

## Responsabilidade

Um Indicador Clínico deverá registrar, no mínimo:

- Tipo do indicador.
- Valor obtido.
- Unidade de medida.
- Data e hora da medição.
- Origem da informação.
- Método de obtenção, quando aplicável.
- Observações.

---

## Origem

Um Indicador Clínico poderá ser produzido por:

- Avaliações Nutricionais.
- Resultados de Exames.
- Equipamentos integrados.
- Dispositivos do Paciente.
- Integrações com sistemas externos.
- Inteligência Artificial, quando permitido pelas regras da plataforma.

---

## Relação com o Prontuário

Todo Indicador Clínico pertence a um único Prontuário.

Os Indicadores representam a evolução objetiva do estado clínico do Paciente ao longo do tempo.

---

## Relação com Objetivos Clínicos

Os Objetivos Clínicos poderão utilizar Indicadores Clínicos para definir critérios de sucesso, acompanhamento e encerramento do tratamento.

Exemplos:

- Peso.
- IMC.
- Percentual de gordura.
- Circunferência abdominal.
- Glicemia.
- Hemoglobina glicada.
- HDL.
- LDL.
- Triglicerídeos.
- Vitamina D.

---

## Evolução

Cada nova medição gera um novo registro.

Nenhum Indicador Clínico substituirá registros anteriores.

Toda evolução deverá permanecer disponível para análise histórica, geração de gráficos, auditoria e apoio à decisão clínica.

---

## Princípio Fundamental

O Indicador Clínico representa uma evidência objetiva da evolução do Paciente.

Ele constitui a principal fonte de dados quantitativos da plataforma, servindo de base para acompanhamento clínico, inteligência artificial, dashboards, protocolos inteligentes e análise da efetividade dos tratamentos.


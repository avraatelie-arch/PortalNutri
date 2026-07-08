# PortalNutri Platform

# Master Permissions

**Versão:** 1.0

**Status:** Documento Mestre de Permissões

---

# 00. Objetivo do Documento

Este documento define oficialmente o Modelo de Permissões do PortalNutri Platform.

Seu objetivo é estabelecer as regras que determinam quais participantes podem visualizar, criar, alterar, compartilhar ou administrar informações dentro da plataforma.

Este documento não define:

- Implementação técnica;
- Banco de Dados;
- Frameworks de autenticação;
- APIs.

Este documento define exclusivamente:

- Modelo conceitual de autorização;
- Papéis da plataforma;
- Regras de acesso;
- Compartilhamentos;
- Delegações;
- Consentimentos;
- Auditoria.

---

## Objetivo Final

Este documento servirá como referência para:

- Backend;
- Frontend;
- Mobile;
- Camada de Aplicação;
- Inteligência Artificial;
- Segurança;
- Auditoria.

---

# 01. Princípios Gerais

O PortalNutri adotará um modelo híbrido de autorização baseado em:

- Papéis (RBAC);
- Atributos (ABAC);
- Permissões;
- Escopos;
- Políticas;
- Vínculos;
- Consentimentos.

Nenhuma permissão será concedida exclusivamente pela existência de um Papel.

Toda autorização dependerá da combinação das regras definidas neste documento.

---

## Princípio Fundamental

Possuir um Papel não significa possuir acesso.

Possuir uma Permissão não significa possuir autorização.

A autorização será sempre resultado da combinação entre:

- Papéis;
- Permissões;
- Escopos;
- Políticas;
- Vínculos;
- Consentimentos.

---

# 02. Modelo Oficial de Autorização

O PortalNutri adotará um modelo híbrido de autorização baseado na combinação de Papéis (RBAC) e Atributos (ABAC), enriquecido por Escopos, Políticas, Vínculos e Consentimentos.

Nenhuma autorização será concedida exclusivamente pela existência de um Papel.

Toda decisão de autorização deverá considerar o contexto completo da operação.

---

## Fluxo Oficial de Autorização

Pessoa

↓

Papéis

↓

Permissões

↓

Escopos

↓

Políticas

↓

Vínculos

↓

Consentimentos

↓

Autorização Final

---

## Pessoa

Representa a identidade digital única da plataforma.

Toda autorização é concedida a uma Pessoa, independentemente dos Papéis que ela exerça.

---

## Papéis

Representam as funções exercidas por uma Pessoa.

Exemplos:

- Paciente
- Nutricionista
- Secretária
- Administrador
- Parceiro

Uma Pessoa poderá exercer múltiplos Papéis simultaneamente.

Os Papéis representam responsabilidades, não permissões.

---

## Permissões

Representam as capacidades concedidas pela plataforma.

Exemplos:

- visualizar;
- criar;
- editar;
- excluir;
- compartilhar;
- aprovar;
- administrar.

As Permissões definem apenas "o que pode ser feito".

---

## Escopos

Representam os recursos sobre os quais determinada Permissão poderá ser exercida.

Exemplos:

- somente pacientes vinculados;
- somente consultas próprias;
- somente organização atual;
- somente unidade organizacional selecionada;
- somente protocolos publicados pelo próprio profissional.

O Escopo responde:

**"Sobre quais informações essa Permissão poderá atuar?"**

---

## Políticas

Representam regras adicionais que condicionam a autorização.

Exemplos:

- vínculo ativo;
- assinatura válida;
- profissional habilitado;
- horário permitido;
- organização ativa.

As Políticas respondem:

**"Em quais condições a Permissão poderá ser utilizada?"**

---

## Vínculos

Representam os relacionamentos válidos entre os participantes da plataforma.

Na maioria das operações clínicas, a existência de um Vínculo será obrigatória para concessão da autorização.

---

## Consentimentos

Representam autorizações concedidas pelo titular dos dados.

Sempre que exigido pela LGPD ou pelas regras da plataforma, o Consentimento deverá ser considerado antes da autorização final.

---

## Autorização Final

A Autorização representa o resultado da avaliação de todos os elementos anteriores.

Somente quando todos os requisitos forem satisfeitos a operação será autorizada.

--- 

# 03. Papéis Oficiais

O PortalNutri reconhecerá oficialmente os seguintes Papéis.

---

## Organização

Representa uma organização participante da plataforma.

Uma Organização poderá assumir diferentes naturezas, tais como:

- Clínica;
- Hospital;
- Academia;
- Consultório;
- Laboratório;
- Empresa;
- Universidade;
- Farmácia;
- Outras organizações autorizadas.

As Organizações administram profissionais, unidades organizacionais, agendas, permissões institucionais e Vínculos conforme as regras da plataforma.

---

## Nutricionista

Realiza atendimento clínico.

Pode administrar informações clínicas somente dentro dos Vínculos autorizados.

---

## Secretária

Executa atividades administrativas.

Seu acesso será sempre limitado pelas permissões concedidas pela Clínica e pelas políticas da plataforma.

---

---

## Administrador

Responsável pela administração institucional da plataforma.

Seu acesso será limitado às responsabilidades administrativas.

Nem mesmo Administradores possuirão acesso automático às informações clínicas.

---

## Parceiro

Representa organizações ou profissionais participantes do ecossistema comercial.

Seu acesso limitar-se-á aos recursos contratados ou autorizados.

---

## Inteligência Artificial

Representa Agentes Inteligentes autorizados pela plataforma.

Os Agentes não possuem autonomia jurídica.

Executam ações em nome da plataforma e sempre respeitando as permissões concedidas ao usuário solicitante.

---

# Princípio Fundamental

Os Papéis definem responsabilidades.

As Permissões definem capacidades.

Os Escopos definem sobre quais recursos essas capacidades poderão ser exercidas.

As Políticas definem as condições necessárias.

Os Vínculos definem os relacionamentos válidos.

Os Consentimentos representam a vontade do titular dos dados.

Somente a combinação desses elementos poderá produzir uma autorização válida.

# 04. Permissões sobre Pessoas

As informações de uma Pessoa pertencem ao Contexto IAM.

Nenhum outro Contexto poderá alterar diretamente os dados cadastrais de uma Pessoa.

---

## O próprio titular poderá

- visualizar seus dados;
- atualizar seus dados cadastrais;
- alterar preferências permitidas pela plataforma.

---

## Administradores

Poderão administrar informações institucionais da Pessoa, respeitando as políticas de privacidade.

Administradores não possuem acesso automático ao conteúdo clínico.

---

# 05. Permissões sobre Vínculos

O Vínculo Clínico representa a autorização básica para existência da relação entre profissionais e pacientes.

Sem Vínculo válido não haverá acesso às informações clínicas.

---

## Nutricionista

Poderá acessar apenas os Vínculos dos quais participa.

---

## Clínica

Poderá administrar os Vínculos pertencentes à sua organização.

---

## Paciente

Poderá visualizar seus próprios Vínculos.

Quando permitido pelas regras da plataforma, poderá solicitar o encerramento de um Vínculo.

---

# 06. Permissões sobre Prontuários

O Prontuário representa o principal ativo clínico da plataforma.

Seu acesso será rigorosamente controlado.

---

## Paciente

Poderá visualizar seu próprio Prontuário.

Poderá compartilhar informações quando permitido pelas políticas da plataforma.

Não poderá alterar registros clínicos produzidos por profissionais.

---

## Nutricionista

Poderá consultar e registrar informações apenas nos Prontuários vinculados aos seus Vínculos Clínicos autorizados.

---

## Clínica

Poderá administrar o acesso institucional aos Prontuários pertencentes aos seus Vínculos Clínicos.

O acesso efetivo dependerá das permissões concedidas aos profissionais.

---

## Inteligência Artificial

Poderá consultar informações clínicas somente quando:

- existir autorização válida;
- existir Vínculo Clínico ativo;
- a operação estiver autorizada pelas políticas da plataforma.

A IA nunca possuirá acesso irrestrito aos Prontuários.

---

# 07. Permissões sobre Objetivos Clínicos

Objetivos Clínicos pertencem ao Prontuário.

---

## Nutricionista

Pode:

- criar;
- atualizar;
- concluir.

Sempre dentro de seus Vínculos autorizados.

---

## Paciente

Pode visualizar.

Poderá participar da definição quando a funcionalidade estiver disponível.

---

# 08. Permissões sobre Consultas

Consultas pertencem ao Aggregate Care.

---

## Nutricionista

Pode:

- agendar;
- iniciar;
- finalizar;
- registrar informações clínicas.

---

## Secretária

Poderá:

- agendar;
- reagendar;
- cancelar.

Não poderá registrar conteúdo clínico.

---

## Paciente

Pode:

- visualizar;
- solicitar reagendamento;
- cancelar quando permitido pelas regras da clínica.

---

# 09. Permissões sobre Avaliações Nutricionais

As Avaliações Nutricionais representam registros técnicos produzidos pelo profissional.

---

## Nutricionista

Pode:

- criar;
- editar;
- complementar.

---

## Paciente

Pode visualizar.

Não poderá alterar registros profissionais.

---

# 10. Permissões sobre Evoluções Clínicas

As Evoluções representam registros oficiais do atendimento.

---

## Nutricionista

Pode registrar novas Evoluções.

Alterações posteriores deverão respeitar as políticas de auditoria da plataforma.

---

## Paciente

Pode visualizar.

Não poderá editar.

---

# 11. Permissões sobre Protocolos

O PortalNutri distingue dois conceitos:

- Protocolo Modelo;
- Protocolo Aplicado.

---

## Protocolo Modelo

Poderá ser criado por profissionais autorizados ou organizações autorizadas.

Sua publicação dependerá das políticas do Marketplace.

---

## Protocolo Aplicado

Pertence exclusivamente ao Prontuário.

Somente profissionais autorizados poderão:

- aplicar;
- personalizar;
- encerrar.

---

## Paciente

Pode visualizar o Protocolo Aplicado.

Não poderá alterá-lo.

---

# 12. Permissões sobre Plano Alimentar

O Plano Alimentar pertence ao Prontuário.

---

## Nutricionista

Pode:

- criar;
- atualizar;
- publicar.

---

## Paciente

Pode:

- visualizar;
- registrar adesão;
- informar dificuldades;
- registrar observações quando permitido.

---

# 13. Permissões sobre Prescrições

Prescrições representam condutas profissionais.

---

## Nutricionista

Pode emitir, revisar e substituir Prescrições.

---

## Paciente

Pode visualizar.

Não poderá alterar.

---

# 14. Permissões sobre Exames

Solicitações de Exames e Resultados pertencem ao Aggregate Care.

---

## Nutricionista

Pode:

- solicitar exames;
- validar resultados;
- registrar interpretações.

---

## Paciente

Pode:

- visualizar solicitações;
- anexar resultados;
- compartilhar resultados.

---

## Laboratórios Integrados

Poderão enviar Resultados de Exames através das integrações autorizadas pela plataforma.

---

# 15. Permissões sobre Indicadores Clínicos

Indicadores representam informações históricas do acompanhamento.

---

## Nutricionista

Pode registrar novos Indicadores.

Pode corrigir informações respeitando as regras de auditoria.

---

## Paciente

Pode visualizar toda sua evolução clínica.

Poderá registrar indicadores informados pelo próprio paciente quando essa funcionalidade estiver habilitada.

---

## Princípio Fundamental

Toda informação clínica pertence ao Aggregate Care.

As permissões concedem acesso às informações.

As permissões nunca transferem propriedade sobre os dados.

O titular das informações continuará sendo a Pessoa, conforme os princípios definidos pela LGPD e pelos Documentos Mestres do PortalNutri.

# 16. Permissões sobre Marketplace

O Marketplace representa o ambiente comercial do PortalNutri.

As permissões deverão respeitar o papel exercido pela Pessoa e as regras definidas pela plataforma.

---

## Organizações

Poderão:

- criar Lojas;
- publicar Produtos;
- publicar Serviços;
- publicar Conteúdos;
- administrar Pedidos;
- administrar Ofertas.

---

## Profissionais

Poderão publicar Produtos e Conteúdos quando autorizados pelas políticas do Marketplace.

---

## Clientes

Poderão:

- visualizar Produtos;
- realizar Compras;
- avaliar Produtos adquiridos.

---

## Administração da Plataforma

Poderá:

- aprovar publicações;
- suspender anúncios;
- moderar conteúdos;
- administrar denúncias.

---

# 17. Permissões da Inteligência Artificial

A Inteligência Artificial deverá respeitar exatamente o mesmo modelo de autorização utilizado pelos usuários humanos.

A IA nunca possuirá privilégios administrativos próprios.

---

## A IA poderá

- consultar informações autorizadas;
- gerar sugestões;
- produzir resumos;
- responder perguntas;
- auxiliar decisões.

---

## A IA nunca poderá

- alterar informações clínicas diretamente;
- aprovar pagamentos;
- emitir prescrições oficiais;
- alterar permissões;
- modificar vínculos;
- tomar decisões que dependam exclusivamente de julgamento humano.

---

## Toda atuação da IA deverá respeitar

- Papéis;
- Permissões;
- Escopos;
- Políticas;
- Vínculos;
- Consentimentos.

A Inteligência Artificial deverá acessar informações exclusivamente através da Camada de Aplicação.

Nenhum Agente Inteligente poderá acessar diretamente Banco de Dados, Aggregates, Entidades, Repositórios ou infraestrutura da plataforma.

---

# 18. Compartilhamentos

O PortalNutri permitirá o compartilhamento controlado de informações.

Todo compartilhamento deverá respeitar:

- políticas institucionais;
- LGPD;
- Consentimentos;
- Escopos definidos.

---

## O compartilhamento poderá ser

- temporário;
- permanente;
- parcial;
- total.

---

## Todo compartilhamento deverá registrar

- quem compartilhou;
- com quem foi compartilhado;
- quais informações foram compartilhadas;
- período de validade;
- motivo do compartilhamento.

---

# 19. Delegações

Uma Pessoa poderá delegar determinadas atividades para outra Pessoa.

A Delegação nunca transferirá responsabilidade profissional.

Ela apenas permitirá a execução de atividades autorizadas.

---

## Exemplos

Uma Nutricionista poderá permitir que uma Secretária:

- agende consultas;
- reagende consultas;
- envie documentos;
- confirme atendimentos.

Entretanto, a Secretária nunca poderá:

- emitir prescrições;
- registrar avaliações clínicas;
- alterar informações do prontuário;
- concluir consultas.

---

## Toda Delegação deverá registrar

- delegante;
- delegado;
- permissões delegadas;
- escopo;
- período de vigência.

---

# 20. Consentimentos

Os Consentimentos representam a manifestação de vontade do titular dos dados.

Sempre que exigido por lei ou pelas políticas da plataforma, deverão ser considerados antes da concessão da autorização.

---

## O Consentimento poderá autorizar

- compartilhamento de dados;
- utilização pela IA;
- participação em pesquisas;
- integrações externas;
- envio de comunicações.

---

## Todo Consentimento deverá registrar

- titular;
- finalidade;
- data;
- vigência;
- situação;
- histórico de alterações.

O Consentimento poderá ser revogado a qualquer momento, respeitadas as obrigações legais aplicáveis.

---

# 21. Auditoria

Toda decisão de autorização deverá ser passível de auditoria.

O PortalNutri deverá registrar, sempre que aplicável:

- Pessoa solicitante;
- Papéis considerados;
- Permissões avaliadas;
- Escopos aplicados;
- Políticas utilizadas;
- Vínculos considerados;
- Consentimentos avaliados;
- decisão final;
- data e hora;
- origem da solicitação.

---

## Objetivos da Auditoria

A Auditoria permitirá:

- rastreabilidade;
- investigação;
- conformidade regulatória;
- transparência;
- segurança.

---

# 22. Governança

O Modelo Oficial de Permissões constitui um dos pilares arquiteturais do PortalNutri.

Qualquer alteração deverá preservar:

- segurança;
- rastreabilidade;
- privacidade;
- baixo acoplamento;
- consistência com os demais Documentos Mestres.

Novas Permissões, Escopos, Políticas ou Consentimentos poderão ser adicionados sem alterar os princípios definidos neste documento.

---

# Princípios Fundamentais

O PortalNutri adota um modelo de autorização baseado em múltiplas camadas.

A autorização nunca dependerá exclusivamente de um Papel.

Toda decisão será resultado da avaliação conjunta de:

- Pessoa;
- Papéis;
- Permissões;
- Escopos;
- Políticas;
- Vínculos;
- Consentimentos.

Esse modelo garante uma plataforma preparada para evoluir de forma segura, escalável e aderente às exigências regulatórias.

---

# Conclusão

O Modelo Oficial de Permissões do PortalNutri estabelece as regras conceituais para controle de acesso em toda a plataforma.

Em conjunto com os Documentos Mestres de Projeto, Modelo de Domínio, Eventos, Bounded Contexts e Aggregates, constitui a base oficial para implementação da segurança, das APIs, da Inteligência Artificial e dos mecanismos de auditoria do PortalNutri.

Toda implementação futura deverá respeitar os princípios definidos neste documento.
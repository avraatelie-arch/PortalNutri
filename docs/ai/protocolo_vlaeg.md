# Protocolo VLAEG — PortalNutri

## V — Visão

O PortalNutri será uma plataforma SaaS abrangente para nutricionistas, pacientes e farmácias de manipulação. O sistema foca em automatizar o atendimento nutricional, criação de protocolos, acompanhamento do paciente, geração de prescrições, teleatendimento e comunicação inteligente. Além disso, o PortalNutri atuará como um marketplace robusto, conectando profissionais, pacientes e farmácias para a venda de produtos e serviços digitais.

O objetivo é criar uma solução profissional, simples de usar e escalável, que ajude nutricionistas a economizar tempo, aumentar sua produtividade e gerar novas fontes de receita, ao mesmo tempo em que melhora a experiência do paciente e integra farmácias parceiras ao ecossistema.

## L — Lógica

O sistema deve funcionar com os seguintes perfis principais:

1. Administrador da plataforma
2. Nutricionista (Prestador de Serviço e Produtor/Vendedor)
3. Paciente (Cliente final)
4. Farmácia parceira (Vendedora/Parceira de Indicações)

Principais módulos:

- Cadastro de nutricionistas, pacientes e farmácias
- Anamnese, Objetivos do paciente e Anexos (exames de sangue, documentos prévios)
- Protocolos nutricionais e Prescrições automatizadas
- Agendamento online e Teleconsulta nativa na plataforma
- Chat entre nutricionista e paciente
- Envio automático de orientações
- Área de cadastro de produtos digitais (e-books, protocolos, planos alimentares modelo, guias)
- Marketplace de farmácias (recebimento de indicações e venda de produtos/serviços)
- Área financeira completa (controle de pedidos, pagamentos, comissões, repasses e relatórios)
- Planos e assinaturas do SaaS
- Aprovação e administração dos produtos vendidos no marketplace

*Nota: Novas funcionalidades poderão ser adicionadas no decorrer do projeto, desde que sejam documentadas e aprovadas antes de suas implementações.*

## A — Arquitetura

Estrutura inicial sugerida:

- frontend: interface visual do sistema
- backend: regras de negócio e APIs
- database: estrutura do banco de dados
- docs: documentação do projeto
- assets: imagens, logos e arquivos visuais
- prompts: comandos e padrões de IA

Tecnologias iniciais:

- HTML
- CSS
- JavaScript

Evolução futura e integrações fundamentais:

- React e Node.js
- Banco de dados relacional
- Autenticação por perfil
- Integração com IA e WhatsApp
- Integração com meios de pagamento e split de pagamento (essencial para distribuição automática de comissões)
- Integração de videochamada (WebRTC ou serviço de terceiros para teleconsultas na plataforma)

## E — Execução

Ordem recomendada de desenvolvimento:

1. Criar documentação base e infraestrutura de governança
2. Criar tela inicial e fluxos de autenticação (login, permissões, multitenancy)
3. Criar cadastros base (nutricionistas, pacientes, farmácias de manipulação)
4. Criar área de agendamento online e anexo de exames
5. Criar núcleo de atendimento (área de protocolos, análise de exames, anamnese, geração de plano)
6. Criar módulo de teleconsulta (videochamada nativa) e chat
7. Desenvolver infraestrutura do Marketplace e vitrine
8. Integrar gateway de pagamento com split automático de comissões
9. Desenvolver módulo financeiro e dashboards (Nutricionista, Farmácia, Admin)
10. Criar banco de dados consolidado
11. Criar testes (sem dados reais)

Cada nova funcionalidade deve ser documentada antes de ser implementada.

## Multitenancy, Segurança e Permissões

O PortalNutri é, em sua essência, um sistema multiusuário e multitenant. A segregação de dados é uma premissa técnica absoluta:

- **Isolamento de Dados:** Cada nutricionista só poderá visualizar seus próprios pacientes, consultas, prescrições, protocolos, arquivos (como exames anexados pelos pacientes) e registro de vendas.
- **Privacidade Absoluta:** Nenhuma nutricionista poderá acessar ou visualizar, sob qualquer hipótese, dados de pacientes, protocolos ou relatórios financeiros de outra nutricionista.
- **Conformidade LGPD:** Todo tratamento de dados, especialmente dados sensíveis de saúde (exames, anamnese, evolução), deve obedecer rigorosamente às normas de privacidade e à LGPD.
- **Controle de Acesso (RBAC):** Os perfis de acesso devem garantir que pacientes, nutricionistas, farmácias e administradores possuam permissões estritas à sua respectiva finalidade.

## Dashboards e Indicadores

A fim de fornecer clareza e gestão inteligente, o sistema deve contar com interfaces analíticas específicas para cada perfil:

**1. Dashboard da Nutricionista**
- Pacientes ativos
- Consultas agendadas (próximos compromissos)
- Consultas realizadas
- Acompanhamento da evolução dos pacientes
- Protocolos utilizados
- Vendas realizadas (e-books, protocolos)
- Comissões a receber
- Faturamento do consultório e do marketplace

**2. Dashboard da Farmácia Parceira**
- Indicações/prescrições recebidas
- Pedidos gerados a partir da plataforma
- Vendas concluídas
- Ticket médio
- Status atual dos pedidos
- Comissões repassadas ou taxas recolhidas

**3. Dashboard do Administrador (Dono do SaaS)**
- Faturamento total transacionado na plataforma
- Receita recorrente (assinaturas do SaaS)
- Comissões arrecadadas sobre vendas no marketplace
- Total de usuários ativos (nutricionistas, pacientes, farmácias)
- Consultas realizadas na plataforma
- Produtos digitais vendidos e ranking (protocolos e e-books mais vendidos)
- Ranking de parceiros (farmácias com melhor desempenho e nutricionistas com melhor desempenho/faturamento)
- Taxa de Churn (cancelamento de assinaturas)
- Ticket médio global
- Relatórios financeiros completos e conciliação bancária

## G — Governança

Regras do projeto:

- Não criar funcionalidades sem antes atualizar a documentação.
- Não alterar arquivos importantes sem explicar o motivo.
- Sempre revisar mudanças antes de aplicar.
- Priorizar simplicidade, clareza e alta segurança.
- Separar bem frontend, backend, banco de dados e documentação.
- Manter os arquivos organizados com código limpo.
- Pensar sempre na experiência do usuário final e no fluxo de segurança da informação.
- Não criar dados sensíveis reais em testes.

## Direção do Produto

O PortalNutri deve resolver problemas reais de gestão, monetização e acompanhamento clínico:

- Eliminar a desorganização de exames e conversas via WhatsApp, centralizando envio de documentos e chat na plataforma.
- Facilitar a análise clínica através do recebimento prévio de exames pelo paciente.
- Proporcionar agendamento online e teleconsultas sem necessidade de apps externos.
- Criar um canal de monetização automatizado onde o nutricionista vende produtos e a plataforma rentabiliza passivamente (split).

## Marketplace e Monetização

- **Produtos Digitais:** Venda de e-books, protocolos e guias.
- **Nutricionistas como Produtores:** Venda de seus próprios produtos digitais.
- **Farmácias Parceiras:** Recebimento de prescrições e venda direta.
- **Monetização do SaaS:** Comissão automática para o dono do PortalNutri sobre todas as vendas realizadas.
- **Gestão Financeira:** Controle de pedidos, split de pagamento e payouts.

## Resultado Esperado

Ao final do desenvolvimento, o PortalNutri será um ecossistema seguro e isolado, onde a nutricionista poderá:

1. Disponibilizar sua agenda online.
2. Receber exames de sangue e documentos dos pacientes antes do atendimento.
3. Analisar exames, realizar teleconsultas na própria plataforma e preencher anamneses.
4. Selecionar protocolos, prescrever fórmulas para farmácias integradas e enviar o plano finalizado.
5. Acompanhar evolução e interagir via chat.
6. Comercializar seus e-books e produtos digitais.
7. Acompanhar em seu painel todo o faturamento, vendas e KPIs de seu negócio.

E o Administrador da plataforma terá visibilidade centralizada (sem expor dados clínicos), controlando assinaturas, transações, comissões globais e a saúde financeira de todo o ecossistema SaaS.

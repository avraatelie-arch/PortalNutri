# PortalNutri Platform

## Master Domain Model

**Versão:** 1.0

**Status:** Documento Mestre de Modelagem de Domínio

---

# 00. Objetivo do Documento

Este documento define oficialmente o Modelo de Domínio do PortalNutri Platform.

Seu objetivo é representar o funcionamento do negócio de forma independente da tecnologia utilizada.

Neste documento não serão definidos:

- Banco de Dados;
- APIs;
- Telas;
- Frameworks;
- Linguagens de Programação;
- Estruturas de Código.

Este documento descreve exclusivamente:

- Os participantes do ecossistema;
- Os domínios de negócio;
- As jornadas dos usuários;
- Os relacionamentos entre entidades;
- Os eventos do domínio;
- As regras fundamentais do negócio;
- A linguagem oficial utilizada pela plataforma.

Toda implementação técnica deverá respeitar obrigatoriamente este documento.

O Modelo de Domínio representa a verdade do negócio.

O Banco de Dados será apenas uma representação física deste modelo.

As APIs representarão apenas a forma de comunicação entre os domínios.

O código representará apenas a implementação das regras aqui definidas.

---

## Princípio Fundamental

O PortalNutri será desenvolvido seguindo os princípios de Domain-Driven Design (DDD).

O domínio do negócio sempre terá prioridade sobre decisões técnicas.

Toda nova funcionalidade deverá nascer primeiro no Modelo de Domínio antes de ser implementada em código.

Este documento deverá evoluir continuamente conforme a plataforma crescer, preservando sempre a consistência conceitual do negócio.

---

## Objetivo Final

Este documento será a principal referência para a construção do Banco de Dados, APIs, Arquitetura, Inteligência Artificial e demais componentes técnicos da plataforma.

Seu objetivo é construir um modelo de domínio suficientemente claro para que qualquer arquiteto, desenvolvedor, analista de negócios ou agente de Inteligência Artificial consiga compreender como o PortalNutri funciona sem precisar analisar código-fonte.

---

# 01. Ecossistema PortalNutri

O PortalNutri Platform é um ecossistema digital composto por pessoas, empresas, instituições, serviços e agentes inteligentes que interagem continuamente para gerar valor aos profissionais da saúde, pacientes e parceiros comerciais.

Cada participante possui objetivos específicos, responsabilidades próprias e relacionamentos bem definidos dentro da plataforma.

O PortalNutri não deverá ser tratado como um software de atendimento nutricional.

Seu propósito é integrar todo o ecossistema da nutrição em um único ambiente digital.

Todos os participantes deverão interagir respeitando as regras de segurança, privacidade, isolamento de dados (multi-tenant) e LGPD.

---

## Grandes participantes do ecossistema

O PortalNutri será composto pelos seguintes participantes:

### Profissionais

- Nutricionistas
- Secretárias
- Equipes de clínicas
- Administradores de clínicas

---

### Pacientes

- Pacientes ativos
- Pacientes em acompanhamento
- Pacientes inativos
- Pacientes particulares
- Pacientes vinculados a clínicas

---

### Empresas Parceiras

- Farmácias de Manipulação
- Laboratórios
- Fabricantes
- Distribuidores
- Fornecedores
- Empresas de suplementos
- Empresas de alimentos funcionais

---

### Marketplace

- Vendedores
- Afiliados
- Criadores de conteúdo
- Autores de e-books
- Autores de protocolos
- Instrutores de cursos
- Mentores

---

### Plataforma

- Administrador Global
- Equipe de Suporte
- Equipe Comercial
- Financeiro
- Marketing
- Atendimento
- Tecnologia

---

### Inteligência Artificial

O PortalNutri possuirá agentes inteligentes especializados que atuarão em diferentes áreas da plataforma.

Exemplos:

- Agente da Nutricionista
- Agente do Paciente
- Agente Financeiro
- Agente Comercial
- Agente Clínico
- Agente Administrativo
- Agente de Marketplace

Todos os agentes deverão operar sempre sob supervisão das regras de negócio da plataforma.

---

## Objetivo do Ecossistema

O objetivo do PortalNutri é conectar todos estes participantes em um único ambiente digital, permitindo que informações, serviços, produtos, conhecimento e oportunidades de negócio circulem de forma segura, organizada e inteligente.

Quanto maior o número de participantes e conexões geradas entre eles, maior será o valor produzido para todo o ecossistema.

---

# 02. Mapa Conceitual do Ecossistema

O PortalNutri Platform será organizado em torno da Nutricionista como personagem principal do ecossistema.

A Nutricionista é o principal agente de valor da plataforma, pois é ela quem atende pacientes, cria protocolos, realiza prescrições, acompanha evolução, gera conteúdo, vende produtos digitais, indica parceiros e movimenta a maior parte das relações dentro do PortalNutri.

O segundo participante mais importante é o Paciente.

O Paciente é o centro da jornada clínica, pois recebe atendimento, realiza consultas, envia exames, acompanha sua evolução, consome conteúdos, compra produtos e interage com a Nutricionista e com os demais serviços da plataforma.

---

## Centro do Ecossistema

O PortalNutri será estruturado inicialmente em torno da relação principal:

Nutricionista  
↓  
Paciente

A partir desta relação surgem todos os demais fluxos:

- Consulta
- Anamnese
- Protocolo
- Prescrição
- Plano alimentar
- Exames
- Evolução
- Chat
- Agenda
- Teleconsulta
- Marketplace
- Pagamentos
- Comissões
- Dashboards
- Inteligência Artificial

---

## Identidade, Papéis e Vínculos

O PortalNutri deverá separar claramente os conceitos de Pessoa, Papel e Vínculo.

Uma Pessoa representa uma identidade única dentro da plataforma.

Uma mesma Pessoa poderá exercer diferentes Papéis em diferentes contextos.

Exemplos de Papéis:

- Paciente
- Nutricionista
- Secretária
- Administrador
- Parceiro
- Comprador
- Vendedor

O Papel define como uma Pessoa atua dentro de determinado contexto.

O Vínculo representa a relação entre uma Pessoa e outra Pessoa, Clínica, Organização ou Tenant dentro da plataforma.

Exemplos de Vínculos:

- Paciente vinculado a uma Nutricionista.
- Paciente vinculado a uma Clínica.
- Nutricionista vinculada a uma Clínica.
- Secretária vinculada a uma Clínica.
- Administrador vinculado a uma Organização.

Uma Pessoa poderá possuir múltiplos vínculos simultaneamente.

Isso permitirá que:

- Um Paciente se relacione com mais de uma Nutricionista.
- Um Paciente se relacione com mais de uma Clínica.
- Uma Nutricionista atue de forma independente.
- Uma Nutricionista atue em múltiplas Clínicas.
- Uma Secretária atue para uma Clínica ou para profissionais específicos.
- Um usuário participe da plataforma sem estar inicialmente vinculado a uma Nutricionista ou Clínica.

A identidade da Pessoa deverá permanecer única na plataforma, enquanto seus Papéis e Vínculos poderão variar conforme o contexto.

Essa separação será essencial para suportar multi-tenancy, permissões, marketplace, histórico clínico, autonomia do paciente e evolução futura da plataforma.

## Participantes Geradores de Receita

Os principais participantes que poderão gerar receita para o PortalNutri são:

- Nutricionistas
- Pacientes
- Clínicas
- Farmácias de Manipulação
- Fornecedores
- Fabricantes
- Laboratórios
- Afiliados
- Criadores de conteúdo
- Parceiros comerciais
- A própria plataforma

A receita poderá ser gerada através de assinaturas, vendas, comissões, marketplace, produtos digitais, produtos físicos, serviços, publicidade, recursos premium e inteligência artificial.

---

## Participantes Compradores

Poderão comprar dentro da plataforma:

- Pacientes
- Nutricionistas
- Clínicas
- Empresas parceiras
- Outros participantes autorizados pela plataforma

Exemplos de compras possíveis:

- Protocolos
- E-books
- Cursos
- Suplementos
- Fórmulas manipuladas
- Exames
- Serviços
- Planilhas
- Mentorias
- Recursos premium
- Assinaturas
- Produtos parceiros

---

## Participantes Vendedores

Poderão vender dentro da plataforma, mediante regras e aprovação do PortalNutri:

- Nutricionistas
- Clínicas
- Farmácias de Manipulação
- Fornecedores
- Fabricantes
- Laboratórios
- Criadores de conteúdo
- Afiliados
- Parceiros comerciais

A plataforma deverá possuir mecanismos para cadastro, aprovação, publicação, controle, comissão, repasse e auditoria das vendas realizadas.

---

## Regra Central de Privacidade

Cada participante deverá visualizar apenas os dados que lhe pertencem ou aos quais recebeu permissão explícita de acesso.

Regras fundamentais:

- Uma Nutricionista não poderá acessar pacientes de outra Nutricionista.
- Uma Clínica só poderá acessar dados vinculados à sua própria operação.
- Uma Farmácia só poderá acessar prescrições, pedidos ou dados necessários para sua operação.
- Um Fornecedor só poderá acessar suas próprias vendas, produtos e indicadores.
- Um Paciente só poderá acessar seus próprios dados.
- O Administrador Global poderá acessar informações da plataforma conforme regras internas, permissões, auditoria e LGPD.
- Dados publicados no Marketplace poderão ser visíveis de forma geral, conforme regras de publicação da plataforma.

---

## Marketplace Geral

O Marketplace será a área pública ou semi-pública da plataforma onde produtos, serviços e conteúdos aprovados poderão ser visualizados por participantes autorizados.

Itens disponíveis no Marketplace poderão ser acessados por múltiplos participantes, desde que respeitem:

- Regras de publicação
- Permissões de acesso
- LGPD
- Termos de uso
- Direitos autorais
- Políticas comerciais
- Regras de comissão

---

## Expansão Futura do Ecossistema

Embora o PortalNutri nasça focado no mercado de nutrição, sua arquitetura deverá permitir expansão futura para áreas complementares de saúde, performance e bem-estar.

Possíveis participantes futuros:

- Personal Trainers
- Educadores físicos
- Coaches de saúde
- Fisioterapeutas
- Psicólogos
- Profissionais de bem-estar
- Academias
- Estúdios
- Centros de performance

Possíveis produtos e serviços futuros:

- Planilhas de treino
- Programas de emagrecimento
- Protocolos de performance
- Acompanhamento físico
- Treinos online
- Comunidades
- Desafios
- Serviços integrados de saúde e bem-estar

Esta expansão futura não deverá alterar o foco inicial da plataforma, mas a arquitetura deverá nascer preparada para suportar novos participantes, produtos e serviços relacionados ao ecossistema de nutrição, saúde e performance.
---

# 03. Participantes do Ecossistema

Os participantes representam todas as pessoas, empresas, instituições e agentes que interagem dentro do PortalNutri Platform.

Cada participante possui responsabilidades, permissões, objetivos e relacionamentos próprios.

Todos os participantes deverão seguir as regras definidas neste Modelo de Domínio.

A seguir serão descritos os participantes oficiais da plataforma.

---

# 03.01 Nutricionista

## Definição

A Nutricionista é o principal participante do PortalNutri Platform.

Todo o ecossistema foi concebido para aumentar sua produtividade, melhorar a qualidade dos atendimentos, reduzir atividades operacionais e criar novas oportunidades de negócio.

A Nutricionista poderá atuar de forma independente ou vinculada a uma ou mais clínicas, respeitando as permissões definidas pela plataforma.

---

## Objetivo

Permitir que a Nutricionista concentre seus esforços no cuidado com seus pacientes enquanto o PortalNutri automatiza processos administrativos, operacionais e comerciais.

---

## Principais Responsabilidades

A Nutricionista poderá:

- Cadastrar pacientes.
- Realizar anamneses.
- Definir objetivos nutricionais.
- Criar protocolos.
- Criar prescrições.
- Elaborar planos alimentares.
- Solicitar exames.
- Receber exames enviados pelos pacientes.
- Interpretar exames com apoio da Inteligência Artificial.
- Registrar evolução clínica.
- Agendar consultas.
- Realizar teleconsultas.
- Enviar orientações.
- Conversar com pacientes.
- Gerenciar agenda.
- Gerenciar financeiro.
- Criar e vender protocolos.
- Criar e vender e-books.
- Criar e vender cursos.
- Criar mentorias.
- Participar do Marketplace.
- Indicar parceiros.
- Utilizar agentes de Inteligência Artificial.

---

## Relacionamentos

A Nutricionista poderá se relacionar com:

- Pacientes
- Clínicas
- Secretárias
- Farmácias de Manipulação
- Laboratórios
- Fornecedores
- Fabricantes
- Marketplace
- Plataforma
- Agentes de Inteligência Artificial

---

## Compras

A Nutricionista poderá adquirir:

- Protocolos
- E-books
- Cursos
- Mentorias
- Inteligência Artificial Premium
- Funcionalidades Premium
- Produtos do Marketplace
- Serviços parceiros

---

## Vendas

A Nutricionista poderá comercializar:

- Consultas
- Protocolos
- E-books
- Cursos
- Mentorias
- Programas de acompanhamento
- Assinaturas
- Produtos digitais
- Serviços autorizados pela plataforma

---

## Indicadores

O PortalNutri deverá disponibilizar indicadores específicos para cada Nutricionista.

Exemplos:

- Número de pacientes ativos.
- Consultas realizadas.
- Consultas futuras.
- Taxa de retorno.
- Pacientes inativos.
- Evolução dos pacientes.
- Receita mensal.
- Receita anual.
- Ticket médio.
- Produtos vendidos.
- Protocolos vendidos.
- E-books vendidos.
- Cursos vendidos.
- Conversão de pacientes.
- Satisfação dos pacientes.
- Utilização da Inteligência Artificial.
- Produtividade.
- Tempo médio por consulta.

---

## Permissões

A Nutricionista somente poderá visualizar informações que lhe pertençam ou para as quais tenha recebido autorização.

Pacientes de outras Nutricionistas permanecerão totalmente isolados, salvo quando houver compartilhamento autorizado através de regras específicas da plataforma.

---

## Modelo de Atuação

O PortalNutri suportará três modelos de atuação:

---

### Atendimento Independente

A Nutricionista administra integralmente seus próprios pacientes.

---

### Atendimento Vinculado à Clínica

A Nutricionista atua dentro de uma clínica.

Os Vínculos Clínicos poderão ser administrados pela própria Nutricionista, pela Clínica ou de forma compartilhada, conforme as regras de negócio, permissões e autorizações definidas pela plataforma.

---

### Modelo Compartilhado

Pacientes poderão ser compartilhados entre profissionais mediante autorização da clínica, do paciente e das regras de segurança da plataforma.

Todo compartilhamento deverá respeitar a LGPD e gerar registro de auditoria.

---

## Inteligência Artificial

Cada Nutricionista possuirá acesso aos Agentes de Inteligência Artificial autorizados para seu plano.

Os agentes atuarão como assistentes especializados, auxiliando na análise de exames, geração de protocolos, organização do consultório, atendimento ao paciente e automação de tarefas.

As decisões clínicas permanecerão sempre sob responsabilidade da Nutricionista.

---

## Princípio Fundamental

A Nutricionista representa o principal agente gerador de valor do PortalNutri Platform.

Toda funcionalidade desenvolvida deverá contribuir direta ou indiretamente para aumentar sua eficiência, melhorar a experiência do paciente ou fortalecer o ecossistema da plataforma.
---

# 03.02 Paciente

## Definição

O Paciente representa uma Pessoa que exerce o Papel de Paciente dentro de um ou mais Vínculos Clínicos estabelecidos na plataforma.

O Paciente não constitui uma identidade própria ou uma entidade independente do ecossistema.

Sua identidade é representada pela entidade Pessoa, enquanto o Papel de Paciente define sua atuação no contexto clínico.

Um mesmo indivíduo poderá exercer simultaneamente outros papéis dentro da plataforma, como Comprador, Aluno, Autor de Conteúdo ou Parceiro Comercial, preservando sempre uma única identidade.

---

## Objetivo

Permitir que a Pessoa acompanhe sua jornada de saúde de forma contínua, centralizando seu histórico clínico, objetivos terapêuticos, atendimentos, evolução, conteúdos, compras e relacionamento com profissionais da saúde em um único ambiente digital.

---

## Principais Responsabilidades

No exercício do Papel de Paciente, a Pessoa poderá:

- Completar seu cadastro clínico.
- Informar objetivos de saúde.
- Agendar consultas.
- Participar de teleconsultas.
- Enviar exames.
- Registrar informações de acompanhamento.
- Registrar peso, medidas e composição corporal.
- Registrar sintomas.
- Enviar fotos de evolução.
- Visualizar prescrições.
- Acompanhar planos alimentares.
- Conversar com profissionais autorizados.
- Receber notificações.
- Comprar produtos e serviços.
- Utilizar Agentes de Inteligência Artificial autorizados.
- Avaliar atendimentos.
- Gerenciar sua conta.

---

## Relacionamentos

O Papel de Paciente poderá manter Vínculos com:

- Nutricionistas.
- Clínicas.
- Laboratórios.
- Farmácias de Manipulação.
- Marketplace.
- Plataforma.

Uma mesma Pessoa poderá manter múltiplos Vínculos Clínicos simultaneamente, respeitando as regras de autorização, compartilhamento e privacidade definidas pela plataforma.

---

## Permissões

O Paciente somente poderá acessar informações pertencentes ao seu próprio Prontuário ou compartilhadas mediante autorização.

O compartilhamento entre profissionais dependerá do consentimento do Paciente, das regras de negócio e da LGPD.

---

## Modelo de Atuação

O Papel de Paciente poderá existir em diferentes contextos:

### Paciente Independente

A Pessoa utiliza a plataforma sem acompanhamento profissional ativo.

---

### Paciente em Acompanhamento

A Pessoa mantém vínculo com uma ou mais Nutricionistas.

---

### Paciente Vinculado à Clínica

A Pessoa recebe atendimento por meio de uma Clínica.

---

### Modelo Compartilhado

A Pessoa poderá autorizar o compartilhamento de seu Prontuário entre profissionais autorizados, preservando auditoria e rastreabilidade.

---

## Inteligência Artificial

O Paciente poderá utilizar Agentes Inteligentes disponibilizados pela plataforma para apoiar sua jornada de saúde.

Os agentes poderão auxiliar na organização da rotina, esclarecimento de dúvidas, acompanhamento de metas e utilização da plataforma, sem substituir a atuação do profissional responsável.

---

## Princípio Fundamental

O Paciente representa um Papel exercido por uma Pessoa dentro de um ou mais Vínculos Clínicos.

Toda a jornada clínica será organizada a partir desses vínculos, preservando identidade única, autonomia, rastreabilidade e conformidade com a LGPD.

---

# 03.03 Clínica

## Definição

A Clínica é uma organização participante do PortalNutri Platform.

Ela representa uma estrutura empresarial ou profissional que pode reunir nutricionistas, secretárias, administradores, pacientes, unidades, agendas, financeiro, conteúdos, produtos e serviços dentro da plataforma.

A Clínica poderá atuar como contratante da plataforma, operadora de atendimentos, gestora de profissionais, mantenedora de vínculos clínicos, vendedora no Marketplace e participante ativa do ecossistema comercial.

---

## Objetivo

Permitir que clínicas de nutrição ou saúde gerenciem sua operação de forma centralizada, organizando profissionais, pacientes, agenda, financeiro, permissões, vendas, indicadores e atendimento em um único ambiente digital.

---

## Principais Responsabilidades

A Clínica poderá:

- Cadastrar profissionais.
- Gerenciar nutricionistas.
- Gerenciar secretárias.
- Gerenciar administradores internos.
- Cadastrar pacientes.
- Gerenciar pacientes vinculados à clínica.
- Organizar agendas.
- Realizar agendamentos.
- Controlar consultas.
- Administrar teleconsultas.
- Gerenciar financeiro.
- Gerenciar planos contratados.
- Gerenciar permissões internas.
- Criar protocolos.
- Criar e vender e-books.
- Criar e vender cursos.
- Criar mentorias.
- Participar do Marketplace.
- Acompanhar indicadores.
- Administrar unidades.
- Gerenciar relacionamento com pacientes.
- Utilizar recursos de Inteligência Artificial autorizados.

---

## Relacionamentos

A Clínica poderá se relacionar com:

- Nutricionistas
- Pacientes
- Secretárias
- Administradores internos
- Farmácias de Manipulação
- Laboratórios
- Fornecedores
- Marketplace
- Plataforma
- Agentes de Inteligência Artificial
- Unidades da própria clínica

Uma Clínica poderá possuir vários profissionais vinculados.

Uma Nutricionista poderá trabalhar em várias clínicas ou atuar de forma independente.

---

## Compras

A Clínica poderá adquirir:

- Planos da plataforma
- Funcionalidades Premium
- Inteligência Artificial Premium
- Cursos
- Protocolos
- E-books
- Serviços parceiros
- Produtos do Marketplace
- Recursos administrativos
- Recursos de gestão
- Recursos de analytics

---

## Vendas

A Clínica poderá comercializar, mediante aprovação da plataforma:

- Consultas
- Programas de acompanhamento
- Protocolos
- E-books
- Cursos
- Mentorias
- Produtos digitais
- Serviços
- Pacotes de atendimento
- Produtos autorizados pelo Marketplace

A Clínica poderá gerar receita própria e também gerar receita para o PortalNutri através de assinaturas, vendas, comissões e serviços transacionais.

---

## Indicadores

O PortalNutri deverá disponibilizar indicadores específicos para cada Clínica.

Exemplos:

- Número de nutricionistas vinculadas.
- Número de pacientes ativos.
- Número de pacientes inativos.
- Consultas realizadas.
- Consultas futuras.
- Taxa de ocupação da agenda.
- Receita mensal.
- Receita anual.
- Ticket médio.
- Faturamento por nutricionista.
- Faturamento por unidade.
- Produtos vendidos.
- Protocolos vendidos.
- Cursos vendidos.
- Comissões geradas.
- Retenção de pacientes.
- Satisfação dos pacientes.
- Produtividade da equipe.
- Utilização da Inteligência Artificial.

---

## Permissões

A Clínica deverá possuir controle avançado de permissões.

Os acessos internos deverão ser definidos conforme o papel de cada usuário.

Exemplos:

- Administrador da clínica.
- Nutricionista vinculada.
- Secretária.
- Financeiro.
- Coordenador.
- Gestor de unidade.

Cada usuário deverá acessar apenas as informações necessárias para sua função.

Toda permissão deverá respeitar LGPD, regras internas, auditoria e isolamento de dados.

---

## Modelo de Atuação

O PortalNutri suportará diferentes modelos de atuação para Clínicas.

### Clínica Individual

Uma única nutricionista utiliza o CNPJ ou estrutura da clínica para organizar sua operação.

---

### Clínica com Múltiplas Nutricionistas

A clínica possui várias nutricionistas vinculadas, com pacientes, agendas e permissões organizadas pela própria clínica.

---

### Clínica com Profissionais Independentes

Nutricionistas atuam dentro da Clínica, podendo manter Vínculos Clínicos próprios, Vínculos Clínicos administrados pela Clínica ou Vínculos Clínicos compartilhados, conforme as regras de negócio, permissões e autorizações definidas pela plataforma.

---

### Clínica com Múltiplas Unidades

A clínica poderá possuir várias unidades físicas ou digitais.

Exemplos:

- Unidade Florianópolis.
- Unidade São José.
- Unidade Balneário Camboriú.
- Unidade Online.

Cada unidade poderá possuir agenda, equipe, pacientes, financeiro e indicadores próprios.

---

### Modelo Híbrido

A Clínica poderá operar simultaneamente com Vínculos Clínicos administrados pela própria Clínica, Vínculos Clínicos administrados pelas Nutricionistas e Vínculos Clínicos compartilhados, conforme as regras de autorização da plataforma.

---

## Titularidade, Vínculo e Custódia do Paciente

O PortalNutri não reconhece qualquer conceito de propriedade sobre a Pessoa ou sobre os dados pessoais por ela compartilhados na plataforma.

A Pessoa é titular de seus próprios dados e de seu histórico clínico, conforme os princípios da LGPD.

A Clínica poderá manter Vínculos Clínicos com Pessoas que exerçam o Papel de Paciente para fins de atendimento, gestão operacional e acompanhamento, sem que isso represente qualquer forma de propriedade sobre a Pessoa ou seus dados.

Da mesma forma, a Nutricionista poderá estabelecer Vínculos Clínicos com Pessoas que exerçam o Papel de Paciente, respeitando as regras de autorização, compartilhamento e privacidade definidas pela plataforma.

O Prontuário será organizado dentro do contexto do Vínculo Clínico correspondente, preservando histórico, rastreabilidade e segregação entre diferentes relações clínicas.

O Paciente poderá:

- Manter vínculo com uma ou mais Clínicas.
- Manter vínculo com uma ou mais Nutricionistas.
- Autorizar o compartilhamento de informações entre profissionais.
- Encerrar vínculos quando permitido pelas regras da plataforma.
- Solicitar acesso, portabilidade e demais direitos previstos na LGPD.

Toda operação envolvendo dados clínicos deverá respeitar os princípios de consentimento, finalidade, necessidade, segurança, auditoria e privacidade.

---

## Inteligência Artificial

A Clínica poderá utilizar Agentes de Inteligência Artificial para auxiliar em:

- Gestão da agenda.
- Análise de indicadores.
- Atendimento administrativo.
- Relatórios gerenciais.
- Produtividade da equipe.
- Gestão financeira.
- Sugestões operacionais.
- Suporte interno.
- Acompanhamento de pacientes.
- Análise de desempenho.

A IA deverá atuar como apoio à gestão da clínica, sem substituir decisões humanas, clínicas ou administrativas.

---

## Princípio Fundamental

A Clínica representa uma organização dentro do PortalNutri Platform.

Ela deverá permitir que múltiplos profissionais, pacientes, unidades, permissões, processos e receitas sejam organizados de forma segura, escalável e auditável.

A Clínica será uma das bases do modelo multi-tenant da plataforma.

---

# 03.04 Secretária / Equipe Operacional

## Definição

A Secretária ou membro da Equipe Operacional representa o profissional responsável por apoiar as atividades administrativas, operacionais e de relacionamento entre pacientes, nutricionistas e clínicas.

Seu principal objetivo é reduzir a carga operacional dos profissionais da saúde, garantindo uma experiência organizada, eficiente e acolhedora para os pacientes.

A Equipe Operacional poderá atuar para uma Nutricionista específica ou para toda uma Clínica, conforme as permissões definidas pela plataforma.

---

## Objetivo

Apoiar a operação da Clínica e dos profissionais da saúde, automatizando processos administrativos, organizando agendas, facilitando o atendimento aos pacientes e contribuindo para o bom funcionamento da plataforma.

---

## Principais Responsabilidades

A Equipe Operacional poderá:

- Cadastrar pacientes.
- Atualizar cadastros.
- Agendar consultas.
- Reagendar consultas.
- Cancelar consultas.
- Confirmar consultas.
- Organizar agendas.
- Gerenciar salas de atendimento.
- Organizar teleconsultas.
- Receber documentos.
- Receber exames.
- Enviar orientações administrativas.
- Realizar atendimento inicial.
- Acompanhar pagamentos.
- Emitir recibos.
- Controlar pendências financeiras.
- Auxiliar no relacionamento com pacientes.
- Apoiar campanhas da clínica.
- Auxiliar no Marketplace quando autorizado.

---

## Relacionamentos

A Equipe Operacional poderá se relacionar com:

- Nutricionistas
- Pacientes
- Clínicas
- Administradores
- Financeiro
- Marketplace
- Plataforma
- Agentes de Inteligência Artificial

---

## Compras

Quando autorizado pela Clínica, poderá adquirir serviços e recursos administrativos necessários para a operação.

Todas as compras deverão respeitar os níveis de permissão definidos pela organização.

---

## Vendas

A Equipe Operacional não comercializa produtos em nome próprio.

Entretanto, poderá atuar operacionalmente em processos de venda autorizados pela Clínica ou pela Nutricionista, como emissão de cobranças, organização de pedidos e suporte ao Marketplace.

---

## Indicadores

O PortalNutri deverá disponibilizar indicadores operacionais específicos.

Exemplos:

- Consultas agendadas.
- Consultas confirmadas.
- Consultas reagendadas.
- Consultas canceladas.
- Tempo médio de atendimento.
- Tempo médio de resposta.
- Pacientes atendidos.
- Pendências resolvidas.
- Produtividade operacional.
- Utilização da Inteligência Artificial.

---

## Permissões

A Equipe Operacional nunca possuirá acesso irrestrito às informações clínicas dos pacientes.

Cada usuário deverá possuir um perfil de acesso definido pela Nutricionista ou pela Clínica.

Exemplos de permissões:

- Agenda.
- Cadastro.
- Financeiro.
- Atendimento.
- Marketplace.
- Relatórios.
- Documentos.
- Comunicação.

As informações clínicas somente poderão ser acessadas quando houver autorização explícita e necessidade operacional.

---

## Modelo de Atuação

O PortalNutri suportará diferentes modelos de atuação.

### Secretária Particular

Atua exclusivamente para uma Nutricionista.

---

### Secretária Compartilhada

Atua para várias Nutricionistas.

---

### Equipe da Clínica

Atua para toda a organização.

---

### Atendimento Remoto

Realiza atividades administrativas de forma totalmente online.

---

## Inteligência Artificial

A Equipe Operacional poderá utilizar Agentes de Inteligência Artificial para auxiliar em:

- Organização da agenda.
- Confirmação automática de consultas.
- Atendimento inicial.
- Comunicação com pacientes.
- Organização documental.
- Respostas frequentes.
- Automação administrativa.
- Gestão operacional.

Os agentes atuarão apenas como apoio às atividades operacionais.

---

## Princípio Fundamental

A Equipe Operacional existe para aumentar a eficiência da Clínica e da Nutricionista, reduzindo tarefas repetitivas e melhorando a experiência dos pacientes.

Toda atividade deverá respeitar os princípios de segurança, privacidade, auditoria e LGPD.

---

# 03.05 Farmácia de Manipulação

## Definição

A Farmácia de Manipulação representa uma organização parceira do PortalNutri Platform responsável pelo fornecimento de fórmulas manipuladas, suplementos, vitaminas, cosméticos, produtos naturais e demais produtos autorizados pela plataforma.

A Farmácia integra o ecossistema como participante estratégico, conectando profissionais da saúde, pacientes e marketplace em um ambiente seguro, transparente e eficiente.

Além da manipulação de fórmulas, poderá atuar como fornecedora de produtos, participante do Marketplace e parceira comercial da plataforma.

---

## Objetivo

Permitir que Farmácias ampliem sua presença digital, fortaleçam o relacionamento com profissionais e pacientes, automatizem processos comerciais e participem do ecossistema PortalNutri.

---

## Principais Responsabilidades

A Farmácia poderá:

- Receber prescrições digitais.
- Receber solicitações de orçamento.
- Comercializar fórmulas manipuladas.
- Comercializar suplementos.
- Comercializar vitaminas.
- Comercializar cosméticos.
- Comercializar produtos naturais.
- Comercializar produtos autorizados pela plataforma.
- Gerenciar pedidos.
- Gerenciar produção.
- Gerenciar entregas.
- Gerenciar relacionamento com pacientes.
- Participar do Marketplace.
- Criar campanhas promocionais.
- Disponibilizar cupons.
- Disponibilizar programas de fidelidade.
- Disponibilizar atendimento digital.
- Utilizar Inteligência Artificial.

---

## Relacionamentos

A Farmácia poderá se relacionar com:

- Pacientes
- Nutricionistas
- Clínicas
- Marketplace
- Plataforma
- Fornecedores
- Fabricantes
- Agentes de Inteligência Artificial

---

## Compras

A Farmácia poderá adquirir:

- Recursos Premium da plataforma.
- Inteligência Artificial.
- Espaços promocionais.
- Campanhas patrocinadas.
- Serviços parceiros.
- Ferramentas de analytics.
- Recursos administrativos.

---

## Vendas

A Farmácia poderá comercializar produtos diretamente aos pacientes através do Marketplace, respeitando a legislação vigente e as políticas comerciais da plataforma.

Produtos sujeitos à prescrição somente poderão ser comercializados mediante apresentação da documentação necessária.

Produtos de venda livre poderão ser adquiridos diretamente pelos pacientes.

---

## Indicadores

O PortalNutri deverá disponibilizar indicadores específicos para cada Farmácia.

Exemplos:

- Número de pedidos.
- Faturamento.
- Ticket médio.
- Produtos vendidos.
- Fórmulas manipuladas.
- Taxa de conversão.
- Tempo médio de entrega.
- Avaliação dos pacientes.
- Avaliação dos profissionais.
- Utilização da Inteligência Artificial.
- Produtos mais vendidos.
- Campanhas mais eficientes.

---

## Permissões

Cada Farmácia poderá visualizar exclusivamente as informações necessárias para execução de sua operação.

Dados clínicos permanecerão protegidos e somente poderão ser acessados quando autorizados e necessários para o cumprimento da prescrição ou do atendimento solicitado.

Toda operação deverá respeitar LGPD, auditoria e regras de segurança da plataforma.

---

## Modelo de Atuação

O PortalNutri suportará diferentes modelos de atuação.

### Farmácia Independente

Atua diretamente junto aos pacientes e profissionais.

---

### Farmácia Parceira

Mantém relacionamento comercial com Nutricionistas, Clínicas e demais participantes da plataforma.

---

### Marketplace

Possui loja própria dentro do PortalNutri, disponibilizando produtos, campanhas, promoções e serviços aos usuários autorizados.

---

## Relacionamentos Comerciais

O PortalNutri permitirá diferentes modelos de relacionamento comercial entre Farmácias, Profissionais e demais parceiros do ecossistema.

A plataforma deverá suportar programas de parceria, benefícios, campanhas, cashback, remuneração por intermediação, comissões, bonificações e outros modelos comerciais configuráveis.

Todos os modelos deverão respeitar a legislação vigente, as normas éticas aplicáveis e os contratos celebrados entre as partes.

O PortalNutri poderá participar da intermediação operacional, comercial e financeira dessas operações, conforme o modelo de negócio adotado pela plataforma.

---

## Disponibilidade e Entrega

A Farmácia poderá vender produtos para diferentes regiões do Brasil, conforme sua capacidade logística, políticas de entrega e regras comerciais.

Produtos físicos poderão ser enviados por Correios, transportadoras ou outros meios logísticos autorizados pela plataforma.

A plataforma deverá identificar automaticamente a modalidade de entrega suportada por cada parceiro, disponibilizando produtos e serviços de acordo com sua cobertura logística, área de atuação e modelo de atendimento.


A disponibilidade de produtos deverá considerar:

- Disponibilidade do produto.
- Estoque disponível.
- Cobertura de entrega.
- Região atendida.
- Prazo estimado.
- Custo de frete.
- Necessidade de prescrição.
- Regras sanitárias aplicáveis.
- Políticas comerciais da Farmácia.
- Políticas da plataforma.

Produtos digitais, quando aplicável, poderão ser disponibilizados nacionalmente.

A plataforma deverá diferenciar produtos de disponibilidade nacional, regional, local, presencial ou digital.

---

## Inteligência Artificial

A Farmácia poderá utilizar Agentes de Inteligência Artificial para auxiliar em:

- Atendimento ao cliente.
- Orçamentos.
- Gestão de pedidos.
- Recomendação de produtos.
- Organização operacional.
- Atendimento digital.
- Relatórios.
- Indicadores.
- Automação comercial.

Os agentes atuarão como apoio operacional e comercial.

---

## Princípio Fundamental

A Farmácia representa um parceiro estratégico do PortalNutri Platform.

Sua participação deverá fortalecer o ecossistema, ampliar as opções disponíveis aos pacientes, facilitar o trabalho dos profissionais da saúde e contribuir para o crescimento sustentável da plataforma.

---

# 03.06 Laboratório

## Definição

O Laboratório representa uma organização parceira do PortalNutri Platform responsável pela realização, processamento e disponibilização de exames laboratoriais aos pacientes e profissionais da saúde.

O Laboratório integra o ecossistema como participante estratégico, permitindo que pacientes realizem exames, nutricionistas acompanhem resultados e a plataforma centralize toda a jornada diagnóstica em um único ambiente digital.

Além da execução de exames, o Laboratório poderá comercializar serviços, participar do Marketplace, integrar-se à plataforma por APIs e utilizar Inteligência Artificial para otimizar sua operação.

---

## Objetivo

Conectar pacientes, nutricionistas e clínicas aos serviços laboratoriais de forma integrada, segura e inteligente, permitindo que toda a jornada diagnóstica permaneça centralizada dentro do PortalNutri.

---

## Principais Responsabilidades

O Laboratório poderá:

- Receber solicitações digitais de exames.
- Comercializar exames laboratoriais.
- Comercializar check-ups.
- Comercializar programas preventivos.
- Disponibilizar coleta presencial.
- Disponibilizar coleta domiciliar.
- Disponibilizar exames online quando aplicável.
- Gerenciar agendamentos.
- Gerenciar unidades.
- Gerenciar pedidos.
- Disponibilizar resultados digitais.
- Integrar resultados automaticamente ao PortalNutri.
- Participar do Marketplace.
- Integrar-se via APIs.
- Utilizar Inteligência Artificial.

---

## Relacionamentos

O Laboratório poderá se relacionar com:

- Pacientes
- Nutricionistas
- Clínicas
- Marketplace
- Plataforma
- Agentes de Inteligência Artificial
- Parceiros comerciais

---

## Compras

O Laboratório poderá adquirir:

- Recursos Premium.
- Inteligência Artificial.
- Espaços promocionais.
- Ferramentas analíticas.
- Serviços parceiros.
- Recursos administrativos.

---

## Vendas

O Laboratório poderá comercializar diretamente através do Marketplace:

- Exames laboratoriais.
- Check-ups.
- Programas preventivos.
- Pacotes de exames.
- Serviços laboratoriais autorizados.

Exames sujeitos à solicitação profissional deverão respeitar a legislação vigente.

Exames de contratação direta poderão ser disponibilizados quando permitidos pela legislação aplicável.

---

## Indicadores

O PortalNutri deverá disponibilizar indicadores específicos para cada Laboratório.

Exemplos:

- Exames realizados.
- Agendamentos.
- Receita.
- Ticket médio.
- Tempo médio para coleta.
- Tempo médio para entrega dos resultados.
- Avaliação dos pacientes.
- Avaliação dos profissionais.
- Conversão de campanhas.
- Utilização da Inteligência Artificial.

---

## Permissões

Cada Laboratório deverá visualizar exclusivamente as informações necessárias para execução de sua operação.

Os resultados somente poderão ser compartilhados conforme autorização do paciente, legislação vigente e regras de segurança da plataforma.

Toda operação deverá respeitar LGPD, auditoria e políticas de privacidade.

---

## Modelo de Atuação

O PortalNutri suportará diferentes modelos de atuação.

### Laboratório Independente

Atende diretamente pacientes e profissionais.

---

### Laboratório Parceiro

Mantém relacionamento comercial com Clínicas, Nutricionistas e demais participantes do ecossistema.

---

### Marketplace

Possui loja própria dentro do PortalNutri para comercialização de exames e serviços.

---

### Rede de Unidades

O Laboratório poderá possuir diversas unidades físicas distribuídas em diferentes cidades ou estados.

Cada unidade poderá possuir agenda, disponibilidade, exames próprios, horários e equipes específicas.

---

## Disponibilidade Regional

A plataforma deverá identificar automaticamente quais Laboratórios podem atender cada paciente.

Entre os critérios poderão estar:

- Cidade.
- Estado.
- CEP.
- Cobertura regional.
- Coleta domiciliar.
- Atendimento presencial.
- Atendimento online.
- Tipo de exame.
- Disponibilidade.
- Prazo.

O objetivo é apresentar apenas Laboratórios compatíveis com a necessidade do paciente.

---

## Histórico Clínico

Os resultados laboratoriais deverão permanecer armazenados no histórico do paciente dentro do PortalNutri.

O paciente poderá:

- Importar exames externos.
- Fazer upload de exames realizados fora da plataforma.
- Compartilhar exames com profissionais autorizados.

Todo o histórico deverá permanecer centralizado, independentemente do laboratório responsável.

---

## Inteligência Artificial

A Inteligência Artificial poderá apoiar a interpretação dos exames laboratoriais.

Os agentes inteligentes poderão:

- Identificar padrões.
- Organizar resultados.
- Comparar exames anteriores.
- Gerar resumos.
- Sugerir possíveis pontos de atenção.
- Recomendar retorno ao profissional.
- Auxiliar na geração de protocolos.

Toda utilização da Inteligência Artificial deverá respeitar os princípios definidos no documento master_ai_architecture.md.

---

## Princípio Fundamental

O Laboratório representa um dos principais fornecedores de informação clínica do PortalNutri Platform.

Sua integração deverá fortalecer a continuidade do cuidado, apoiar os profissionais da saúde e enriquecer o histórico clínico do paciente através de dados estruturados, seguros e integrados.

---

# 03.07 Fabricante

## Definição

O Fabricante representa uma organização responsável pelo desenvolvimento, produção e disponibilização de produtos destinados ao ecossistema do PortalNutri.

Além da fabricação de produtos, o Fabricante poderá atuar como parceiro estratégico da plataforma, oferecendo conteúdo técnico, programas de relacionamento, campanhas comerciais, materiais científicos e integração tecnológica.

Sua participação deverá fortalecer o ecossistema, ampliar o acesso à inovação e aproximar fabricantes, profissionais da saúde, pacientes e demais participantes da plataforma.

---

## Objetivo

Permitir que fabricantes participem ativamente do ecossistema PortalNutri, disponibilizando produtos, conhecimento, serviços e programas de parceria de forma integrada, segura e escalável.

---

## Principais Responsabilidades

O Fabricante poderá:

- Cadastrar produtos.
- Gerenciar seu catálogo.
- Comercializar produtos.
- Disponibilizar materiais técnicos.
- Disponibilizar materiais científicos.
- Disponibilizar treinamentos.
- Disponibilizar cursos.
- Publicar campanhas.
- Criar programas de relacionamento.
- Disponibilizar amostras.
- Integrar sistemas via API.
- Participar do Marketplace.
- Utilizar Inteligência Artificial.

---

## Relacionamentos

O Fabricante poderá se relacionar com:

- Nutricionistas.
- Clínicas.
- Pacientes.
- Farmácias de Manipulação.
- Fornecedores.
- Distribuidores.
- Marketplace.
- Plataforma.
- Agentes Inteligentes.
- Parceiros comerciais.

---

## Compras

O Fabricante poderá contratar recursos da plataforma, incluindo:

- Assinaturas.
- Recursos Premium.
- Espaços publicitários.
- Campanhas patrocinadas.
- Inteligência Artificial.
- Ferramentas analíticas.
- Integrações.
- Serviços especializados.

---

## Vendas

O Fabricante poderá comercializar, quando permitido pela legislação aplicável:

- Produtos físicos.
- Produtos digitais.
- Cursos.
- Materiais técnicos.
- E-books.
- Programas educacionais.
- Serviços.
- Outros produtos autorizados.

A plataforma deverá permitir diferentes modelos comerciais, incluindo vendas diretas, vendas por parceiros e vendas intermediadas.

---

## Conteúdo Científico

O Fabricante poderá disponibilizar conteúdo técnico e científico aos participantes da plataforma.

Exemplos:

- Estudos.
- Artigos.
- Guias técnicos.
- Protocolos.
- Webinars.
- Cursos.
- Eventos.
- Materiais educativos.

A disponibilização desses conteúdos deverá respeitar critérios de qualidade, transparência e as políticas do PortalNutri.

---

## Programas de Parceria

O Fabricante poderá criar programas de relacionamento com profissionais da saúde e demais participantes autorizados.

Exemplos:

- Cashback.
- Programas de fidelidade.
- Embaixadores.
- Benefícios.
- Bonificações.
- Campanhas promocionais.
- Programas de indicação.
- Incentivos comerciais.

Todos os programas deverão respeitar a legislação vigente, as normas éticas aplicáveis e as políticas da plataforma.

---

## Marketplace

O Fabricante poderá possuir uma loja oficial dentro do PortalNutri.

A plataforma deverá permitir:

- Catálogo próprio.
- Gestão de produtos.
- Promoções.
- Campanhas.
- Avaliações.
- Indicadores.
- Integrações.
- Gestão comercial.

---

## Integrações

O Fabricante poderá integrar seus sistemas ao PortalNutri por meio de APIs oficiais.

Exemplos de integração:

- Catálogo de produtos.
- Estoque.
- Preços.
- Pedidos.
- Rastreamento.
- Campanhas.
- Disponibilidade.
- Informações técnicas.

As integrações deverão respeitar os padrões técnicos definidos pela plataforma.

---

## Inteligência Artificial

O Fabricante poderá utilizar Agentes Inteligentes para apoiar:

- Atendimento.
- Marketing.
- Gestão comercial.
- Recomendação de produtos.
- Organização de campanhas.
- Atendimento aos parceiros.
- Geração de indicadores.
- Automação operacional.

Toda utilização da Inteligência Artificial deverá respeitar os princípios definidos no documento `master_ai_architecture.md`.

---

## Disponibilidade Comercial

A plataforma deverá identificar automaticamente a disponibilidade comercial de cada Fabricante.

Essa disponibilidade poderá considerar:

- Região atendida.
- País.
- Estoque.
- Disponibilidade do produto.
- Política comercial.
- Canal de distribuição.
- Parceiros autorizados.
- Restrições legais.
- Modalidade de venda.

---

## Princípio Fundamental

O Fabricante representa uma das principais fontes de inovação, produtos e conhecimento do ecossistema PortalNutri.

Sua participação deverá fortalecer toda a cadeia de valor da plataforma, promovendo inovação, educação, relacionamento e acesso qualificado a produtos e serviços para profissionais da saúde, pacientes e parceiros comerciais.

---

# 03.08 Fornecedor

## Definição

O Fornecedor representa uma organização responsável pela comercialização, distribuição, representação ou disponibilização de produtos e serviços dentro do ecossistema do PortalNutri.

Diferentemente do Fabricante, o Fornecedor não necessariamente produz os produtos comercializados, podendo atuar como distribuidor, importador, revendedor autorizado, operador logístico ou parceiro comercial.

Sua atuação deverá ampliar a disponibilidade de produtos e serviços aos participantes da plataforma, promovendo competitividade, variedade e eficiência comercial.

---

## Objetivo

Permitir que fornecedores participem do ecossistema PortalNutri comercializando produtos e serviços de forma integrada, segura, transparente e escalável.

---

## Principais Responsabilidades

O Fornecedor poderá:

- Comercializar produtos.
- Comercializar serviços.
- Representar fabricantes.
- Distribuir produtos.
- Gerenciar estoque.
- Gerenciar pedidos.
- Gerenciar entregas.
- Integrar sistemas via API.
- Participar do Marketplace.
- Utilizar Inteligência Artificial.

---

## Relacionamentos

O Fornecedor poderá se relacionar com:

- Fabricantes.
- Nutricionistas.
- Clínicas.
- Pacientes.
- Farmácias de Manipulação.
- Marketplace.
- Plataforma.
- Agentes Inteligentes.
- Parceiros comerciais.

---

## Compras

O Fornecedor poderá contratar recursos da plataforma, incluindo:

- Assinaturas.
- Recursos Premium.
- Espaços publicitários.
- Campanhas patrocinadas.
- Inteligência Artificial.
- Ferramentas analíticas.
- Integrações.
- Serviços especializados.

---

## Vendas

O Fornecedor poderá comercializar, quando permitido pela legislação aplicável:

- Produtos físicos.
- Equipamentos.
- Materiais clínicos.
- Livros.
- Cursos.
- Produtos digitais.
- Kits.
- Testes rápidos.
- Acessórios.
- Serviços.

A plataforma deverá permitir diferentes modelos de comercialização, incluindo vendas diretas, distribuição, representação comercial e operações intermediadas.

---

## Modelos de Operação

O PortalNutri deverá suportar diferentes modelos de atuação dos fornecedores.

Exemplos:

### Distribuidor

Comercializa produtos de um ou mais fabricantes.

---

### Revendedor

Atua revendendo produtos diretamente aos consumidores ou profissionais.

---

### Importador

Disponibiliza produtos nacionais e importados.

---

### Operador Logístico

Responsável pela armazenagem, separação e distribuição dos produtos.

---

### Dropshipping

O Fornecedor poderá operar utilizando modelos em que a entrega seja realizada diretamente pelo fabricante ou parceiro logístico.

---

## Marketplace

O Fornecedor poderá possuir uma loja própria dentro do PortalNutri.

A plataforma deverá permitir:

- Catálogo próprio.
- Gestão de produtos.
- Gestão de estoque.
- Promoções.
- Campanhas.
- Avaliações.
- Indicadores.
- Integrações.
- Gestão comercial.

---

## Múltiplos Fornecedores

Um mesmo produto poderá ser comercializado por diferentes fornecedores.

A plataforma deverá permitir a comparação entre ofertas considerando, quando aplicável:

- Preço.
- Disponibilidade.
- Estoque.
- Prazo de entrega.
- Frete.
- Avaliações.
- Região atendida.
- Condições comerciais.

O objetivo é promover competitividade e ampliar as opções disponíveis aos usuários.

---

## Integrações

O Fornecedor poderá integrar seus sistemas ao PortalNutri por meio de APIs oficiais.

Exemplos:

- Catálogo.
- Estoque.
- Pedidos.
- Preços.
- Rastreamento.
- Disponibilidade.
- Informações comerciais.

As integrações deverão respeitar os padrões técnicos definidos pela plataforma.

---

## Inteligência Artificial

O Fornecedor poderá utilizar Agentes Inteligentes para apoiar:

- Atendimento.
- Gestão comercial.
- Organização operacional.
- Atendimento aos parceiros.
- Gestão de estoque.
- Recomendação de produtos.
- Indicadores.
- Automação de processos.

Toda utilização da Inteligência Artificial deverá respeitar os princípios definidos no documento master_ai_architecture.md.

---

## Disponibilidade Comercial

A plataforma deverá identificar automaticamente a disponibilidade comercial de cada fornecedor.

Essa disponibilidade poderá considerar:

- Região atendida.
- País.
- Estoque.
- Disponibilidade do produto.
- Prazo de entrega.
- Modalidade logística.
- Política comercial.
- Canal de venda.
- Restrições legais.

---

## Princípio Fundamental

O Fornecedor representa um elemento essencial para ampliar a disponibilidade de produtos e serviços dentro do PortalNutri.

Sua participação deverá fortalecer o Marketplace, aumentar a competitividade, oferecer melhores opções aos usuários e contribuir para o crescimento sustentável do ecossistema.

---

# 03.09 Marketplace

## Definição

O Marketplace representa a infraestrutura comercial oficial do PortalNutri Platform.

Seu objetivo é conectar profissionais, pacientes, clínicas, empresas parceiras e demais participantes do ecossistema, permitindo a comercialização de produtos, serviços, conteúdos, assinaturas, eventos e soluções digitais em um único ambiente integrado.

O Marketplace não deverá ser tratado apenas como uma loja virtual.

Ele constitui um domínio estratégico da plataforma, responsável por gerar oportunidades de negócio, fortalecer o ecossistema e ampliar as possibilidades de relacionamento entre todos os participantes.

---

## Objetivo

Promover um ambiente seguro, organizado e escalável para comercialização de produtos, serviços e conhecimento, gerando valor para usuários, parceiros comerciais e para o PortalNutri.

---

## Participantes

Poderão participar do Marketplace:

- Nutricionistas.
- Pacientes.
- Clínicas.
- Farmácias de Manipulação.
- Laboratórios.
- Fabricantes.
- Fornecedores.
- Parceiros Comerciais.
- Criadores de Conteúdo.
- Instituições de Ensino.
- Plataforma PortalNutri.

Novos participantes poderão ser incorporados conforme evolução da plataforma.

---

## Produtos Comercializados

O Marketplace poderá disponibilizar:

- Suplementos.
- Produtos manipulados.
- Alimentos funcionais.
- Equipamentos.
- Livros.
- Materiais clínicos.
- Testes rápidos.
- Kits.
- Produtos digitais.
- Protocolos.
- E-books.
- Planilhas.
- Templates.
- Outros produtos autorizados.

---

## Serviços

O Marketplace poderá disponibilizar:

- Consultorias.
- Mentorias.
- Consultas.
- Teleconsultas.
- Cursos.
- Treinamentos.
- Eventos.
- Webinars.
- Workshops.
- Serviços especializados.

---

## Conteúdo

O Marketplace poderá comercializar ou disponibilizar:

- Protocolos.
- Guias.
- Materiais científicos.
- Conteúdos técnicos.
- Artigos.
- Vídeos.
- Aulas.
- Bibliotecas.
- Comunidades.
- Conteúdos exclusivos.

---

## Assinaturas

O Marketplace poderá disponibilizar diferentes modalidades de assinatura.

Exemplos:

- Planos Premium.
- Recursos avançados.
- Inteligência Artificial Premium.
- Comunidades exclusivas.
- Clubes de benefícios.
- Conteúdos recorrentes.

---

## Modelos Comerciais

O PortalNutri deverá suportar diferentes modelos de negócio.

Exemplos:

- B2B.
- B2C.
- C2C.
- Assinaturas.
- Afiliados.
- Comissões.
- Cashback.
- Programas de fidelidade.
- Programas de parceria.
- Publicidade.
- Campanhas patrocinadas.

Novos modelos poderão ser incorporados futuramente.

---

## Múltiplos Vendedores

Um mesmo produto poderá ser comercializado por diferentes vendedores.

O PortalNutri poderá apresentar diferentes ofertas considerando:

- Preço.
- Disponibilidade.
- Estoque.
- Prazo de entrega.
- Avaliações.
- Região atendida.
- Condições comerciais.
- Benefícios adicionais.

O objetivo é ampliar a competitividade e oferecer melhores opções aos usuários.

---

## Disponibilidade

Cada produto ou serviço poderá possuir regras próprias de disponibilidade.

Exemplos:

- Nacional.
- Regional.
- Local.
- Digital.
- Presencial.
- Exclusivo para profissionais.
- Exclusivo para pacientes.
- Exclusivo para parceiros.

A plataforma deverá controlar automaticamente essas regras.

---

## Inteligência Artificial

O Marketplace poderá utilizar Agentes Inteligentes para apoiar:

- Recomendação personalizada.
- Busca inteligente.
- Atendimento.
- Organização do catálogo.
- Gestão comercial.
- Campanhas.
- Precificação.
- Indicadores.
- Automação operacional.

Toda utilização da Inteligência Artificial deverá respeitar os princípios definidos no documento `master_ai_architecture.md`.

---

## Integrações

O Marketplace deverá permitir integração com sistemas externos.

Exemplos:

- ERP.
- Plataformas logísticas.
- Gateways de pagamento.
- Marketplaces parceiros.
- Sistemas de estoque.
- Sistemas fiscais.
- Plataformas de ensino.
- APIs oficiais.

---

## Monetização

O Marketplace poderá gerar receita para o PortalNutri através de:

- Assinaturas.
- Comissões sobre vendas.
- Publicidade.
- Campanhas patrocinadas.
- Recursos Premium.
- Inteligência Artificial.
- Serviços especializados.
- Programas de parceria.
- Integrações.
- Eventos.

Novos modelos de monetização poderão ser incorporados conforme evolução da plataforma.

---

## Governança

Toda operação realizada no Marketplace deverá respeitar:

- LGPD.
- Políticas da plataforma.
- Contratos.
- Direitos autorais.
- Regras comerciais.
- Normas éticas.
- Legislação vigente.
- Critérios de auditoria.

---

## Princípio Fundamental

O Marketplace representa a infraestrutura comercial do PortalNutri Platform.

Seu propósito é conectar todo o ecossistema da nutrição em um único ambiente digital, permitindo que produtos, serviços, conhecimento e oportunidades de negócio circulem de forma segura, inteligente e sustentável, fortalecendo continuamente todos os participantes da plataforma.

---

# 04. Glossário Oficial do Domínio

## Objetivo

O Glossário Oficial do Domínio estabelece a linguagem oficial utilizada pelo PortalNutri Platform.

Todas as definições presentes neste documento deverão ser utilizadas de forma consistente em toda a plataforma, incluindo:

- Documentação
- Banco de Dados
- APIs
- Arquitetura
- Código-fonte
- Interfaces
- Inteligência Artificial
- Materiais técnicos

Toda alteração neste glossário deverá ser refletida em todos os documentos oficiais do PortalNutri.

---

## PortalNutri Platform

Plataforma tecnológica responsável por integrar profissionais da saúde, pacientes, empresas parceiras, Inteligência Artificial e serviços digitais em um único ecossistema.

---

## Ecossistema

Conjunto de participantes, organizações, serviços, produtos, processos e relacionamentos que interagem dentro do PortalNutri para gerar valor aos usuários.

---

## Domínio de Negócio

Área funcional independente da plataforma que concentra responsabilidades, regras e processos específicos.

Exemplos de Bounded Contexts oficiais:

- IAM
- Care
- Marketplace
- Business
- AI
- Communication
- Analytics
- Platform

---

## Pessoa

Representa a identidade única de um usuário dentro do PortalNutri Platform.

Uma Pessoa poderá exercer diferentes papéis e manter múltiplos vínculos simultaneamente dentro do ecossistema.

A identidade da Pessoa permanecerá única, independentemente das organizações, profissionais ou serviços com os quais se relacione.

---

## Papel

Função exercida por uma Pessoa dentro de determinado contexto da plataforma.

Exemplos:

- Paciente
- Nutricionista
- Secretária
- Administrador
- Comprador
- Vendedor

Uma mesma Pessoa poderá exercer múltiplos papéis simultaneamente, conforme suas permissões e relacionamentos.

---

## Vínculo

Relação formal entre uma Pessoa e outra Pessoa, Clínica, Organização ou Tenant dentro da plataforma.

O Vínculo define o contexto no qual a Pessoa atua, estabelecendo permissões, responsabilidades, relacionamentos clínicos, comerciais e administrativos.

Uma Pessoa poderá possuir múltiplos vínculos simultaneamente.

---

## Tenant

Unidade lógica de organização e isolamento da plataforma.

Representa uma organização independente dentro do PortalNutri, como clínica, consultório, nutricionista autônoma, hospital, empresa, laboratório, farmácia, fornecedor ou outro participante autorizado.

---

## Unidade Organizacional

Subdivisão operacional de um Tenant.

Representa unidades, filiais, ambulatórios, polos, campus, unidades online ou outras estruturas internas de uma organização.

---

## Prontuário

Conjunto organizado de informações clínicas produzidas dentro de um Vínculo Clínico.

O Prontuário preserva o histórico, os objetivos, as consultas, avaliações, evoluções, protocolos, prescrições, exames e indicadores clínicos do paciente naquele contexto.

---

## Objetivo Clínico

Finalidade terapêutica definida dentro de um Prontuário.

Organiza a jornada clínica do paciente, agrupando consultas, avaliações, evoluções, protocolos, prescrições, exames e indicadores relacionados a um determinado objetivo de cuidado.

---

## Protocolo Modelo

Ativo de conhecimento reutilizável, versionado e estruturado para apoiar tratamentos nutricionais.

Poderá ser privado, institucional, oficial da plataforma ou comercializado no Marketplace.

---

## Protocolo Aplicado

Instância de um Protocolo Modelo aplicada a um Prontuário específico.

Preserva a versão utilizada, permite personalizações e passa a compor o histórico clínico do paciente.

---

## Plano Alimentar

Estratégia nutricional prática vinculada a um Protocolo Aplicado.

Define refeições, alimentos, substituições, horários, recomendações e orientações alimentares.

---

## Prescrição Nutricional

Conduta nutricional formal vinculada a um Protocolo Aplicado.

Poderá conter suplementos, manipulados, fitoterápicos, dosagens, frequência, duração e observações profissionais.

---

## Indicador Clínico

Variável clínica mensurável utilizada para acompanhar a evolução do paciente.

Exemplos incluem peso, IMC, circunferência, percentual de gordura, glicemia, colesterol, triglicerídeos, vitamina D e demais dados objetivos relevantes.

---

## Nutricionista

Pessoa que exerce o papel de Nutricionista dentro da plataforma.

É responsável pelo atendimento clínico, acompanhamento nutricional, elaboração de protocolos, interpretação das informações dos pacientes e condução da jornada nutricional.

A Nutricionista representa um dos principais agentes geradores de valor do ecossistema PortalNutri.

---

## Paciente

Pessoa que exerce o papel de Paciente dentro de um ou mais vínculos clínicos estabelecidos na plataforma.

O Paciente poderá manter relacionamentos simultâneos com diferentes Nutricionistas, Clínicas ou Organizações, preservando sua identidade única dentro do PortalNutri.

---

## Clínica

Organização participante do PortalNutri responsável por disponibilizar estrutura para atendimento clínico, gestão de profissionais e relacionamento com pacientes.

Uma Clínica poderá manter vínculos com múltiplas Pessoas, incluindo Nutricionistas, Secretárias, Administradores e Pacientes, respeitando os modelos de permissão definidos pela plataforma.

---

## Secretária

Pessoa que exerce o papel de Secretária dentro da plataforma.

É responsável pelo apoio operacional, administrativo e organizacional da Nutricionista, Clínica ou Organização, conforme os vínculos e permissões estabelecidos.

---

## Farmácia de Manipulação

Empresa responsável pela produção e comercialização de fórmulas manipuladas, mantendo relacionamento com profissionais da saúde, pacientes e demais participantes da plataforma.

---

## Laboratório

Empresa responsável pela realização de exames laboratoriais, produção de resultados clínicos e disponibilização de serviços relacionados ao diagnóstico.

---

## Fabricante

Empresa responsável pelo desenvolvimento e fabricação de produtos disponibilizados no ecossistema PortalNutri.

---

## Fornecedor

Empresa responsável pela comercialização, distribuição, representação ou disponibilização de produtos e serviços dentro da plataforma.

---

## Marketplace

Infraestrutura comercial oficial do PortalNutri responsável pela comercialização de produtos, serviços, conteúdos, assinaturas e soluções digitais.

---

## Produto

Bem físico ou digital disponibilizado por participantes autorizados da plataforma.

---

## Serviço

Atividade disponibilizada por participantes autorizados que gere valor ao ecossistema.

---

## Conteúdo

Material técnico, científico, educacional ou informativo disponibilizado dentro da plataforma.

---

## Assinatura

Modelo recorrente de contratação de recursos, serviços ou funcionalidades disponibilizadas pelo PortalNutri.

---

## Inteligência Artificial

Conjunto de agentes inteligentes responsáveis por apoiar profissionais, pacientes e demais participantes da plataforma.

---

## Agente Inteligente

Componente especializado responsável por executar atividades específicas utilizando Inteligência Artificial, respeitando os princípios definidos no `master_ai_architecture.md`.

---

## PortalNutri AI Orchestrator

Componente responsável por coordenar toda a atuação da Inteligência Artificial da plataforma, selecionando agentes, construindo contexto, aplicando regras de governança e consolidando resultados.

---

## Contexto Inteligente

Conjunto de informações selecionadas pelo Orquestrador para permitir que um Agente Inteligente execute sua função com precisão, segurança e eficiência.

---

## Memória Inteligente

Componente responsável por preservar conhecimento relevante da plataforma de forma organizada, permanente ou temporária, independente dos Agentes Inteligentes.

---

## Base Oficial de Conhecimento

Conjunto de documentos, conteúdos, regras, materiais científicos e informações institucionais oficialmente reconhecidos pelo PortalNutri para utilização pela Inteligência Artificial.

---

## Multi-tenant

Arquitetura que garante o isolamento completo dos dados entre diferentes clientes, organizações e participantes da plataforma.

---

## LGPD

Lei Geral de Proteção de Dados Pessoais, responsável por regulamentar o tratamento de dados pessoais no Brasil e orientar todas as operações realizadas pelo PortalNutri.

---

## Integração

Mecanismo de comunicação entre o PortalNutri e sistemas externos por meio de APIs, serviços ou outros padrões tecnológicos.

---

## API

Interface oficial utilizada para comunicação segura entre sistemas, serviços, parceiros e componentes internos da plataforma.

---

## Documento Mestre

Documento oficial que define princípios, regras e diretrizes de uma área estratégica da plataforma.

Exemplos:

- master_project.md
- master_domain_model.md
- master_ai_architecture.md
- master_database.md
- master_architecture.md
- master_application.md

---

## Princípio Fundamental

O Glossário Oficial do Domínio representa a linguagem oficial do PortalNutri Platform.

Todos os participantes, documentos, sistemas, APIs, componentes técnicos, agentes de Inteligência Artificial e códigos-fonte deverão utilizar estas definições de forma consistente, garantindo unidade conceitual em toda a plataforma.

---

# Status do Documento

**Status:** ✅ CONGELADO

Este documento representa oficialmente o Modelo de Domínio do PortalNutri Platform.

Toda evolução do domínio deverá preservar os conceitos, definições e princípios estabelecidos neste documento.

Alterações estruturais somente poderão ocorrer mediante decisão arquitetural formal e deverão manter compatibilidade com os demais Documentos Mestres da plataforma.

---

## Documentos Relacionados

Este documento possui relação direta com:

- master_project.md
- master_ai_architecture.md
- master_architecture.md
- master_database.md
- master_application.md
- master_bounded_contexts.md
- master_aggregates.md
- master_use_cases.md
- master_permissions.md
- master_security.md
- master_architecture_decisions.md

Toda alteração neste documento deverá ser refletida, quando aplicável, nos demais Documentos Mestres da plataforma.


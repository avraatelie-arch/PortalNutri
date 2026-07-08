# PortalNutri Platform

# Master Use Cases

**Versão:** 1.0

**Status:** Documento Mestre de Casos de Uso

---

# 00. Objetivo do Documento

Este documento define oficialmente os Casos de Uso do PortalNutri Platform.

Os Casos de Uso representam as capacidades de negócio disponibilizadas pela plataforma aos seus participantes.

Este documento não define:

- Interfaces;
- APIs;
- Banco de Dados;
- Implementação técnica;
- Frameworks.

Este documento define:

- Capacidades da plataforma;
- Responsabilidades dos Bounded Contexts;
- Aggregates envolvidos;
- Eventos produzidos;
- Permissões necessárias.

---

## Objetivo Final

Este documento servirá como referência para:

- Camada de Aplicação;
- Backend;
- Frontend;
- Mobile;
- Inteligência Artificial;
- Testes;
- Documentação Funcional.

---

# 01. Princípios Gerais

Todo Caso de Uso representa uma ação de negócio.

Casos de Uso não representam operações CRUD.

Eles representam objetivos alcançados pelos participantes da plataforma.

---

## Estrutura Oficial

Todo Caso de Uso deverá possuir:

- Nome;
- Objetivo;
- Bounded Context responsável;
- Aggregate principal;
- Permissões necessárias;
- Eventos produzidos.

---

## Princípio Fundamental

Todo Caso de Uso deverá modificar apenas um Aggregate principal.

Quando outros Aggregates participarem da operação, a comunicação deverá ocorrer através de Eventos de Domínio ou contratos oficialmente definidos pela arquitetura.

---

# 02. Casos de Uso do IAM

## Registrar Pessoa

Objetivo

Registrar uma nova Pessoa na plataforma.

Aggregate

Pessoa

Eventos

- Pessoa Criada

---

## Atualizar Cadastro da Pessoa

Objetivo

Atualizar informações cadastrais da Pessoa.

Aggregate

Pessoa

Eventos

- Pessoa Atualizada

---

## Inativar Pessoa

Objetivo

Inativar uma Pessoa.

Eventos

- Pessoa Inativada

---

## Atribuir Papel

Objetivo

Associar um Papel a uma Pessoa.

Eventos

- Papel Atribuído

---

## Revogar Papel

Objetivo

Remover um Papel.

Eventos

- Papel Revogado

---

## Criar Vínculo

Objetivo

Criar um relacionamento oficial entre participantes.

Eventos

- Vínculo Criado

---

## Atualizar Vínculo

Objetivo

Alterar informações do Vínculo.

Eventos

- Vínculo Atualizado

---

## Encerrar Vínculo

Objetivo

Finalizar um relacionamento.

Eventos

- Vínculo Encerrado

---

## Conceder Permissão

Objetivo

Adicionar Permissões a uma Pessoa.

Eventos

- Permissão Concedida

---

## Revogar Permissão

Objetivo

Remover Permissões.

Eventos

- Permissão Revogada

---

# 03. Casos de Uso do Care

## Criar Prontuário

Objetivo

Iniciar o acompanhamento clínico.

Aggregate

Prontuário

Eventos

- Prontuário Criado

---

## Definir Objetivo Clínico

Objetivo

Registrar um novo Objetivo Clínico.

Eventos

- Objetivo Clínico Definido

---

## Atualizar Objetivo Clínico

Eventos

- Objetivo Clínico Atualizado

---

## Concluir Objetivo Clínico

Eventos

- Objetivo Clínico Concluído

---

## Agendar Consulta

Eventos

- Consulta Agendada

---

## Reagendar Consulta

Eventos

- Consulta Reagendada

---

## Cancelar Consulta

Eventos

- Consulta Cancelada

---

## Iniciar Consulta

Eventos

- Consulta Iniciada

---

## Finalizar Consulta

Eventos

- Consulta Finalizada

---

## Registrar Avaliação Nutricional

Eventos

- Avaliação Nutricional Registrada

---

## Registrar Evolução Clínica

Eventos

- Evolução Clínica Registrada

---

## Aplicar Protocolo

Eventos

- Protocolo Aplicado

---

## Publicar Plano Alimentar

Eventos

- Plano Alimentar Publicado

---

## Atualizar Plano Alimentar

Eventos

- Plano Alimentar Atualizado

---

## Substituir Plano Alimentar

Eventos

- Plano Alimentar Atualizado

---

## Emitir Prescrição Nutricional

Eventos

- Prescrição Nutricional Emitida

---

## Atualizar Prescrição Nutricional

Eventos

- Prescrição Nutricional Atualizada

---

## Solicitar Exame

Eventos

- Solicitação de Exame Emitida

---

## Registrar Resultado de Exame

Eventos

- Resultado de Exame Recebido

---

## Validar Resultado de Exame

Eventos

- Resultado de Exame Validado

---

## Registrar Indicador Clínico

Eventos

- Indicador Clínico Atualizado

---

## Compartilhar Prontuário

Eventos

- Documento Clínico Compartilhado

---

## Encerrar Acompanhamento Clínico

Eventos

- Acompanhamento Clínico Encerrado

---

## Princípio Fundamental

Todos os Casos de Uso clínicos pertencem exclusivamente ao Bounded Context Care.

Nenhum outro Contexto poderá modificar diretamente informações clínicas.

# 04. Casos de Uso do Marketplace

O Bounded Context Marketplace é responsável pelas capacidades comerciais do PortalNutri.

---

## Criar Loja

Objetivo

Registrar uma nova Loja no Marketplace.

Aggregate

Loja

Eventos

- Loja Criada

---

## Atualizar Loja

Eventos

- Loja Atualizada

---

## Suspender Loja

Eventos

- Loja Suspensa

---

## Reativar Loja

Eventos

- Loja Reativada

---

## Publicar Produto

Aggregate

Produto

Eventos

- Produto Publicado

---

## Atualizar Produto

Eventos

- Produto Atualizado

---

## Suspender Produto

Eventos

- Produto Suspenso

---

## Reativar Produto

Eventos

- Produto Reativado

---

## Despublicar Produto

Eventos

- Produto Despublicado

---

## Publicar Serviço

Aggregate

Serviço

Eventos

- Serviço Publicado

---

## Atualizar Serviço

Eventos

- Serviço Atualizado

---

## Despublicar Serviço

Eventos

- Serviço Despublicado

---

## Publicar Conteúdo

Aggregate

Conteúdo

Eventos

- Conteúdo Publicado

---

## Atualizar Conteúdo

Eventos

- Conteúdo Atualizado

---

## Despublicar Conteúdo

Eventos

- Conteúdo Despublicado

---

## Criar Oferta

Eventos

- Oferta Criada

---

## Atualizar Oferta

Eventos

- Oferta Atualizada

---

## Encerrar Oferta

Eventos

- Oferta Encerrada

---

## Criar Campanha

Eventos

- Campanha Criada

---

## Encerrar Campanha

Eventos

- Campanha Encerrada

---

## Criar Cupom

Eventos

- Cupom Criado

---

## Cancelar Cupom

Eventos

- Cupom Cancelado

---

## Aplicar Cupom

Eventos

- Cupom Utilizado

---

## Criar Pedido

Aggregate

Pedido

Eventos

- Pedido Criado

---

## Confirmar Compra

Eventos

- Compra Confirmada

---

## Cancelar Pedido

Eventos

- Pedido Cancelado

---

## Registrar Avaliação

Eventos

- Avaliação Publicada

---

## Responder Avaliação

Eventos

- Resposta Publicada

---

## Princípio Fundamental

Todo Caso de Uso comercial pertence exclusivamente ao Bounded Context Marketplace.

---

# 05. Casos de Uso do Business

O Bounded Context Business administra todas as capacidades financeiras da plataforma.

---

## Contratar Assinatura

Aggregate

Assinatura

Eventos

- Assinatura Contratada

---

## Renovar Assinatura

Eventos

- Assinatura Renovada

---

## Alterar Plano

Eventos

- Assinatura Alterada

---

## Cancelar Assinatura

Eventos

- Assinatura Cancelada

---

## Gerar Cobrança

Aggregate

Cobrança

Eventos

- Cobrança Gerada

---

## Cancelar Cobrança

Eventos

- Cobrança Cancelada

---

## Confirmar Pagamento

Aggregate

Pagamento

Eventos

- Pagamento Confirmado

---

## Registrar Pagamento

Eventos

- Pagamento Recebido

---

## Estornar Pagamento

Eventos

- Pagamento Estornado

---

## Efetuar Reembolso

Eventos

- Reembolso Efetuado

---

## Calcular Comissão

Aggregate

Comissão

Eventos

- Comissão Calculada

---

## Liberar Comissão

Eventos

- Comissão Liberada

---

## Efetuar Repasse

Aggregate

Repasse Financeiro

Eventos

- Repasse Financeiro Efetuado

---

## Emitir Nota Fiscal

Aggregate

Documento Fiscal

Eventos

- Nota Fiscal Emitida

---

## Cancelar Nota Fiscal

Eventos

- Nota Fiscal Cancelada

---

## Registrar Crédito

Eventos

- Crédito Registrado

---

## Registrar Débito

Eventos

- Débito Registrado

---

## Encerrar Competência Financeira

Eventos

- Competência Encerrada

---

## Gerar Extrato Financeiro

Eventos

- Extrato Gerado

---

## Gerar Demonstrativo Financeiro

Eventos

- Demonstrativo Financeiro Gerado

---

## Princípio Fundamental

Todos os Casos de Uso financeiros pertencem exclusivamente ao Bounded Context Business.

Nenhum outro Contexto poderá alterar diretamente informações financeiras oficiais.

# 06. Casos de Uso da Inteligência Artificial

O Bounded Context AI representa todas as capacidades inteligentes disponibilizadas pela plataforma.

A IA atua como suporte aos demais Contextos, nunca como proprietária dos dados ou das decisões de negócio.

---

## Construir Contexto Inteligente

Aggregate

Agente Inteligente

Eventos

- Contexto Inteligente Construído

---

## Consultar Base Oficial de Conhecimento

Eventos

- Conhecimento Consultado

---

## Consultar Memória Inteligente

Eventos

- Memória Consultada

---

## Gerar Resposta Inteligente

Eventos

- Resposta Gerada

---

## Gerar Resumo Clínico

Eventos

- Resumo Inteligente Gerado

---

## Gerar Sugestão Clínica

Eventos

- Sugestão Clínica Gerada

---

## Sugerir Protocolo

Eventos

- Protocolo Sugerido

---

## Sugerir Plano Alimentar

Eventos

- Plano Alimentar Sugerido

---

## Sugerir Prescrição Nutricional

Eventos

- Prescrição Sugerida

---

## Explicar Recomendação

Eventos

- Explicação Gerada

---

## Registrar Feedback da IA

Eventos

- Feedback Recebido

---

## Aprender com Feedback

Eventos

- Aprendizado Registrado

---

# 07. Casos de Uso da Comunicação

O Bounded Context Communication administra todas as comunicações da plataforma.

---

## Enviar Notificação

Eventos

- Notificação Enviada

---

## Enviar E-mail

Eventos

- E-mail Enviado

---

## Enviar WhatsApp

Eventos

- WhatsApp Enviado

---

## Enviar Push

Eventos

- Push Enviado

---

## Enviar SMS

Eventos

- SMS Enviado

---

## Compartilhar Documento

Eventos

- Documento Compartilhado

---

## Revogar Compartilhamento

Eventos

- Documento Removido do Compartilhamento

---

## Enviar Convite

Eventos

- Convite Enviado

---

## Aceitar Convite

Eventos

- Convite Aceito

---

## Recusar Convite

Eventos

- Convite Recusado

---

# 08. Casos de Uso do Analytics

O Bounded Context Analytics consolida informações produzidas pelos demais Contextos.

---

## Atualizar Dashboard

Eventos

- Dashboard Atualizado

---

## Calcular Indicadores

Eventos

- Indicador Estratégico Calculado

---

## Gerar Relatório

Eventos

- Relatório Gerado

---

## Gerar Métricas

Eventos

- Métricas Calculadas

---

## Atualizar Business Intelligence

Eventos

- BI Atualizado

---

# 09. Casos de Uso da Plataforma

O Bounded Context Platform administra recursos transversais.

---

## Atualizar Configuração Global

Eventos

- Configuração Alterada

---

## Atualizar Feature Flag

Eventos

- Feature Flag Atualizada

---

## Registrar Auditoria

Eventos

- Auditoria Registrada

---

## Atualizar Parametrização

Eventos

- Parametrização Atualizada

---

## Publicar Nova Configuração

Eventos

- Configuração Publicada

---

# 10. Casos de Uso Compostos

Algumas operações de negócio exigem colaboração entre múltiplos Bounded Contexts.

Esses Casos de Uso Compostos representam orquestrações de negócio.

Nenhum Contexto se torna proprietário dos dados de outro Contexto.

---

## Finalizar Compra

Contextos envolvidos

- Marketplace
- Business
- Communication
- Analytics

Fluxo

Pedido Criado

↓

Pagamento Confirmado

↓

Compra Confirmada

↓

Notificação Enviada

↓

Dashboard Atualizado

---

## Finalizar Consulta

Contextos envolvidos

- Care
- AI
- Communication
- Analytics

Fluxo

Consulta Finalizada

↓

Resumo Inteligente Gerado

↓

Notificação enviada

↓

Indicadores atualizados

---

## Aplicar Protocolo Clínico

Contextos envolvidos

- Care
- AI

Fluxo

Protocolo Aplicado

↓

IA gera recomendações complementares

↓

Profissional valida

---

## Contratar Assinatura

Contextos envolvidos

- Business
- Communication
- Analytics

Fluxo

Assinatura Contratada

↓

Pagamento confirmado

↓

Notificação enviada

↓

Indicadores atualizados

---

## Compartilhar Prontuário

Contextos envolvidos

- Care
- IAM
- Communication

Fluxo

Solicitação

↓

Validação de Permissões

↓

Validação de Consentimento

↓

Compartilhamento realizado

↓

Notificação enviada

---

# 11. Governança dos Casos de Uso

Os Casos de Uso representam as capacidades oficiais do PortalNutri.

Toda nova funcionalidade deverá ser implementada por meio de um Caso de Uso oficialmente definido.

Nenhuma API deverá existir sem um Caso de Uso correspondente.

Nenhuma tela deverá executar regras de negócio diretamente.

Toda regra deverá estar associada a um Caso de Uso.

---

## Evolução

Novos Casos de Uso poderão ser adicionados sempre que representarem uma nova capacidade do domínio.

Alterações deverão preservar:

- consistência;
- baixo acoplamento;
- alinhamento com os Bounded Contexts;
- alinhamento com os Aggregates;
- alinhamento com os Eventos de Domínio.

---

# Princípios Fundamentais

Os Casos de Uso representam aquilo que o PortalNutri é capaz de realizar.

Eles descrevem comportamentos do negócio e não operações técnicas.

Os Casos de Uso constituem a ponte entre o domínio, a arquitetura e a implementação da plataforma.

Toda API, tela, fluxo de negócio, automação ou agente inteligente deverá estar fundamentado em um ou mais Casos de Uso definidos neste documento.

---

# Conclusão

Os Casos de Uso definidos neste documento consolidam as capacidades oficiais do PortalNutri.

Em conjunto com os Documentos Mestres de Projeto, Modelo de Domínio, Eventos, Bounded Contexts, Aggregates e Permissões, formam a base funcional da plataforma.

Toda implementação futura deverá respeitar os Casos de Uso aqui definidos, garantindo alinhamento entre negócio, arquitetura e tecnologia.


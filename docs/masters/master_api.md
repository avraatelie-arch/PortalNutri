# PortalNutri Platform

# Master API

**Versão:** 1.0

**Status:** Documento Mestre de APIs

---

# 00. Objetivo

Este documento define oficialmente o Padrão de APIs (Application Programming Interfaces) do PortalNutri Platform.

Seu objetivo é estabelecer os princípios de comunicação, formatos de dados, versionamento, convenções de design, tratamento de erros e políticas de integração aplicadas a todos os endpoints expostos pela plataforma.

Este documento complementa e deve ser lido em conjunto com:

- master_application.md
- master_security.md
- master_permissions.md
- master_architecture.md

---

# 01. Princípios de Design das APIs

Todas as interfaces de comunicação técnica do PortalNutri deverão respeitar os seguintes princípios:

- **Orientação aos Casos de Uso**: APIs representam apenas uma forma de expor os Casos de Uso definidos na Camada de Aplicação. Nenhum controller ou rota de API deverá conter regras de negócio.
- **RESTful por Padrão**: As APIs públicas e privadas principais seguirão os padrões de arquitetura REST.
- **Consistência de Payload**: Request e Response DTOs deverão possuir estruturas padronizadas em toda a plataforma.
- **Segurança por Padrão (Zero Trust)**: Toda API deverá exigir autenticação e passar pelo *Authorization Engine* centralizado, a menos que seja explicitamente pública (ex: login, cadastro inicial).
- **Formatos suportados**: O formato oficial de payload para troca de dados é exclusivamente JSON (JavaScript Object Notation).

---

# 02. Protocolos e Endpoints

O PortalNutri expõe capacidades através de dois protocolos oficiais principais:

## 1. REST API
Utilizada para operações transacionais síncronas entre clientes (Frontend, Mobile) e a plataforma.
* **Base URL**: `https://api.portalnutri.com.br/v1`

## 2. Webhooks
Utilizados para integração assíncrona orientada a eventos para parceiros e sistemas externos.
* **Protocolo**: HTTP POST com assinatura criptográfica no header `X-PortalNutri-Signature`.

---

# 03. Convenções HTTP (REST)

## Métodos HTTP

As operações deverão utilizar os métodos HTTP correspondentes ao seu propósito de negócio:

| Método | Propósito | Idempotência |
|---|---|---|
| `GET` | Recuperação de recursos (Queries) | Sim |
| `POST` | Criação de novos recursos ou acionamento de Commands complexos | Não |
| `PUT` | Atualização completa de recursos existentes | Sim |
| `PATCH` | Atualização parcial de recursos (preferencial para modificações específicas) | Não |
| `DELETE`| Inativação ou arquivamento lógico de recursos | Sim |

---

## Códigos de Retorno (HTTP Status Codes)

A plataforma utilizará códigos de status HTTP padrão para indicar o resultado das operações:

### Sucesso (2xx)
* `200 OK`: Operação de leitura ou atualização concluída com sucesso.
* `201 Created`: Novo recurso criado com sucesso (geralmente em POST).
* `204 No Content`: Operação concluída com sucesso sem retorno de payload.

### Erros de Cliente (4xx)
* `400 Bad Request`: Payload malformado ou erro de sintaxe.
* `401 Unauthorized`: Usuário não autenticado ou token inválido/expirado.
* `403 Forbidden`: Usuário autenticado, mas sem permissões ou vínculos autorizados para este escopo.
* `404 Not Found`: Recurso solicitado não foi encontrado.
* `409 Conflict`: Conflito de estado do recurso (ex: e-mail já cadastrado).
* `422 Unprocessable Entity`: Falha na validação de regras de negócio ou de esquema (esquema Zod inválido).

### Erros de Servidor (5xx)
* `500 Internal Server Error`: Erro imprevisto no servidor. Detalhes técnicos da falha nunca deverão ser expostos na resposta.

---

# 04. Padrão de Resposta de Erros

Em caso de falhas (HTTP >= 400), a resposta retornada pela API deverá seguir rigorosamente o seguinte formato JSON:

```json
{
  "error": {
    "code": "VALOR_CODIGO_ERRO",
    "message": "Mensagem amigável para o usuário.",
    "details": [
      {
        "field": "campo_com_erro",
        "message": "Descrição detalhada do erro no campo."
      }
    ],
    "timestamp": "2026-07-07T08:30:00Z",
    "traceId": "uuid-do-registro-operacional-para-suporte"
  }
}
```

---

# 05. Paginação e Filtros

Operações de listagem (`GET`) deverão obrigatoriamente aceitar paginação para evitar sobrecarga de memória e rede.

## Parâmetros de Entrada
* `page`: Número da página (padrão: 1, baseado em index 1).
* `limit`: Quantidade de itens por página (padrão: 20, máximo: 100).
* `sort`: Campo de ordenação (ex: `createdAt:desc`).

## Payload de Saída Padronizado
```json
{
  "data": [
    { "id": "1", "name": "Exemplo" }
  ],
  "meta": {
    "currentPage": 1,
    "perPage": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

---

# 06. Controle de Taxa (Rate Limiting)

Para proteger a infraestrutura contra ataques de negação de serviço (DoS/DDoS) e uso excessivo de recursos das APIs por scripts mal configurados:

* **Público (Não Autenticado)**: Máximo de 60 requisições por minuto por IP.
* **Autenticado (Pessoa)**: Máximo de 300 requisições por minuto por sessão de usuário.
* **Parceiros (Integrações/API Keys)**: Definido em contrato e monitorado por níveis de consumo.

Os cabeçalhos HTTP de resposta deverão incluir as informações de consumo:
* `X-RateLimit-Limit`: Limite permitido no período.
* `X-RateLimit-Remaining`: Requisições restantes na janela atual.
* `X-RateLimit-Reset`: Timestamp UTC para reinício da janela.

---

# 07. Governança e Evolução das APIs

## Versionamento
O versionamento da API será incluído diretamente no caminho da URL (ex: `/v1/`, `/v2/`).
* Mudanças não quebrantes (inclusão de campos opcionais de retorno) não alteram a versão da API.
* Mudanças quebrantes (renomeação de campos obrigatórios, exclusão de endpoints) exigem o lançamento de uma nova versão (ex: `/v2/`), mantendo a versão anterior ativa pelo período de deprecation estabelecido na governança da plataforma.

---

# 08. Estado de Exposição HTTP (Implementação)

Este documento define padrões para APIs expostas. A tabela abaixo distingue **casos de uso implementados internamente** de **endpoints HTTP publicados**.

| Módulo | Casos de uso (Application Layer) | Rotas HTTP expostas |
|--------|----------------------------------|---------------------|
| IAM | ✅ Implementados | ✅ Person, Tenant, Membership, Role, Permission, Auth |
| Clinical | ✅ 75 handlers (41 commands + 33 queries) | ❌ **Não expostos** — `registerClinicalModule()` é stub |
| Patient | ✅ Implementados | ❌ Não expostos |
| Nutrition | ✅ Implementados | ❌ Não expostos |
| Appointment | ✅ Implementados | ❌ Não expostos |

**ClinicalChart** (FEATURE-040) será exposto como query-side quando implementado — conforme ADR-0019, sem commands HTTP de escrita para prontuário unificado.

Documentar endpoints clínicos neste master **somente após** implementação e registro em `registerClinicalModule()`.

---

# Conclusão

O presente documento estabelece as diretrizes obrigatórias de comunicação e exposição de APIs no PortalNutri.

Toda API exposta no backend e consumida pelas aplicações cliente (Frontend, Mobile) deverá estar em estrita conformidade com os padrões de design, payloads, paginação e segurança estabelecidos neste documento, garantindo integridade conceitual em todo o ecossistema.

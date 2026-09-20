# Alerta Automático de Aderência a Treinamentos (Google Chat + Webhook)

> Solução de ChatOps desenvolvida em Google Apps Script para monitoramento contínuo e notificação automática do percentual de aderência a treinamentos e quizes operacionais diretamente no Google Chat.

---

## Objetivo & Contexto de Negócio

* **Problema:** A liderança não possuía visibilidade centralizada sobre quais analistas haviam concluído ou pendenciado as pílulas e quizes do time de treinamento. A cobrança era descentralizada, informal e sem histórico registrado do momento em que os avisos foram emitidos.
* **Solução:** Desenvolvimento de um script em **Google Apps Script integrado via Webhook ao Google Chat**. O sistema executa duas vezes por semana via acionador temporal (*Time-Driven Trigger*), calcula a taxa de aderência por módulo de treinamento e publica um card detalhado no canal da equipe com os e-mails exatos dos analistas com pendências.

---

## Ferramentas

* **Linguagem & Backend:** [Google Apps Script](Code.gs) (JavaScript Server-Side)
* **Integração de ChatOps:** Google Chat Incoming Webhooks API (Payload JSON)
* **Automação & Agendamento:** Acionadores temporais (*Time-Driven Triggers / Cron*)
* **Fonte de Dados:** Google Sheets / Formulários de Treinamento

---

## Demonstração Visual

### Card de Alerta Publicado na Espaço "Central de Aderência"
![Demonstração do Alerta no Google Chat](![E-mail de Relatório](chatl.png.png))

---

## Arquitetura do Fluxo

```text
[ Trigger Temporal: 2x por Semana ]
                 │
                 ▼
 [ Google Apps Script: Leitura das Bases ]
                 │
                 ▼
 [ Cálculo de Aderência (%) & Filtro de Pendentes ]
                 │
                 ▼
 [ Montagem do Payload de Mensagem em JSON ]
                 │
                 ▼
 [ Requisição HTTP POST via Incoming Webhook ]
                 │
                 ▼
 [ Notificação Instantânea na Sala do Google Chat ]

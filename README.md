# ai-agent-frontend

A Dockerized Node.js + Express Single-Page Application (SPA) providing a clean chat interface for an AI Agent, with Microsoft Entra ID (Azure AD) authentication via MSAL Browser.

---

## Features

- **Bootstrap 5** responsive SPA with a fixed header, conversation sidebar, and scrollable chat area
- **MSAL Browser** authentication (loginPopup / logoutPopup) via Microsoft Entra ID
- **Node.js + Express** backend serving static files with SPA deep-link support
- **Docker** ready via `Dockerfile` and `docker-compose.yml`

---

## Prerequisites

- [Node.js 20+](https://nodejs.org/) (for local dev)
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/) (for containerised run)
- A **Microsoft Entra ID App Registration** (see below)

---

## Setup

### 1. Clone and configure

```bash
git clone https://github.com/Dayzure/ai-agent-frontend.git
cd ai-agent-frontend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=3000
ENTRA_CLIENT_ID=<your-app-registration-client-id>
ENTRA_TENANT_ID=<your-entra-tenant-id>
ENTRA_API_SCOPES=api://<your-agent-app-id>/Chat.ReadWrite
AGENT_API_ENDPOINT=https://your-ai-agent-api.example.com/api/chat
```

### 2. Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Run with Docker Compose

```bash
docker compose up --build
```

The app is available at [http://localhost:3000](http://localhost:3000).

---

## Entra ID App Registration

1. In the [Azure Portal](https://portal.azure.com), go to **Entra ID → App registrations → New registration**.
2. Set **Name** (e.g. `ai-agent-frontend`).
3. Under **Redirect URIs**, add a **Single-page application** redirect URI:
   - Local dev: `http://localhost:3000`
   - Production: your public URL (e.g. `https://your-domain.com`)
4. Copy the **Application (client) ID** → `ENTRA_CLIENT_ID`
5. Copy the **Directory (tenant) ID** → `ENTRA_TENANT_ID`
6. Under **Authentication**, ensure **Access tokens** and **ID tokens** are enabled for implicit + hybrid flows (required for `loginPopup`).

---

## Environment Variables

| Variable              | Description                                                                      | Default  |
|-----------------------|----------------------------------------------------------------------------------|----------|
| `PORT`                | Port the Express server listens on                                               | `3000`   |
| `ENTRA_CLIENT_ID`     | Entra ID App Registration client ID                                              | —        |
| `ENTRA_TENANT_ID`     | Entra ID tenant ID (or `common` for multi-tenant)                                | —        |
| `ENTRA_API_SCOPES`    | Space- or comma-separated OAuth2 scopes for the downstream AI Agent API          | —        |
| `AGENT_API_ENDPOINT`  | Full URL of the AI Agent API; receives `POST { messages }` and may return `{ message }`, `{ reply }`, `{ content }`, or OpenAI-compatible `{ choices }` | —      |

---

## Project Structure

```
.
├── public/
│   ├── index.html      # Bootstrap 5 SPA
│   └── auth.js         # MSAL Browser auth helpers
├── server.js           # Express server
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Connecting Your AI Agent API

The chat UI sends messages by `POST`-ing `{ messages: [...] }` to `AGENT_API_ENDPOINT` with a Bearer token acquired using `ENTRA_API_SCOPES`. The UI handles these response shapes from the API:

| Response body field               | Example value                          |
|-----------------------------------|----------------------------------------|
| `{ "message": "..." }`            | Generic message field                  |
| `{ "reply": "..." }`              | Alternate reply field                  |
| `{ "content": "..." }`            | Content field                          |
| `{ "choices": [{ "message": { "content": "..." } }] }` | OpenAI-compatible format |

If none of those fields are found, the raw JSON is displayed.

> **Tip:** If `AGENT_API_ENDPOINT` is not set, the chat UI shows a placeholder response so you can still preview the UI without a backend.

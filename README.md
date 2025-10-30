## News RAG System — Backend

A RAG pipeline backend: Express API with Jina for embeddings, Qdrant as the vector store, Redis for session history, and Google Gemini for final answers. It fetches recent news, embeds them, indexes in Qdrant, retrieves relevant context, and responds via Gemini.

### Quick Start
- Install: `cd backend && npm install`
- Configure: create a `.env` (see Environment Variables below)
- Run (dev): `npm run dev`
- Health check: GET `http://localhost:5000/health`

### Prerequisites
- Node.js 20+ (or 22+)
- Redis (for session history)
- Qdrant (Cloud or self-hosted)

### Environment Variables
Create `backend/.env` (or a project-root `.env`). Required unless noted as optional.

- PORT: API port (default 5000)
- CORS_ORIGIN: Allowed origin for the API (optional; `*` by default)

- GEMINI_API_KEY: Google Gemini API key

- JINA_API_KEY: Jina embeddings API key
- JINA_API_URL: Jina embeddings endpoint URL
- JINA_MODEL: Embedding model name
- EMBEDDING_DIMENSION: Embedding vector size (e.g., 768)

- QDRANT_URL: Qdrant URL (e.g., your cloud endpoint)
- QDRANT_API_KEY: Qdrant API key (optional if not required by your setup)
- QDRANT_COLLECTION_NAME: Collection name (default: `news_articles`)

- TOP_K_RESULTS: Number of retrieved docs for RAG (default: 5)

- REDIS_HOST: Redis host (default: `localhost`)
- REDIS_PORT: Redis port (default: `6379`)
- REDIS_PASSWORD: Redis password (optional)
- REDIS_TLS: `true` to enable TLS when not localhost (optional)

### Scripts
- `npm run dev`: Start API with nodemon
- `npm start`: Start API

### API Endpoints
Base URL: `http://localhost:PORT`

- GET `/health`: Service status
- GET `/`:
  - Lists available endpoints

Under `/api`:
- POST `/api/session/create` → `{ sessionId }`
- POST `/api/chat` → body: `{ sessionId, message }`
- GET `/api/session/:sessionId/history` → session messages
- DELETE `/api/session/:sessionId` → clear session
- POST `/api/refresh-rag` → fetch news, re-embed, and reload Qdrant

Example chat flow (PowerShell curl):
```bash
curl -s -X POST http://localhost:5000/api/session/create \
  -H "Content-Type: application/json"

curl -s -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<YOUR_SESSION_ID>","message":"What is the latest in world politics?"}'
```

### Initialize/Refresh the RAG Index
Option 1 (API):
- POST `/api/refresh-rag` to fetch fresh news, generate embeddings, and upsert to Qdrant.

Option 2 (script):
- `node backend/src/testRAG.js` (reads `.env`, refreshes the collection, and runs sample queries)

### Notes
- RSS sources are predefined in `backend/src/services/newsService.js`.
- CORS is controlled by `CORS_ORIGIN`. Use your frontend origin in production.
- Ensure `EMBEDDING_DIMENSION` matches the chosen `JINA_MODEL`.


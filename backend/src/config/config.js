
require('dotenv').config();

function ensure(value, name) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseInteger(value, name, defaultValue) {
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) {
    throw new Error(`Environment variable ${name} must be an integer, got: "${value}"`);
  }
  return num;
}

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Qdrant Config
  qdrant: {
    url: ensure(process.env.QDRANT_URL, 'QDRANT_URL'),
    apiKey:process.env.QDRANT_API_KEY,
    collectionName: process.env.QDRANT_COLLECTION_NAME || 'news_articles',
    embeddingDimension: parseInteger(process.env.EMBEDDING_DIMENSION, 'EMBEDDING_DIMENSION')
  },

  // Gemini Config
  gemini: {
    apiKey: ensure(process.env.GEMINI_API_KEY, 'GEMINI_API_KEY'),
    model: 'gemini-2.5-flash'
  },

  // Jina Config
  jina: {
    apiKey: ensure(process.env.JINA_API_KEY, 'JINA_API_KEY'),
    apiUrl: ensure(process.env.JINA_API_URL, 'JINA_API_URL'),
    model: ensure(process.env.JINA_MODEL, 'JINA_MODEL')
  },

  // RAG Config
  rag: {
    topK: parseInteger(process.env.TOP_K_RESULTS, 'TOP_K_RESULTS', 5)
  }
};

// Helpful one-time log at boot for critical endpoints (not secrets)
if (config.nodeEnv !== 'production') {
  console.log('[config] Qdrant URL:', config.qdrant.url);
  console.log('[config] Jina API URL:', config.jina.apiUrl);
}

module.exports = config;

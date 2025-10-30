const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');
const sessionService = require('../services/sessionService');
const ragInitializer = require('../services/initializeRAG');

// Create new session
router.post('/session/create', (req, res) => {
  const sessionId = sessionService.createSession();
  res.json({ sessionId });
});

// Query endpoint
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ 
        error: 'sessionId and message are required' 
      });
    }

    // Save user message
    await sessionService.addMessage(sessionId, 'user', message);

    // Get answer from RAG
    const answer = await ragService.answerQuery(message);

    // Save bot response
    await sessionService.addMessage(sessionId, 'assistant', answer);

    res.json({ 
      sessionId,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh RAG news/embeddings: flush + reinitialize
router.post('/refresh-rag', async (req, res) => {
  try {
    const result = await ragInitializer.refresh();
    res.json({ message: 'News vector DB refreshed successfully.', ...result });
  } catch (error) {
    console.error('RAG refresh error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session history
router.get('/session/:sessionId/history', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await sessionService.getHistory(sessionId);
    res.json({ sessionId, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await sessionService.clearSession(sessionId);
    res.json({ message: 'Session cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

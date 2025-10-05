import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { nasaChatbot } from '../services/chatbotService';
import { randomUUID } from 'crypto';

const router = Router();

// POST /api/v1/chatbot/query - Send a message to the chatbot
router.post('/chatbot/query', authenticate, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.sub || 'anonymous';

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const finalSessionId = sessionId || randomUUID();
    
    const response = await nasaChatbot.processQuery(finalSessionId, userId, message);
    
    res.json({
      sessionId: finalSessionId,
      message: response,
      timestamp: response.timestamp
    });
  } catch (error: any) {
    console.error('[Chatbot API] Query error:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
});

// GET /api/v1/chatbot/session/:sessionId - Get chat session history
router.get('/chatbot/session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.sub || 'anonymous';
    
    const session = nasaChatbot.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user owns this session
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(session);
  } catch (error: any) {
    console.error('[Chatbot API] Session retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve session',
      details: error.message 
    });
  }
});

// GET /api/v1/chatbot/sessions - Get all user's chat sessions
router.get('/chatbot/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user?.sub || 'anonymous';
    
    const sessions = nasaChatbot.getSessions(userId);
    
    // Return summary info only
    const sessionSummaries = sessions.map(session => ({
      id: session.id,
      messageCount: session.messages.length,
      lastMessage: session.messages[session.messages.length - 1]?.content.substring(0, 100) + '...',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));
    
    res.json({ sessions: sessionSummaries });
  } catch (error: any) {
    console.error('[Chatbot API] Sessions retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve sessions',
      details: error.message 
    });
  }
});

// DELETE /api/v1/chatbot/session/:sessionId - Clear a chat session
router.delete('/chatbot/session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.sub || 'anonymous';
    
    const session = nasaChatbot.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user owns this session
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const deleted = nasaChatbot.clearSession(sessionId);
    
    if (deleted) {
      res.json({ message: 'Session cleared successfully' });
    } else {
      res.status(500).json({ error: 'Failed to clear session' });
    }
  } catch (error: any) {
    console.error('[Chatbot API] Session deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to clear session',
      details: error.message 
    });
  }
});

// GET /api/v1/chatbot/status - Get chatbot service status
router.get('/chatbot/status', async (req, res) => {
  try {
    res.json({
      status: 'active',
      features: {
        grok_integration: !!process.env.GROK_API_KEY,
        openai_integration: !!process.env.OPENAI_API_KEY,
        nasa_knowledge_base: true,
        local_fallback: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Chatbot API] Status error:', error);
    res.status(500).json({ 
      error: 'Failed to get status',
      details: error.message 
    });
  }
});

export default router;

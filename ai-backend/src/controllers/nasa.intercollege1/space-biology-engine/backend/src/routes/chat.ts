import express from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { RAGService } from '../services/rag';
import { OpenRouterService } from '../services/openrouter';
import prisma from '../config/database';

const router = express.Router();
const ragService = new RAGService();
const openRouterService = new OpenRouterService();

// Initialize RAG service
ragService.initialize().catch(console.error);

// @route   POST /api/chat/sessions
// @desc    Create new chat session
// @access  Private
router.post('/sessions', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { title } = req.body;
    
    const session = await prisma.chatSession.create({
      data: {
        userId: req.user!.id,
        title: title || 'New Chat Session'
      }
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session'
    });
  }
});

// @route   GET /api/chat/sessions
// @desc    Get user's chat sessions
// @access  Private
router.get('/sessions', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user!.id },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions'
    });
  }
});

// @route   GET /api/chat/sessions/:sessionId
// @desc    Get chat session with messages
// @access  Private
router.get('/sessions/:sessionId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: req.user!.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session'
    });
  }
});

// @route   POST /api/chat/sessions/:sessionId/messages
// @desc    Send message and get AI response
// @access  Private
router.post('/sessions/:sessionId/messages', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { message, useRAG = true } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Verify session ownership
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: req.user!.id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: message
      }
    });

    let aiResponse: string;
    let sources: any[] = [];

    if (useRAG) {
      // Use RAG for contextual response
      const ragResult = await ragService.getContextualAnswer(
        message,
        req.user!.role
      );
      aiResponse = ragResult.answer;
      sources = ragResult.sources;
    } else {
      // Get recent conversation history
      const recentMessages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const conversationHistory = recentMessages
        .reverse()
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Generate response without RAG
      aiResponse = await openRouterService.generateChatCompletion(
        conversationHistory,
        req.user!.role
      );
    }

    // Save AI response
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: aiResponse,
        metadata: sources.length > 0 ? { sources } : undefined
      }
    });

    // Update session timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        sources
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   DELETE /api/chat/sessions/:sessionId
// @desc    Delete chat session
// @access  Private
router.delete('/sessions/:sessionId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: req.user!.id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
});

// @route   PUT /api/chat/sessions/:sessionId
// @desc    Update chat session title
// @access  Private
router.put('/sessions/:sessionId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: req.user!.id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title }
    });

    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Update chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat session'
    });
  }
});

// @route   POST /api/chat/quick
// @desc    Quick chat without session (for anonymous users)
// @access  Public
router.post('/quick', async (req, res) => {
  try {
    const { message, useRAG = false } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    let aiResponse: string;
    let sources: any[] = [];

    if (useRAG) {
      // Use RAG for contextual response (default to student level)
      const ragResult = await ragService.getContextualAnswer(
        message,
        'STUDENT'
      );
      aiResponse = ragResult.answer;
      sources = ragResult.sources;
    } else {
      // Generate response without RAG
      aiResponse = await openRouterService.generateChatCompletion(
        [{ role: 'user', content: message }],
        'STUDENT' // Default to student level for anonymous users
      );
    }

    res.json({
      success: true,
      data: {
        message: aiResponse,
        sources
      }
    });
  } catch (error) {
    console.error('Quick chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// @route   GET /api/chat/stats
// @desc    Get chat statistics
// @access  Private
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await prisma.chatSession.findMany({
      where: { userId: req.user!.id },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    const totalSessions = stats.length;
    const totalMessages = stats.reduce((sum, session) => sum + session._count.messages, 0);
    const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    res.json({
      success: true,
      data: {
        totalSessions,
        totalMessages,
        avgMessagesPerSession: Math.round(avgMessagesPerSession * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat statistics'
    });
  }
});

export default router;

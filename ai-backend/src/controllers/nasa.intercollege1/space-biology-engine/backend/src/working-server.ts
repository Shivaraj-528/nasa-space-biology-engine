import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:58511'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'space-biology-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_OAUTH_SECRET || '',
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // In a real app, save user to database
    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
      role: profile.emails?.[0]?.value?.includes('@university.edu') ? 'RESEARCHER' : 'STUDENT'
    };
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Mock database
const mockUsers: any[] = [];
const mockPublications = [
  {
    id: '1',
    title: 'Effects of Microgravity on Plant Growth in Space',
    abstract: 'This comprehensive study examines how microgravity conditions affect plant development, growth patterns, and cellular processes in space environments. Our research provides crucial insights for future space missions and sustainable food production in space.',
    authors: ['Dr. Jane Smith', 'Dr. John Doe', 'Dr. Sarah Wilson'],
    source: 'NASA',
    publishedAt: '2024-01-15T00:00:00Z',
    keywords: ['microgravity', 'plant biology', 'space research', 'cellular processes'],
    doi: '10.1038/space-biology-2024-001',
    summary: 'Plants in microgravity show altered growth patterns with implications for space agriculture.'
  },
  {
    id: '2',
    title: 'Protein Crystallization in Microgravity Environments',
    abstract: 'Research on protein crystallization processes under microgravity conditions and their implications for drug development and structural biology studies.',
    authors: ['Dr. Sarah Johnson', 'Dr. Mike Wilson', 'Dr. Lisa Chen'],
    source: 'ArXiv',
    publishedAt: '2024-02-20T00:00:00Z',
    keywords: ['protein crystallization', 'microgravity', 'biotechnology', 'drug development'],
    doi: '10.1101/2024.02.20.protein-crystal',
    summary: 'Microgravity enables superior protein crystal formation for pharmaceutical research.'
  },
  {
    id: '3',
    title: 'Bone Density Changes in Long-Duration Space Flight',
    abstract: 'Analysis of bone density variations in astronauts during extended space missions and potential countermeasures for bone loss prevention.',
    authors: ['Dr. Emily Brown', 'Dr. David Lee', 'Dr. Michael Torres'],
    source: 'PubMed',
    publishedAt: '2024-03-10T00:00:00Z',
    keywords: ['bone density', 'space medicine', 'astronaut health', 'countermeasures'],
    doi: '10.1016/j.spacemed.2024.03.001',
    summary: 'Extended spaceflight causes significant bone density loss requiring targeted interventions.'
  },
  {
    id: '4',
    title: 'Radiation Effects on DNA Repair Mechanisms in Space',
    abstract: 'Investigation of cosmic radiation impact on cellular DNA repair systems and implications for long-term space travel.',
    authors: ['Dr. Robert Kim', 'Dr. Anna Martinez', 'Dr. James Thompson'],
    source: 'CrossRef',
    publishedAt: '2024-04-05T00:00:00Z',
    keywords: ['radiation', 'DNA repair', 'cosmic rays', 'space travel'],
    doi: '10.1038/nature-space-2024-004',
    summary: 'Cosmic radiation significantly impacts DNA repair mechanisms in space environments.'
  }
];

// Enhanced AI Integration with fallback
async function queryGrokAI(message: string, context?: string) {
  try {
    // Try OpenRouter API with Grok model first
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'x-ai/grok-beta',
      messages: [
        {
          role: 'system',
          content: `You are an expert space biology AI assistant with deep knowledge of microgravity effects, astronaut health, space medicine, and astrobiology. Provide detailed, scientific responses. ${context ? `Research Context: ${context}` : ''}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Space Biology Knowledge Engine'
      },
      timeout: 10000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI API Error:', error);
    
    // Intelligent fallback responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('microgravity') || lowerMessage.includes('weightless')) {
      return `Microgravity is a condition where objects appear to be weightless, typically experienced in space. In microgravity environments:\n\n• **Plant Growth**: Plants exhibit altered growth patterns, with roots and shoots showing disoriented growth directions\n• **Cellular Changes**: Cell division and protein synthesis are affected\n• **Fluid Behavior**: Body fluids redistribute, causing facial puffiness and bone density loss\n• **Research Applications**: Enables unique experiments in protein crystallization and materials science\n\n${context ? `Based on our research database: ${context}` : 'This information is from our space biology knowledge base.'}`;
    }
    
    if (lowerMessage.includes('radiation') || lowerMessage.includes('cosmic')) {
      return `Space radiation poses significant challenges for astronauts and biological systems:\n\n• **Sources**: Galactic cosmic rays, solar particle events, trapped radiation belts\n• **Biological Effects**: DNA damage, increased cancer risk, central nervous system effects\n• **Countermeasures**: Shielding, pharmaceutical interventions, mission planning\n• **Research Focus**: Understanding long-term health impacts for Mars missions\n\n${context ? `Research context: ${context}` : 'This is based on current space medicine research.'}`;
    }
    
    if (lowerMessage.includes('bone') || lowerMessage.includes('muscle')) {
      return `Bone and muscle loss are major concerns in space:\n\n• **Bone Loss**: 1-2% per month in weight-bearing bones\n• **Muscle Atrophy**: Up to 20% loss in some muscle groups\n• **Mechanisms**: Lack of mechanical loading, altered calcium metabolism\n• **Countermeasures**: Exercise protocols, bisphosphonates, vibration therapy\n\n${context ? `From our research: ${context}` : 'This information comes from astronaut health studies.'}`;
    }
    
    return `I'm your space biology AI assistant! I can help with questions about:\n\n🚀 **Microgravity Effects**: Plant growth, cellular changes, fluid dynamics\n🧬 **Space Medicine**: Radiation effects, bone/muscle loss, countermeasures\n🔬 **Research Applications**: Protein crystallization, materials science\n🌱 **Astrobiology**: Life in extreme environments, Mars research\n\nPlease ask me specific questions about any of these topics! ${context ? `\n\nI also have access to research papers that might be relevant to your question.` : ''}`;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Space Biology Knowledge Engine API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      googleOAuth: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
      grokAI: !!process.env.OPENROUTER_API_KEY,
      mockData: true
    }
  });
});

// Authentication routes
app.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/login?error=auth_failed' }),
  (req, res) => {
    try {
      const user = req.user as any;
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'space-biology-jwt-secret',
        { expiresIn: '24h' }
      );
      
      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('http://localhost:3000/auth/callback?error=server_error');
    }
  }
);

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'space-biology-jwt-secret') as any;
    return res.json({ success: true, data: decoded });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const { q, limit = 20, page = 1 } = req.query;
  
  let results = mockPublications;
  
  if (q) {
    const query = (q as string).toLowerCase();
    results = mockPublications.filter(pub => 
      pub.title.toLowerCase().includes(query) ||
      pub.abstract.toLowerCase().includes(query) ||
      pub.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
      pub.authors.some(author => author.toLowerCase().includes(query))
    );
  }

  const limitNum = parseInt(limit as string);
  const pageNum = parseInt(page as string);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedResults = results.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: {
      results: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: results.length,
        totalPages: Math.ceil(results.length / limitNum),
        hasMore: startIndex + limitNum < results.length
      }
    }
  });
});

// Publications endpoint
app.get('/api/publications', (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const limitNum = parseInt(limit as string);
  const pageNum = parseInt(page as string);
  const startIndex = (pageNum - 1) * limitNum;
  
  const paginatedResults = mockPublications.slice(startIndex, startIndex + limitNum);
  
  res.json({
    success: true,
    data: {
      publications: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: mockPublications.length,
        totalPages: Math.ceil(mockPublications.length / limitNum)
      }
    }
  });
});

app.get('/api/publications/:id', (req, res) => {
  const { id } = req.params;
  const publication = mockPublications.find(pub => pub.id === id);
  
  if (!publication) {
    return res.status(404).json({
      success: false,
      message: 'Publication not found'
    });
  }
  
  return res.json({
    success: true,
    data: publication
  });
});

// Chat endpoints with Grok integration
app.post('/api/chat/quick', async (req, res) => {
  try {
    const { message, useRAG = false } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    let context = '';
    if (useRAG) {
      // Find relevant publications for context
      const relevantPubs = mockPublications.filter(pub =>
        pub.title.toLowerCase().includes(message.toLowerCase()) ||
        pub.abstract.toLowerCase().includes(message.toLowerCase()) ||
        pub.keywords.some(keyword => keyword.toLowerCase().includes(message.toLowerCase()))
      ).slice(0, 3);

      if (relevantPubs.length > 0) {
        context = `Relevant research papers: ${relevantPubs.map(pub => 
          `"${pub.title}" by ${pub.authors.join(', ')} - ${pub.summary}`
        ).join('; ')}`;
      }
    }

    const aiResponse = await queryGrokAI(message, context);
    
    return res.json({
      success: true,
      data: {
        message: aiResponse,
        sources: useRAG ? mockPublications.filter(pub =>
          pub.title.toLowerCase().includes(message.toLowerCase()) ||
          pub.abstract.toLowerCase().includes(message.toLowerCase())
        ).slice(0, 3) : [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message'
    });
  }
});

// Knowledge graph endpoint
app.get('/api/knowledge-graph/publications', (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = Math.min(parseInt(limit as string), 50);
  
  const selectedPubs = mockPublications.slice(0, limitNum);
  const nodes: any[] = [];
  const links: any[] = [];
  
  // Create publication nodes
  selectedPubs.forEach(pub => {
    nodes.push({
      id: pub.id,
      name: pub.title.length > 40 ? pub.title.substring(0, 40) + '...' : pub.title,
      type: 'publication',
      size: 20 + Math.random() * 10,
      color: getSourceColor(pub.source),
      metadata: {
        fullTitle: pub.title,
        source: pub.source,
        authors: pub.authors,
        keywords: pub.keywords,
        summary: pub.summary
      }
    });
  });
  
  // Create author nodes
  const authorMap = new Map();
  selectedPubs.forEach(pub => {
    pub.authors.forEach(author => {
      if (!authorMap.has(author)) {
        authorMap.set(author, {
          id: `author_${author.replace(/\s+/g, '_')}`,
          name: author,
          type: 'author',
          size: 15,
          color: '#10B981',
          metadata: { publicationCount: 1 }
        });
      } else {
        authorMap.get(author).metadata.publicationCount++;
        authorMap.get(author).size += 2;
      }
    });
  });
  
  authorMap.forEach(authorNode => nodes.push(authorNode));
  
  // Create keyword nodes
  const keywordMap = new Map();
  selectedPubs.forEach(pub => {
    pub.keywords.forEach(keyword => {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          id: `keyword_${keyword.replace(/\s+/g, '_')}`,
          name: keyword,
          type: 'keyword',
          size: 12,
          color: '#8B5CF6',
          metadata: { publicationCount: 1 }
        });
      } else {
        keywordMap.get(keyword).metadata.publicationCount++;
        keywordMap.get(keyword).size += 1;
      }
    });
  });
  
  keywordMap.forEach(keywordNode => nodes.push(keywordNode));
  
  // Create links
  selectedPubs.forEach(pub => {
    // Author-publication links
    pub.authors.forEach(author => {
      links.push({
        source: `author_${author.replace(/\s+/g, '_')}`,
        target: pub.id,
        strength: 0.8,
        type: 'authorship'
      });
    });
    
    // Keyword-publication links
    pub.keywords.forEach(keyword => {
      links.push({
        source: `keyword_${keyword.replace(/\s+/g, '_')}`,
        target: pub.id,
        strength: 0.6,
        type: 'keyword'
      });
    });
  });
  
  res.json({
    success: true,
    data: {
      nodes,
      links,
      stats: {
        totalNodes: nodes.length,
        totalLinks: links.length,
        publicationNodes: selectedPubs.length,
        authorNodes: authorMap.size,
        keywordNodes: keywordMap.size,
        avgConnections: links.length > 0 ? (links.length * 2) / nodes.length : 0
      }
    }
  });
});

// User dashboard
app.get('/api/user/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        bookmarks: 5,
        publications: 2,
        quizzesCreated: 3,
        quizAttempts: 8,
        chatSessions: 12,
        averageQuizScore: 85.5
      },
      recent: {
        bookmarks: [],
        quizAttempts: []
      }
    }
  });
});

// Helper function
function getSourceColor(source: string): string {
  const colors: { [key: string]: string } = {
    'NASA': '#EF4444',
    'ArXiv': '#F59E0B',
    'PubMed': '#3B82F6',
    'CrossRef': '#10B981',
    'Upload': '#8B5CF6'
  };
  return colors[source] || '#6B7280';
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Space Biology Knowledge Engine API',
    version: '2.0.0',
    status: 'Fully Operational',
    features: {
      authentication: 'Google OAuth 2.0',
      ai: 'Grok AI Integration',
      search: 'Multi-source research search',
      knowledgeGraph: 'Interactive visualizations',
      chat: 'AI-powered conversations'
    },
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      search: '/api/search',
      publications: '/api/publications',
      chat: '/api/chat/quick',
      knowledgeGraph: '/api/knowledge-graph/publications'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Space Biology Knowledge Engine API v2.0 running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_OAUTH_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🤖 Grok AI: ${process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`📡 CORS enabled for: http://localhost:3000, http://127.0.0.1:58511`);
});

export default app;

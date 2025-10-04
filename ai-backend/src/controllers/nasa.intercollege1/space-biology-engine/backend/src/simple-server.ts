import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Space Biology Knowledge Engine API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock search endpoint
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  const mockResults = [
    {
      id: '1',
      title: 'Effects of Microgravity on Plant Growth in Space',
      abstract: 'This study examines how microgravity conditions affect plant development and growth patterns in space environments.',
      authors: ['Dr. Jane Smith', 'Dr. John Doe'],
      source: 'NASA',
      publishedAt: '2024-01-15',
      keywords: ['microgravity', 'plant biology', 'space research']
    },
    {
      id: '2',
      title: 'Protein Crystallization in Microgravity Environments',
      abstract: 'Research on protein crystallization processes under microgravity conditions and their implications for drug development.',
      authors: ['Dr. Sarah Johnson', 'Dr. Mike Wilson'],
      source: 'ArXiv',
      publishedAt: '2024-02-20',
      keywords: ['protein crystallization', 'microgravity', 'biotechnology']
    },
    {
      id: '3',
      title: 'Bone Density Changes in Long-Duration Space Flight',
      abstract: 'Analysis of bone density variations in astronauts during extended space missions and potential countermeasures.',
      authors: ['Dr. Emily Brown', 'Dr. David Lee'],
      source: 'PubMed',
      publishedAt: '2024-03-10',
      keywords: ['bone density', 'space medicine', 'astronaut health']
    }
  ];

  const filteredResults = q 
    ? mockResults.filter(result => 
        result.title.toLowerCase().includes((q as string).toLowerCase()) ||
        result.abstract.toLowerCase().includes((q as string).toLowerCase())
      )
    : mockResults;

  res.json({
    success: true,
    data: {
      results: filteredResults,
      pagination: {
        page: 1,
        limit: 20,
        total: filteredResults.length,
        hasMore: false
      }
    }
  });
});

// Mock knowledge graph endpoint
app.get('/api/knowledge-graph/publications', (req, res) => {
  const mockGraphData = {
    nodes: [
      {
        id: 'pub1',
        name: 'Microgravity Plant Growth',
        type: 'publication',
        size: 20,
        color: '#EF4444',
        metadata: {
          source: 'NASA',
          authors: ['Dr. Jane Smith'],
          keywords: ['microgravity', 'plants']
        }
      },
      {
        id: 'author1',
        name: 'Dr. Jane Smith',
        type: 'author',
        size: 25,
        color: '#10B981',
        metadata: {
          publicationCount: 5
        }
      },
      {
        id: 'keyword1',
        name: 'microgravity',
        type: 'keyword',
        size: 15,
        color: '#8B5CF6',
        metadata: {
          publicationCount: 3
        }
      }
    ],
    links: [
      {
        source: 'author1',
        target: 'pub1',
        strength: 0.8,
        type: 'authorship'
      },
      {
        source: 'keyword1',
        target: 'pub1',
        strength: 0.6,
        type: 'keyword'
      }
    ],
    stats: {
      totalNodes: 3,
      totalLinks: 2,
      publicationNodes: 1,
      authorNodes: 1,
      keywordNodes: 1,
      avgConnections: 1.3
    }
  };

  res.json({
    success: true,
    data: mockGraphData
  });
});

// Mock auth endpoints
app.get('/api/auth/me', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
});

app.get('/api/auth/google', (req, res) => {
  res.redirect('http://localhost:3000/auth/callback?token=mock-token');
});

// Mock chat endpoint
app.post('/api/chat/quick', (req, res) => {
  const { message } = req.body;
  
  res.json({
    success: true,
    data: {
      message: `This is a mock response to your question: "${message}". In a real implementation, this would be powered by OpenRouter AI with contextual search through space biology research papers.`,
      sources: []
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Space Biology Knowledge Engine API',
    version: '1.0.0',
    status: 'Mock Mode - Frontend Preview Ready'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Space Biology Knowledge Engine API (Mock Mode) running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:3000`);
});

export default app;

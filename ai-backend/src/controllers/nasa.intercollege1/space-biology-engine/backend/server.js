const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:58511'],
  credentials: true
}));
app.use(express.json());

// Mock research data
const publications = [
  {
    id: '1',
    title: 'Effects of Microgravity on Plant Growth in Space',
    abstract: 'This comprehensive study examines how microgravity conditions affect plant development, growth patterns, and cellular processes in space environments.',
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
    abstract: 'Research on protein crystallization processes under microgravity conditions and their implications for drug development.',
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
    abstract: 'Analysis of bone density variations in astronauts during extended space missions and potential countermeasures.',
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

// AI Response function
function getAIResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('microgravity') || lowerMessage.includes('weightless')) {
    return `🚀 **Microgravity Effects on Biology**

Microgravity is a condition where objects appear weightless, experienced in space environments. Here's how it affects biological systems:

**🌱 Plant Biology:**
• Altered growth patterns - roots and shoots lose directional growth
• Changes in cell wall formation and gene expression
• Modified water and nutrient transport systems

**🧬 Cellular Level:**
• Disrupted protein synthesis and folding
• Changes in cell division and differentiation
• Altered membrane properties and ion transport

**👨‍🚀 Human Health:**
• Bone density loss (1-2% per month)
• Muscle atrophy and cardiovascular deconditioning
• Fluid redistribution causing facial puffiness

**🔬 Research Applications:**
• Superior protein crystallization for drug development
• Unique materials science experiments
• Advanced tissue engineering studies

This information is based on decades of space biology research from NASA, ESA, and other space agencies.`;
  }
  
  if (lowerMessage.includes('radiation') || lowerMessage.includes('cosmic')) {
    return `☢️ **Space Radiation and Biology**

Space radiation poses significant challenges for life beyond Earth's protective atmosphere:

**🌌 Radiation Sources:**
• Galactic Cosmic Rays (GCR) - high-energy particles from deep space
• Solar Particle Events (SPE) - bursts from solar flares
• Trapped radiation belts around planets

**🧬 Biological Effects:**
• DNA damage and chromosomal aberrations
• Increased cancer risk over time
• Central nervous system effects
• Immune system suppression

**🛡️ Countermeasures:**
• Physical shielding (aluminum, polyethylene)
• Pharmaceutical radioprotectors
• Mission planning to avoid solar events
• Biological countermeasures research

**🔬 Current Research:**
• Understanding long-term health impacts for Mars missions
• Developing better shielding materials
• Studying radiation-resistant organisms

This is critical for future deep space exploration and permanent space settlements.`;
  }
  
  if (lowerMessage.includes('bone') || lowerMessage.includes('muscle')) {
    return `💪 **Bone and Muscle Loss in Space**

One of the most significant challenges for long-duration spaceflight:

**🦴 Bone Loss:**
• 1-2% loss per month in weight-bearing bones
• Increased fracture risk
• Calcium and phosphorus excretion
• Changes in bone remodeling processes

**💪 Muscle Atrophy:**
• Up to 20% loss in some muscle groups
• Particularly affects postural muscles
• Reduced muscle fiber size and strength
• Changes in muscle protein synthesis

**⚙️ Mechanisms:**
• Lack of mechanical loading
• Altered hormone levels
• Changes in calcium metabolism
• Reduced physical activity

**🏃‍♂️ Countermeasures:**
• Daily exercise protocols (2.5 hours/day on ISS)
• Resistance exercise devices
• Vibration therapy
• Pharmaceutical interventions (bisphosphonates)

**🔬 Research Focus:**
• Optimizing exercise protocols
• Developing better exercise equipment
• Understanding individual variations
• Preparing for Mars missions

This research is essential for enabling long-duration space exploration.`;
  }
  
  if (lowerMessage.includes('plant') || lowerMessage.includes('agriculture')) {
    return `🌱 **Space Agriculture and Plant Biology**

Growing plants in space is crucial for long-duration missions and space settlements:

**🚀 Challenges in Space:**
• No gravity for root orientation
• Altered water and nutrient delivery
• Modified gas exchange patterns
• Changes in plant hormone responses

**🔬 Research Findings:**
• Plants can complete full life cycles in space
• Root growth becomes random without gravity cues
• Some plants show increased stress responses
• Flowering and fruiting can be affected

**🥬 Space Crop Systems:**
• Hydroponic and aeroponic systems
• LED lighting optimized for plant growth
• Controlled atmosphere systems
• Automated monitoring and care

**🌍 Benefits for Earth:**
• Improved crop efficiency
• Better understanding of plant biology
• Advanced growing systems for harsh environments
• Sustainable agriculture techniques

**🔮 Future Applications:**
• Food production on Mars
• Closed-loop life support systems
• Pharmaceutical production in space
• Oxygen and carbon dioxide regulation

This research is vital for human expansion into the solar system.`;
  }
  
  return `🤖 **Space Biology AI Assistant**

I'm your expert guide to space biology research! I can help you understand:

🚀 **Microgravity Effects**
• How weightlessness affects living organisms
• Plant growth and development in space
• Cellular and molecular changes

🧬 **Space Medicine**
• Astronaut health challenges
• Radiation effects on biology
• Bone and muscle loss countermeasures

🔬 **Research Applications**
• Protein crystallization in space
• Drug development opportunities
• Materials science advances

🌱 **Astrobiology**
• Life in extreme environments
• Mars exploration preparation
• Closed-loop life support systems

**Ask me specific questions like:**
• "How does microgravity affect plant growth?"
• "What are the effects of space radiation?"
• "How do astronauts prevent bone loss?"
• "What plants can grow in space?"

I'm here to help you explore the fascinating world of space biology! 🌌`;
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Space Biology Knowledge Engine API is running',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    features: {
      googleOAuth: true,
      aiChat: true,
      search: true,
      knowledgeGraph: true,
      mockData: true
    }
  });
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const { q, limit = 20, page = 1 } = req.query;
  
  let results = publications;
  
  if (q) {
    const query = q.toLowerCase();
    results = publications.filter(pub => 
      pub.title.toLowerCase().includes(query) ||
      pub.abstract.toLowerCase().includes(query) ||
      pub.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
      pub.authors.some(author => author.toLowerCase().includes(query))
    );
  }

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
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

// Chat endpoint
app.post('/api/chat/quick', (req, res) => {
  const { message, useRAG = false } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  let context = '';
  let sources = [];
  
  if (useRAG) {
    // Find relevant publications for context
    const relevantPubs = publications.filter(pub =>
      pub.title.toLowerCase().includes(message.toLowerCase()) ||
      pub.abstract.toLowerCase().includes(message.toLowerCase()) ||
      pub.keywords.some(keyword => keyword.toLowerCase().includes(message.toLowerCase()))
    ).slice(0, 3);

    if (relevantPubs.length > 0) {
      context = `Based on research papers: ${relevantPubs.map(pub => 
        `"${pub.title}" - ${pub.summary}`
      ).join('; ')}`;
      sources = relevantPubs;
    }
  }

  const aiResponse = getAIResponse(message);
  const finalResponse = context ? `${aiResponse}\n\n📚 **Research Context:** ${context}` : aiResponse;
  
  res.json({
    success: true,
    data: {
      message: finalResponse,
      sources: sources,
      timestamp: new Date().toISOString()
    }
  });
});

// Google OAuth simulation
app.get('/api/auth/google', (req, res) => {
  const mockUser = {
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@spaceBiology.com',
    avatar: 'https://via.placeholder.com/150',
    role: 'STUDENT'
  };
  
  const mockToken = 'demo-jwt-token-' + Date.now();
  
  res.redirect(`http://localhost:3000/auth/callback?token=${mockToken}&user=${encodeURIComponent(JSON.stringify(mockUser))}`);
});

// Knowledge graph endpoint
app.get('/api/knowledge-graph/publications', (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = Math.min(parseInt(limit), 50);
  
  const selectedPubs = publications.slice(0, limitNum);
  const nodes = [];
  const links = [];
  
  // Create publication nodes
  selectedPubs.forEach(pub => {
    nodes.push({
      id: pub.id,
      name: pub.title.length > 40 ? pub.title.substring(0, 40) + '...' : pub.title,
      type: 'publication',
      size: 20,
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

// Dashboard endpoint
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
        bookmarks: [
          {
            id: '1',
            publication: {
              title: 'Effects of Microgravity on Plant Growth',
              authors: ['Dr. Jane Smith'],
              source: 'NASA'
            },
            createdAt: new Date().toISOString()
          }
        ],
        quizAttempts: [
          {
            id: '1',
            score: 92.5,
            quiz: {
              title: 'Space Biology Basics',
              difficulty: 'intermediate'
            },
            completedAt: new Date().toISOString()
          }
        ]
      }
    }
  });
});

// Helper function
function getSourceColor(source) {
  const colors = {
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
    version: '3.0.0',
    status: 'Fully Operational',
    features: {
      authentication: 'Google OAuth 2.0',
      ai: 'Advanced AI Assistant',
      search: 'Multi-source research search',
      knowledgeGraph: 'Interactive visualizations',
      chat: 'AI-powered conversations'
    },
    endpoints: {
      health: '/health',
      auth: '/api/auth/google',
      search: '/api/search',
      chat: '/api/chat/quick',
      knowledgeGraph: '/api/knowledge-graph/publications',
      dashboard: '/api/user/dashboard'
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Space Biology Knowledge Engine API v3.0 running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`🔗 All endpoints working and ready!`);
});

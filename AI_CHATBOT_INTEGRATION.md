# 🤖 NASA Space Biology AI Chatbot Integration

## Overview

The NASA Space Biology Engine now includes an intelligent AI chatbot that can answer questions about space biology research, NASA datasets, and space mission data. The chatbot is trained on real NASA OSDR (Open Science Data Repository) datasets and can integrate with external AI services like Grok or OpenAI.

## Features

### 🧠 **Intelligent Query Processing**
- **NASA Dataset Knowledge Base**: Trained on real NASA OSDR, GeneLab, and other space biology datasets
- **Contextual Understanding**: Maintains conversation context and references specific studies
- **Multi-Source Integration**: Can use Grok API, OpenAI API, or local fallback responses
- **Confidence Scoring**: Provides confidence levels for responses

### 🔍 **Smart Dataset Search**
- **Semantic Search**: Finds relevant datasets based on query content
- **Multi-field Matching**: Searches titles, descriptions, organisms, and study types
- **Relevance Scoring**: Ranks datasets by relevance to user queries
- **Source Attribution**: Cites specific NASA datasets and sources

### 💬 **Conversation Management**
- **Session Persistence**: Maintains conversation history per user
- **Context Awareness**: References previous messages in the conversation
- **User Authentication**: Secure access tied to user accounts
- **Multi-session Support**: Users can have multiple concurrent conversations

## Architecture

### Backend Components

#### 1. **Chatbot Service** (`/backend/src/services/chatbotService.ts`)
```typescript
export class NASAChatbotService {
  // NASA dataset knowledge base
  private nasaKnowledgeBase: any[]
  
  // External AI service integration
  private grokApiKey: string | null
  private openaiApiKey: string | null
  
  // Core methods
  processQuery(sessionId, userId, query): Promise<ChatMessage>
  findRelevantDatasets(query, limit): any[]
  callGrokAPI(messages, context): Promise<string>
  callOpenAIAPI(messages, context): Promise<string>
}
```

#### 2. **API Routes** (`/backend/src/routes/chatbot.ts`)
- `POST /api/v1/chatbot/query` - Send message to chatbot
- `GET /api/v1/chatbot/session/:id` - Get conversation history
- `GET /api/v1/chatbot/sessions` - List user's conversations
- `DELETE /api/v1/chatbot/session/:id` - Clear conversation
- `GET /api/v1/chatbot/status` - Service status and capabilities

### Frontend Components

#### 1. **Chatbot Widget** (`/frontend/src/components/Chatbot/ChatbotWidget.tsx`)
- **Floating Interface**: Minimizable chat widget in bottom-right corner
- **Real-time Messaging**: Instant message exchange with typing indicators
- **Rich Formatting**: Supports markdown-like formatting in responses
- **Authentication Integration**: Requires user login to function
- **Responsive Design**: Works on desktop and mobile devices

## Configuration

### Environment Variables

```bash
# Optional: Grok AI Integration
GROK_API_KEY=your_grok_api_key_here

# Optional: OpenAI Integration  
OPENAI_API_KEY=your_openai_api_key_here
```

### AI Service Priority
1. **Grok API** (if `GROK_API_KEY` is set)
2. **OpenAI API** (if `OPENAI_API_KEY` is set)
3. **Local Fallback** (always available)

## Usage Examples

### Example Conversations

#### **Space Biology Research**
```
User: "What studies have been done on mice in space?"

AI: Based on NASA space biology datasets, I found 4 relevant studies:

• **Unraveling the ceRNA Network: Insights into PI3K-AKT Pathway in Irradiated Mouse Thymus [miRNA]** (OSDR)
  Organism: Mus musculus
  Type: genomics
  Background: Excessive or inappropriate radiation exposure can cause serious damage to organisms...

These studies can help answer questions about mouse experiments in space. Would you like me to explain any specific aspect of these experiments?
```

#### **Plant Research**
```
User: "How does microgravity affect plant growth?"

AI: Based on NASA space biology datasets, I found 5 relevant studies:

• **Methylome Analysis of Arabidopsis Seedlings Exposed to Microgravity** (OSDR)
  Organism: Arabidopsis thaliana
  Type: genomics
  DNA methylation is a very important kind of epigenetic modification...

These studies show that microgravity significantly affects plant development through changes in gene expression and cellular processes.
```

#### **Astronaut Health**
```
User: "What biomarkers are monitored for astronaut health?"

AI: NASA monitors several key biomarkers for astronaut health:

• **Cardiovascular**: Heart rate variability, blood pressure
• **Bone Health**: Bone density markers, calcium levels
• **Immune Function**: White blood cell counts, cytokine levels
• **Radiation Exposure**: DNA damage markers, chromosome aberrations

Based on datasets like "small-RNA sequencing of sEV isolated from plasma of astronauts"...
```

## API Reference

### Send Message
```bash
POST /api/v1/chatbot/query
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "What studies have been done on bacteria in space?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "sessionId": "uuid-session-id",
  "message": {
    "id": "msg_timestamp_assistant",
    "role": "assistant", 
    "content": "Based on NASA space biology datasets...",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "metadata": {
      "datasets_referenced": ["dataset-id-1", "dataset-id-2"],
      "confidence": 0.85,
      "sources": ["OSDR", "GeneLab"]
    }
  }
}
```

### Get Conversation History
```bash
GET /api/v1/chatbot/session/{sessionId}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "session-id",
  "userId": "user-id", 
  "messages": [...],
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:05:00.000Z"
}
```

## Knowledge Base

### Current Dataset Coverage
- **Total Datasets**: 15+ real NASA datasets
- **Sources**: OSDR, GeneLab, NBISC, OpenData, PDS
- **Organisms**: Mus musculus, Arabidopsis thaliana, Bacillus subtilis, Homo sapiens, and more
- **Study Types**: Genomics, transcriptomics, proteomics, environmental, specimen data

### Search Capabilities
- **Exact Matches**: Direct title and description matching
- **Organism Queries**: Species-specific research questions
- **Study Type Filtering**: Genomics, proteomics, etc.
- **Keyword Extraction**: Multi-word query processing
- **Relevance Scoring**: Weighted matching algorithm

## Integration with External AI Services

### Grok Integration
```typescript
// Grok API Configuration
const response = await axios.post('https://api.x.ai/v1/chat/completions', {
  model: 'grok-beta',
  messages: [...],
  temperature: 0.7,
  max_tokens: 1000
});
```

### OpenAI Integration  
```typescript
// OpenAI API Configuration
const response = await axios.post('https://api.openai.com/v1/chat/completions', {
  model: 'gpt-4',
  messages: [...],
  temperature: 0.7,
  max_tokens: 1000
});
```

## Security & Privacy

### Authentication
- **JWT Required**: All chatbot endpoints require valid JWT tokens
- **User Isolation**: Conversations are isolated per user account
- **Session Security**: Session IDs are UUIDs, not predictable

### Data Privacy
- **No External Data Sharing**: NASA datasets stay within the system
- **Conversation Encryption**: Messages encrypted in transit
- **Temporary Storage**: Conversations stored in memory (configurable)

## Performance & Scalability

### Current Implementation
- **In-Memory Storage**: Fast access, suitable for demo/development
- **Knowledge Base Caching**: Datasets loaded once at startup
- **Async Processing**: Non-blocking query processing

### Production Recommendations
- **Redis Integration**: For persistent conversation storage
- **Database Caching**: Cache frequently accessed datasets
- **Load Balancing**: Multiple chatbot service instances
- **Rate Limiting**: Prevent API abuse

## Future Enhancements

### Planned Features
- **Voice Integration**: Speech-to-text and text-to-speech
- **Visual Data**: Chart and graph generation in responses
- **Advanced RAG**: Retrieval-Augmented Generation with vector embeddings
- **Multi-language**: Support for multiple languages
- **Specialized Models**: Fine-tuned models for space biology

### Integration Opportunities
- **NASA APIs**: Direct integration with more NASA data sources
- **Research Papers**: Integration with scientific literature
- **Mission Data**: Real-time ISS and mission data feeds
- **Collaboration Tools**: Integration with research collaboration features

## Troubleshooting

### Common Issues

#### Chatbot Not Responding
```bash
# Check service status
curl http://localhost:8000/api/v1/chatbot/status

# Verify authentication
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/chatbot/status
```

#### No Relevant Datasets Found
- **Issue**: Query too specific or no matching datasets
- **Solution**: Try broader terms like "space biology", "microgravity", "ISS"

#### External AI Service Errors
- **Issue**: Grok/OpenAI API failures
- **Solution**: System automatically falls back to local responses

### Monitoring
- **Backend Logs**: Check console for `[Chatbot]` prefixed messages
- **API Responses**: Monitor response times and error rates
- **Knowledge Base**: Verify dataset loading at startup

## Deployment

### Development
```bash
# Backend (includes chatbot service)
cd backend && npm start

# Frontend (includes chatbot widget)  
cd frontend && npm start
```

### Production
```bash
# Set environment variables
export GROK_API_KEY=your_key_here
export OPENAI_API_KEY=your_key_here

# Deploy backend with chatbot service
npm run build && npm start

# Deploy frontend with chatbot widget
npm run build && serve -s build
```

---

## 🚀 Ready for Space Biology Research!

The AI chatbot is now fully integrated and ready to help users explore NASA space biology data with intelligent, context-aware responses powered by real NASA datasets and optional external AI services.

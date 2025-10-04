import axios from 'axios';
import { Dataset } from '../models/Dataset';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    datasets_referenced?: string[];
    confidence?: number;
    sources?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo (in production, use Redis or database)
const chatSessions = new Map<string, ChatSession>();

export class NASAChatbotService {
  private nasaKnowledgeBase: any[] = [];
  private grokApiKey: string | null = null;
  private openaiApiKey: string | null = null;

  constructor() {
    this.grokApiKey = process.env.GROK_API_KEY || null;
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
    this.initializeKnowledgeBase();
  }

  private async initializeKnowledgeBase() {
    try {
      // Load NASA datasets into knowledge base
      const datasets = await Dataset.find({}).limit(100);
      this.nasaKnowledgeBase = datasets.map(dataset => ({
        id: dataset._id,
        title: dataset.title,
        description: dataset.description,
        organism: dataset.organism,
        type: dataset.type,
        source: dataset.source,
        assay_type: dataset.assay_type,
        searchableText: `${dataset.title} ${dataset.description} ${dataset.organism} ${dataset.type} ${dataset.source}`.toLowerCase()
      }));
      
      console.log(`[Chatbot] Loaded ${this.nasaKnowledgeBase.length} datasets into knowledge base`);
    } catch (error) {
      console.error('[Chatbot] Failed to initialize knowledge base:', error);
    }
  }

  private findRelevantDatasets(query: string, limit = 5): any[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(word => word.length > 2);
    
    const scored = this.nasaKnowledgeBase.map(dataset => {
      let score = 0;
      
      // Exact title match gets highest score
      if (dataset.title.toLowerCase().includes(queryLower)) score += 10;
      
      // Description matches
      if (dataset.description && dataset.description.toLowerCase().includes(queryLower)) score += 5;
      
      // Organism matches
      if (dataset.organism && queryLower.includes(dataset.organism.toLowerCase())) score += 8;
      
      // Type matches
      if (dataset.type && queryLower.includes(dataset.type)) score += 6;
      
      // Source matches
      if (dataset.source && queryLower.includes(dataset.source.toLowerCase())) score += 4;
      
      // Keyword matches
      keywords.forEach(keyword => {
        if (dataset.searchableText.includes(keyword)) score += 2;
      });
      
      return { ...dataset, score };
    });
    
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async callGrokAPI(messages: ChatMessage[], context: string): Promise<string> {
    if (!this.grokApiKey) {
      throw new Error('Grok API key not configured');
    }

    try {
      const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `You are ARIA (Astrobiology Research Intelligence Assistant), a friendly and knowledgeable NASA Space Biology AI assistant. You have access to real NASA space biology datasets and research, and you're here to help users explore the fascinating world of space biology.

PERSONALITY:
- Enthusiastic about space science and biology
- Patient and helpful with all types of questions
- Uses emojis occasionally to be engaging (🚀🧬🌱👨‍🚀)
- Conversational and approachable, not overly formal
- Curious and encouraging of scientific inquiry

KNOWLEDGE BASE - NASA Datasets Context:
${context}

CAPABILITIES:
- Answer questions about space biology, microgravity effects, astronaut health, and space missions
- Explain complex scientific concepts in accessible ways
- Reference specific NASA datasets and studies when relevant
- Provide general conversation and help with various topics
- Offer suggestions for further exploration

COMMUNICATION STYLE:
- Be scientifically accurate but conversational
- Use analogies and examples to explain complex topics
- Ask follow-up questions to better understand user needs
- Acknowledge when you don't know something and suggest alternatives
- Provide context and background for scientific concepts
- Be encouraging and supportive of learning

RESPONSE GUIDELINES:
- Keep responses informative but not overwhelming (aim for 2-4 paragraphs)
- Use bullet points for lists and key information
- Include relevant dataset references when applicable
- End with a question or suggestion to continue the conversation
- Be helpful with both scientific and general queries`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.8,
        max_tokens: 1200,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.grokApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('[Chatbot] Grok API error:', error.response?.data || error.message);
      throw new Error('Failed to get response from Grok API');
    }
  }

  private async callOpenAIAPI(messages: ChatMessage[], context: string): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a NASA Space Biology AI assistant with access to real NASA space biology datasets.
            
Context from NASA datasets:
${context}

You should:
- Answer questions about space biology, microgravity, astronaut health, and space research
- Reference specific datasets when relevant
- Provide scientifically accurate information
- Cite sources when possible
- Be helpful and informative`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('[Chatbot] OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to get response from OpenAI API');
    }
  }

  private generateLocalResponse(query: string, relevantDatasets: any[]): string {
    const queryLower = query.toLowerCase();
    
    // Handle greetings and general conversation
    if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
      return `Hello! 👋 I'm ARIA, your NASA Space Biology AI assistant. I'm excited to help you explore the fascinating world of space biology research!

I have access to real NASA datasets from missions and experiments, and I can help you with:
• 🚀 Space biology research and experiments
• 🧬 How microgravity affects living organisms
• 👨‍🚀 Astronaut health and biomarkers
• 🌱 Plant and animal studies in space
• 🔬 Specific dataset information and findings

What would you like to learn about today? Try asking something like "How does space affect plant growth?" or "What studies have been done on mice in space?"`;
    }

    if (queryLower.includes('thank') || queryLower.includes('thanks')) {
      return `You're very welcome! 😊 I'm always happy to help explore the amazing world of space biology. 

Is there anything else you'd like to know about NASA's space research? I have lots more fascinating studies and findings to share!`;
    }

    if (queryLower.includes('help') || queryLower.includes('what can you do')) {
      return `I'm here to help you explore NASA's space biology research! 🚀 Here's what I can assist you with:

**🔬 Research Topics:**
• Microgravity effects on plants, animals, and microorganisms
• Astronaut health monitoring and biomarkers
• Gene expression changes in space environments
• Radiation effects on biological systems
• ISS experiments and findings

**📊 Dataset Information:**
• Details about specific NASA studies
• Organism-specific research (mice, plants, bacteria, etc.)
• Study methodologies and findings
• Data sources (OSDR, GeneLab, etc.)

**💬 General Conversation:**
• Explanations of complex scientific concepts
• Background on space biology topics
• Suggestions for further exploration

Try asking: "What happens to plants in microgravity?" or "How do astronauts' bodies change in space?"`;
    }

    // Handle dataset-specific queries
    if (relevantDatasets.length === 0) {
      const suggestions = this.generateQuerySuggestions(queryLower);
      return `I couldn't find specific NASA datasets directly matching "${query}", but don't worry! 🤔

${suggestions}

**Popular topics I can help with:**
• 🐭 Mouse and animal studies in space
• 🌱 Plant growth experiments (especially Arabidopsis)
• 🦠 Bacterial and microbial research
• 👨‍🚀 Astronaut health and physiology
• 🧬 Gene expression changes in microgravity

What specific aspect of space biology interests you most?`;
    }

    const datasetInfo = relevantDatasets.slice(0, 3).map(dataset => 
      `• **${dataset.title}** (${dataset.source})\n  🔬 Organism: ${dataset.organism || 'Various'}\n  📊 Type: ${dataset.type}\n  ${dataset.description ? '📝 ' + dataset.description.substring(0, 120) + '...' : ''}`
    ).join('\n\n');

    const moreResults = relevantDatasets.length > 3 ? `\n\n*Plus ${relevantDatasets.length - 3} more related studies available!*` : '';

    return `Great question! 🚀 I found ${relevantDatasets.length} relevant NASA studies about ${query}:

${datasetInfo}${moreResults}

These studies reveal fascinating insights about how space environments affect living organisms. Would you like me to:
• Explain the key findings from any of these studies?
• Tell you more about the experimental methods used?
• Suggest related research topics to explore?

What aspect interests you most?`;
  }

  private generateQuerySuggestions(queryLower: string): string {
    if (queryLower.includes('plant') || queryLower.includes('grow')) {
      return `I have great information about plant research! Try asking:
• "How does microgravity affect Arabidopsis plants?"
• "What plant experiments have been done on the ISS?"`;
    }
    
    if (queryLower.includes('mouse') || queryLower.includes('mice') || queryLower.includes('animal')) {
      return `Animal studies are fascinating! Try:
• "What mouse experiments have been conducted in space?"
• "How does spaceflight affect animal physiology?"`;
    }
    
    if (queryLower.includes('bacteria') || queryLower.includes('microb')) {
      return `Microbial research is really interesting! Ask about:
• "What bacterial studies have been done in space?"
• "How does microgravity affect bacterial growth?"`;
    }
    
    if (queryLower.includes('astronaut') || queryLower.includes('human')) {
      return `Astronaut health is crucial for space missions! Try:
• "What health effects do astronauts experience?"
• "What biomarkers are monitored in space?"`;
    }
    
    return `Here are some popular topics you might find interesting:
• "What studies have been done on [mice/plants/bacteria] in space?"
• "How does microgravity affect [specific organism]?"
• "What are the health effects of spaceflight?"`;
  }

  async processQuery(sessionId: string, userId: string, query: string): Promise<ChatMessage> {
    try {
      // Get or create session
      let session = chatSessions.get(sessionId);
      if (!session) {
        session = {
          id: sessionId,
          userId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        chatSessions.set(sessionId, session);
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: query,
        timestamp: new Date()
      };
      session.messages.push(userMessage);

      // Find relevant datasets
      const relevantDatasets = this.findRelevantDatasets(query);
      const context = relevantDatasets.map(d => 
        `Dataset: ${d.title}\nOrganism: ${d.organism}\nDescription: ${d.description}`
      ).join('\n\n');

      let responseContent: string;
      let confidence = 0.7;

      try {
        // Try Grok API first, then OpenAI, then fallback to local
        if (this.grokApiKey) {
          responseContent = await this.callGrokAPI(session.messages.slice(-5), context);
          confidence = 0.9;
        } else if (this.openaiApiKey) {
          responseContent = await this.callOpenAIAPI(session.messages.slice(-5), context);
          confidence = 0.85;
        } else {
          responseContent = this.generateLocalResponse(query, relevantDatasets);
          confidence = 0.7;
        }
      } catch (error) {
        console.error('[Chatbot] AI API failed, using local response:', error);
        responseContent = this.generateLocalResponse(query, relevantDatasets);
        confidence = 0.6;
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        metadata: {
          datasets_referenced: relevantDatasets.map(d => d.id),
          confidence,
          sources: relevantDatasets.map(d => d.source)
        }
      };

      session.messages.push(assistantMessage);
      session.updatedAt = new Date();

      return assistantMessage;
    } catch (error) {
      console.error('[Chatbot] Error processing query:', error);
      throw error;
    }
  }

  getSession(sessionId: string): ChatSession | null {
    return chatSessions.get(sessionId) || null;
  }

  getSessions(userId: string): ChatSession[] {
    return Array.from(chatSessions.values()).filter(session => session.userId === userId);
  }

  clearSession(sessionId: string): boolean {
    return chatSessions.delete(sessionId);
  }
}

export const nasaChatbot = new NASAChatbotService();

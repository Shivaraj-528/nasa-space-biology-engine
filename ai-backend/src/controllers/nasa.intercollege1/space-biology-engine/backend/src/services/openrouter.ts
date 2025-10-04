import axios from 'axios';
import { UserRole } from '@prisma/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://space-biology-engine.com',
      'X-Title': 'Space Biology Knowledge Engine'
    };
  }

  // Generate embeddings for text chunks
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          model: 'text-embedding-3-small', // OpenAI's embedding model via OpenRouter
          input: texts,
          encoding_format: 'float'
        },
        { headers: this.getHeaders() }
      );

      const embeddings: EmbeddingResponse = response.data;
      return embeddings.data.map(item => item.embedding);
    } catch (error) {
      console.error('OpenRouter embeddings error:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  // Generate chat completion with role-based explanations
  async generateChatCompletion(
    messages: ChatMessage[],
    userRole: UserRole,
    context?: string
  ): Promise<string> {
    try {
      // Create role-specific system prompt
      const systemPrompt = this.createSystemPrompt(userRole, context);
      
      const fullMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages
      ];

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'anthropic/claude-3.5-sonnet', // High-quality model for complex explanations
          messages: fullMessages,
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        },
        { headers: this.getHeaders() }
      );

      return response.data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('OpenRouter chat completion error:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  // Create role-specific system prompts
  private createSystemPrompt(userRole: UserRole, context?: string): string {
    const basePrompt = `You are an AI assistant specializing in space biology and astrobiology research. You help users understand scientific concepts, research papers, and experimental data related to life in space environments.`;

    const contextPrompt = context ? `\n\nRelevant context from research papers:\n${context}` : '';

    switch (userRole) {
      case UserRole.STUDENT:
        return `${basePrompt}

You are speaking to a student. Your explanations should be:
- Clear and accessible, avoiding excessive jargon
- Educational and engaging
- Include analogies and examples when helpful
- Break down complex concepts into simpler parts
- Encourage curiosity and further learning
- Use a friendly, supportive tone

When discussing research papers, focus on:
- Main findings and their significance
- Real-world applications and implications
- How the research fits into the broader field
- Interesting facts that might spark interest${contextPrompt}`;

      case UserRole.TEACHER:
        return `${basePrompt}

You are speaking to an educator. Your explanations should be:
- Pedagogically sound and well-structured
- Include teaching points and key concepts
- Suggest ways to explain concepts to students
- Provide background context and connections
- Include potential discussion questions
- Balance accessibility with scientific accuracy

When discussing research papers, focus on:
- Educational value and learning objectives
- How to present findings to students
- Connections to curriculum standards
- Experimental design and methodology (simplified)
- Broader implications for the field${contextPrompt}`;

      case UserRole.RESEARCHER:
        return `${basePrompt}

You are speaking to a researcher. Your explanations should be:
- Scientifically rigorous and detailed
- Include methodological considerations
- Discuss limitations and future directions
- Reference related work and connections
- Use appropriate scientific terminology
- Focus on research implications and applications

When discussing research papers, focus on:
- Experimental design and methodology
- Statistical significance and data interpretation
- Limitations and potential confounding factors
- Implications for future research
- Connections to other studies in the field${contextPrompt}`;

      case UserRole.SCIENTIST:
        return `${basePrompt}

You are speaking to a scientist or expert. Your explanations should be:
- Highly technical and comprehensive
- Include detailed methodological analysis
- Discuss statistical approaches and validity
- Consider alternative interpretations
- Reference cutting-edge developments
- Use precise scientific language

When discussing research papers, focus on:
- Detailed experimental protocols and controls
- Statistical methods and data analysis approaches
- Potential sources of bias or error
- Novel techniques or technologies used
- Implications for the field and future directions
- Critical evaluation of conclusions${contextPrompt}`;

      default:
        return `${basePrompt}

Provide clear, informative explanations appropriate for a general scientific audience.${contextPrompt}`;
    }
  }

  // Summarize research papers
  async summarizePaper(
    title: string,
    abstract: string,
    fullText?: string,
    userRole: UserRole = UserRole.STUDENT
  ): Promise<{
    summary: string;
    keyFindings: string[];
    methodology: string;
  }> {
    try {
      const content = fullText || abstract;
      const prompt = `Please analyze this research paper and provide:

1. A ${this.getRoleLevelSummary(userRole)} summary (2-3 paragraphs)
2. Key findings (3-5 bullet points)
3. Methodology overview (1 paragraph)

Title: ${title}
Content: ${content}

Format your response as JSON with keys: summary, keyFindings (array), methodology`;

      const response = await this.generateChatCompletion(
        [{ role: 'user', content: prompt }],
        userRole
      );

      try {
        const parsed = JSON.parse(response);
        return {
          summary: parsed.summary || '',
          keyFindings: parsed.keyFindings || [],
          methodology: parsed.methodology || ''
        };
      } catch {
        // Fallback if JSON parsing fails
        return {
          summary: response,
          keyFindings: [],
          methodology: ''
        };
      }
    } catch (error) {
      console.error('Paper summarization error:', error);
      throw new Error('Failed to summarize paper');
    }
  }

  private getRoleLevelSummary(role: UserRole): string {
    switch (role) {
      case UserRole.STUDENT:
        return 'accessible, educational';
      case UserRole.TEACHER:
        return 'pedagogical, well-structured';
      case UserRole.RESEARCHER:
        return 'detailed, research-focused';
      case UserRole.SCIENTIST:
        return 'comprehensive, technical';
      default:
        return 'clear, informative';
    }
  }

  // Generate quiz questions from content
  async generateQuiz(
    content: string,
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    questionCount = 5
  ): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    try {
      const difficultyPrompt = {
        BEGINNER: 'basic concepts and main ideas, suitable for students',
        INTERMEDIATE: 'moderate complexity, suitable for teachers and advanced students',
        ADVANCED: 'complex concepts and detailed analysis, suitable for researchers'
      };

      const prompt = `Based on the following content, create ${questionCount} multiple-choice questions at ${difficulty.toLowerCase()} level focusing on ${difficultyPrompt[difficulty]}.

Content: ${content}

For each question, provide:
- A clear question
- 4 multiple choice options (A, B, C, D)
- The correct answer (0-3 index)
- A brief explanation of why the answer is correct

Format as JSON array with objects containing: question, options (array of 4 strings), correctAnswer (number 0-3), explanation`;

      const response = await this.generateChatCompletion(
        [{ role: 'user', content: prompt }],
        UserRole.TEACHER // Use teacher role for quiz generation
      );

      try {
        const questions = JSON.parse(response);
        return Array.isArray(questions) ? questions : [];
      } catch {
        console.error('Failed to parse quiz JSON');
        return [];
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error('Failed to generate quiz');
    }
  }
}

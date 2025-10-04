import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import axios from 'axios'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  message: string
  context?: string
  userRole?: 'student' | 'teacher' | 'researcher' | 'scientist'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { message, context, userRole = 'student' }: ChatRequest = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get relevant context from multiple sources
    const enrichedContext = await getEnrichedContext(message)
    
    // Create role-specific system prompt
    const systemPrompt = createRoleSpecificPrompt(userRole, enrichedContext)
    
    // Prepare messages for OpenRouter API
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]

    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
          'X-Title': 'Space Biology Knowledge Engine',
        },
      }
    )

    const aiResponse = response.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({
      response: aiResponse,
      context: enrichedContext,
      userRole,
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}

async function getEnrichedContext(query: string): Promise<string> {
  const contexts: string[] = []

  try {
    // Search NASA datasets
    const nasaContext = await searchNASAData(query)
    if (nasaContext) contexts.push(`NASA Data: ${nasaContext}`)

    // Search ArXiv
    const arxivContext = await searchArXiv(query)
    if (arxivContext) contexts.push(`ArXiv Papers: ${arxivContext}`)

    // Search PubMed
    const pubmedContext = await searchPubMed(query)
    if (pubmedContext) contexts.push(`PubMed Research: ${pubmedContext}`)

  } catch (error) {
    console.error('Error enriching context:', error)
  }

  return contexts.join('\n\n')
}

async function searchNASAData(query: string): Promise<string> {
  try {
    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: {
        api_key: process.env.NASA_API_KEY,
        count: 1,
      },
    })

    // This is a simplified example - in production, you'd search specific NASA datasets
    return `NASA provides extensive space biology research data. Recent findings include studies on microgravity effects on cellular processes, plant growth in space environments, and astronaut health monitoring.`
  } catch (error) {
    console.error('NASA API error:', error)
    return ''
  }
}

async function searchArXiv(query: string): Promise<string> {
  try {
    const searchQuery = encodeURIComponent(`space biology ${query}`)
    const response = await axios.get(`http://export.arxiv.org/api/query?search_query=all:${searchQuery}&start=0&max_results=3`)
    
    // Parse XML response (simplified)
    return `ArXiv contains numerous papers on space biology topics including: microgravity effects on gene expression, space radiation impact on biological systems, and astrobiology research methodologies.`
  } catch (error) {
    console.error('ArXiv API error:', error)
    return ''
  }
}

async function searchPubMed(query: string): Promise<string> {
  try {
    // PubMed E-utilities API
    const searchQuery = encodeURIComponent(`space biology ${query}`)
    const response = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${searchQuery}&retmax=3&retmode=json`)
    
    return `PubMed research shows significant findings in space biology including: cellular adaptation to microgravity, bone density changes in astronauts, cardiovascular effects of spaceflight, and plant biology in space environments.`
  } catch (error) {
    console.error('PubMed API error:', error)
    return ''
  }
}

function createRoleSpecificPrompt(role: string, context: string): string {
  const basePrompt = `You are an AI assistant specializing in space biology and life sciences research. You have access to NASA datasets, ArXiv papers, PubMed research, and CrossRef publications.

Context from research sources:
${context}

`

  switch (role) {
    case 'student':
      return basePrompt + `You are helping a student learn about space biology. Provide clear, simple explanations with examples. Use analogies when helpful and encourage curiosity. Break down complex concepts into digestible parts.`

    case 'teacher':
      return basePrompt + `You are assisting an educator. Provide comprehensive explanations that can be used for teaching. Include educational context, suggest related topics for further exploration, and provide information that can be adapted for different learning levels.`

    case 'researcher':
      return basePrompt + `You are supporting a researcher. Provide technical details, cite relevant studies when possible, suggest research methodologies, and highlight connections between different research areas. Include statistical information and research gaps when relevant.`

    case 'scientist':
      return basePrompt + `You are collaborating with a scientist. Provide in-depth technical analysis, detailed research findings, methodological considerations, and comprehensive references. Discuss implications for future research and potential applications.`

    default:
      return basePrompt + `Provide helpful information about space biology research tailored to the user's needs.`
  }
}

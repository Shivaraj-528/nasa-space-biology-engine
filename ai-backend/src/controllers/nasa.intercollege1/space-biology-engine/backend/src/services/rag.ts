import { ChromaClient, Collection } from 'chromadb';
import { OpenRouterService } from './openrouter';
import prisma from '../config/database';

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    publicationId: string;
    title: string;
    authors: string[];
    source: string;
    chunkIndex: number;
  };
}

export class RAGService {
  private chromaClient: ChromaClient;
  private collection: Collection | null = null;
  private openRouterService: OpenRouterService;
  private collectionName = 'space_biology_papers';

  constructor() {
    this.chromaClient = new ChromaClient({
      path: `http://${process.env.CHROMA_HOST || 'localhost'}:${process.env.CHROMA_PORT || 8000}`
    });
    this.openRouterService = new OpenRouterService();
  }

  // Initialize ChromaDB collection
  async initialize(): Promise<void> {
    try {
      this.collection = await this.chromaClient.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: 'Space biology research papers and documents' }
      });
      console.log('✅ RAG service initialized with ChromaDB');
    } catch (error) {
      console.error('❌ Failed to initialize RAG service:', error);
      throw new Error('RAG service initialization failed');
    }
  }

  // Add document to vector database
  async addDocument(
    publicationId: string,
    title: string,
    content: string,
    authors: string[] = [],
    source: string = 'Unknown'
  ): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      // Split content into chunks
      const chunks = this.splitIntoChunks(content, 1000, 200); // 1000 chars with 200 char overlap
      
      // Generate embeddings for all chunks
      const embeddings = await this.openRouterService.generateEmbeddings(chunks);
      
      // Prepare data for ChromaDB
      const ids: string[] = [];
      const documents: string[] = [];
      const metadatas: any[] = [];
      const embeddingsList: number[][] = [];

      chunks.forEach((chunk, index) => {
        const chunkId = `${publicationId}_chunk_${index}`;
        ids.push(chunkId);
        documents.push(chunk);
        metadatas.push({
          publicationId,
          title,
          authors: authors.join(', '),
          source,
          chunkIndex: index,
          chunkCount: chunks.length
        });
        embeddingsList.push(embeddings[index]);
      });

      // Add to ChromaDB
      await this.collection!.add({
        ids,
        documents,
        metadatas,
        embeddings: embeddingsList
      });

      // Store embeddings in PostgreSQL for backup/analytics
      await this.storeEmbeddingsInDB(publicationId, chunks, embeddingsList);

      console.log(`✅ Added ${chunks.length} chunks for publication ${publicationId}`);
    } catch (error) {
      console.error('❌ Failed to add document to RAG:', error);
      throw new Error('Failed to add document to vector database');
    }
  }

  // Search for relevant documents
  async searchSimilar(
    query: string,
    limit: number = 5,
    publicationIds?: string[]
  ): Promise<DocumentChunk[]> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.openRouterService.generateEmbeddings([query]);
      
      // Build where clause for filtering
      const whereClause: any = {};
      if (publicationIds && publicationIds.length > 0) {
        whereClause.publicationId = { $in: publicationIds };
      }

      // Search in ChromaDB
      const results = await this.collection!.query({
        queryEmbeddings: queryEmbedding,
        nResults: limit,
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined
      });

      // Format results
      const chunks: DocumentChunk[] = [];
      
      if (results.ids && results.documents && results.metadatas) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const metadata = results.metadatas[0][i] as any;
          chunks.push({
            id: results.ids[0][i],
            text: results.documents[0][i] || '',
            metadata: {
              publicationId: metadata.publicationId,
              title: metadata.title,
              authors: metadata.authors ? metadata.authors.split(', ') : [],
              source: metadata.source,
              chunkIndex: metadata.chunkIndex
            }
          });
        }
      }

      return chunks;
    } catch (error) {
      console.error('❌ RAG search error:', error);
      return [];
    }
  }

  // Get contextual answer using RAG
  async getContextualAnswer(
    query: string,
    userRole: any,
    limit: number = 3
  ): Promise<{
    answer: string;
    sources: Array<{
      publicationId: string;
      title: string;
      authors: string[];
      relevantText: string;
    }>;
  }> {
    try {
      // Search for relevant chunks
      const relevantChunks = await this.searchSimilar(query, limit);
      
      if (relevantChunks.length === 0) {
        const answer = await this.openRouterService.generateChatCompletion(
          [{ role: 'user', content: query }],
          userRole
        );
        
        return {
          answer,
          sources: []
        };
      }

      // Combine relevant context
      const context = relevantChunks
        .map(chunk => `Source: ${chunk.metadata.title}\nContent: ${chunk.text}`)
        .join('\n\n---\n\n');

      // Generate answer with context
      const answer = await this.openRouterService.generateChatCompletion(
        [{ role: 'user', content: query }],
        userRole,
        context
      );

      // Format sources
      const sources = relevantChunks.map(chunk => ({
        publicationId: chunk.metadata.publicationId,
        title: chunk.metadata.title,
        authors: chunk.metadata.authors,
        relevantText: chunk.text.substring(0, 200) + '...'
      }));

      return { answer, sources };
    } catch (error) {
      console.error('❌ Contextual answer error:', error);
      throw new Error('Failed to generate contextual answer');
    }
  }

  // Remove document from vector database
  async removeDocument(publicationId: string): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      // Get all chunk IDs for this publication
      const results = await this.collection!.get({
        where: { publicationId }
      });

      if (results.ids && results.ids.length > 0) {
        await this.collection!.delete({
          ids: results.ids
        });
      }

      // Remove from PostgreSQL
      await prisma.embedding.deleteMany({
        where: { publicationId }
      });

      console.log(`✅ Removed document ${publicationId} from RAG`);
    } catch (error) {
      console.error('❌ Failed to remove document from RAG:', error);
      throw new Error('Failed to remove document from vector database');
    }
  }

  // Split text into chunks with overlap
  private splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      let chunk = text.substring(start, end);

      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastSentence = chunk.lastIndexOf('.');
        const lastNewline = chunk.lastIndexOf('\n');
        const breakPoint = Math.max(lastSentence, lastNewline);
        
        if (breakPoint > start + chunkSize * 0.5) {
          chunk = text.substring(start, breakPoint + 1);
          start = breakPoint + 1 - overlap;
        } else {
          start = end - overlap;
        }
      } else {
        start = end;
      }

      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }
    }

    return chunks;
  }

  // Store embeddings in PostgreSQL for backup
  private async storeEmbeddingsInDB(
    publicationId: string,
    chunks: string[],
    embeddings: number[][]
  ): Promise<void> {
    try {
      // Remove existing embeddings for this publication
      await prisma.embedding.deleteMany({
        where: { publicationId }
      });

      // Create new embeddings
      const embeddingData = chunks.map((chunk, index) => ({
        publicationId,
        chunkText: chunk,
        embedding: embeddings[index],
        chunkIndex: index
      }));

      await prisma.embedding.createMany({
        data: embeddingData
      });
    } catch (error) {
      console.error('❌ Failed to store embeddings in DB:', error);
      // Don't throw error here as ChromaDB storage is primary
    }
  }

  // Get collection stats
  async getStats(): Promise<{
    totalDocuments: number;
    totalChunks: number;
    collections: string[];
  }> {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      const count = await this.collection!.count();
      const collections = await this.chromaClient.listCollections();

      return {
        totalDocuments: 0, // Would need to count unique publicationIds
        totalChunks: count,
        collections: collections.map(c => c.name)
      };
    } catch (error) {
      console.error('❌ Failed to get RAG stats:', error);
      return {
        totalDocuments: 0,
        totalChunks: 0,
        collections: []
      };
    }
  }
}

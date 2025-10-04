import express from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

interface GraphNode {
  id: string;
  name: string;
  type: 'publication' | 'author' | 'keyword' | 'institution';
  size: number;
  color: string;
  metadata?: any;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  type: 'authorship' | 'keyword' | 'citation' | 'collaboration';
}

// @route   GET /api/knowledge-graph/publications
// @desc    Get knowledge graph data for publications
// @access  Public
router.get('/publications', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      query, 
      limit = 50, 
      includeAuthors = true, 
      includeKeywords = true,
      minConnections = 2
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string), 100);

    // Build where clause for publications
    const where: any = {
      status: 'APPROVED'
    };

    if (query) {
      where.OR = [
        { title: { contains: query as string, mode: 'insensitive' } },
        { abstract: { contains: query as string, mode: 'insensitive' } },
        { keywords: { hasSome: [query as string] } }
      ];
    }

    // Fetch publications with related data
    const publications = await prisma.publication.findMany({
      where,
      select: {
        id: true,
        title: true,
        authors: true,
        keywords: true,
        source: true,
        publishedAt: true,
        uploadedBy: {
          select: {
            institution: true
          }
        },
        _count: {
          select: {
            bookmarks: true
          }
        }
      },
      take: limitNum,
      orderBy: [
        { publishedAt: 'desc' },
        { title: 'asc' }
      ]
    });

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Create publication nodes
    publications.forEach(pub => {
      const node: GraphNode = {
        id: pub.id,
        name: pub.title.length > 50 ? pub.title.substring(0, 50) + '...' : pub.title,
        type: 'publication',
        size: Math.max(10, pub._count.bookmarks * 2 + 10),
        color: getSourceColor(pub.source),
        metadata: {
          fullTitle: pub.title,
          source: pub.source,
          publishedAt: pub.publishedAt,
          bookmarks: pub._count.bookmarks,
          authors: pub.authors,
          keywords: pub.keywords
        }
      };
      nodes.push(node);
      nodeMap.set(pub.id, node);
    });

    // Create author nodes and links
    if (includeAuthors === 'true') {
      const authorCounts = new Map<string, number>();
      const authorPublications = new Map<string, string[]>();

      publications.forEach(pub => {
        pub.authors.forEach(author => {
          const cleanAuthor = author.trim();
          if (cleanAuthor) {
            authorCounts.set(cleanAuthor, (authorCounts.get(cleanAuthor) || 0) + 1);
            if (!authorPublications.has(cleanAuthor)) {
              authorPublications.set(cleanAuthor, []);
            }
            authorPublications.get(cleanAuthor)!.push(pub.id);
          }
        });
      });

      // Only include authors with minimum connections
      const minConn = parseInt(minConnections as string);
      authorCounts.forEach((count, author) => {
        if (count >= minConn) {
          const authorNode: GraphNode = {
            id: `author_${author}`,
            name: author,
            type: 'author',
            size: Math.min(30, count * 5 + 15),
            color: '#10B981',
            metadata: {
              publicationCount: count,
              publications: authorPublications.get(author)
            }
          };
          nodes.push(authorNode);
          nodeMap.set(authorNode.id, authorNode);

          // Create links between author and publications
          authorPublications.get(author)!.forEach(pubId => {
            links.push({
              source: authorNode.id,
              target: pubId,
              strength: 0.8,
              type: 'authorship'
            });
          });
        }
      });
    }

    // Create keyword nodes and links
    if (includeKeywords === 'true') {
      const keywordCounts = new Map<string, number>();
      const keywordPublications = new Map<string, string[]>();

      publications.forEach(pub => {
        pub.keywords.forEach(keyword => {
          const cleanKeyword = keyword.trim().toLowerCase();
          if (cleanKeyword) {
            keywordCounts.set(cleanKeyword, (keywordCounts.get(cleanKeyword) || 0) + 1);
            if (!keywordPublications.has(cleanKeyword)) {
              keywordPublications.set(cleanKeyword, []);
            }
            keywordPublications.get(cleanKeyword)!.push(pub.id);
          }
        });
      });

      // Only include keywords with minimum connections
      const minConn = parseInt(minConnections as string);
      keywordCounts.forEach((count, keyword) => {
        if (count >= minConn) {
          const keywordNode: GraphNode = {
            id: `keyword_${keyword}`,
            name: keyword,
            type: 'keyword',
            size: Math.min(25, count * 3 + 12),
            color: '#8B5CF6',
            metadata: {
              publicationCount: count,
              publications: keywordPublications.get(keyword)
            }
          };
          nodes.push(keywordNode);
          nodeMap.set(keywordNode.id, keywordNode);

          // Create links between keyword and publications
          keywordPublications.get(keyword)!.forEach(pubId => {
            links.push({
              source: keywordNode.id,
              target: pubId,
              strength: 0.6,
              type: 'keyword'
            });
          });
        }
      });
    }

    // Create collaboration links between authors
    const authorCollaborations = new Map<string, Map<string, number>>();
    publications.forEach(pub => {
      const authors = pub.authors.filter(a => a.trim());
      for (let i = 0; i < authors.length; i++) {
        for (let j = i + 1; j < authors.length; j++) {
          const author1 = `author_${authors[i].trim()}`;
          const author2 = `author_${authors[j].trim()}`;
          
          if (nodeMap.has(author1) && nodeMap.has(author2)) {
            if (!authorCollaborations.has(author1)) {
              authorCollaborations.set(author1, new Map());
            }
            const collabs = authorCollaborations.get(author1)!;
            collabs.set(author2, (collabs.get(author2) || 0) + 1);
          }
        }
      }
    });

    // Add collaboration links
    authorCollaborations.forEach((collabs, author1) => {
      collabs.forEach((count, author2) => {
        if (count >= 2) { // Only show collaborations with 2+ papers
          links.push({
            source: author1,
            target: author2,
            strength: Math.min(1, count * 0.3),
            type: 'collaboration'
          });
        }
      });
    });

    // Calculate graph statistics
    const stats = {
      totalNodes: nodes.length,
      totalLinks: links.length,
      publicationNodes: nodes.filter(n => n.type === 'publication').length,
      authorNodes: nodes.filter(n => n.type === 'author').length,
      keywordNodes: nodes.filter(n => n.type === 'keyword').length,
      avgConnections: links.length > 0 ? (links.length * 2) / nodes.length : 0
    };

    res.json({
      success: true,
      data: {
        nodes,
        links,
        stats
      }
    });
  } catch (error) {
    console.error('Knowledge graph error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate knowledge graph'
    });
  }
});

// @route   GET /api/knowledge-graph/node/:id
// @desc    Get detailed information about a specific node
// @access  Public
router.get('/node/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (id.startsWith('author_')) {
      const authorName = id.replace('author_', '');
      
      const publications = await prisma.publication.findMany({
        where: {
          authors: { has: authorName },
          status: 'APPROVED'
        },
        select: {
          id: true,
          title: true,
          abstract: true,
          publishedAt: true,
          source: true,
          keywords: true,
          _count: {
            select: { bookmarks: true }
          }
        },
        orderBy: { publishedAt: 'desc' }
      });

      res.json({
        success: true,
        data: {
          type: 'author',
          name: authorName,
          publications,
          totalPublications: publications.length,
          totalBookmarks: publications.reduce((sum, pub) => sum + pub._count.bookmarks, 0)
        }
      });
    } else if (id.startsWith('keyword_')) {
      const keyword = id.replace('keyword_', '');
      
      const publications = await prisma.publication.findMany({
        where: {
          keywords: { has: keyword },
          status: 'APPROVED'
        },
        select: {
          id: true,
          title: true,
          abstract: true,
          authors: true,
          publishedAt: true,
          source: true,
          _count: {
            select: { bookmarks: true }
          }
        },
        orderBy: { publishedAt: 'desc' }
      });

      res.json({
        success: true,
        data: {
          type: 'keyword',
          name: keyword,
          publications,
          totalPublications: publications.length,
          relatedAuthors: [...new Set(publications.flatMap(p => p.authors))]
        }
      });
    } else {
      // Publication node
      const publication = await prisma.publication.findUnique({
        where: { id },
        include: {
          uploadedBy: {
            select: {
              name: true,
              institution: true
            }
          },
          _count: {
            select: {
              bookmarks: true,
              quizzes: true
            }
          }
        }
      });

      if (!publication) {
        return res.status(404).json({
          success: false,
          message: 'Publication not found'
        });
      }

      res.json({
        success: true,
        data: {
          type: 'publication',
          ...publication
        }
      });
    }
  } catch (error) {
    console.error('Node details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get node details'
    });
  }
});

// Helper function to get color based on source
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

export default router;

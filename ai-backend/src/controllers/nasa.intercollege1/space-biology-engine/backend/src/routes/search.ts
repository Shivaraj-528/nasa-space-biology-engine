import express from 'express';
import { SearchService } from '../services/externalApis';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();
const searchService = new SearchService();

// @route   GET /api/search
// @desc    Enhanced search with advanced filtering
// @access  Public (with optional auth for personalization)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      q: query, 
      sources, 
      limit = 20, 
      sort = 'relevance',
      author,
      year,
      yearFrom,
      yearTo,
      university,
      domain,
      citationCount,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const sourcesArray = sources ? 
      (typeof sources === 'string' ? sources.split(',') : sources as string[]) : 
      undefined;

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const pageNum = parseInt(page as string) || 1;
    const offset = (pageNum - 1) * limitNum;

    // Search external APIs
    const externalResults = await searchService.searchAll(query, sourcesArray, limitNum + offset);

    // Also search local publications
    const localResults = await prisma.publication.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { abstract: { contains: query } },
          { keywords: { contains: query } }
        ],
        ...(author && {
          authors: { contains: author as string }
        }),
        ...(year && {
          publishedAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${parseInt(year as string) + 1}-01-01`)
          }
        }),
        status: 'APPROVED'
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        authors: true,
        keywords: true,
        doi: true,
        publishedAt: true,
        source: true,
        pdfUrl: true,
        summary: true,
        keyFindings: true,
        uploadedBy: {
          select: {
            name: true,
            institution: true
          }
        }
      },
      take: limitNum,
      skip: offset
    });

    // Combine and format results
    const combinedResults = [
      ...externalResults.slice(offset, offset + limitNum),
      ...localResults.map(pub => ({
        id: pub.id,
        title: pub.title,
        abstract: pub.abstract,
        authors: pub.authors,
        publishedAt: pub.publishedAt?.toISOString(),
        doi: pub.doi,
        source: pub.source as any,
        url: pub.pdfUrl,
        keywords: pub.keywords,
        summary: pub.summary,
        keyFindings: pub.keyFindings,
        uploadedBy: pub.uploadedBy
      }))
    ];

    // Apply sorting
    let sortedResults = combinedResults;
    switch (sort) {
      case 'date':
        sortedResults = combinedResults.sort((a, b) => {
          const dateA = new Date(a.publishedAt || '1900-01-01');
          const dateB = new Date(b.publishedAt || '1900-01-01');
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'author':
        sortedResults = combinedResults.sort((a, b) => {
          const authorA = a.authors[0] || '';
          const authorB = b.authors[0] || '';
          return authorA.localeCompare(authorB);
        });
        break;
      case 'title':
        sortedResults = combinedResults.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
        break;
      default: // relevance
        // Results are already sorted by relevance from the search service
        break;
    }

    res.json({
      success: true,
      data: {
        results: sortedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: combinedResults.length,
          hasMore: combinedResults.length === limitNum
        },
        filters: {
          query,
          sources: sourcesArray,
          sort,
          author,
          year
        }
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get suggestions from local publications
    const suggestions = await prisma.publication.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { keywords: { hasSome: [query] } }
        ],
        status: 'APPROVED'
      },
      select: {
        title: true,
        keywords: true
      },
      take: 10
    });

    // Extract unique suggestions
    const suggestionSet = new Set<string>();
    
    suggestions.forEach(pub => {
      // Add title words
      pub.title.split(' ').forEach(word => {
        if (word.toLowerCase().includes(query.toLowerCase()) && word.length > 2) {
          suggestionSet.add(word);
        }
      });
      
      // Add matching keywords
      pub.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(query.toLowerCase())) {
          suggestionSet.add(keyword);
        }
      });
    });

    const suggestionList = Array.from(suggestionSet).slice(0, 8);

    res.json({
      success: true,
      data: suggestionList
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
});

// @route   GET /api/search/filters
// @desc    Get available filter options
// @access  Public
router.get('/filters', async (req, res) => {
  try {
    // Get unique authors and years from local publications
    const publications = await prisma.publication.findMany({
      where: { status: 'APPROVED' },
      select: {
        authors: true,
        publishedAt: true,
        source: true,
        keywords: true
      }
    });

    const authors = new Set<string>();
    const years = new Set<number>();
    const sources = new Set<string>();
    const keywords = new Set<string>();

    publications.forEach(pub => {
      pub.authors.forEach(author => authors.add(author));
      if (pub.publishedAt) {
        years.add(pub.publishedAt.getFullYear());
      }
      sources.add(pub.source);
      pub.keywords.forEach(keyword => keywords.add(keyword));
    });

    // Add external sources
    sources.add('NASA');
    sources.add('ArXiv');
    sources.add('PubMed');
    sources.add('CrossRef');

    res.json({
      success: true,
      data: {
        authors: Array.from(authors).sort(),
        years: Array.from(years).sort((a, b) => b - a),
        sources: Array.from(sources).sort(),
        keywords: Array.from(keywords).sort(),
        sortOptions: [
          { value: 'relevance', label: 'Relevance' },
          { value: 'date', label: 'Date' },
          { value: 'author', label: 'Author' },
          { value: 'title', label: 'Title' }
        ]
      }
    });
  } catch (error) {
    console.error('Filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filters'
    });
  }
});

// @route   POST /api/search/export
// @desc    Export search results to CSV/Excel
// @access  Private
router.post('/export', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { searchParams, format = 'csv' } = req.body;
    const user = req.user;

    // Perform search with no limit for export
    const { q: query, sources, author, year, yearFrom, yearTo, university, domain } = searchParams;
    
    const sourcesArray = sources ? 
      (typeof sources === 'string' ? sources.split(',') : sources as string[]) : 
      undefined;

    // Search external APIs
    const externalResults = await searchService.searchAll(query, sourcesArray, 1000);

    // Also search local publications
    const localResults = await prisma.publication.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { abstract: { contains: query } },
          { keywords: { contains: query } }
        ],
        ...(author && {
          authors: { contains: author as string }
        }),
        ...(year && {
          publishedAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${parseInt(year as string) + 1}-01-01`)
          }
        }),
        ...(yearFrom && yearTo && {
          publishedAt: {
            gte: new Date(`${yearFrom}-01-01`),
            lte: new Date(`${yearTo}-12-31`)
          }
        }),
        status: 'APPROVED'
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        authors: true,
        keywords: true,
        doi: true,
        publishedAt: true,
        source: true,
        pdfUrl: true,
        summary: true,
        uploadedBy: {
          select: {
            name: true,
            institution: true
          }
        }
      },
      take: 1000
    });

    // Combine results
    const allResults = [
      ...externalResults,
      ...localResults.map(pub => ({
        id: pub.id,
        title: pub.title,
        abstract: pub.abstract,
        authors: pub.authors,
        publishedAt: pub.publishedAt?.toISOString(),
        doi: pub.doi,
        source: pub.source,
        url: pub.pdfUrl,
        keywords: pub.keywords,
        summary: pub.summary,
        university: pub.uploadedBy?.institution || '',
        uploadedBy: pub.uploadedBy
      }))
    ];

    if (format === 'csv') {
      const csvData = generateCSV(allResults);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="search_results.csv"');
      res.send(csvData);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="search_results.json"');
      res.json({
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email || 'anonymous',
        searchParams,
        results: allResults,
        total: allResults.length
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Use csv or json.'
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
});

// Helper function to generate CSV
function generateCSV(publications: any[]): string {
  if (!publications.length) return '';

  const headers = [
    'Title', 'Authors', 'Year', 'Journal', 'DOI', 'Source', 'University', 'Keywords', 'Abstract'
  ];

  const csvRows = [
    headers.join(','),
    ...publications.map(pub => [
      `"${(pub.title || '').replace(/"/g, '""')}"`,
      `"${Array.isArray(pub.authors) ? pub.authors.join('; ') : (pub.authors || '').replace(/"/g, '""')}"`,
      pub.publishedAt ? new Date(pub.publishedAt).getFullYear() : '',
      `"${(pub.journal || '').replace(/"/g, '""')}"`,
      pub.doi || '',
      pub.source || '',
      `"${(pub.university || '').replace(/"/g, '""')}"`,
      `"${Array.isArray(pub.keywords) ? pub.keywords.join('; ') : (pub.keywords || '').replace(/"/g, '""')}"`,
      `"${(pub.abstract || '').replace(/"/g, '""').substring(0, 500)}"`
    ].join(','))
  ];

  return csvRows.join('\n');
}

export default router;

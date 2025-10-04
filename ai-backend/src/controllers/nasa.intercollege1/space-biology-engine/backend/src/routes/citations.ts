import express from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Citation formats
interface CitationFormats {
  apa: string;
  mla: string;
  ieee: string;
  chicago: string;
  harvard: string;
}

// @route   GET /api/citations/:publicationId
// @desc    Generate citations in multiple formats
// @access  Public
router.get('/:publicationId', async (req, res) => {
  try {
    const { publicationId } = req.params;
    const { formats = 'apa,mla,ieee' } = req.query;

    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      include: {
        uploadedBy: {
          select: {
            name: true,
            institution: true
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

    const requestedFormats = (formats as string).split(',');
    const citations: Partial<CitationFormats> = {};

    // Parse authors
    const authors = Array.isArray(publication.authors) 
      ? publication.authors 
      : JSON.parse(publication.authors || '[]');

    // Get publication year
    const year = publication.publishedAt 
      ? new Date(publication.publishedAt).getFullYear()
      : new Date(publication.uploadedAt).getFullYear();

    // Generate citations for requested formats
    if (requestedFormats.includes('apa')) {
      citations.apa = generateAPACitation(publication, authors, year);
    }

    if (requestedFormats.includes('mla')) {
      citations.mla = generateMLACitation(publication, authors, year);
    }

    if (requestedFormats.includes('ieee')) {
      citations.ieee = generateIEEECitation(publication, authors, year);
    }

    if (requestedFormats.includes('chicago')) {
      citations.chicago = generateChicagoCitation(publication, authors, year);
    }

    if (requestedFormats.includes('harvard')) {
      citations.harvard = generateHarvardCitation(publication, authors, year);
    }

    res.json({
      success: true,
      data: {
        publication: {
          id: publication.id,
          title: publication.title,
          authors,
          year,
          doi: publication.doi,
          source: publication.source
        },
        citations
      }
    });
  } catch (error) {
    console.error('Citation generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate citations'
    });
  }
});

// @route   POST /api/citations/batch
// @desc    Generate citations for multiple publications
// @access  Private
router.post('/batch', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { publicationIds, format = 'apa' } = req.body;

    if (!Array.isArray(publicationIds) || publicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Publication IDs array is required'
      });
    }

    const publications = await prisma.publication.findMany({
      where: {
        id: { in: publicationIds }
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            institution: true
          }
        }
      }
    });

    const citations = publications.map(publication => {
      const authors = Array.isArray(publication.authors) 
        ? publication.authors 
        : JSON.parse(publication.authors || '[]');

      const year = publication.publishedAt 
        ? new Date(publication.publishedAt).getFullYear()
        : new Date(publication.uploadedAt).getFullYear();

      let citation = '';
      switch (format) {
        case 'mla':
          citation = generateMLACitation(publication, authors, year);
          break;
        case 'ieee':
          citation = generateIEEECitation(publication, authors, year);
          break;
        case 'chicago':
          citation = generateChicagoCitation(publication, authors, year);
          break;
        case 'harvard':
          citation = generateHarvardCitation(publication, authors, year);
          break;
        default:
          citation = generateAPACitation(publication, authors, year);
      }

      return {
        id: publication.id,
        title: publication.title,
        citation
      };
    });

    res.json({
      success: true,
      data: {
        format,
        citations,
        total: citations.length
      }
    });
  } catch (error) {
    console.error('Batch citation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch citations'
    });
  }
});

// @route   POST /api/citations/export
// @desc    Export citations as bibliography file
// @access  Private
router.post('/export', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { publicationIds, format = 'apa', exportFormat = 'txt' } = req.body;

    const publications = await prisma.publication.findMany({
      where: {
        id: { in: publicationIds }
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            institution: true
          }
        }
      }
    });

    const citations = publications.map(publication => {
      const authors = Array.isArray(publication.authors) 
        ? publication.authors 
        : JSON.parse(publication.authors || '[]');

      const year = publication.publishedAt 
        ? new Date(publication.publishedAt).getFullYear()
        : new Date(publication.uploadedAt).getFullYear();

      switch (format) {
        case 'mla':
          return generateMLACitation(publication, authors, year);
        case 'ieee':
          return generateIEEECitation(publication, authors, year);
        case 'chicago':
          return generateChicagoCitation(publication, authors, year);
        case 'harvard':
          return generateHarvardCitation(publication, authors, year);
        default:
          return generateAPACitation(publication, authors, year);
      }
    });

    if (exportFormat === 'bibtex') {
      const bibtex = generateBibTeX(publications);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="bibliography.bib"');
      res.send(bibtex);
    } else {
      const bibliography = citations.join('\n\n');
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="bibliography_${format}.txt"`);
      res.send(bibliography);
    }
  } catch (error) {
    console.error('Export citations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export citations'
    });
  }
});

// @route   GET /api/citations/formats
// @desc    Get available citation formats
// @access  Public
router.get('/formats', (req, res) => {
  res.json({
    success: true,
    data: {
      formats: [
        { id: 'apa', name: 'APA', description: 'American Psychological Association' },
        { id: 'mla', name: 'MLA', description: 'Modern Language Association' },
        { id: 'ieee', name: 'IEEE', description: 'Institute of Electrical and Electronics Engineers' },
        { id: 'chicago', name: 'Chicago', description: 'Chicago Manual of Style' },
        { id: 'harvard', name: 'Harvard', description: 'Harvard Referencing Style' }
      ],
      exportFormats: [
        { id: 'txt', name: 'Text File', extension: '.txt' },
        { id: 'bibtex', name: 'BibTeX', extension: '.bib' }
      ]
    }
  });
});

// Helper functions for citation generation
function generateAPACitation(publication: any, authors: string[], year: number): string {
  const authorStr = formatAuthorsAPA(authors);
  const title = publication.title;
  const source = publication.source === 'Upload' ? 'Unpublished manuscript' : publication.source;
  const doi = publication.doi ? ` https://doi.org/${publication.doi}` : '';
  
  return `${authorStr} (${year}). ${title}. ${source}.${doi}`;
}

function generateMLACitation(publication: any, authors: string[], year: number): string {
  const authorStr = formatAuthorsMLA(authors);
  const title = `"${publication.title}"`;
  const source = publication.source === 'Upload' ? 'Unpublished manuscript' : publication.source;
  
  return `${authorStr} ${title} ${source}, ${year}.`;
}

function generateIEEECitation(publication: any, authors: string[], year: number): string {
  const authorStr = formatAuthorsIEEE(authors);
  const title = `"${publication.title}"`;
  const source = publication.source === 'Upload' ? 'Unpublished manuscript' : publication.source;
  const doi = publication.doi ? `, doi: ${publication.doi}` : '';
  
  return `${authorStr} ${title} ${source}, ${year}${doi}.`;
}

function generateChicagoCitation(publication: any, authors: string[], year: number): string {
  const authorStr = formatAuthorsChicago(authors);
  const title = `"${publication.title}"`;
  const source = publication.source === 'Upload' ? 'Unpublished manuscript' : publication.source;
  
  return `${authorStr} ${title} ${source} (${year}).`;
}

function generateHarvardCitation(publication: any, authors: string[], year: number): string {
  const authorStr = formatAuthorsHarvard(authors);
  const title = publication.title;
  const source = publication.source === 'Upload' ? 'Unpublished manuscript' : publication.source;
  
  return `${authorStr} ${year}, '${title}', ${source}.`;
}

function formatAuthorsAPA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author.';
  if (authors.length === 1) return `${authors[0]}.`;
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}.`;
  return `${authors[0]} et al.`;
}

function formatAuthorsIEEE(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author,';
  if (authors.length === 1) return `${authors[0]},`;
  if (authors.length <= 3) return `${authors.join(', ')},`;
  return `${authors[0]} et al.,`;
}

function formatAuthorsChicago(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author.';
  if (authors.length === 1) return `${authors[0]}.`;
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}.`;
  return `${authors[0]} et al.`;
}

function formatAuthorsHarvard(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
}

function generateBibTeX(publications: any[]): string {
  return publications.map(pub => {
    const authors = Array.isArray(pub.authors) 
      ? pub.authors 
      : JSON.parse(pub.authors || '[]');
    
    const year = pub.publishedAt 
      ? new Date(pub.publishedAt).getFullYear()
      : new Date(pub.uploadedAt).getFullYear();

    const key = pub.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) + year;
    
    return `@article{${key},
  title={${pub.title}},
  author={${authors.join(' and ')}},
  year={${year}},
  journal={${pub.source}},
  ${pub.doi ? `doi={${pub.doi}},` : ''}
  abstract={${pub.abstract || ''}}
}`;
  }).join('\n\n');
}

export default router;

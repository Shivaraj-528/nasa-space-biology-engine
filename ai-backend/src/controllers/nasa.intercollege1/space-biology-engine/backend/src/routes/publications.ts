import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { OpenRouterService } from '../services/openrouter';
import { RAGService } from '../services/rag';
import prisma from '../config/database';

const router = express.Router();
const openRouterService = new OpenRouterService();
const ragService = new RAGService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// @route   POST /api/publications/upload
// @desc    Upload and process PDF publication
// @access  Private (Researchers and Scientists only)
router.post('/upload', 
  authenticate, 
  authorize('RESEARCHER', 'SCIENTIST'),
  upload.single('pdf'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'PDF file is required'
        });
      }

      const { title, abstract, authors, keywords, doi } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      // Parse PDF content
      const pdfBuffer = await fs.readFile(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      const fullText = pdfData.text;

      // Parse authors and keywords
      const authorsArray = authors ? 
        (typeof authors === 'string' ? authors.split(',').map((a: string) => a.trim()) : authors) : 
        [];
      const keywordsArray = keywords ? 
        (typeof keywords === 'string' ? keywords.split(',').map((k: string) => k.trim()) : keywords) : 
        [];

      // Create publication record
      const publication = await prisma.publication.create({
        data: {
          title,
          abstract: abstract || null,
          authors: authorsArray,
          keywords: keywordsArray,
          doi: doi || null,
          pdfPath: req.file.path,
          pdfUrl: `/uploads/${req.file.filename}`,
          source: 'Upload',
          status: 'PENDING',
          uploadedById: req.user!.id
        }
      });

      // Generate AI summary asynchronously
      try {
        const aiSummary = await openRouterService.summarizePaper(
          title,
          abstract || fullText.substring(0, 2000),
          fullText,
          req.user!.role
        );

        // Update publication with AI-generated content
        await prisma.publication.update({
          where: { id: publication.id },
          data: {
            summary: aiSummary.summary,
            keyFindings: aiSummary.keyFindings,
            methodology: aiSummary.methodology
          }
        });

        // Add to RAG system
        await ragService.addDocument(
          publication.id,
          title,
          fullText,
          authorsArray,
          'Upload'
        );
      } catch (aiError) {
        console.error('AI processing error:', aiError);
        // Continue without AI processing if it fails
      }

      res.status(201).json({
        success: true,
        data: publication,
        message: 'Publication uploaded successfully. AI processing in progress.'
      });
    } catch (error) {
      console.error('Upload publication error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to upload publication'
      });
    }
  }
);

// @route   GET /api/publications
// @desc    Get publications with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      source,
      author,
      year,
      status = 'APPROVED',
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: status as string
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { abstract: { contains: search as string, mode: 'insensitive' } },
        { keywords: { hasSome: [search as string] } }
      ];
    }

    if (source) {
      where.source = source as string;
    }

    if (author) {
      where.authors = { hasSome: [author as string] };
    }

    if (year) {
      const yearNum = parseInt(year as string);
      where.publishedAt = {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`)
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'title' || sortBy === 'publishedAt' || sortBy === 'uploadedAt') {
      orderBy[sortBy as string] = sortOrder as string;
    } else {
      orderBy.publishedAt = 'desc';
    }

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              name: true,
              institution: true
            }
          },
          _count: {
            select: {
              bookmarks: true
            }
          }
        },
        orderBy,
        take: limitNum,
        skip: offset
      }),
      prisma.publication.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        publications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasMore: offset + limitNum < total
        }
      }
    });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get publications'
    });
  }
});

// @route   GET /api/publications/:id
// @desc    Get single publication
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            name: true,
            institution: true,
            role: true
          }
        },
        bookmarks: {
          select: {
            userId: true,
            notes: true
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
      data: publication
    });
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get publication'
    });
  }
});

// @route   POST /api/publications/:id/bookmark
// @desc    Bookmark/unbookmark publication
// @access  Private
router.post('/:id/bookmark', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if publication exists
    const publication = await prisma.publication.findUnique({
      where: { id }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_publicationId: {
          userId: req.user!.id,
          publicationId: id
        }
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      });

      res.json({
        success: true,
        message: 'Bookmark removed',
        bookmarked: false
      });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: req.user!.id,
          publicationId: id,
          notes: notes || null
        }
      });

      res.json({
        success: true,
        message: 'Publication bookmarked',
        bookmarked: true
      });
    }
  } catch (error) {
    console.error('Bookmark publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark publication'
    });
  }
});

// @route   GET /api/publications/:id/download
// @desc    Download publication PDF
// @access  Public
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const publication = await prisma.publication.findUnique({
      where: { id },
      select: {
        title: true,
        pdfPath: true,
        pdfUrl: true
      }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    if (!publication.pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not available'
      });
    }

    // Check if file exists
    try {
      await fs.access(publication.pdfPath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${publication.title}.pdf"`);

    // Stream the file
    const fileStream = require('fs').createReadStream(publication.pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download publication'
    });
  }
});

// @route   PUT /api/publications/:id/status
// @desc    Update publication status (Admin only)
// @access  Private (Scientists only)
router.put('/:id/status', 
  authenticate, 
  authorize('SCIENTIST'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const publication = await prisma.publication.update({
        where: { id },
        data: { status }
      });

      res.json({
        success: true,
        data: publication,
        message: `Publication ${status.toLowerCase()}`
      });
    } catch (error) {
      console.error('Update publication status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update publication status'
      });
    }
  }
);

// @route   DELETE /api/publications/:id
// @desc    Delete publication
// @access  Private (Owner or Scientists only)
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const publication = await prisma.publication.findUnique({
      where: { id },
      select: {
        uploadedById: true,
        pdfPath: true
      }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    // Check permissions
    const canDelete = req.user!.role === 'SCIENTIST' || 
                     publication.uploadedById === req.user!.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this publication'
      });
    }

    // Remove from RAG system
    try {
      await ragService.removeDocument(id);
    } catch (ragError) {
      console.error('Failed to remove from RAG:', ragError);
    }

    // Delete file
    if (publication.pdfPath) {
      try {
        await fs.unlink(publication.pdfPath);
      } catch (fileError) {
        console.error('Failed to delete file:', fileError);
      }
    }

    // Delete from database
    await prisma.publication.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Publication deleted successfully'
    });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete publication'
    });
  }
});

export default router;

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { OpenRouterService } from '../services/openrouter';
import prisma from '../config/database';

const router = express.Router();
const openRouterService = new OpenRouterService();

// Configure multer for data file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/data');
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
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// @route   POST /api/data-integration/upload
// @desc    Upload and analyze experimental data
// @access  Private (Researchers and Scientists only)
router.post('/upload', 
  authenticate, 
  authorize('RESEARCHER', 'SCIENTIST'),
  upload.single('dataFile'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Data file is required'
        });
      }

      const { title, description, experimentType, dataType } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      // Parse data file
      let parsedData: any[] = [];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      if (fileExtension === '.csv') {
        parsedData = await parseCSV(req.file.path);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        parsedData = await parseExcel(req.file.path);
      }

      if (parsedData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data found in file'
        });
      }

      // Analyze data structure
      const dataAnalysis = analyzeDataStructure(parsedData);

      // Generate AI insights
      const aiInsights = await generateAIInsights(
        title,
        description,
        dataAnalysis,
        parsedData.slice(0, 10) // Sample data for AI analysis
      );

      // Save data integration record
      const dataIntegration = await prisma.dataIntegration.create({
        data: {
          title,
          description: description || null,
          experimentType: experimentType || null,
          dataType: dataType || 'experimental',
          filePath: req.file.path,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          rowCount: parsedData.length,
          columnCount: dataAnalysis.columns.length,
          dataStructure: dataAnalysis,
          aiInsights: aiInsights,
          uploadedById: req.user!.id,
          status: 'PROCESSED'
        }
      });

      res.status(201).json({
        success: true,
        data: {
          id: dataIntegration.id,
          title: dataIntegration.title,
          rowCount: parsedData.length,
          columnCount: dataAnalysis.columns.length,
          dataStructure: dataAnalysis,
          aiInsights: aiInsights,
          uploadedAt: dataIntegration.createdAt
        },
        message: 'Data uploaded and analyzed successfully'
      });
    } catch (error) {
      console.error('Data upload error:', error);
      
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
        message: 'Failed to upload and analyze data'
      });
    }
  }
);

// @route   GET /api/data-integration/:id/analysis
// @desc    Get detailed data analysis
// @access  Private
router.get('/:id/analysis', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const dataIntegration = await prisma.dataIntegration.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            name: true,
            institution: true
          }
        }
      }
    });

    if (!dataIntegration) {
      return res.status(404).json({
        success: false,
        message: 'Data integration not found'
      });
    }

    // Check if user has access
    if (dataIntegration.uploadedById !== req.user!.id && req.user!.role !== 'SCIENTIST') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Load and analyze data file
    const parsedData = await loadDataFile(dataIntegration.filePath, dataIntegration.fileName);
    const statisticalAnalysis = performStatisticalAnalysis(parsedData);
    const correlationAnalysis = performCorrelationAnalysis(parsedData);
    const visualizationData = generateVisualizationData(parsedData);

    res.json({
      success: true,
      data: {
        metadata: {
          id: dataIntegration.id,
          title: dataIntegration.title,
          description: dataIntegration.description,
          experimentType: dataIntegration.experimentType,
          dataType: dataIntegration.dataType,
          rowCount: dataIntegration.rowCount,
          columnCount: dataIntegration.columnCount,
          uploadedBy: dataIntegration.uploadedBy,
          uploadedAt: dataIntegration.createdAt
        },
        dataStructure: dataIntegration.dataStructure,
        statisticalAnalysis,
        correlationAnalysis,
        visualizationData,
        aiInsights: dataIntegration.aiInsights
      }
    });
  } catch (error) {
    console.error('Data analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze data'
    });
  }
});

// @route   POST /api/data-integration/:id/hypotheses
// @desc    Generate AI hypotheses from data
// @access  Private
router.post('/:id/hypotheses', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { context, researchQuestion } = req.body;

    const dataIntegration = await prisma.dataIntegration.findUnique({
      where: { id }
    });

    if (!dataIntegration) {
      return res.status(404).json({
        success: false,
        message: 'Data integration not found'
      });
    }

    // Generate AI hypotheses
    const hypotheses = await openRouterService.generateHypotheses({
      title: dataIntegration.title,
      description: dataIntegration.description,
      dataStructure: dataIntegration.dataStructure,
      aiInsights: dataIntegration.aiInsights,
      context: context || '',
      researchQuestion: researchQuestion || ''
    });

    res.json({
      success: true,
      data: {
        hypotheses,
        generatedAt: new Date().toISOString(),
        context,
        researchQuestion
      }
    });
  } catch (error) {
    console.error('Hypothesis generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hypotheses'
    });
  }
});

// @route   GET /api/data-integration
// @desc    Get user's data integrations
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 20, dataType, experimentType } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {
      uploadedById: req.user!.id
    };

    if (dataType) {
      where.dataType = dataType as string;
    }

    if (experimentType) {
      where.experimentType = experimentType as string;
    }

    const [dataIntegrations, total] = await Promise.all([
      prisma.dataIntegration.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          experimentType: true,
          dataType: true,
          rowCount: true,
          columnCount: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offset
      }),
      prisma.dataIntegration.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        dataIntegrations,
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
    console.error('Get data integrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get data integrations'
    });
  }
});

// Helper functions
async function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function parseExcel(filePath: string): Promise<any[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

function analyzeDataStructure(data: any[]): any {
  if (data.length === 0) return { columns: [], types: {}, summary: {} };

  const columns = Object.keys(data[0]);
  const types: { [key: string]: string } = {};
  const summary: { [key: string]: any } = {};

  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
    
    // Determine data type
    const numericValues = values.filter(val => !isNaN(Number(val)));
    if (numericValues.length > values.length * 0.8) {
      types[column] = 'numeric';
      const numbers = numericValues.map(Number);
      summary[column] = {
        count: numbers.length,
        mean: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        std: calculateStandardDeviation(numbers)
      };
    } else {
      types[column] = 'categorical';
      const uniqueValues = [...new Set(values)];
      summary[column] = {
        count: values.length,
        unique: uniqueValues.length,
        top: uniqueValues.slice(0, 10)
      };
    }
  });

  return { columns, types, summary };
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

async function generateAIInsights(title: string, description: string, dataAnalysis: any, sampleData: any[]): Promise<any> {
  try {
    const prompt = `Analyze this experimental data:
Title: ${title}
Description: ${description}
Data Structure: ${JSON.stringify(dataAnalysis, null, 2)}
Sample Data: ${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Provide insights on:
1. Data quality and completeness
2. Potential patterns or trends
3. Suggested statistical analyses
4. Possible research directions
5. Data visualization recommendations`;

    const insights = await openRouterService.generateInsights(prompt);
    return insights;
  } catch (error) {
    console.error('AI insights generation error:', error);
    return {
      dataQuality: 'Unable to analyze',
      patterns: [],
      suggestedAnalyses: [],
      researchDirections: [],
      visualizations: []
    };
  }
}

function performStatisticalAnalysis(data: any[]): any {
  // Implement statistical analysis logic
  return {
    descriptiveStats: {},
    distributions: {},
    outliers: []
  };
}

function performCorrelationAnalysis(data: any[]): any {
  // Implement correlation analysis logic
  return {
    correlationMatrix: {},
    significantCorrelations: []
  };
}

function generateVisualizationData(data: any[]): any {
  // Generate data for charts and graphs
  return {
    histograms: {},
    scatterPlots: {},
    boxPlots: {}
  };
}

async function loadDataFile(filePath: string, fileName: string): Promise<any[]> {
  const fileExtension = path.extname(fileName).toLowerCase();
  
  if (fileExtension === '.csv') {
    return await parseCSV(filePath);
  } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    return await parseExcel(filePath);
  }
  
  return [];
}

export default router;

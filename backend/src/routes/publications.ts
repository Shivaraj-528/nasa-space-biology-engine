import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { publicationFilterService, PublicationFilter } from '../services/publicationFilterService';

const router = Router();

// GET /api/v1/publications/filter - Filter publications by year range and other criteria
router.get('/publications/filter', authenticate, async (req, res) => {
  try {
    const {
      startYear,
      endYear,
      topics,
      organisms,
      studyTypes,
      journals,
      keywords,
      limit = 50
    } = req.query;

    // Validate year parameters
    const start = startYear ? parseInt(startYear as string) : 2018;
    const end = endYear ? parseInt(endYear as string) : new Date().getFullYear();

    if (start > end) {
      return res.status(400).json({
        error: 'Invalid year range',
        message: 'Start year must be less than or equal to end year'
      });
    }

    // Parse filter parameters
    const filters: Partial<PublicationFilter> = {};
    if (topics) filters.topics = Array.isArray(topics) ? topics as string[] : [topics as string];
    if (organisms) filters.organisms = Array.isArray(organisms) ? organisms as string[] : [organisms as string];
    if (studyTypes) filters.studyTypes = Array.isArray(studyTypes) ? studyTypes as string[] : [studyTypes as string];
    if (journals) filters.journals = Array.isArray(journals) ? journals as string[] : [journals as string];
    if (keywords) filters.keywords = Array.isArray(keywords) ? keywords as string[] : [keywords as string];

    const publications = await publicationFilterService.getPublicationsByYearRange(start, end, filters);
    
    res.json({
      success: true,
      data: {
        publications: publications.slice(0, parseInt(limit as string)),
        total_count: publications.length,
        year_range: { start, end },
        filters_applied: filters
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Publications API] Filter error:', error);
    res.status(500).json({
      error: 'Failed to filter publications',
      message: error.message
    });
  }
});

// GET /api/v1/publications/by-topic/:topic - Get publications by specific topic
router.get('/publications/by-topic/:topic', authenticate, async (req, res) => {
  try {
    const { topic } = req.params;
    const { startYear, endYear, limit = 50 } = req.query;

    let yearRange;
    if (startYear && endYear) {
      yearRange = {
        start: parseInt(startYear as string),
        end: parseInt(endYear as string)
      };
    }

    const publications = await publicationFilterService.getPublicationsByTopic(topic, yearRange);
    
    res.json({
      success: true,
      data: {
        topic,
        publications: publications.slice(0, parseInt(limit as string)),
        total_count: publications.length,
        year_range: yearRange,
        message: `Publications released ${yearRange ? `between ${yearRange.start} and ${yearRange.end}` : 'in the last 10 years'} on topic: ${topic}`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Publications API] Topic filter error:', error);
    res.status(500).json({
      error: 'Failed to filter publications by topic',
      message: error.message
    });
  }
});

// GET /api/v1/publications/stats - Get publication statistics
router.get('/publications/stats', authenticate, async (req, res) => {
  try {
    const {
      topics,
      organisms,
      studyTypes,
      journals,
      keywords
    } = req.query;

    // Parse filter parameters
    const filters: Partial<PublicationFilter> = {};
    if (topics) filters.topics = Array.isArray(topics) ? topics as string[] : [topics as string];
    if (organisms) filters.organisms = Array.isArray(organisms) ? organisms as string[] : [organisms as string];
    if (studyTypes) filters.studyTypes = Array.isArray(studyTypes) ? studyTypes as string[] : [studyTypes as string];
    if (journals) filters.journals = Array.isArray(journals) ? journals as string[] : [journals as string];
    if (keywords) filters.keywords = Array.isArray(keywords) ? keywords as string[] : [keywords as string];

    const stats = await publicationFilterService.getPublicationStats(filters);
    
    res.json({
      success: true,
      data: stats,
      filters_applied: filters,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Publications API] Stats error:', error);
    res.status(500).json({
      error: 'Failed to get publication statistics',
      message: error.message
    });
  }
});

// GET /api/v1/publications/search - Search publications
router.get('/publications/search', authenticate, async (req, res) => {
  try {
    const {
      q: query,
      startYear,
      endYear,
      topics,
      organisms,
      studyTypes,
      limit = 50
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Missing query parameter',
        message: 'Please provide a search query using the "q" parameter'
      });
    }

    // Parse filter parameters
    const filters: Partial<PublicationFilter> = {};
    if (startYear) filters.startYear = parseInt(startYear as string);
    if (endYear) filters.endYear = parseInt(endYear as string);
    if (topics) filters.topics = Array.isArray(topics) ? topics as string[] : [topics as string];
    if (organisms) filters.organisms = Array.isArray(organisms) ? organisms as string[] : [organisms as string];
    if (studyTypes) filters.studyTypes = Array.isArray(studyTypes) ? studyTypes as string[] : [studyTypes as string];

    const publications = await publicationFilterService.searchPublications(query as string, filters);
    
    res.json({
      success: true,
      data: {
        query,
        publications: publications.slice(0, parseInt(limit as string)),
        total_count: publications.length,
        filters_applied: filters
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Publications API] Search error:', error);
    res.status(500).json({
      error: 'Failed to search publications',
      message: error.message
    });
  }
});

// GET /api/v1/publications/years - Get available publication years
router.get('/publications/years', authenticate, async (req, res) => {
  try {
    const stats = await publicationFilterService.getPublicationStats();
    
    const years = Object.keys(stats.publications_by_year)
      .map(year => parseInt(year))
      .sort((a, b) => a - b);
    
    res.json({
      success: true,
      data: {
        available_years: years,
        year_range: stats.year_range,
        publications_by_year: stats.publications_by_year,
        total_publications: stats.total_publications
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Publications API] Years error:', error);
    res.status(500).json({
      error: 'Failed to get publication years',
      message: error.message
    });
  }
});

// GET /api/v1/publications/topics - Get available topics
router.get('/publications/topics', authenticate, async (req, res) => {
  try {
    const stats = await publicationFilterService.getPublicationStats();
    
    res.json({
      success: true,
      data: {
        top_topics: stats.top_topics,
        total_topics: stats.top_topics.length,
        suggestion: "Use these topics to filter publications by specific research areas"
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Publications API] Topics error:', error);
    res.status(500).json({
      error: 'Failed to get publication topics',
      message: error.message
    });
  }
});

// GET /api/v1/publications/timeline - Get publication timeline data
router.get('/publications/timeline', authenticate, async (req, res) => {
  try {
    const { topics, organisms, studyTypes } = req.query;

    // Parse filter parameters
    const filters: Partial<PublicationFilter> = {};
    if (topics) filters.topics = Array.isArray(topics) ? topics as string[] : [topics as string];
    if (organisms) filters.organisms = Array.isArray(organisms) ? organisms as string[] : [organisms as string];
    if (studyTypes) filters.studyTypes = Array.isArray(studyTypes) ? studyTypes as string[] : [studyTypes as string];

    const stats = await publicationFilterService.getPublicationStats(filters);
    
    // Create timeline data
    const timelineData = Object.entries(stats.publications_by_year)
      .map(([year, count]) => ({
        year: parseInt(year),
        publications: count,
        percentage: Math.round((count / stats.total_publications) * 100)
      }))
      .sort((a, b) => a.year - b.year);
    
    res.json({
      success: true,
      data: {
        timeline: timelineData,
        year_range: stats.year_range,
        total_publications: stats.total_publications,
        filters_applied: filters,
        peak_year: timelineData.reduce((max, current) => 
          current.publications > max.publications ? current : max
        )
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Publications API] Timeline error:', error);
    res.status(500).json({
      error: 'Failed to get publication timeline',
      message: error.message
    });
  }
});

export default router;

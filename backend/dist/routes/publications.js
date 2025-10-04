"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const publicationFilterService_1 = require("../services/publicationFilterService");
const router = (0, express_1.Router)();
// GET /api/v1/publications/filter - Filter publications by year range and other criteria
router.get('/publications/filter', auth_1.authenticate, async (req, res) => {
    try {
        const { startYear, endYear, topics, organisms, studyTypes, journals, keywords, limit = 50 } = req.query;
        // Validate year parameters
        const start = startYear ? parseInt(startYear) : 2018;
        const end = endYear ? parseInt(endYear) : new Date().getFullYear();
        if (start > end) {
            return res.status(400).json({
                error: 'Invalid year range',
                message: 'Start year must be less than or equal to end year'
            });
        }
        // Parse filter parameters
        const filters = {};
        if (topics)
            filters.topics = Array.isArray(topics) ? topics : [topics];
        if (organisms)
            filters.organisms = Array.isArray(organisms) ? organisms : [organisms];
        if (studyTypes)
            filters.studyTypes = Array.isArray(studyTypes) ? studyTypes : [studyTypes];
        if (journals)
            filters.journals = Array.isArray(journals) ? journals : [journals];
        if (keywords)
            filters.keywords = Array.isArray(keywords) ? keywords : [keywords];
        const publications = await publicationFilterService_1.publicationFilterService.getPublicationsByYearRange(start, end, filters);
        res.json({
            success: true,
            data: {
                publications: publications.slice(0, parseInt(limit)),
                total_count: publications.length,
                year_range: { start, end },
                filters_applied: filters
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[Publications API] Filter error:', error);
        res.status(500).json({
            error: 'Failed to filter publications',
            message: error.message
        });
    }
});
// GET /api/v1/publications/by-topic/:topic - Get publications by specific topic
router.get('/publications/by-topic/:topic', auth_1.authenticate, async (req, res) => {
    try {
        const { topic } = req.params;
        const { startYear, endYear, limit = 50 } = req.query;
        let yearRange;
        if (startYear && endYear) {
            yearRange = {
                start: parseInt(startYear),
                end: parseInt(endYear)
            };
        }
        const publications = await publicationFilterService_1.publicationFilterService.getPublicationsByTopic(topic, yearRange);
        res.json({
            success: true,
            data: {
                topic,
                publications: publications.slice(0, parseInt(limit)),
                total_count: publications.length,
                year_range: yearRange,
                message: `Publications released ${yearRange ? `between ${yearRange.start} and ${yearRange.end}` : 'in the last 10 years'} on topic: ${topic}`
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[Publications API] Topic filter error:', error);
        res.status(500).json({
            error: 'Failed to filter publications by topic',
            message: error.message
        });
    }
});
// GET /api/v1/publications/stats - Get publication statistics
router.get('/publications/stats', auth_1.authenticate, async (req, res) => {
    try {
        const { topics, organisms, studyTypes, journals, keywords } = req.query;
        // Parse filter parameters
        const filters = {};
        if (topics)
            filters.topics = Array.isArray(topics) ? topics : [topics];
        if (organisms)
            filters.organisms = Array.isArray(organisms) ? organisms : [organisms];
        if (studyTypes)
            filters.studyTypes = Array.isArray(studyTypes) ? studyTypes : [studyTypes];
        if (journals)
            filters.journals = Array.isArray(journals) ? journals : [journals];
        if (keywords)
            filters.keywords = Array.isArray(keywords) ? keywords : [keywords];
        const stats = await publicationFilterService_1.publicationFilterService.getPublicationStats(filters);
        res.json({
            success: true,
            data: stats,
            filters_applied: filters,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[Publications API] Stats error:', error);
        res.status(500).json({
            error: 'Failed to get publication statistics',
            message: error.message
        });
    }
});
// GET /api/v1/publications/search - Search publications
router.get('/publications/search', auth_1.authenticate, async (req, res) => {
    try {
        const { q: query, startYear, endYear, topics, organisms, studyTypes, limit = 50 } = req.query;
        if (!query) {
            return res.status(400).json({
                error: 'Missing query parameter',
                message: 'Please provide a search query using the "q" parameter'
            });
        }
        // Parse filter parameters
        const filters = {};
        if (startYear)
            filters.startYear = parseInt(startYear);
        if (endYear)
            filters.endYear = parseInt(endYear);
        if (topics)
            filters.topics = Array.isArray(topics) ? topics : [topics];
        if (organisms)
            filters.organisms = Array.isArray(organisms) ? organisms : [organisms];
        if (studyTypes)
            filters.studyTypes = Array.isArray(studyTypes) ? studyTypes : [studyTypes];
        const publications = await publicationFilterService_1.publicationFilterService.searchPublications(query, filters);
        res.json({
            success: true,
            data: {
                query,
                publications: publications.slice(0, parseInt(limit)),
                total_count: publications.length,
                filters_applied: filters
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[Publications API] Search error:', error);
        res.status(500).json({
            error: 'Failed to search publications',
            message: error.message
        });
    }
});
// GET /api/v1/publications/years - Get available publication years
router.get('/publications/years', auth_1.authenticate, async (req, res) => {
    try {
        const stats = await publicationFilterService_1.publicationFilterService.getPublicationStats();
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
    }
    catch (error) {
        console.error('[Publications API] Years error:', error);
        res.status(500).json({
            error: 'Failed to get publication years',
            message: error.message
        });
    }
});
// GET /api/v1/publications/topics - Get available topics
router.get('/publications/topics', auth_1.authenticate, async (req, res) => {
    try {
        const stats = await publicationFilterService_1.publicationFilterService.getPublicationStats();
        res.json({
            success: true,
            data: {
                top_topics: stats.top_topics,
                total_topics: stats.top_topics.length,
                suggestion: "Use these topics to filter publications by specific research areas"
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[Publications API] Topics error:', error);
        res.status(500).json({
            error: 'Failed to get publication topics',
            message: error.message
        });
    }
});
// GET /api/v1/publications/timeline - Get publication timeline data
router.get('/publications/timeline', auth_1.authenticate, async (req, res) => {
    try {
        const { topics, organisms, studyTypes } = req.query;
        // Parse filter parameters
        const filters = {};
        if (topics)
            filters.topics = Array.isArray(topics) ? topics : [topics];
        if (organisms)
            filters.organisms = Array.isArray(organisms) ? organisms : [organisms];
        if (studyTypes)
            filters.studyTypes = Array.isArray(studyTypes) ? studyTypes : [studyTypes];
        const stats = await publicationFilterService_1.publicationFilterService.getPublicationStats(filters);
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
                peak_year: timelineData.reduce((max, current) => current.publications > max.publications ? current : max)
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[Publications API] Timeline error:', error);
        res.status(500).json({
            error: 'Failed to get publication timeline',
            message: error.message
        });
    }
});
exports.default = router;

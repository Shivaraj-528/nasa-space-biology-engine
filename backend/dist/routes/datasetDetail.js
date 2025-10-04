"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const datasetDetailService_1 = require("../services/datasetDetailService");
const Dataset_1 = require("../models/Dataset");
const router = (0, express_1.Router)();
// GET /api/v1/datasets/:id - Get detailed dataset information
router.get('/datasets/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id.length !== 24) {
            return res.status(400).json({ error: 'Invalid dataset ID format' });
        }
        const detailedDataset = await datasetDetailService_1.datasetDetailService.getDetailedDataset(id);
        res.json({
            success: true,
            data: detailedDataset,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[DatasetDetail API] Error fetching dataset details:', error);
        if (error.message === 'Dataset not found') {
            return res.status(404).json({
                error: 'Dataset not found',
                message: 'The requested dataset does not exist or has been removed'
            });
        }
        res.status(500).json({
            error: 'Failed to fetch dataset details',
            message: 'An internal server error occurred while retrieving dataset information'
        });
    }
});
// GET /api/v1/datasets/:id/files - Get dataset file listing
router.get('/datasets/:id/files', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const detailedDataset = await datasetDetailService_1.datasetDetailService.getDetailedDataset(id);
        res.json({
            success: true,
            data: {
                dataset_id: id,
                files: detailedDataset.files,
                total_files: detailedDataset.files.length,
                total_size_mb: detailedDataset.metadata.size_mb
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[DatasetDetail API] Error fetching dataset files:', error);
        res.status(500).json({
            error: 'Failed to fetch dataset files',
            message: error.message
        });
    }
});
// GET /api/v1/datasets/:id/files/:filename - Download specific file
router.get('/datasets/:id/files/:filename', auth_1.authenticate, async (req, res) => {
    try {
        const { id, filename } = req.params;
        // Validate dataset exists
        const dataset = await Dataset_1.Dataset.findById(id);
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        // Get detailed dataset to check if file exists
        const detailedDataset = await datasetDetailService_1.datasetDetailService.getDetailedDataset(id);
        const file = detailedDataset.files.find(f => f.name === filename);
        if (!file) {
            return res.status(404).json({ error: 'File not found in dataset' });
        }
        // For demo purposes, generate a sample file or redirect to external URL
        if (file.url && file.url.startsWith('http')) {
            return res.redirect(file.url);
        }
        // Generate sample file content for demo
        const sampleContent = generateSampleFileContent(file);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', getContentType(file.format));
        res.setHeader('Content-Length', sampleContent.length);
        res.setHeader('X-File-Size', file.size.toString());
        res.setHeader('X-Checksum', file.checksum || 'unknown');
        res.send(sampleContent);
    }
    catch (error) {
        console.error('[DatasetDetail API] Error downloading file:', error);
        res.status(500).json({
            error: 'Failed to download file',
            message: error.message
        });
    }
});
// GET /api/v1/datasets/:id/publication - Get publication information
router.get('/datasets/:id/publication', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const detailedDataset = await datasetDetailService_1.datasetDetailService.getDetailedDataset(id);
        if (!detailedDataset.publication) {
            return res.status(404).json({
                error: 'No publication found',
                message: 'This dataset does not have an associated publication'
            });
        }
        res.json({
            success: true,
            data: detailedDataset.publication,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[DatasetDetail API] Error fetching publication:', error);
        res.status(500).json({
            error: 'Failed to fetch publication information',
            message: error.message
        });
    }
});
// GET /api/v1/datasets/:id/related - Get related studies
router.get('/datasets/:id/related', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const detailedDataset = await datasetDetailService_1.datasetDetailService.getDetailedDataset(id);
        res.json({
            success: true,
            data: {
                dataset_id: id,
                related_studies: detailedDataset.related_studies.slice(0, limit),
                total_count: detailedDataset.related_studies.length
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[DatasetDetail API] Error fetching related studies:', error);
        res.status(500).json({
            error: 'Failed to fetch related studies',
            message: error.message
        });
    }
});
// GET /api/v1/datasets/:id/citation - Get dataset citation information
router.get('/datasets/:id/citation', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const format = req.query.format || 'apa';
        const detailedDataset = await datasetDetailService_1.datasetDetailService.getDetailedDataset(id);
        const citation = generateCitation(detailedDataset, format);
        res.json({
            success: true,
            data: {
                dataset_id: id,
                citation,
                format,
                bibtex: generateBibtex(detailedDataset),
                endnote: generateEndnote(detailedDataset)
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[DatasetDetail API] Error generating citation:', error);
        res.status(500).json({
            error: 'Failed to generate citation',
            message: error.message
        });
    }
});
// POST /api/v1/datasets/:id/download-request - Request dataset download
router.post('/datasets/:id/download-request', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { purpose, institution } = req.body;
        const userId = req.user?.sub;
        // Validate dataset exists
        const dataset = await Dataset_1.Dataset.findById(id);
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        // Log download request (in production, this would go to a database)
        console.log(`[Download Request] User: ${userId}, Dataset: ${id}, Purpose: ${purpose}, Institution: ${institution}`);
        // Generate download token (in production, this would be a secure token)
        const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        res.json({
            success: true,
            data: {
                download_token: downloadToken,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                download_url: `/api/v1/datasets/${id}/download/${downloadToken}`,
                instructions: 'Use the download URL within 24 hours to access the complete dataset'
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[DatasetDetail API] Error processing download request:', error);
        res.status(500).json({
            error: 'Failed to process download request',
            message: error.message
        });
    }
});
// Helper functions
function generateSampleFileContent(file) {
    switch (file.format.toLowerCase()) {
        case 'csv':
            return generateSampleCSV(file);
        case 'txt':
        case 'text':
            return generateSampleText(file);
        case 'json':
            return generateSampleJSON(file);
        default:
            return `# Sample ${file.format} file: ${file.name}\n# This is a demonstration file for the NASA Space Biology Engine\n# In production, this would contain the actual research data.\n\n[Binary data placeholder - ${file.size} bytes]`;
    }
}
function generateSampleCSV(file) {
    if (file.name.includes('expression')) {
        return `gene_id,gene_name,control_mean,treatment_mean,fold_change,p_value,adjusted_p_value
AT1G01010,NAC001,125.4,89.2,-1.41,0.0023,0.0156
AT1G01020,ARV1,45.8,78.3,1.71,0.0001,0.0012
AT1G01030,NGA3,234.1,187.9,-1.25,0.0456,0.1234
AT1G01040,DCL1,89.7,145.2,1.62,0.0012,0.0089
AT1G01050,PPA1,156.3,98.7,-1.58,0.0034,0.0234`;
    }
    return `sample_id,condition,replicate,value1,value2,value3
S001,control,1,12.5,23.4,45.6
S002,control,2,13.1,24.2,46.8
S003,treatment,1,8.9,18.7,32.1
S004,treatment,2,9.4,19.3,33.5`;
}
function generateSampleText(file) {
    if (file.name.includes('metadata')) {
        return `# Dataset Metadata
# Generated: ${new Date().toISOString()}
# 
# Study Information
study_id: GLDS-123
title: ${file.name.replace('.txt', '')}
organism: Arabidopsis thaliana
treatment: Microgravity simulation
duration: 14 days
platform: Illumina HiSeq 2500

# Sample Information
total_samples: 24
control_samples: 12
treatment_samples: 12
biological_replicates: 6
technical_replicates: 2

# Data Processing
pipeline_version: NASA-SB-Pipeline-v2.1
reference_genome: TAIR10
annotation: TAIR10.51
quality_threshold: Q30`;
    }
    return `Sample data file: ${file.name}
This file contains research data from NASA space biology experiments.
File size: ${file.size} bytes
Format: ${file.format}
Generated: ${new Date().toISOString()}`;
}
function generateSampleJSON(file) {
    return JSON.stringify({
        file_info: {
            name: file.name,
            size: file.size,
            format: file.format,
            generated: new Date().toISOString()
        },
        sample_data: {
            experiment: "NASA Space Biology",
            samples: [
                { id: "S001", condition: "control", value: 123.45 },
                { id: "S002", condition: "treatment", value: 98.76 }
            ]
        }
    }, null, 2);
}
function getContentType(format) {
    const contentTypes = {
        'csv': 'text/csv',
        'txt': 'text/plain',
        'text': 'text/plain',
        'json': 'application/json',
        'pdf': 'application/pdf',
        'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'fastq': 'application/octet-stream',
        'bam': 'application/octet-stream',
        'vcf': 'text/plain'
    };
    return contentTypes[format.toLowerCase()] || 'application/octet-stream';
}
function generateCitation(dataset, format) {
    const authors = dataset.research_team.principal_investigator;
    const year = new Date(dataset.createdAt).getFullYear();
    const title = dataset.title;
    const source = dataset.source;
    switch (format.toLowerCase()) {
        case 'apa':
            return `${authors} (${year}). ${title}. ${source} Database. Retrieved from https://osdr.nasa.gov/bio/repo/data/studies/${dataset.experimental_details.study_id}`;
        case 'mla':
            return `${authors}. "${title}." ${source} Database, ${year}, https://osdr.nasa.gov/bio/repo/data/studies/${dataset.experimental_details.study_id}.`;
        case 'chicago':
            return `${authors}. "${title}." ${source} Database. Accessed ${new Date().toLocaleDateString()}. https://osdr.nasa.gov/bio/repo/data/studies/${dataset.experimental_details.study_id}.`;
        default:
            return `${authors} (${year}). ${title}. ${source} Database.`;
    }
}
function generateBibtex(dataset) {
    const year = new Date(dataset.createdAt).getFullYear();
    const authorLastName = dataset.research_team.principal_investigator.split(' ').pop()?.toLowerCase();
    return `@dataset{${authorLastName}${year}${dataset.experimental_details.study_id.toLowerCase()},
  title={${dataset.title}},
  author={${dataset.research_team.principal_investigator}},
  year={${year}},
  publisher={${dataset.source}},
  url={https://osdr.nasa.gov/bio/repo/data/studies/${dataset.experimental_details.study_id}},
  note={Dataset ID: ${dataset.experimental_details.study_id}}
}`;
}
function generateEndnote(dataset) {
    const year = new Date(dataset.createdAt).getFullYear();
    return `%0 Dataset
%A ${dataset.research_team.principal_investigator}
%T ${dataset.title}
%D ${year}
%I ${dataset.source}
%U https://osdr.nasa.gov/bio/repo/data/studies/${dataset.experimental_details.study_id}
%X ${dataset.description}`;
}
exports.default = router;

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as stats from 'simple-statistics';

interface GeneExpressionRequest {
  sample_a: { [gene: string]: number };
  sample_b: { [gene: string]: number };
  metadata?: {
    experiment_id?: string;
    organism?: string;
    tissue_type?: string;
    treatment?: string;
    control?: string;
  };
}

interface GeneExpressionResult {
  analysis_id: string;
  differential_expression: {
    gene: string;
    sample_a_expression: number;
    sample_b_expression: number;
    fold_change: number;
    log2_fold_change: number;
    p_value: number;
    significance: string;
    regulation: string;
  }[];
  summary: {
    total_genes: number;
    upregulated: number;
    downregulated: number;
    unchanged: number;
    significant_threshold: number;
  };
  pathway_analysis: {
    pathway: string;
    genes_involved: string[];
    enrichment_score: number;
    p_value: number;
  }[];
  quality_metrics: {
    correlation: number;
    data_quality: string;
    sample_similarity: number;
  };
  model_version: string;
  timestamp: string;
}

export const geneExpressionAnalysis = async (req: Request, res: Response) => {
  try {
    const { sample_a, sample_b, metadata }: GeneExpressionRequest = req.body;
    
    console.log(`[AI] Gene expression analysis requested for ${Object.keys(sample_a).length} genes`);
    
    // Simulate AI model processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
    
    // Perform differential expression analysis
    const differentialExpression = calculateDifferentialExpression(sample_a, sample_b);
    const summary = generateSummary(differentialExpression);
    const pathwayAnalysis = performPathwayAnalysis(differentialExpression);
    const qualityMetrics = calculateQualityMetrics(sample_a, sample_b);
    
    const result: GeneExpressionResult = {
      analysis_id: uuidv4(),
      differential_expression: differentialExpression,
      summary,
      pathway_analysis: pathwayAnalysis,
      quality_metrics: qualityMetrics,
      model_version: '1.8.0',
      timestamp: new Date().toISOString()
    };
    
    console.log(`[AI] Gene expression analysis completed: ${summary.significant_genes} significant genes`);
    
    res.json({
      success: true,
      data: result,
      processing_time_ms: 2000 + Math.random() * 1500,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[AI] Gene expression analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Gene expression analysis failed',
      code: 'ANALYSIS_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

function calculateDifferentialExpression(sample_a: any, sample_b: any) {
  const genes = Object.keys(sample_a);
  const significanceThreshold = 0.05;
  
  return genes.map(gene => {
    const expr_a = sample_a[gene];
    const expr_b = sample_b[gene];
    
    // Calculate fold change
    const foldChange = expr_b / expr_a;
    const log2FoldChange = Math.log2(Math.abs(foldChange));
    
    // Simulate p-value calculation (in real implementation, use proper statistical tests)
    const pValue = Math.random() * 0.1; // Simulate p-values
    
    // Determine significance and regulation
    const significance = pValue < significanceThreshold ? 'Significant' : 'Not Significant';
    let regulation = 'Unchanged';
    
    if (Math.abs(log2FoldChange) > 1 && pValue < significanceThreshold) {
      regulation = foldChange > 1 ? 'Upregulated' : 'Downregulated';
    }
    
    return {
      gene,
      sample_a_expression: expr_a,
      sample_b_expression: expr_b,
      fold_change: foldChange,
      log2_fold_change: log2FoldChange,
      p_value: pValue,
      significance,
      regulation
    };
  }).sort((a, b) => Math.abs(b.log2_fold_change) - Math.abs(a.log2_fold_change));
}

function generateSummary(differentialExpression: any[]) {
  const upregulated = differentialExpression.filter(g => g.regulation === 'Upregulated').length;
  const downregulated = differentialExpression.filter(g => g.regulation === 'Downregulated').length;
  const unchanged = differentialExpression.filter(g => g.regulation === 'Unchanged').length;
  const significant = differentialExpression.filter(g => g.significance === 'Significant').length;
  
  return {
    total_genes: differentialExpression.length,
    upregulated,
    downregulated,
    unchanged,
    significant_genes: significant,
    significant_threshold: 0.05
  };
}

function performPathwayAnalysis(differentialExpression: any[]) {
  // Simulate pathway analysis based on significant genes
  const significantGenes = differentialExpression
    .filter(g => g.significance === 'Significant')
    .map(g => g.gene);
  
  const pathways = [
    {
      pathway: 'DNA Damage Response',
      genes: ['TP53', 'ATM', 'BRCA1', 'CHEK2'],
      description: 'Response to DNA damage and repair mechanisms'
    },
    {
      pathway: 'Oxidative Stress Response',
      genes: ['SOD1', 'CAT', 'GPX1', 'NRF2'],
      description: 'Cellular response to oxidative stress'
    },
    {
      pathway: 'Cell Cycle Regulation',
      genes: ['CCND1', 'CDK4', 'RB1', 'E2F1'],
      description: 'Control of cell division and proliferation'
    },
    {
      pathway: 'Apoptosis',
      genes: ['BAX', 'BCL2', 'CASP3', 'FAS'],
      description: 'Programmed cell death pathways'
    },
    {
      pathway: 'Immune Response',
      genes: ['IL6', 'TNF', 'IFNG', 'CD8A'],
      description: 'Immune system activation and response'
    },
    {
      pathway: 'Muscle Development',
      genes: ['MYC', 'MYOD1', 'MSTN', 'IGF1'],
      description: 'Muscle growth and development'
    }
  ];
  
  return pathways.map(pathway => {
    const genesInvolved = pathway.genes.filter(gene => significantGenes.includes(gene));
    const enrichmentScore = genesInvolved.length / pathway.genes.length;
    const pValue = Math.random() * 0.1; // Simulate enrichment p-value
    
    return {
      pathway: pathway.pathway,
      genes_involved: genesInvolved,
      enrichment_score: enrichmentScore,
      p_value: pValue,
      description: pathway.description
    };
  }).filter(p => p.genes_involved.length > 0)
    .sort((a, b) => b.enrichment_score - a.enrichment_score);
}

function calculateQualityMetrics(sample_a: any, sample_b: any) {
  const genes = Object.keys(sample_a);
  const values_a = genes.map(gene => sample_a[gene]);
  const values_b = genes.map(gene => sample_b[gene]);
  
  // Calculate correlation between samples
  const correlation = stats.sampleCorrelation(values_a, values_b);
  
  // Calculate sample similarity (inverse of coefficient of variation)
  const cv_a = stats.sampleStandardDeviation(values_a) / stats.mean(values_a);
  const cv_b = stats.sampleStandardDeviation(values_b) / stats.mean(values_b);
  const avgCV = (cv_a + cv_b) / 2;
  const sampleSimilarity = Math.max(0, 1 - avgCV);
  
  // Determine data quality
  let dataQuality = 'Poor';
  if (correlation > 0.7 && sampleSimilarity > 0.6) {
    dataQuality = 'Excellent';
  } else if (correlation > 0.5 && sampleSimilarity > 0.4) {
    dataQuality = 'Good';
  } else if (correlation > 0.3 && sampleSimilarity > 0.2) {
    dataQuality = 'Fair';
  }
  
  return {
    correlation: Math.round(correlation * 1000) / 1000,
    data_quality: dataQuality,
    sample_similarity: Math.round(sampleSimilarity * 1000) / 1000
  };
}

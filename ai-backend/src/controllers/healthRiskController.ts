import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as stats from 'simple-statistics';

interface HealthRiskRequest {
  biomarkers: {
    CRP: number;      // C-Reactive Protein (mg/L)
    Cortisol: number; // Cortisol (μg/dL)
    CK: number;       // Creatine Kinase (μkat/L)
  };
  metadata: {
    subject: string;
    mission_duration?: number;
    radiation_exposure?: number;
    age?: number;
    gender?: string;
  };
}

interface HealthRiskResult {
  analysis_id: string;
  risk_score: number;
  risk_level: string;
  biomarker_analysis: {
    CRP: { value: number; status: string; reference_range: string; impact: string };
    Cortisol: { value: number; status: string; reference_range: string; impact: string };
    CK: { value: number; status: string; reference_range: string; impact: string };
  };
  recommendations: string[];
  confidence: number;
  model_version: string;
  timestamp: string;
}

export const healthRiskPrediction = async (req: Request, res: Response) => {
  try {
    const { biomarkers, metadata }: HealthRiskRequest = req.body;
    
    console.log(`[AI] Health risk prediction requested for subject: ${metadata.subject}`);
    
    // Simulate AI model processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Advanced health risk calculation
    const riskScore = calculateHealthRisk(biomarkers, metadata);
    const riskLevel = getRiskLevel(riskScore);
    const biomarkerAnalysis = analyzeBiomarkers(biomarkers);
    const recommendations = generateRecommendations(biomarkers, riskScore, metadata);
    const confidence = calculateConfidence(biomarkers, metadata);
    
    const result: HealthRiskResult = {
      analysis_id: uuidv4(),
      risk_score: riskScore,
      risk_level: riskLevel,
      biomarker_analysis: biomarkerAnalysis,
      recommendations,
      confidence,
      model_version: '2.1.0',
      timestamp: new Date().toISOString()
    };
    
    console.log(`[AI] Health risk analysis completed: ${riskLevel} (${riskScore.toFixed(2)})`);
    
    res.json({
      success: true,
      data: result,
      processing_time_ms: 1500 + Math.random() * 1000,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[AI] Health risk prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Health risk prediction failed',
      code: 'PREDICTION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

function calculateHealthRisk(biomarkers: any, metadata: any): number {
  // Sophisticated risk calculation based on biomarkers and mission parameters
  let riskScore = 0;
  
  // CRP contribution (inflammation marker)
  const crpNormal = 1.0;
  const crpWeight = 0.35;
  riskScore += Math.min((biomarkers.CRP / crpNormal), 3) * crpWeight;
  
  // Cortisol contribution (stress marker)
  const cortisolNormal = 0.5;
  const cortisolWeight = 0.30;
  riskScore += Math.min((biomarkers.Cortisol / cortisolNormal), 3) * cortisolWeight;
  
  // Creatine Kinase contribution (muscle damage marker)
  const ckNormal = 1.0;
  const ckWeight = 0.25;
  riskScore += Math.min((biomarkers.CK / ckNormal), 3) * ckWeight;
  
  // Mission duration factor
  if (metadata.mission_duration) {
    const durationFactor = Math.min(metadata.mission_duration / 180, 2) * 0.1;
    riskScore += durationFactor;
  }
  
  // Radiation exposure factor
  if (metadata.radiation_exposure) {
    const radiationFactor = Math.min(metadata.radiation_exposure / 50, 2) * 0.15;
    riskScore += radiationFactor;
  }
  
  // Age factor
  if (metadata.age) {
    const ageFactor = Math.max(0, (metadata.age - 35) / 35) * 0.1;
    riskScore += ageFactor;
  }
  
  // Add some realistic variability
  riskScore += (Math.random() - 0.5) * 0.1;
  
  return Math.max(0, Math.min(1, riskScore));
}

function getRiskLevel(score: number): string {
  if (score < 0.3) return 'Low';
  if (score < 0.6) return 'Moderate';
  if (score < 0.8) return 'High';
  return 'Critical';
}

function analyzeBiomarkers(biomarkers: any) {
  return {
    CRP: {
      value: biomarkers.CRP,
      status: biomarkers.CRP > 3.0 ? 'Elevated' : biomarkers.CRP > 1.0 ? 'Borderline' : 'Normal',
      reference_range: '< 1.0 mg/L (Normal), 1.0-3.0 mg/L (Borderline), > 3.0 mg/L (Elevated)',
      impact: biomarkers.CRP > 3.0 ? 'High inflammation risk' : biomarkers.CRP > 1.0 ? 'Mild inflammation' : 'No inflammation detected'
    },
    Cortisol: {
      value: biomarkers.Cortisol,
      status: biomarkers.Cortisol > 1.0 ? 'Elevated' : biomarkers.Cortisol > 0.6 ? 'Borderline' : 'Normal',
      reference_range: '< 0.6 μg/dL (Normal), 0.6-1.0 μg/dL (Borderline), > 1.0 μg/dL (Elevated)',
      impact: biomarkers.Cortisol > 1.0 ? 'High stress response' : biomarkers.Cortisol > 0.6 ? 'Moderate stress' : 'Normal stress levels'
    },
    CK: {
      value: biomarkers.CK,
      status: biomarkers.CK > 2.0 ? 'Elevated' : biomarkers.CK > 1.2 ? 'Borderline' : 'Normal',
      reference_range: '< 1.2 μkat/L (Normal), 1.2-2.0 μkat/L (Borderline), > 2.0 μkat/L (Elevated)',
      impact: biomarkers.CK > 2.0 ? 'Significant muscle damage' : biomarkers.CK > 1.2 ? 'Mild muscle stress' : 'Normal muscle function'
    }
  };
}

function generateRecommendations(biomarkers: any, riskScore: number, metadata: any): string[] {
  const recommendations: string[] = [];
  
  if (biomarkers.CRP > 1.0) {
    recommendations.push('Monitor inflammatory markers closely');
    recommendations.push('Consider anti-inflammatory interventions');
  }
  
  if (biomarkers.Cortisol > 0.6) {
    recommendations.push('Implement stress reduction protocols');
    recommendations.push('Monitor sleep quality and duration');
  }
  
  if (biomarkers.CK > 1.2) {
    recommendations.push('Adjust exercise intensity');
    recommendations.push('Monitor muscle recovery protocols');
  }
  
  if (riskScore > 0.6) {
    recommendations.push('Increase medical monitoring frequency');
    recommendations.push('Consider mission timeline adjustments');
  }
  
  if (metadata.mission_duration && metadata.mission_duration > 90) {
    recommendations.push('Implement long-duration mission health protocols');
    recommendations.push('Schedule regular health assessments');
  }
  
  // Always include general recommendations
  recommendations.push('Maintain regular exercise routine');
  recommendations.push('Monitor hydration and nutrition status');
  recommendations.push('Continue regular biomarker monitoring');
  
  return recommendations;
}

function calculateConfidence(biomarkers: any, metadata: any): number {
  let confidence = 0.85; // Base confidence
  
  // Reduce confidence for extreme values
  if (biomarkers.CRP > 5 || biomarkers.Cortisol > 2 || biomarkers.CK > 3) {
    confidence -= 0.1;
  }
  
  // Increase confidence with more metadata
  if (metadata.age && metadata.gender) confidence += 0.05;
  if (metadata.mission_duration) confidence += 0.03;
  if (metadata.radiation_exposure) confidence += 0.02;
  
  return Math.max(0.7, Math.min(0.95, confidence));
}

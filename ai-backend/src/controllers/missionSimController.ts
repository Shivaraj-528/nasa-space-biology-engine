import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface MissionSimRequest {
  mission: string;
  duration_days: number;
  environment: {
    radiation: 'low' | 'medium' | 'high';
    gravity: string;
    atmosphere?: string;
    temperature?: {
      min: number;
      max: number;
    };
  };
  crew_profile?: {
    size?: number;
    avg_age?: number;
    experience_level?: 'novice' | 'experienced' | 'veteran';
  };
}

interface MissionSimResult {
  simulation_id: string;
  mission_profile: {
    name: string;
    duration_days: number;
    environment_type: string;
    risk_level: string;
  };
  biological_impacts: {
    cardiovascular: {
      impact_score: number;
      description: string;
      timeline: { day: number; effect: string; severity: string }[];
    };
    musculoskeletal: {
      impact_score: number;
      description: string;
      bone_density_loss: number;
      muscle_mass_loss: number;
    };
    radiation_exposure: {
      total_dose_mSv: number;
      cancer_risk_increase: number;
      acute_effects: string[];
    };
    psychological: {
      stress_level: number;
      isolation_impact: number;
      performance_degradation: number;
    };
  };
  crew_health_projections: {
    day: number;
    overall_health: number;
    fitness_level: number;
    cognitive_performance: number;
    mission_readiness: number;
  }[];
  countermeasures: {
    category: string;
    intervention: string;
    effectiveness: number;
    implementation_day: number;
  }[];
  mission_success_probability: number;
  model_version: string;
  timestamp: string;
}

export const missionSimulation = async (req: Request, res: Response) => {
  try {
    const { mission, duration_days, environment, crew_profile }: MissionSimRequest = req.body;
    
    console.log(`[AI] Mission simulation requested: ${mission} (${duration_days} days)`);
    
    // Simulate AI model processing time
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    // Perform mission simulation
    const missionProfile = analyzeMissionProfile(mission, duration_days, environment);
    const biologicalImpacts = simulateBiologicalImpacts(duration_days, environment, crew_profile);
    const healthProjections = generateHealthProjections(duration_days, environment, crew_profile);
    const countermeasures = recommendCountermeasures(duration_days, environment, biologicalImpacts);
    const successProbability = calculateMissionSuccess(biologicalImpacts, countermeasures, crew_profile);
    
    const result: MissionSimResult = {
      simulation_id: uuidv4(),
      mission_profile: missionProfile,
      biological_impacts: biologicalImpacts,
      crew_health_projections: healthProjections,
      countermeasures,
      mission_success_probability: successProbability,
      model_version: '3.0.0',
      timestamp: new Date().toISOString()
    };
    
    console.log(`[AI] Mission simulation completed: ${missionProfile.risk_level} risk, ${(successProbability * 100).toFixed(1)}% success probability`);
    
    res.json({
      success: true,
      data: result,
      processing_time_ms: 3000 + Math.random() * 2000,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[AI] Mission simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Mission simulation failed',
      code: 'SIMULATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

function analyzeMissionProfile(mission: string, duration: number, environment: any) {
  let environmentType = 'Unknown';
  let riskLevel = 'Low';
  
  // Determine environment type based on gravity
  const gravity = parseFloat(environment.gravity);
  if (gravity < 0.2) {
    environmentType = 'Lunar';
  } else if (gravity < 0.5) {
    environmentType = 'Mars';
  } else if (gravity < 1.0) {
    environmentType = 'Asteroid/Low Gravity';
  } else {
    environmentType = 'Earth-like/ISS';
  }
  
  // Calculate risk level
  let riskScore = 0;
  
  // Duration risk
  if (duration > 365) riskScore += 3;
  else if (duration > 180) riskScore += 2;
  else if (duration > 90) riskScore += 1;
  
  // Radiation risk
  if (environment.radiation === 'high') riskScore += 3;
  else if (environment.radiation === 'medium') riskScore += 2;
  else riskScore += 1;
  
  // Gravity risk
  if (gravity < 0.2) riskScore += 2;
  else if (gravity < 0.5) riskScore += 1;
  
  if (riskScore >= 6) riskLevel = 'Critical';
  else if (riskScore >= 4) riskLevel = 'High';
  else if (riskScore >= 2) riskLevel = 'Moderate';
  
  return {
    name: mission,
    duration_days: duration,
    environment_type: environmentType,
    risk_level: riskLevel
  };
}

function simulateBiologicalImpacts(duration: number, environment: any, crew_profile: any) {
  const gravity = parseFloat(environment.gravity);
  
  // Cardiovascular impacts
  const cardiovascularImpact = Math.min(10, (1 - gravity) * 5 + duration / 100);
  const cardiovascularTimeline = generateCardiovascularTimeline(duration, gravity);
  
  // Musculoskeletal impacts
  const boneDensityLoss = Math.min(20, (1 - gravity) * 10 + duration / 50); // % loss
  const muscleMassLoss = Math.min(25, (1 - gravity) * 12 + duration / 40); // % loss
  const musculoskeletalImpact = (boneDensityLoss + muscleMassLoss) / 4;
  
  // Radiation exposure
  let radiationDose = 0;
  if (environment.radiation === 'high') radiationDose = duration * 2.5;
  else if (environment.radiation === 'medium') radiationDose = duration * 1.5;
  else radiationDose = duration * 0.5;
  
  const cancerRiskIncrease = radiationDose * 0.05; // % increase per mSv
  const acuteEffects = radiationDose > 1000 ? ['Radiation sickness', 'Nausea', 'Fatigue'] : 
                     radiationDose > 500 ? ['Mild radiation effects', 'Immune suppression'] : [];
  
  // Psychological impacts
  const isolationFactor = Math.min(10, duration / 30);
  const stressLevel = Math.min(10, isolationFactor + (environment.radiation === 'high' ? 2 : 0));
  const performanceDegradation = Math.min(30, stressLevel * 2 + duration / 50);
  
  return {
    cardiovascular: {
      impact_score: Math.round(cardiovascularImpact * 10) / 10,
      description: `${cardiovascularImpact > 7 ? 'Severe' : cardiovascularImpact > 4 ? 'Moderate' : 'Mild'} cardiovascular deconditioning expected`,
      timeline: cardiovascularTimeline
    },
    musculoskeletal: {
      impact_score: Math.round(musculoskeletalImpact * 10) / 10,
      description: `Significant bone and muscle loss in microgravity environment`,
      bone_density_loss: Math.round(boneDensityLoss * 10) / 10,
      muscle_mass_loss: Math.round(muscleMassLoss * 10) / 10
    },
    radiation_exposure: {
      total_dose_mSv: Math.round(radiationDose),
      cancer_risk_increase: Math.round(cancerRiskIncrease * 100) / 100,
      acute_effects: acuteEffects
    },
    psychological: {
      stress_level: Math.round(stressLevel * 10) / 10,
      isolation_impact: Math.round(isolationFactor * 10) / 10,
      performance_degradation: Math.round(performanceDegradation * 10) / 10
    }
  };
}

function generateCardiovascularTimeline(duration: number, gravity: number) {
  const timeline = [];
  const checkpoints = [7, 30, 90, 180, 365];
  
  for (const day of checkpoints) {
    if (day > duration) break;
    
    let effect = 'Minimal changes';
    let severity = 'Low';
    
    if (gravity < 0.5) {
      if (day >= 180) {
        effect = 'Significant cardiac deconditioning';
        severity = 'High';
      } else if (day >= 90) {
        effect = 'Moderate cardiac adaptation';
        severity = 'Moderate';
      } else if (day >= 30) {
        effect = 'Early cardiac changes';
        severity = 'Low';
      }
    }
    
    timeline.push({ day, effect, severity });
  }
  
  return timeline;
}

function generateHealthProjections(duration: number, environment: any, crew_profile: any) {
  const projections = [];
  const gravity = parseFloat(environment.gravity);
  const checkInterval = Math.max(7, Math.floor(duration / 20));
  
  for (let day = 0; day <= duration; day += checkInterval) {
    const progressFactor = day / duration;
    
    // Calculate health metrics (0-100 scale)
    let overallHealth = 100 - (progressFactor * (1 - gravity) * 30);
    let fitnessLevel = 100 - (progressFactor * (1 - gravity) * 40);
    let cognitivePerformance = 100 - (progressFactor * 15); // General mission stress
    let missionReadiness = (overallHealth + fitnessLevel + cognitivePerformance) / 3;
    
    // Apply radiation effects
    if (environment.radiation === 'high') {
      overallHealth -= progressFactor * 10;
      cognitivePerformance -= progressFactor * 8;
    }
    
    // Ensure values stay within bounds
    overallHealth = Math.max(20, Math.min(100, overallHealth));
    fitnessLevel = Math.max(15, Math.min(100, fitnessLevel));
    cognitivePerformance = Math.max(30, Math.min(100, cognitivePerformance));
    missionReadiness = Math.max(20, Math.min(100, missionReadiness));
    
    projections.push({
      day,
      overall_health: Math.round(overallHealth),
      fitness_level: Math.round(fitnessLevel),
      cognitive_performance: Math.round(cognitivePerformance),
      mission_readiness: Math.round(missionReadiness)
    });
  }
  
  return projections;
}

function recommendCountermeasures(duration: number, environment: any, impacts: any) {
  const countermeasures = [];
  
  // Exercise countermeasures
  if (impacts.musculoskeletal.impact_score > 3) {
    countermeasures.push({
      category: 'Exercise',
      intervention: 'Advanced Resistive Exercise Device (ARED) - 2.5 hours daily',
      effectiveness: 0.75,
      implementation_day: 1
    });
  }
  
  if (impacts.cardiovascular.impact_score > 4) {
    countermeasures.push({
      category: 'Cardiovascular',
      intervention: 'Combined Exercise and Lower Body Negative Pressure',
      effectiveness: 0.65,
      implementation_day: 7
    });
  }
  
  // Radiation countermeasures
  if (impacts.radiation_exposure.total_dose_mSv > 500) {
    countermeasures.push({
      category: 'Radiation Protection',
      intervention: 'Enhanced shielding and radioprotective pharmaceuticals',
      effectiveness: 0.60,
      implementation_day: 1
    });
  }
  
  // Psychological countermeasures
  if (impacts.psychological.stress_level > 5) {
    countermeasures.push({
      category: 'Psychological',
      intervention: 'Regular Earth communication and virtual reality recreation',
      effectiveness: 0.70,
      implementation_day: 14
    });
  }
  
  // Nutritional countermeasures
  if (duration > 90) {
    countermeasures.push({
      category: 'Nutrition',
      intervention: 'Optimized nutrition with bone health supplements',
      effectiveness: 0.55,
      implementation_day: 1
    });
  }
  
  return countermeasures;
}

function calculateMissionSuccess(impacts: any, countermeasures: any, crew_profile: any) {
  let successProbability = 0.95; // Base success rate
  
  // Reduce success based on impacts
  successProbability -= impacts.cardiovascular.impact_score * 0.02;
  successProbability -= impacts.musculoskeletal.impact_score * 0.015;
  successProbability -= impacts.radiation_exposure.cancer_risk_increase * 0.01;
  successProbability -= impacts.psychological.performance_degradation * 0.005;
  
  // Increase success based on countermeasures
  const avgEffectiveness = countermeasures.reduce((sum: number, cm: any) => sum + cm.effectiveness, 0) / countermeasures.length;
  successProbability += avgEffectiveness * 0.1;
  
  // Crew experience factor
  if (crew_profile?.experience_level === 'veteran') {
    successProbability += 0.05;
  } else if (crew_profile?.experience_level === 'novice') {
    successProbability -= 0.03;
  }
  
  return Math.max(0.3, Math.min(0.99, successProbability));
}

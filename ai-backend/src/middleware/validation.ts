import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const handleValidationError = (error: Joi.ValidationError, res: Response) => {
  const details = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    value: detail.context?.value
  }));

  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details,
    timestamp: new Date().toISOString()
  });
};

// Health Risk Validation
const healthRiskSchema = Joi.object({
  biomarkers: Joi.object({
    CRP: Joi.number().min(0).max(50).required().description('C-Reactive Protein (mg/L)'),
    Cortisol: Joi.number().min(0).max(5).required().description('Cortisol (μg/dL)'),
    CK: Joi.number().min(0).max(10).required().description('Creatine Kinase (μkat/L)')
  }).required(),
  metadata: Joi.object({
    subject: Joi.string().required(),
    mission_duration: Joi.number().min(1).max(1000).optional(),
    radiation_exposure: Joi.number().min(0).max(100).optional(),
    age: Joi.number().min(18).max(70).optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  }).required()
});

export const validateHealthRisk = (req: Request, res: Response, next: NextFunction) => {
  const { error } = healthRiskSchema.validate(req.body);
  if (error) {
    handleValidationError(error, res);
    return;
  }
  next();
};

// Gene Expression Validation
const geneExpressionSchema = Joi.object({
  sample_a: Joi.object().pattern(
    Joi.string(),
    Joi.number().required()
  ).min(1).required().description('Gene expression values for sample A'),
  sample_b: Joi.object().pattern(
    Joi.string(),
    Joi.number().required()
  ).min(1).required().description('Gene expression values for sample B'),
  metadata: Joi.object({
    experiment_id: Joi.string().optional(),
    organism: Joi.string().optional(),
    tissue_type: Joi.string().optional(),
    treatment: Joi.string().optional(),
    control: Joi.string().optional()
  }).optional()
});

export const validateGeneExpression = (req: Request, res: Response, next: NextFunction) => {
  const { error } = geneExpressionSchema.validate(req.body);
  if (error) {
    handleValidationError(error, res);
    return;
  }
  next();
};

// Mission Simulation Validation
const missionSimSchema = Joi.object({
  mission: Joi.string().required().description('Mission identifier'),
  duration_days: Joi.number().min(1).max(1000).required().description('Mission duration in days'),
  environment: Joi.object({
    radiation: Joi.string().valid('low', 'medium', 'high').required(),
    gravity: Joi.string().pattern(/^[0-9.]+g$/).required().description('Gravity level (e.g., 0.16g, 1g)'),
    atmosphere: Joi.string().valid('earth', 'co2', 'vacuum', 'mixed').optional(),
    temperature: Joi.object({
      min: Joi.number().min(-273).max(100),
      max: Joi.number().min(-273).max(100)
    }).optional()
  }).required(),
  crew_profile: Joi.object({
    size: Joi.number().min(1).max(20).optional(),
    avg_age: Joi.number().min(18).max(70).optional(),
    experience_level: Joi.string().valid('novice', 'experienced', 'veteran').optional()
  }).optional()
});

export const validateMissionSim = (req: Request, res: Response, next: NextFunction) => {
  const { error } = missionSimSchema.validate(req.body);
  if (error) {
    handleValidationError(error, res);
    return;
  }
  next();
};

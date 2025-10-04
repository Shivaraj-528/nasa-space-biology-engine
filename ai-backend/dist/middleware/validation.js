"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMissionSim = exports.validateGeneExpression = exports.validateHealthRisk = void 0;
const joi_1 = __importDefault(require("joi"));
const handleValidationError = (error, res) => {
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
const healthRiskSchema = joi_1.default.object({
    biomarkers: joi_1.default.object({
        CRP: joi_1.default.number().min(0).max(50).required().description('C-Reactive Protein (mg/L)'),
        Cortisol: joi_1.default.number().min(0).max(5).required().description('Cortisol (μg/dL)'),
        CK: joi_1.default.number().min(0).max(10).required().description('Creatine Kinase (μkat/L)')
    }).required(),
    metadata: joi_1.default.object({
        subject: joi_1.default.string().required(),
        mission_duration: joi_1.default.number().min(1).max(1000).optional(),
        radiation_exposure: joi_1.default.number().min(0).max(100).optional(),
        age: joi_1.default.number().min(18).max(70).optional(),
        gender: joi_1.default.string().valid('male', 'female', 'other').optional()
    }).required()
});
const validateHealthRisk = (req, res, next) => {
    const { error } = healthRiskSchema.validate(req.body);
    if (error) {
        handleValidationError(error, res);
        return;
    }
    next();
};
exports.validateHealthRisk = validateHealthRisk;
const geneExpressionSchema = joi_1.default.object({
    sample_a: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.number().required()).min(1).required().description('Gene expression values for sample A'),
    sample_b: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.number().required()).min(1).required().description('Gene expression values for sample B'),
    metadata: joi_1.default.object({
        experiment_id: joi_1.default.string().optional(),
        organism: joi_1.default.string().optional(),
        tissue_type: joi_1.default.string().optional(),
        treatment: joi_1.default.string().optional(),
        control: joi_1.default.string().optional()
    }).optional()
});
const validateGeneExpression = (req, res, next) => {
    const { error } = geneExpressionSchema.validate(req.body);
    if (error) {
        handleValidationError(error, res);
        return;
    }
    next();
};
exports.validateGeneExpression = validateGeneExpression;
const missionSimSchema = joi_1.default.object({
    mission: joi_1.default.string().required().description('Mission identifier'),
    duration_days: joi_1.default.number().min(1).max(1000).required().description('Mission duration in days'),
    environment: joi_1.default.object({
        radiation: joi_1.default.string().valid('low', 'medium', 'high').required(),
        gravity: joi_1.default.string().pattern(/^[0-9.]+g$/).required().description('Gravity level (e.g., 0.16g, 1g)'),
        atmosphere: joi_1.default.string().valid('earth', 'co2', 'vacuum', 'mixed').optional(),
        temperature: joi_1.default.object({
            min: joi_1.default.number().min(-273).max(100),
            max: joi_1.default.number().min(-273).max(100)
        }).optional()
    }).required(),
    crew_profile: joi_1.default.object({
        size: joi_1.default.number().min(1).max(20).optional(),
        avg_age: joi_1.default.number().min(18).max(70).optional(),
        experience_level: joi_1.default.string().valid('novice', 'experienced', 'veteran').optional()
    }).optional()
});
const validateMissionSim = (req, res, next) => {
    const { error } = missionSimSchema.validate(req.body);
    if (error) {
        handleValidationError(error, res);
        return;
    }
    next();
};
exports.validateMissionSim = validateMissionSim;
//# sourceMappingURL=validation.js.map
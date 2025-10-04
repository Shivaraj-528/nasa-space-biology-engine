"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthRiskController_1 = require("../controllers/healthRiskController");
const geneExpressionController_1 = require("../controllers/geneExpressionController");
const missionSimController_1 = require("../controllers/missionSimController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/predict/health-risk', validation_1.validateHealthRisk, healthRiskController_1.healthRiskPrediction);
router.post('/analyze/gene-expression', validation_1.validateGeneExpression, geneExpressionController_1.geneExpressionAnalysis);
router.post('/simulate/mission', validation_1.validateMissionSim, missionSimController_1.missionSimulation);
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            service: 'NASA AI Analysis Engine',
            version: '1.0.0',
            status: 'operational',
            capabilities: [
                'Health Risk Prediction',
                'Gene Expression Analysis',
                'Mission Simulation',
                'Biomarker Analysis',
                'Space Environment Modeling'
            ],
            models: {
                health_risk: {
                    version: '2.1.0',
                    accuracy: 0.89,
                    last_trained: '2024-01-15'
                },
                gene_expression: {
                    version: '1.8.0',
                    correlation_threshold: 0.85,
                    last_updated: '2024-02-01'
                },
                mission_sim: {
                    version: '3.0.0',
                    environments: ['lunar', 'mars', 'iss', 'deep_space'],
                    last_calibrated: '2024-01-30'
                }
            },
            timestamp: new Date().toISOString()
        }
    });
});
router.get('/models', (req, res) => {
    res.json({
        success: true,
        data: {
            available_models: [
                {
                    id: 'health-risk-v2',
                    name: 'Space Health Risk Predictor',
                    description: 'Predicts health risks for astronauts based on biomarkers and mission parameters',
                    input_features: ['CRP', 'Cortisol', 'CK', 'mission_duration', 'radiation_exposure'],
                    output: 'risk_score',
                    accuracy: 0.89,
                    status: 'active'
                },
                {
                    id: 'gene-expression-v1',
                    name: 'Gene Expression Analyzer',
                    description: 'Analyzes differential gene expression in space environments',
                    input_features: ['gene_counts', 'sample_metadata', 'experimental_conditions'],
                    output: 'differential_expression',
                    correlation_threshold: 0.85,
                    status: 'active'
                },
                {
                    id: 'mission-sim-v3',
                    name: 'Mission Environment Simulator',
                    description: 'Simulates biological responses to various space mission environments',
                    input_features: ['mission_type', 'duration', 'environment', 'crew_profile'],
                    output: 'simulation_results',
                    environments: ['lunar', 'mars', 'iss', 'deep_space'],
                    status: 'active'
                }
            ],
            total_models: 3,
            timestamp: new Date().toISOString()
        }
    });
});
exports.default = router;
//# sourceMappingURL=ai.js.map
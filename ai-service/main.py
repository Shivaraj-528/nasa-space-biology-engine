from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict
import time

app = FastAPI(title="NASA Space Biology Engine AI Service", version="1.0.0")


class HealthRiskRequest(BaseModel):
    biomarkers: Dict[str, float]
    metadata: Dict[str, Any] | None = None


class GeneExpressionRequest(BaseModel):
    sample_a: Dict[str, float]
    sample_b: Dict[str, float]
    metadata: Dict[str, Any] | None = None


class MissionSimRequest(BaseModel):
    mission: str
    duration_days: int
    environment: Dict[str, Any]


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "service": "ai-service", "time": time.time()}


@app.post("/api/v1/ai/predict/health-risk")
async def predict_health_risk(req: HealthRiskRequest):
    # Placeholder logic
    risk_score = min(0.99, sum(req.biomarkers.values()) / (len(req.biomarkers) * 10.0)) if req.biomarkers else 0.05
    risk_level = "low" if risk_score < 0.33 else ("medium" if risk_score < 0.66 else "high")
    return {
        "risk_score": round(risk_score, 3),
        "risk_level": risk_level,
        "model": "random_forest_demo",
    }


@app.post("/api/v1/ai/analyze/gene-expression")
async def analyze_gene_expression(req: GeneExpressionRequest):
    # Placeholder differential expression: (A - B)
    diffs = {gene: req.sample_a.get(gene, 0.0) - val for gene, val in req.sample_b.items()}
    top = sorted(diffs.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
    return {
        "top_genes": [{"gene": g, "delta": round(d, 4)} for g, d in top],
        "method": "demo_diff",
    }


@app.post("/api/v1/ai/simulate/mission")
async def simulate_mission(req: MissionSimRequest):
    return {
        "mission": req.mission,
        "duration_days": req.duration_days,
        "summary": "Simulation completed (demo).",
        "environment": req.environment,
    }

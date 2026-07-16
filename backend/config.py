"""
FORTIX Backend — Configuration Settings
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "fortix.db"

# Database
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Security
SECRET_KEY = os.getenv("FORTIX_SECRET_KEY", "fortix-quantum-safe-jwt-secret-2026-enterprise")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8-hour shift

# CORS — allowed frontend origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
]

# ML Model Hyperparameters
ML_CONFIG = {
    "isolation_forest": {
        "n_estimators": 100,
        "contamination": 0.1,
        "random_state": 42,
    },
    "gradient_boosting": {
        "n_estimators": 100,
        "max_depth": 4,
        "learning_rate": 0.1,
        "random_state": 42,
    },
    "trust_dna_weights": {
        "identity": 0.20,
        "behavior": 0.20,
        "device": 0.15,
        "network": 0.15,
        "data": 0.10,
        "command": 0.10,
        "cloud": 0.10,
    },
    "swarm_model_weights": {
        "anomaly_detector": 0.30,
        "risk_predictor": 0.25,
        "trust_dna": 0.25,
        "collusion_engine": 0.20,
    },
}

# Event Generator
EVENT_INTERVAL_SECONDS = 3

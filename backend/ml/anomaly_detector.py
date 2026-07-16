"""
FORTIX ML — Isolation Forest Anomaly Detector

Uses scikit-learn's Isolation Forest to flag insider threat anomalies.
The model is trained on normal behavioral patterns and returns an
anomaly score for each user's latest telemetry snapshot.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from backend.config import ML_CONFIG

PARAMS = ML_CONFIG["isolation_forest"]

# Feature vector ordering
FEATURE_NAMES = [
    "login_hour",
    "query_volume",
    "file_exports",
    "cloud_uploads",
    "device_count",
    "vpn_distance",
    "working_hours",
    "sudo_usage",
]


class AnomalyDetector:
    """Isolation Forest based insider threat anomaly detector."""

    def __init__(self):
        self.model: Optional[IsolationForest] = None
        self.is_trained = False
        self._training_data: Optional[np.ndarray] = None

    def train(self, db: Session):
        """
        Train the Isolation Forest on all users' historical behavioral data.
        Each row = one user's aggregated feature vector from the last 30 days.
        """
        from backend.models.db_models import BehaviorLog, User

        users = db.query(User).filter(User.is_active == True).all()
        if not users:
            return

        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        feature_matrix = []

        for user in users:
            logs = (
                db.query(BehaviorLog)
                .filter(BehaviorLog.user_id == user.id)
                .filter(BehaviorLog.timestamp >= cutoff)
                .all()
            )
            feature_vec = self._extract_features(logs)
            feature_matrix.append(feature_vec)

        if len(feature_matrix) < 3:
            # Need minimum samples — generate synthetic normals
            for _ in range(10):
                feature_matrix.append(self._generate_normal_sample())

        X = np.array(feature_matrix, dtype=np.float64)
        self._training_data = X

        self.model = IsolationForest(
            n_estimators=PARAMS["n_estimators"],
            contamination=PARAMS["contamination"],
            random_state=PARAMS["random_state"],
        )
        self.model.fit(X)
        self.is_trained = True

    def predict(self, db: Session, user_id: int) -> dict:
        """
        Score a single user for anomaly. Returns:
          anomaly_score: float between 0 and 1 (1 = highly anomalous)
          confidence: percentage
          is_anomalous: bool
        """
        if not self.is_trained:
            self.train(db)

        from backend.models.db_models import BehaviorLog

        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        logs = (
            db.query(BehaviorLog)
            .filter(BehaviorLog.user_id == user_id)
            .filter(BehaviorLog.timestamp >= cutoff)
            .all()
        )

        features = self._extract_features(logs)
        X = np.array([features], dtype=np.float64)

        # Isolation Forest: decision_function returns negative for outliers
        raw_score = self.model.decision_function(X)[0]
        prediction = self.model.predict(X)[0]  # -1 = anomaly, 1 = normal

        # Normalize raw_score to [0, 1] where 1 = most anomalous
        # decision_function typically ranges from about -0.5 to 0.5
        anomaly_score = max(0.0, min(1.0, 0.5 - raw_score))
        confidence = round(abs(raw_score) * 100, 1)
        confidence = min(confidence, 99.9)

        return {
            "anomaly_score": round(anomaly_score, 4),
            "confidence": confidence,
            "is_anomalous": prediction == -1,
        }

    def predict_all(self, db: Session) -> list[dict]:
        """Score all active users."""
        from backend.models.db_models import User

        if not self.is_trained:
            self.train(db)

        users = db.query(User).filter(User.is_active == True).all()
        results = []
        for user in users:
            score = self.predict(db, user.id)
            results.append({
                "user_id": user.id,
                "user_name": user.name,
                "department": user.department,
                **score,
            })
        return results

    def _extract_features(self, logs) -> list[float]:
        """Aggregate behavioral logs into a fixed-length feature vector."""
        metric_agg: dict[str, list[float]] = {}
        for log in logs:
            metric_agg.setdefault(log.metric_name, []).append(log.value)

        features = []
        for feat in FEATURE_NAMES:
            vals = metric_agg.get(feat, [])
            features.append(np.mean(vals) if vals else 0.0)
        return features

    def _generate_normal_sample(self) -> list[float]:
        """Generate a synthetic normal behavioral sample for bootstrapping."""
        rng = np.random.default_rng(42)
        return [
            rng.normal(9, 2),    # login_hour: ~9 AM
            rng.normal(50, 15),  # query_volume
            rng.normal(5, 3),    # file_exports
            rng.normal(10, 5),   # cloud_uploads
            rng.normal(2, 1),    # device_count
            rng.normal(0, 0.5),  # vpn_distance (0 = normal office)
            rng.normal(8, 1),    # working_hours
            rng.normal(2, 1),    # sudo_usage
        ]


# Singleton instance
anomaly_detector = AnomalyDetector()

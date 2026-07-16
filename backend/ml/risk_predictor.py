"""
FORTIX ML — Gradient Boosted Risk Classifier

Multi-class risk prediction using scikit-learn GradientBoostingClassifier.
Classifies users into Low / Medium / High / Critical risk tiers.
Exports feature importance for the Explainable AI screen.
"""
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from backend.config import ML_CONFIG

PARAMS = ML_CONFIG["gradient_boosting"]

FEATURE_NAMES = [
    "login_hour_variance",
    "query_volume_ratio",
    "file_export_rate",
    "cloud_upload_rate",
    "vpn_distance_score",
    "device_integrity",
    "working_hours_deviation",
    "sudo_frequency",
]

RISK_CLASSES = ["Low", "Medium", "High", "Critical"]


class RiskPredictor:
    """Gradient Boosted multi-class insider threat risk classifier."""

    def __init__(self):
        self.model: Optional[GradientBoostingClassifier] = None
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(RISK_CLASSES)
        self.is_trained = False

    def train(self, db: Session):
        """
        Train on synthetic + real behavioral data with labeled risk tiers.
        Uses historical alerts to infer labels for users.
        """
        from backend.models.db_models import User, BehaviorLog, Alert

        users = db.query(User).filter(User.is_active == True).all()
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)

        X_data = []
        y_labels = []

        for user in users:
            logs = (
                db.query(BehaviorLog)
                .filter(BehaviorLog.user_id == user.id)
                .filter(BehaviorLog.timestamp >= cutoff)
                .all()
            )
            features = self._extract_features(logs)

            # Infer label from trust score and alert history
            alert_count = (
                db.query(Alert)
                .filter(Alert.user_id == user.id)
                .filter(Alert.severity.in_(["High", "Critical"]))
                .count()
            )

            if user.trust_score < 45 or alert_count >= 3:
                label = "Critical"
            elif user.trust_score < 65 or alert_count >= 2:
                label = "High"
            elif user.trust_score < 85 or alert_count >= 1:
                label = "Medium"
            else:
                label = "Low"

            X_data.append(features)
            y_labels.append(label)

        # Augment with synthetic training data for all 4 classes
        synthetic_X, synthetic_y = self._generate_synthetic_training(n_per_class=20)
        X_data.extend(synthetic_X)
        y_labels.extend(synthetic_y)

        X = np.array(X_data, dtype=np.float64)
        y = self.label_encoder.transform(y_labels)

        self.model = GradientBoostingClassifier(
            n_estimators=PARAMS["n_estimators"],
            max_depth=PARAMS["max_depth"],
            learning_rate=PARAMS["learning_rate"],
            random_state=PARAMS["random_state"],
        )
        self.model.fit(X, y)
        self.is_trained = True

    def predict(self, db: Session, user_id: int) -> dict:
        """
        Predict risk tier for a specific user.
        Returns class label, probabilities, and feature importances.
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

        pred_idx = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        predicted_class = self.label_encoder.inverse_transform([pred_idx])[0]

        # Feature importance for explainability
        importances = dict(zip(FEATURE_NAMES, self.model.feature_importances_.tolist()))

        return {
            "risk_class": predicted_class,
            "risk_score": round(float(max(probabilities)) * 100, 1),
            "probabilities": {
                cls: round(float(prob) * 100, 1)
                for cls, prob in zip(RISK_CLASSES, probabilities)
            },
            "feature_importances": importances,
        }

    def get_feature_importances(self) -> dict[str, float]:
        """Return trained model's feature importances for XAI display."""
        if not self.is_trained or self.model is None:
            return {f: 0.0 for f in FEATURE_NAMES}
        return dict(zip(FEATURE_NAMES, self.model.feature_importances_.tolist()))

    def _extract_features(self, logs) -> list[float]:
        """Aggregate behavioral logs into feature vector."""
        agg: dict[str, list[float]] = {}
        for log in logs:
            agg.setdefault(log.metric_name, []).append(log.value)

        mapping = {
            "login_hour_variance": "login_hour",
            "query_volume_ratio": "query_volume",
            "file_export_rate": "file_exports",
            "cloud_upload_rate": "cloud_uploads",
            "vpn_distance_score": "vpn_distance",
            "device_integrity": "device_integrity",
            "working_hours_deviation": "working_hours",
            "sudo_frequency": "sudo_usage",
        }

        features = []
        for feat_name in FEATURE_NAMES:
            metric = mapping.get(feat_name, feat_name)
            vals = agg.get(metric, [])
            if vals:
                mean_val = float(np.mean(vals))
                # Compute deviation from baseline
                baseline_vals = [
                    l.baseline_value for l in [log for log in (agg.get(metric + "_raw", []) or [])]
                ] or [mean_val * 0.8]
                features.append(abs(mean_val - np.mean(baseline_vals)))
            else:
                features.append(0.0)
        return features

    def _generate_synthetic_training(self, n_per_class: int = 20):
        """Generate synthetic labeled training data for all risk tiers."""
        rng = np.random.default_rng(42)
        X = []
        y = []

        profiles = {
            "Low":      {"mean": [2, 10, 3, 5, 0.2, 2, 1, 1],   "std": [1, 5, 2, 3, 0.1, 1, 0.5, 0.5]},
            "Medium":   {"mean": [5, 25, 10, 15, 2, 8, 3, 3],   "std": [2, 8, 5, 5, 1, 3, 1, 1]},
            "High":     {"mean": [10, 50, 30, 35, 5, 15, 6, 6], "std": [3, 10, 8, 8, 2, 5, 2, 2]},
            "Critical": {"mean": [20, 80, 60, 70, 10, 30, 12, 12], "std": [5, 15, 10, 10, 3, 8, 3, 3]},
        }

        for cls, params in profiles.items():
            for _ in range(n_per_class):
                sample = [
                    max(0, rng.normal(m, s))
                    for m, s in zip(params["mean"], params["std"])
                ]
                X.append(sample)
                y.append(cls)

        return X, y


# Singleton instance
risk_predictor = RiskPredictor()

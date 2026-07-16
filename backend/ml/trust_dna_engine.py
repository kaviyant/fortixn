"""
FORTIX ML — TrustDNA Multi-Vector Scoring Engine

Calculates 7 trust dimensions for each user based on their behavioral
telemetry. Each dimension is a weighted composite of behavioral metrics
with exponential time-decay. The overall TrustDNA score is a weighted
harmonic mean that penalises any single weak dimension.
"""
import math
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from backend.config import ML_CONFIG

WEIGHTS = ML_CONFIG["trust_dna_weights"]

# Map each dimension to the behavioral metrics that compose it
DIMENSION_METRICS = {
    "identity": ["login_pattern", "mfa_compliance", "credential_age"],
    "behavior": ["working_hours", "query_volume", "keystroke_rate"],
    "device": ["device_integrity", "patch_level", "endpoint_compliance"],
    "network": ["vpn_distance", "dns_anomaly", "connection_frequency"],
    "data": ["file_exports", "db_query_volume", "data_classification_access"],
    "command": ["cli_commands", "sudo_usage", "script_execution"],
    "cloud": ["cloud_uploads", "api_calls", "bucket_access"],
}

# Thresholds
THRESHOLDS = {
    "green": 85,
    "yellow": 65,
    "orange": 45,
}


class TrustDNAEngine:
    """Computes the 7-dimensional TrustDNA vector for a given user."""

    def __init__(self):
        self.weights = WEIGHTS

    def compute_dimension(
        self,
        metric_values: list[tuple[float, float, datetime]],
        half_life_hours: float = 72.0,
    ) -> float:
        """
        Compute a single dimension score from its constituent metrics.

        Parameters
        ----------
        metric_values : list of (current_value, baseline_value, timestamp)
            Each tuple represents one metric observation.
        half_life_hours : float
            Exponential decay half-life — recent readings weigh more.

        Returns
        -------
        float
            Dimension score in [0, 100].
        """
        if not metric_values:
            return 100.0  # No data = assume compliant

        now = datetime.now(timezone.utc)
        decay_lambda = math.log(2) / half_life_hours

        weighted_sum = 0.0
        weight_total = 0.0

        for current, baseline, ts in metric_values:
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            age_hours = max((now - ts).total_seconds() / 3600, 0.01)
            time_weight = math.exp(-decay_lambda * age_hours)

            # Deviation ratio: how far current is from baseline
            if baseline > 0:
                deviation = abs(current - baseline) / baseline
            else:
                deviation = abs(current) / 100.0

            # Score: lower deviation = higher trust
            score = max(0, 100 * (1 - deviation))
            weighted_sum += score * time_weight
            weight_total += time_weight

        return round(weighted_sum / weight_total, 2) if weight_total > 0 else 100.0

    def compute_overall(self, dimensions: dict[str, float]) -> float:
        """
        Weighted harmonic mean of all 7 dimensions. The harmonic mean
        ensures that one very low dimension drags down the overall score
        significantly, reflecting real-world security posture.
        """
        numerator = 0.0
        denominator = 0.0

        for dim, weight in self.weights.items():
            val = dimensions.get(dim, 100.0)
            if val <= 0:
                val = 0.01
            numerator += weight
            denominator += weight / val

        if denominator == 0:
            return 0.0
        return round(numerator / denominator, 2)

    def classify(self, score: float) -> str:
        """Map score to human-readable status."""
        if score >= THRESHOLDS["green"]:
            return "Highly Secure"
        elif score >= THRESHOLDS["yellow"]:
            return "Warning State"
        elif score >= THRESHOLDS["orange"]:
            return "High Risk"
        else:
            return "Incident Containment"

    def compute_for_user(
        self,
        db: Session,
        user_id: int,
    ) -> dict:
        """
        Full TrustDNA computation for a user, pulling metrics from the DB.

        Returns dict with all 7 dimension scores, overall score, and status.
        """
        from backend.models.db_models import BehaviorLog

        logs = (
            db.query(BehaviorLog)
            .filter(BehaviorLog.user_id == user_id)
            .filter(BehaviorLog.timestamp >= datetime.now(timezone.utc) - timedelta(days=30))
            .all()
        )

        # Group logs by metric name
        by_metric: dict[str, list] = {}
        for log in logs:
            by_metric.setdefault(log.metric_name, []).append(
                (log.value, log.baseline_value, log.timestamp)
            )

        # Compute each dimension
        dimensions = {}
        for dim, metric_names in DIMENSION_METRICS.items():
            readings = []
            for m in metric_names:
                readings.extend(by_metric.get(m, []))
            dimensions[dim] = self.compute_dimension(readings)

        overall = self.compute_overall(dimensions)
        status = self.classify(overall)

        return {
            "identity": dimensions.get("identity", 100.0),
            "behavior": dimensions.get("behavior", 100.0),
            "device": dimensions.get("device", 100.0),
            "network": dimensions.get("network", 100.0),
            "data": dimensions.get("data", 100.0),
            "command": dimensions.get("command", 100.0),
            "cloud": dimensions.get("cloud", 100.0),
            "overall_score": overall,
            "status": status,
        }


# Singleton instance
trust_dna_engine = TrustDNAEngine()

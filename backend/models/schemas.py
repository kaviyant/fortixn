"""
FORTIX Backend — Pydantic Schemas (Request / Response Validation)
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Auth ─────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str
    mfa_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_role: str


# ── Users ────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str
    branch: str
    privilege_level: str
    trust_score: float
    avatar_url: str
    is_active: bool
    is_privileged: bool

    class Config:
        from_attributes = True


class BehaviorMetric(BaseModel):
    label: str
    value: float
    baseline: float
    max_val: float = 100.0


class TrustTwinResponse(BaseModel):
    user: UserOut
    behaviors: list[BehaviorMetric]
    trust_score_display: float
    risk_class: str  # normal, warning, critical


class TrustDNAResponse(BaseModel):
    identity: float
    behavior: float
    device: float
    network: float
    data: float
    command: float
    cloud: float
    overall_score: float
    status: str  # Highly Secure, Warning, Critical


class BehaviorHistoryPoint(BaseModel):
    day: str
    baseline: float
    current: float


# ── Dashboard ────────────────────────────────────────────────────────────
class KPIResponse(BaseModel):
    org_trust_index: float
    active_privileged_users: int
    high_risk_profiles: int
    active_incidents: int
    compliance_index: float
    mttd_seconds: float
    mttr_seconds: float


class ThreatTimelinePoint(BaseModel):
    hour: str
    access_requests: int
    anomalous_blocks: int


class DepartmentRisk(BaseModel):
    department: str
    risk_score: float
    event_count: int


# ── Alerts / Threats ─────────────────────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    severity: str
    status: str
    risk_score: float
    trigger_type: str
    action_taken: str
    description: str
    department: str
    user_name: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class AnomalyScoreOut(BaseModel):
    user_id: int
    user_name: str
    department: str
    anomaly_score: float
    confidence: float
    is_anomalous: bool


class SuspiciousUserOut(BaseModel):
    user_id: int
    name: str
    department: str
    risk_label: str
    risk_score: float


class InsiderHeatmapCell(BaseModel):
    branch: str
    low: int
    medium: int
    critical: int


# ── Vendors ──────────────────────────────────────────────────────────────
class VendorOut(BaseModel):
    id: int
    name: str
    company: str
    trust_score: float
    risk_level: str
    status: str
    access_expiry: str
    access_count: int

    class Config:
        from_attributes = True


class VendorRiskUpdate(BaseModel):
    risk_level: str
    trust_score: Optional[float] = None


# ── Evidence ─────────────────────────────────────────────────────────────
class EvidenceOut(BaseModel):
    id: int
    name: str
    source: str
    sha256_hash: str
    quantum_signature: str
    integrity_status: str
    collected_at: datetime

    class Config:
        from_attributes = True


class EvidenceCreate(BaseModel):
    name: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1)


class EvidenceVerifyOut(BaseModel):
    id: int
    name: str
    hash_valid: bool
    quantum_valid: bool
    integrity_status: str


# ── Simulation ───────────────────────────────────────────────────────────
class SimulationStartRequest(BaseModel):
    scenario: str = Field(..., pattern="^(theft|usb|malware|vendor)$")


class SimulationStatusResponse(BaseModel):
    is_running: bool
    scenario: str
    current_trust_index: float
    effects: str
    alert_status: str


# ── Copilot ──────────────────────────────────────────────────────────────
class CopilotChatRequest(BaseModel):
    message: str = Field(..., min_length=1)


class CopilotChatResponse(BaseModel):
    reply: str
    context: dict


# ── Compliance ───────────────────────────────────────────────────────────
class ComplianceScoreOut(BaseModel):
    framework: str
    score: float
    status: str
    pending_items: int


class ComplianceControlOut(BaseModel):
    id: int
    control_id: str
    framework: str
    category: str
    requirement: str
    status: str
    score: float
    last_verified: datetime

    class Config:
        from_attributes = True


# ── WebSocket Events ─────────────────────────────────────────────────────
class LiveEventOut(BaseModel):
    event_type: str
    description: str
    department: str
    ip_address: str
    risk_level: str
    timestamp: str

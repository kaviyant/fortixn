"""
FORTIX Backend — SQLAlchemy ORM Models
Defines the relational schema for users, events, alerts, vendors,
evidence, behavioral logs, and compliance controls.
"""
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship

from backend.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    branch = Column(String(100), nullable=False)
    privilege_level = Column(String(80), default="Tier-3 Standard")
    trust_score = Column(Float, default=96.0)
    avatar_url = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
    is_privileged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)

    # Relationships
    behavior_logs = relationship("BehaviorLog", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    metric_name = Column(String(80), nullable=False)  # e.g. "login_hour", "query_volume"
    value = Column(Float, nullable=False)
    baseline_value = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=_utcnow, index=True)

    user = relationship("User", back_populates="behavior_logs")

    __table_args__ = (
        Index("ix_behavior_user_metric", "user_id", "metric_name"),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    severity = Column(String(20), nullable=False, default="Low")  # Low, Medium, High, Critical
    status = Column(String(40), nullable=False, default="Active")  # Active, Quarantined, Resolved
    risk_score = Column(Float, default=0.0)
    trigger_type = Column(String(120), default="")
    action_taken = Column(String(200), default="None")
    description = Column(Text, default="")
    department = Column(String(100), default="")
    branch = Column(String(100), default="")
    is_simulated = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=_utcnow, index=True)

    user = relationship("User", back_populates="alerts")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    company = Column(String(150), nullable=False)
    trust_score = Column(Float, default=90.0)
    risk_level = Column(String(20), default="Low")  # Low, Medium, High, Critical
    status = Column(String(30), default="Active")  # Active, Warning, Revoked, Expired
    access_expiry = Column(String(30), default="")
    api_key_hash = Column(String(256), default="")
    access_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=_utcnow)


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    source = Column(String(200), nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    quantum_signature = Column(String(128), default="")
    integrity_status = Column(String(40), default="Pending Verification")
    collected_at = Column(DateTime, default=_utcnow)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)  # Login, DB_Access, File_Access, USB_Insert, VPN, Cloud
    description = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    ip_address = Column(String(45), default="")
    risk_level = Column(String(20), default="Low")
    department = Column(String(100), default="")
    timestamp = Column(DateTime, default=_utcnow, index=True)

    user = relationship("User", back_populates="events")


class ComplianceControl(Base):
    __tablename__ = "compliance_controls"

    id = Column(Integer, primary_key=True, index=True)
    control_id = Column(String(30), nullable=False, unique=True)  # e.g. RBI-SEC-4.1
    framework = Column(String(30), nullable=False)  # RBI, ISO27001, NIST, PCI_DSS
    category = Column(String(100), nullable=False)
    requirement = Column(Text, nullable=False)
    status = Column(String(30), default="Active")  # Active, Pending, Failed
    score = Column(Float, default=100.0)
    last_verified = Column(DateTime, default=_utcnow)


class SimulationState(Base):
    """Tracks the current Red Team simulation state."""
    __tablename__ = "simulation_state"

    id = Column(Integer, primary_key=True, index=True)
    is_running = Column(Boolean, default=False)
    scenario = Column(String(30), default="")  # theft, usb, malware, vendor
    original_trust_index = Column(Float, default=96.0)
    current_trust_index = Column(Float, default=96.0)
    started_at = Column(DateTime, nullable=True)
    effects_description = Column(Text, default="")

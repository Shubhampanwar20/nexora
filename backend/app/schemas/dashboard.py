from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DashboardActivity(BaseModel):
    action: str
    resource_type: str
    created_at: datetime


class DashboardSummary(BaseModel):
    organization_id: UUID
    organization_name: str
    user_name: str
    role: str
    total_users: int
    active_users: int
    audit_events: int
    ai_insights: int
    system_health: float
    recent_activity: list[DashboardActivity]

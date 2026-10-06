from uuid import UUID

from pydantic import BaseModel


class InsightItem(BaseModel):
    type: str
    title: str
    description: str
    value: str
    label: str


class InsightsResponse(BaseModel):
    organization_id: UUID
    insights: list[InsightItem]

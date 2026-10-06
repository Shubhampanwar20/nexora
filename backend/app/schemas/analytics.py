from datetime import date
from pydantic import BaseModel


class AnalyticsActivityPoint(BaseModel):
    date: date
    count: int


class AnalyticsActivityResponse(BaseModel):
    organization_id: str
    points: list[AnalyticsActivityPoint]

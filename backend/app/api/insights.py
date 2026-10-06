from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth_dependencies import get_current_user
from app.api.dependencies import get_db
from app.models.user import User
from app.schemas.insights import InsightsResponse
from app.services.insights import InsightsService


router = APIRouter(prefix="/insights", tags=["AI Insights"])

DatabaseSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=InsightsResponse)
def get_insights(
    db: DatabaseSession,
    current_user: CurrentUser,
    organization_id: UUID | None = Query(default=None),
) -> InsightsResponse:
    target_organization_id = current_user.organization_id

    if organization_id is not None:
        if current_user.role.lower() == "admin":
            target_organization_id = organization_id

    insights = InsightsService.get_insights(
        db=db,
        organization_id=target_organization_id,
    )

    return {
        "organization_id": target_organization_id,
        "insights": insights,
    }

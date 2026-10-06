from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth_dependencies import get_current_user
from app.api.dependencies import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsActivityResponse
from app.services.analytics import AnalyticsService


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


@router.get(
    "/activity",
    response_model=AnalyticsActivityResponse,
)
def get_analytics_activity(
    db: DatabaseSession,
    current_user: CurrentUser,
    organization_id: UUID | None = Query(default=None),
    days: Annotated[int, Query(ge=7, le=90)] = 30,
) -> AnalyticsActivityResponse:
    target_organization_id = current_user.organization_id

    if organization_id is not None:
        if current_user.role.lower() == "admin":
            target_organization_id = organization_id

    points = AnalyticsService.get_activity(
        db=db,
        organization_id=target_organization_id,
        days=days,
    )

    return {
        "organization_id": str(target_organization_id),
        "points": points,
    }

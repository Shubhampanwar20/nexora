from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth_dependencies import get_current_user
from app.api.dependencies import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard import DashboardService


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
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
    "/summary",
    response_model=DashboardSummary,
)
def get_dashboard_summary(
    db: DatabaseSession,
    current_user: CurrentUser,
    organization_id: UUID | None = Query(default=None),
) -> DashboardSummary:
    target_organization_id = current_user.organization_id

    if organization_id is not None:
        if current_user.role.lower() != "admin":
            organization_id = current_user.organization_id

        target_organization_id = organization_id

    return DashboardService.get_summary(
        db=db,
        organization_id=target_organization_id,
        user=current_user,
    )

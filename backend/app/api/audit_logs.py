from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth_dependencies import require_admin
from app.api.dependencies import get_db
from app.models.user import User
from app.schemas.audit_log import AuditLogRead
from app.services.audit_log import AuditLogService


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]


CurrentAdmin = Annotated[
    User,
    Depends(require_admin),
]


@router.get(
    "",
    response_model=list[AuditLogRead],
)
def list_audit_logs(
    db: DatabaseSession,
    current_admin: CurrentAdmin,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    organization_id: Annotated[UUID | None, Query()] = None,
) -> list[AuditLogRead]:
    target_organization_id = current_admin.organization_id

    if organization_id is not None:
        target_organization_id = organization_id

    return AuditLogService.list_by_organization(
        db,
        organization_id=target_organization_id,
        skip=skip,
        limit=limit,
    )

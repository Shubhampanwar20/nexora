from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth_dependencies import require_admin
from app.api.dependencies import get_db
from app.models.user import User
from app.schemas.organization import OrganizationCreate, OrganizationRead
from app.services.organization import (
    OrganizationService,
    OrganizationSlugExistsError,
)


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)

DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]

CurrentAdmin = Annotated[
    User,
    Depends(require_admin),
]


@router.post(
    "",
    response_model=OrganizationRead,
    status_code=status.HTTP_201_CREATED,
)
def create_organization(
    data: OrganizationCreate,
    db: DatabaseSession,
    current_admin: CurrentAdmin,
) -> OrganizationRead:

    try:
        return OrganizationService.create(
            db,
            data,
            created_by=current_admin.id,
        )

    except OrganizationSlugExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An organization with this slug already exists.",
        ) from None


@router.get(
    "",
    response_model=list[OrganizationRead],
)
def list_organizations(
    db: DatabaseSession,
    current_admin: CurrentAdmin,
) -> list[OrganizationRead]:

    return OrganizationService.list_all(db)
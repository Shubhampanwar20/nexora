from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.auth_dependencies import get_current_user, require_admin
from app.api.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.services.user import (
    OrganizationNotFoundError,
    UserEmailExistsError,
    UserService,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


DatabaseSession = Annotated[
    Session,
    Depends(get_db),
]

CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]

CurrentAdmin = Annotated[
    User,
    Depends(require_admin),
]


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    data: UserCreate,
    db: DatabaseSession,
    current_admin: CurrentAdmin,
    organization_id: Annotated[UUID | None, Query()] = None,
) -> UserRead:

    target_organization_id = current_admin.organization_id

    if organization_id is not None:
        target_organization_id = organization_id

    try:
        return UserService.create(
            db,
            data,
            organization_id=target_organization_id,
        )

    except OrganizationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The specified organization does not exist.",
        ) from None

    except UserEmailExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from None


@router.get(
    "",
    response_model=list[UserRead],
)
def list_users(
    db: DatabaseSession,
    current_user: CurrentUser,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    organization_id: Annotated[UUID | None, Query()] = None,
) -> list[UserRead]:

    target_organization_id = current_user.organization_id

    if organization_id is not None:
        if current_user.role.lower() == "admin":
            target_organization_id = organization_id

    return UserService.list_by_organization(
        db,
        organization_id=target_organization_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/me",
    response_model=UserRead,
)
def get_my_profile(
    current_user: CurrentUser,
) -> UserRead:

    return current_user


@router.get(
    "/{user_id}",
    response_model=UserRead,
)
def get_user(
    user_id: UUID,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> UserRead:

    user = UserService.get_by_id_in_organization(
        db,
        user_id=user_id,
        organization_id=current_user.organization_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user
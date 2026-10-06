from uuid import UUID

from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate
from app.services.audit_log import AuditLogService
from app.utils.security import hash_password


class OrganizationNotFoundError(Exception):
    pass


class UserEmailExistsError(Exception):
    pass


class UserService:

    @staticmethod
    def create(
        db: Session,
        data: UserCreate,
        organization_id: UUID,
    ) -> User:

        organization = db.get(
            Organization,
            organization_id,
        )

        if organization is None:
            raise OrganizationNotFoundError()

        existing_user = UserRepository.get_by_email(
            db,
            data.email,
        )

        if existing_user is not None:
            raise UserEmailExistsError()

        hashed_password = hash_password(data.password)

        user = User(
            organization_id=organization_id,
            full_name=data.full_name,
            email=data.email,
            hashed_password=hashed_password,
            role=data.role,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        AuditLogService.record(
            db=db,
            organization_id=user.organization_id,
            user_id=user.id,
            action="USER_CREATED",
            resource_type="user",
            resource_id=user.id,
            details={
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            },
        )

        return user

    @staticmethod
    def get_by_id(
        db: Session,
        user_id: UUID,
    ):
        return UserRepository.get_by_id(
            db,
            user_id,
        )

    @staticmethod
    def get_by_id_in_organization(
        db: Session,
        user_id: UUID,
        organization_id: UUID,
    ):
        user = UserRepository.get_by_id(
            db,
            user_id,
        )

        if user is None:
            return None

        if user.organization_id != organization_id:
            return None

        return user

    @staticmethod
    def list_by_organization(
        db: Session,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ):
        return UserRepository.get_by_organization(
            db,
            organization_id=organization_id,
            skip=skip,
            limit=limit,
        )
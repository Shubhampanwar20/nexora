from sqlalchemy.orm import Session

from app.core.tokens import create_access_token
from app.models.user import User
from app.repositories.user import UserRepository
from app.services.audit_log import AuditLogService
from app.utils.security import verify_password


class InvalidCredentialsError(Exception):
    """Raised when the login credentials are invalid."""


class AuthService:
    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
    ) -> str:
        user: User | None = UserRepository.get_by_email(
            db,
            email.strip().lower(),
        )

        if user is None or not verify_password(
            password,
            user.hashed_password,
        ):
            raise InvalidCredentialsError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise InvalidCredentialsError(
                "Invalid email or password."
            )

        access_token = create_access_token(
            subject=str(user.id)
        )

        AuditLogService.record(
            db=db,
            organization_id=user.organization_id,
            user_id=user.id,
            action="USER_LOGIN",
            resource_type="user",
            resource_id=user.id,
            details={
                "email": user.email,
            },
        )

        return access_token
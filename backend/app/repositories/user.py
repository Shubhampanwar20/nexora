
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return db.scalar(statement)

    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> User | None:
        return db.get(User, user_id)

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> list[User]:
        statement = (
            select(User)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def get_by_organization(
        db: Session,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[User]:
        statement = (
            select(User)
            .where(User.organization_id == organization_id)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def create(
        db: Session,
        *,
        organization_id: UUID,
        full_name: str,
        email: str,
        hashed_password: str,
    ) -> User:
        user = User(
            organization_id=organization_id,
            full_name=full_name,
            email=email,
            hashed_password=hashed_password,
        )

        db.add(user)
        db.flush()
        db.refresh(user)

        return user
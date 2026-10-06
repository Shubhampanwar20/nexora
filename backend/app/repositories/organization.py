
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.organization import Organization


class OrganizationRepository:
    @staticmethod
    def get_by_slug(
        db: Session,
        slug: str,
    ) -> Organization | None:
        return db.scalar(
            select(Organization).where(
                Organization.slug == slug
            )
        )

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Organization]:
        statement = (
            select(Organization)
            .order_by(Organization.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def create(
        db: Session,
        *,
        name: str,
        slug: str,
    ) -> Organization:
        organization = Organization(
            name=name,
            slug=slug,
        )
        db.add(organization)
        db.flush()
        db.refresh(organization)
        return organization
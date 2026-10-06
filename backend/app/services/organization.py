from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.repositories.organization import OrganizationRepository
from app.schemas.organization import OrganizationCreate
from app.services.audit_log import AuditLogService


class OrganizationSlugExistsError(Exception):
    pass


class OrganizationService:

    @staticmethod
    def create(
        db: Session,
        data: OrganizationCreate,
        created_by: UUID | None = None,
    ) -> Organization:

        existing = OrganizationRepository.get_by_slug(
            db,
            data.slug,
        )

        if existing is not None:
            raise OrganizationSlugExistsError()

        organization = Organization(
            name=data.name,
            slug=data.slug,
        )

        db.add(organization)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise OrganizationSlugExistsError() from None

        db.refresh(organization)

        if created_by is not None:
            AuditLogService.record(
                db=db,
                organization_id=organization.id,
                user_id=created_by,
                action="ORGANIZATION_CREATED",
                resource_type="organization",
                resource_id=organization.id,
                details={
                    "name": organization.name,
                    "slug": organization.slug,
                },
            )

        return organization

    @staticmethod
    def list_all(
        db: Session,
    ):
        return OrganizationRepository.get_all(db)
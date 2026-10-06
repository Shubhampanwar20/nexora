from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.audit_log import AuditLogRepository
from app.schemas.audit_log import AuditLogCreate


class AuditLogService:

    @staticmethod
    def create(
        db: Session,
        data: AuditLogCreate,
    ):
        return AuditLogRepository.create(db, data)

    @staticmethod
    def record(
        db: Session,
        organization_id: UUID,
        action: str,
        resource_type: str,
        user_id: UUID | None = None,
        resource_id: UUID | None = None,
        details: dict | None = None,
    ):
        data = AuditLogCreate(
            organization_id=organization_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
        )

        return AuditLogRepository.create(db, data)

    @staticmethod
    def list_by_organization(
        db: Session,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ):
        return AuditLogRepository.get_by_organization(
            db,
            organization_id=organization_id,
            skip=skip,
            limit=limit,
        )
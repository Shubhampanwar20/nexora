from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogCreate


class AuditLogRepository:

    @staticmethod
    def create(
        db: Session,
        data: AuditLogCreate,
    ) -> AuditLog:
        audit_log = AuditLog(
            organization_id=data.organization_id,
            user_id=data.user_id,
            action=data.action,
            resource_type=data.resource_type,
            resource_id=data.resource_id,
            details=data.details,
        )

        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)

        return audit_log

    @staticmethod
    def get_by_organization(
        db: Session,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[AuditLog]:
        statement = (
            select(AuditLog)
            .where(
                AuditLog.organization_id == organization_id
            )
            .order_by(
                AuditLog.created_at.desc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(db.scalars(statement).all())
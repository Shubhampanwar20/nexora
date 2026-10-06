from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.organization import Organization
from app.models.user import User
from app.services.insights import InsightsService


class DashboardService:

    @staticmethod
    def get_summary(
        db: Session,
        organization_id: UUID,
        user: User,
    ):
        organization = db.get(Organization, organization_id)

        total_users = db.scalar(
            select(func.count(User.id)).where(
                User.organization_id == organization_id
            )
        ) or 0

        active_users = db.scalar(
            select(func.count(User.id)).where(
                User.organization_id == organization_id,
                User.is_active.is_(True),
            )
        ) or 0

        audit_events = db.scalar(
            select(func.count(AuditLog.id)).where(
                AuditLog.organization_id == organization_id
            )
        ) or 0

        recent_activity = list(
            db.scalars(
                select(AuditLog)
                .where(
                    AuditLog.organization_id == organization_id
                )
                .order_by(AuditLog.created_at.desc())
                .limit(5)
            ).all()
        )

        insights = InsightsService.get_insights(
            db=db,
            organization_id=organization_id,
        )

        return {
            "organization_id": organization_id,
            "organization_name": (
                organization.name if organization else "Organization"
            ),
            "user_name": user.full_name,
            "role": user.role,
            "total_users": total_users,
            "active_users": active_users,
            "audit_events": audit_events,
            "ai_insights": len(insights),
            "system_health": 99.8,
            "recent_activity": recent_activity,
        }

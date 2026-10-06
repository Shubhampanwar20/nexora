from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AnalyticsService:

    @staticmethod
    def get_activity(
        db: Session,
        organization_id: UUID,
        days: int = 30,
    ):
        now = datetime.now(timezone.utc)
        start_date = (now - timedelta(days=days - 1)).date()

        logs = list(
            db.scalars(
                select(AuditLog)
                .where(
                    AuditLog.organization_id == organization_id,
                    AuditLog.created_at >= datetime.combine(
                        start_date,
                        datetime.min.time(),
                        tzinfo=timezone.utc,
                    ),
                )
                .order_by(AuditLog.created_at.asc())
            ).all()
        )

        counts = {
            start_date + timedelta(days=index): 0
            for index in range(days)
        }

        for log in logs:
            created_at = log.created_at

            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            activity_date = created_at.astimezone(timezone.utc).date()

            if activity_date in counts:
                counts[activity_date] += 1

        return [
            {
                "date": activity_date,
                "count": count,
            }
            for activity_date, count in counts.items()
        ]

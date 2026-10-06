from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


class InsightsService:

    @staticmethod
    def get_insights(
        db: Session,
        organization_id: UUID,
    ):
        now = datetime.now(timezone.utc)

        recent_start = now - timedelta(days=7)
        previous_start = now - timedelta(days=14)

        total_users = (
            db.scalar(
                select(func.count(User.id)).where(
                    User.organization_id == organization_id
                )
            )
            or 0
        )

        active_users = (
            db.scalar(
                select(func.count(User.id)).where(
                    User.organization_id == organization_id,
                    User.is_active.is_(True),
                )
            )
            or 0
        )

        total_events = (
            db.scalar(
                select(func.count(AuditLog.id)).where(
                    AuditLog.organization_id == organization_id
                )
            )
            or 0
        )

        recent_events = (
            db.scalar(
                select(func.count(AuditLog.id)).where(
                    AuditLog.organization_id == organization_id,
                    AuditLog.created_at >= recent_start,
                )
            )
            or 0
        )

        previous_events = (
            db.scalar(
                select(func.count(AuditLog.id)).where(
                    AuditLog.organization_id == organization_id,
                    AuditLog.created_at >= previous_start,
                    AuditLog.created_at < recent_start,
                )
            )
            or 0
        )

        active_rate = (
            round((active_users / total_users) * 100)
            if total_users > 0
            else 0
        )

        if previous_events == 0:
            if recent_events > 0:
                activity_change = "New"
                event_word = "event" if recent_events == 1 else "events"
                event_verb = "was" if recent_events == 1 else "were"
                activity_description = (
                    f"{recent_events} audit {event_word} {event_verb} recorded "
                    "in the last 7 days after no events were recorded in the "
                    "previous 7-day period."
                )
            else:
                activity_change = "0%"
                activity_description = (
                    "No audit activity was recorded during either of "
                    "the last two 7-day periods."
                )
        else:
            change_percent = round(
                ((recent_events - previous_events) / previous_events) * 100
            )

            activity_change = (
                f"+{change_percent}%"
                if change_percent > 0
                else f"{change_percent}%"
            )

            if change_percent > 0:
                activity_description = (
                    f"Workspace activity increased by {change_percent}% "
                    "compared with the previous 7-day period."
                )
            elif change_percent < 0:
                activity_description = (
                    f"Workspace activity decreased by "
                    f"{abs(change_percent)}% compared with the "
                    "previous 7-day period."
                )
            else:
                activity_description = (
                    "Workspace activity is stable compared with the "
                    "previous 7-day period."
                )

        common_action = db.execute(
            select(
                AuditLog.action,
                func.count(AuditLog.id).label("action_count"),
            )
            .where(
                AuditLog.organization_id == organization_id,
                AuditLog.created_at >= recent_start,
            )
            .group_by(AuditLog.action)
            .order_by(func.count(AuditLog.id).desc())
            .limit(1)
        ).first()

        if common_action:
            action_name = common_action[0].replace("_", " ").title()
            action_count = common_action[1]
            action_value = str(action_count)
            action_description = (
                f"{action_name} is the most frequent recorded action "
                f"over the last 7 days, with {action_count} event"
                f"{'' if action_count == 1 else 's'}."
            )
        else:
            action_name = "No activity"
            action_value = "0"
            action_description = (
                "No audit actions have been recorded in the last "
                "7 days."
            )

        if total_users == 0:
            workforce_title = "Workspace has no members yet"
            workforce_description = (
                "No workspace members are currently registered. "
                "Add users to begin tracking workforce activity and "
                "workspace participation."
            )
        elif active_rate >= 80:
            workforce_title = "User activity remains healthy"
            workforce_description = (
                f"{active_users} of {total_users} workspace members "
                "are active, indicating strong workspace adoption."
            )
        elif active_rate >= 50:
            workforce_title = "User activity is moderate"
            workforce_description = (
                f"{active_users} of {total_users} workspace members "
                "are active. Reviewing inactive accounts may improve "
                "workspace participation."
            )
        else:
            workforce_title = "User activity needs attention"
            workforce_description = (
                f"Only {active_users} of {total_users} workspace "
                "members are active. Review inactive accounts and "
                "current access requirements."
            )

        if recent_events == 0:
            performance_title = "Workspace activity is quiet"
        elif previous_events == 0:
            performance_title = "Workspace activity is emerging"
        elif recent_events > previous_events:
            performance_title = "Workspace activity is trending upward"
        elif recent_events < previous_events:
            performance_title = "Workspace activity is trending downward"
        else:
            performance_title = "Workspace activity is stable"

        insights = [
            {
                "type": "Performance",
                "title": performance_title,
                "description": activity_description,
                "value": activity_change,
                "label": "7-day activity change",
            },
            {
                "type": "Workforce",
                "title": workforce_title,
                "description": workforce_description,
                "value": f"{active_rate}%",
                "label": "active rate",
            },
            {
                "type": "Activity",
                "title": "Most frequent workspace action",
                "description": action_description,
                "value": action_value,
                "label": action_name,
            },
            {
                "type": "Intelligence",
                "title": "Workspace signals analyzed",
                "description": (
                    f"Nexora analyzed {total_events} recorded audit "
                    f"{'event' if total_events == 1 else 'events'} to "
                    "identify operational patterns for this workspace."
                ),
                "value": str(total_events),
                "label": "total events",
            },
        ]

        return insights

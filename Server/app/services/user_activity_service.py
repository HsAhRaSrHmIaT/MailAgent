from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import select, delete, func, and_, or_
from app.core.database import db_manager, UserActivityLogModel
from app.models.schemas import ActivityAction, ActivityStatus


class UserActivityService:
    """Simple user-specific activity logging service"""
    
    async def log_activity(
        self,
        user_id: str,
        action: ActivityAction,
        status: ActivityStatus,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log a user activity"""
        try:
            async with await db_manager.get_session() as session:
                log_entry = UserActivityLogModel(
                    user_id=user_id,
                    action=action.value,
                    status=status.value,
                    message=message,
                    details=details
                )
                
                session.add(log_entry)
                await session.commit()
        except Exception as e:
            # Silent fail - logging shouldn't break the app
            print(f"Failed to log activity: {e}")
    
    async def get_user_activities(
        self,
        user_id: str,
        limit: int = 100,
        offset: int = 0,
        action: Optional[str] = None,
        status: Optional[str] = None,
        # search_term: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get user's activity logs with filtering"""
        try:
            async with await db_manager.get_session() as session:
                query = select(UserActivityLogModel).where(
                    UserActivityLogModel.user_id == user_id
                )
                
                # Apply filters
                if action:
                    query = query.where(UserActivityLogModel.action == action)
                
                if status:
                    query = query.where(UserActivityLogModel.status == status)
                
                # if search_term:
                #     query = query.where(
                #         or_(
                #             UserActivityLogModel.message.ilike(f'%{search_term}%'),
                #             UserActivityLogModel.details.astext.ilike(f'%{search_term}%')
                #         )
                #     )
                
                # Order and paginate
                query = query.order_by(
                    UserActivityLogModel.created_at.desc()
                ).offset(offset).limit(limit)
                
                result = await session.execute(query)
                activities = result.scalars().all()
                
                # Convert to dict
                return [
                    {
                        'id': activity.id,
                        'user_id': activity.user_id,
                        'action': activity.action,
                        'status': activity.status,
                        'message': activity.message,
                        'details': activity.details,
                        'created_at': activity.created_at.isoformat() if activity.created_at else None
                    }
                    for activity in activities
                ]
        except Exception as e:
            print(f"Failed to get activities: {e}")
            return []
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user activity statistics"""
        try:
            async with await db_manager.get_session() as session:
                # Get total count
                total_query = select(func.count(UserActivityLogModel.id)).where(
                    UserActivityLogModel.user_id == user_id
                )
                total_result = await session.execute(total_query)
                total = total_result.scalar() or 0
                
                # Get counts by status
                stats = {
                    'total_activities': total,
                    'success_count': 0,
                    'error_count': 0,
                    'warning_count': 0,
                    'action_breakdown': {},
                    'recent_activities': []
                }
                
                if total > 0:
                    # Status breakdown
                    for status_val in ['success', 'error', 'warning']:
                        status_query = select(func.count(UserActivityLogModel.id)).where(
                            and_(
                                UserActivityLogModel.user_id == user_id,
                                UserActivityLogModel.status == status_val
                            )
                        )
                        status_result = await session.execute(status_query)
                        count = status_result.scalar() or 0
                        stats[f'{status_val}_count'] = count
                    
                    # Action breakdown
                    action_query = select(
                        UserActivityLogModel.action,
                        func.count(UserActivityLogModel.id).label('count')
                    ).where(
                        UserActivityLogModel.user_id == user_id
                    ).group_by(UserActivityLogModel.action)
                    
                    action_result = await session.execute(action_query)
                    stats['action_breakdown'] = {
                        row.action: row.count for row in action_result
                    }
                    
                    # Recent activities (last 10)
                    recent_query = select(UserActivityLogModel).where(
                        UserActivityLogModel.user_id == user_id
                    ).order_by(
                        UserActivityLogModel.created_at.desc()
                    ).limit(10)
                    
                    recent_result = await session.execute(recent_query)
                    recent_activities = recent_result.scalars().all()
                    
                    stats['recent_activities'] = [
                        {
                            'action': activity.action,
                            'status': activity.status,
                            'message': activity.message,
                            'time': activity.created_at.isoformat() if activity.created_at else None
                        }
                        for activity in recent_activities
                    ]
                
                return stats
        except Exception as e:
            print(f"Failed to get stats: {e}")
            return {
                'total_activities': 0,
                'success_count': 0,
                'error_count': 0,
                'warning_count': 0,
                'action_breakdown': {},
                'recent_activities': []
            }
    
    async def clear_old_activities(self, user_id: str, days: int = 90) -> int:
        """Clear user's old activity logs"""
        try:
            async with await db_manager.get_session() as session:
                cutoff_date = datetime.now() - timedelta(days=days)
                
                delete_query = delete(UserActivityLogModel).where(
                    and_(
                        UserActivityLogModel.user_id == user_id,
                        UserActivityLogModel.created_at < cutoff_date
                    )
                )
                
                result = await session.execute(delete_query)
                await session.commit()
                
                return result.rowcount
        except Exception as e:
            print(f"Failed to clear activities: {e}")
            return 0
    
    async def clear_user_activities(self, user_id: str) -> int:
        """Clear all activity logs for a user"""
        try:
            async with await db_manager.get_session() as session:
                delete_query = delete(UserActivityLogModel).where(
                    UserActivityLogModel.user_id == user_id
                )
                
                result = await session.execute(delete_query)
                await session.commit()
                
                return result.rowcount
        except Exception as e:
            print(f"Failed to clear user activities: {e}")
            return 0


# Global instance
user_activity_service = UserActivityService()

from fastapi import APIRouter, Query, Depends
from typing import Optional, List
from app.services.user_activity_service import user_activity_service
from app.models.schemas import UserActivityLog, ActivityStats
from app.core.security import get_current_user_from_token

router = APIRouter()

@router.get("/activity-logs", response_model=List[UserActivityLog])
async def get_user_activities(
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    action: Optional[str] = None,
    status: Optional[str] = None,
    # search_term: Optional[str] = None,
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get current user's activity logs with filtering options"""
    try:
        activities = await user_activity_service.get_user_activities(
            user_id=current_user["id"],
            limit=limit,
            offset=offset,
            action=action,
            status=status,
            # search_term=search_term
        )
        return activities
    except Exception as e:
        print(f"Failed to retrieve activities: {e}")
        return []

@router.get("/activity-logs/stats", response_model=ActivityStats)
async def get_user_activity_stats(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get current user's activity statistics"""
    try:
        stats = await user_activity_service.get_user_stats(
            user_id=current_user["id"]
        )
        return stats
    except Exception as e:
        print(f"Failed to retrieve activity stats: {e}")
        return {
            'total_activities': 0,
            'success_count': 0,
            'error_count': 0,
            'warning_count': 0,
            'action_breakdown': {},
            'recent_activities': []
        }

@router.delete("/activity-logs/cleanup")
async def cleanup_old_activities(
    days: int = Query(default=30, ge=7, le=365),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Clean up user's activity logs older than specified days"""
    try:
        deleted_count = await user_activity_service.clear_old_activities(
            user_id=current_user["id"],
            days=days
        )
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Deleted {deleted_count} activity logs older than {days} days"
        }
    except Exception as e:
        print(f"Failed to cleanup activities: {e}")
        return {
            "success": False,
            "deleted_count": 0,
            "message": "Failed to cleanup activities"
        }
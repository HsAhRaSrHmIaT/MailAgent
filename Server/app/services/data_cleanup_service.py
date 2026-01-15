from datetime import datetime, timedelta
from sqlalchemy import select
from app.core.database import db_manager, UserModel
from app.services.email_service import email_service
from app.services.chat_service import chat_service
from app.services.user_activity_service import user_activity_service
import asyncio
import logging

logger = logging.getLogger(__name__)

class DataCleanupService:
    """Service to automatically clean up data for users with save_history disabled"""
    
    async def cleanup_old_data(self):
        """
        Delete data older than 24 hours for users who have save_history=False
        """
        try:
            async with await db_manager.get_session() as session:
                # Find all users with save_history=False
                query = select(UserModel).where(UserModel.save_history == False)
                result = await session.execute(query)
                users = result.scalars().all()
                
                if not users:
                    logger.info("No users with save_history=False found")
                    return
                
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
                logger.info(f"Starting cleanup for {len(users)} users with data older than {cutoff_time}")
                
                for user in users:
                    try:
                        user_id = user.id
                        
                        # Delete old emails (older than 24 hours)
                        from app.core.database import EmailMessageModel
                        from sqlalchemy import delete
                        
                        email_delete_query = delete(EmailMessageModel).where(
                            EmailMessageModel.user_id == user_id,
                            EmailMessageModel.timestamp < cutoff_time
                        )
                        result = await session.execute(email_delete_query)
                        emails_deleted = result.rowcount
                        
                        # Delete old chat messages (older than 24 hours)
                        from app.core.database import ChatMessageModel
                        
                        chat_delete_query = delete(ChatMessageModel).where(
                            ChatMessageModel.user_id == user_id,
                            ChatMessageModel.timestamp < cutoff_time
                        )
                        result = await session.execute(chat_delete_query)
                        messages_deleted = result.rowcount
                        
                        # Delete old activity logs (older than 24 hours)
                        from app.core.database import UserActivityLogModel
                        
                        activity_delete_query = delete(UserActivityLogModel).where(
                            UserActivityLogModel.user_id == user_id,
                            UserActivityLogModel.created_at < cutoff_time
                        )
                        result = await session.execute(activity_delete_query)
                        activities_deleted = result.rowcount
                        
                        await session.commit()
                        
                        if emails_deleted > 0 or messages_deleted > 0 or activities_deleted > 0:
                            logger.info(
                                f"Cleaned up data for user {user_id}: "
                                f"{emails_deleted} emails, {messages_deleted} messages, "
                                f"{activities_deleted} activities"
                            )
                    except Exception as e:
                        logger.error(f"Error cleaning up data for user {user.id}: {e}")
                        await session.rollback()
                        continue
                        
        except Exception as e:
            logger.error(f"Error in cleanup_old_data: {e}")
    
    async def start_cleanup_scheduler(self, interval_hours: int = 1):
        """
        Start a background task that runs cleanup periodically
        
        Args:
            interval_hours: How often to run cleanup (default: 1 hour)
        """
        logger.info(f"Starting data cleanup scheduler (runs every {interval_hours} hour(s))")
        
        while True:
            try:
                await self.cleanup_old_data()
            except Exception as e:
                logger.error(f"Error in cleanup scheduler: {e}")
            
            # Wait for next run
            await asyncio.sleep(interval_hours * 3600)

data_cleanup_service = DataCleanupService()

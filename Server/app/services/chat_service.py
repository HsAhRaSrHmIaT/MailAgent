from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from app.core.database import ChatMessageModel
from datetime import datetime
from typing import List, Optional
import json

class ChatService:
    async def save_message(
        self,
        db: AsyncSession,
        user_id: str,
        message_id: str,
        content: str,
        sender: str,
        timestamp: datetime,
        tone: Optional[str] = None,
        message_type: str = "text",
        email_data: Optional[dict] = None
    ):
        """Save a chat message to database"""
        message = ChatMessageModel(
            user_id=user_id,
            message_id=message_id,
            content=content,
            sender=sender,
            tone=tone,
            message_type=message_type,
            email_data=email_data,
            timestamp=timestamp
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message
    
    async def get_user_messages(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 50,
        before_timestamp: Optional[datetime] = None,
        after_timestamp: Optional[datetime] = None
    ) -> List[ChatMessageModel]:
        """Get messages with pagination"""
        query = select(ChatMessageModel).where(
            ChatMessageModel.user_id == user_id
        )
        
        # If loading older messages (scrolling up)
        if before_timestamp:
            query = query.where(ChatMessageModel.timestamp < before_timestamp)
        
        # If loading newer messages (live updates)
        if after_timestamp:
            query = query.where(ChatMessageModel.timestamp > after_timestamp)
        
        # Order by newest first, limit results
        query = query.order_by(ChatMessageModel.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        messages = result.scalars().all()
        
        # Reverse to show oldest first in UI
        return list(reversed(messages))
    
    async def get_message_count(
        self,
        db: AsyncSession,
        user_id: str
    ) -> int:
        """Get total message count for user"""
        query = select(func.count(ChatMessageModel.id)).where(
            ChatMessageModel.user_id == user_id
        )
        result = await db.execute(query)
        return result.scalar() or 0
    
    async def clear_user_messages(
        self,
        db: AsyncSession,
        user_id: str
    ):
        """Clear all chat messages for a user"""
        query = delete(ChatMessageModel).where(
            ChatMessageModel.user_id == user_id
        )
        await db.execute(query)
        await db.commit()

chat_service = ChatService()
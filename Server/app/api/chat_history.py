from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import DatabaseManager
from app.services.chat_service import chat_service
from app.core.security import get_current_user_from_token
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Database dependency
db_manager = DatabaseManager()

async def get_db():
    """Dependency to get database session."""
    if not db_manager._initialized:
        await db_manager.initialize()
    
    async with db_manager.session_factory() as session:
        try:
            yield session
        finally:
            await session.close()

class SaveMessageRequest(BaseModel):
    message_id: str
    content: str
    sender: str
    timestamp: str  # ISO format
    tone: str | None = None
    message_type: str = "text"
    email_data: dict | None = None

class MessageResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: str
    hashtag: str | None = None
    type: str = "text"
    emailData: dict | None = None

class PaginatedMessagesResponse(BaseModel):
    messages: List[MessageResponse]
    hasMore: bool
    total: int

@router.post("/chat/messages")
async def save_message(
    data: SaveMessageRequest,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Save a chat message"""
    await chat_service.save_message(
        db=db,
        user_id=current_user["id"],
        message_id=data.message_id,
        content=data.content,
        sender=data.sender,
        timestamp=datetime.fromisoformat(data.timestamp),
        tone=data.tone,
        message_type=data.message_type,
        email_data=data.email_data
    )
    return {"success": True}

@router.get("/chat/messages", response_model=PaginatedMessagesResponse)
async def get_messages(
    limit: int = Query(50, ge=1, le=100),
    before: Optional[str] = Query(None, description="ISO timestamp to load messages before"),
    after: Optional[str] = Query(None, description="ISO timestamp to load messages after"),
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get paginated chat messages for current user"""
    before_dt = datetime.fromisoformat(before) if before else None
    after_dt = datetime.fromisoformat(after) if after else None
    
    messages = await chat_service.get_user_messages(
        db=db,
        user_id=current_user["id"],
        limit=limit,
        before_timestamp=before_dt,
        after_timestamp=after_dt
    )
    
    total_count = await chat_service.get_message_count(
        db=db,
        user_id=current_user["id"]
    )
    
    return PaginatedMessagesResponse(
        messages=[
            MessageResponse(
                id=msg.message_id,
                content=msg.content,
                sender=msg.sender,
                timestamp=msg.timestamp.isoformat(),
                hashtag=msg.tone,
                type=msg.message_type,
                emailData=msg.email_data
            )
            for msg in messages
        ],
        hasMore=len(messages) == limit,
        total=total_count
    )

@router.delete("/chat/messages")
async def clear_messages(
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Clear all chat messages (for /clear command)"""
    await chat_service.clear_user_messages(
        db=db,
        user_id=current_user["id"]
    )
    return {"success": True, "message": "Chat history cleared"}
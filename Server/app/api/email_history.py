from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import DatabaseManager
from app.services.email_service import email_service
from app.core.security import get_current_user_from_token
from app.models.schemas import (
    SaveEmailRequest,
    UpdateEmailRequest,
    EmailHistoryResponse,
    PaginatedEmailsResponse,
    UsageStatsResponse
)
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

@router.post("/emails")
async def save_email(
    data: SaveEmailRequest,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Save an email"""
    await email_service.save_email(
        db=db,
        user_id=current_user["id"],
        email_id=data.email_id,
        to_email=data.to_email,
        subject=data.subject,
        body=data.body,
        timestamp=datetime.fromisoformat(data.timestamp),
        tone=data.tone,
        prompt=data.prompt,
        status=data.status
    )
    return {"success": True}

@router.get("/emails", response_model=PaginatedEmailsResponse)
async def get_emails(
    limit: int = Query(50, ge=1, le=100),
    before: Optional[str] = Query(None, description="ISO timestamp to load emails before"),
    after: Optional[str] = Query(None, description="ISO timestamp to load emails after"),
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get paginated emails for current user"""
    before_dt = datetime.fromisoformat(before) if before else None
    after_dt = datetime.fromisoformat(after) if after else None
    
    emails = await email_service.get_user_emails(
        db=db,
        user_id=current_user["id"],
        limit=limit,
        before_timestamp=before_dt,
        after_timestamp=after_dt
    )
    
    total_count = await email_service.get_email_count(
        db=db,
        user_id=current_user["id"]
    )
    
    return PaginatedEmailsResponse(
        emails=[
            EmailHistoryResponse(
                id=email.email_id,
                to_email=email.to_email,
                subject=email.subject,
                body=email.body,
                tone=email.tone,
                prompt=email.prompt,
                status=email.status,
                sent_at=email.sent_at.isoformat() if email.sent_at else None,
                regeneration_count=email.regeneration_count,
                version=email.version,
                timestamp=email.timestamp.isoformat()
            )
            for email in emails
        ],
        hasMore=len(emails) == limit,
        total=total_count
    )

@router.patch("/emails/{email_id}")
async def update_email(
    email_id: str,
    data: UpdateEmailRequest,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Update an email (for Edit, Send, Save as Draft actions)"""
    email = await email_service.update_email(
        db=db,
        user_id=current_user["id"],
        email_id=email_id,
        status=data.status,
        body=data.body,
        subject=data.subject,
        to_email=data.to_email,
        increment_version=data.body is not None or data.subject is not None
    )
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    return {"success": True, "email_id": email.email_id}

@router.post("/emails/{email_id}/regenerate")
async def regenerate_email(
    email_id: str,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Mark email as regenerated (increments regeneration count)"""
    email = await email_service.update_email(
        db=db,
        user_id=current_user["id"],
        email_id=email_id,
        increment_regeneration=True
    )
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    return {"success": True, "regeneration_count": email.regeneration_count}

@router.delete("/emails")
async def clear_emails(
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Clear all emails (for /clear command)"""
    await email_service.clear_user_emails(
        db=db,
        user_id=current_user["id"]
    )
    return {"success": True, "message": "Email history cleared"}

@router.get("/usage-stats", response_model=UsageStatsResponse)
async def get_usage_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get user usage statistics"""
    stats = await email_service.get_usage_stats(
        db=db,
        user_id=current_user["id"]
    )
    return stats
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import DatabaseManager
from app.services.email_service import email_service
from app.services.email_config_service import email_config_service
from app.services.email_sending_service import email_sending_service
from app.services.user_activity_service import user_activity_service
from app.core.security import get_current_user_from_token
from app.models.schemas import (
    SaveEmailRequest,
    UpdateEmailRequest,
    BulkSendEmailRequest,
    BulkSendResponse,
    BulkSendResult,
    EmailHistoryResponse,
    PaginatedEmailsResponse,
    UsageStatsResponse,
    ActivityAction,
    ActivityStatus
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
    user_id = current_user["id"]
    
    # Check if email already exists
    existing_email = await email_service.get_email_by_id(
        db=db,
        user_id=user_id,
        email_id=data.email_id
    )
    
    if existing_email:
        # If email already exists, update it instead of creating duplicate
        await email_service.update_email(
            db=db,
            user_id=user_id,
            email_id=data.email_id,
            to_email=data.to_email,
            subject=data.subject,
            body=data.body,
            status=data.status
        )
        
        # Log draft update
        if data.status == "draft":
            await user_activity_service.log_activity(
                user_id=user_id,
                action=ActivityAction.EMAIL_DRAFT_UPDATED,
                status=ActivityStatus.SUCCESS,
                message="Draft email updated",
                details={"subject": data.subject[:50]}
            )
    else:
        # Create new email
        await email_service.save_email(
            db=db,
            user_id=user_id,
            email_id=data.email_id,
            to_email=data.to_email,
            subject=data.subject,
            body=data.body,
            timestamp=datetime.fromisoformat(data.timestamp),
            tone=data.tone,
            prompt=data.prompt,
            status=data.status
        )
        
        # Log draft creation
        if data.status == "draft":
            await user_activity_service.log_activity(
                user_id=user_id,
                action=ActivityAction.EMAIL_DRAFT_CREATED,
                status=ActivityStatus.SUCCESS,
                message="Draft email created",
                details={"subject": data.subject[:50]}
            )
    
    return {"success": True}

@router.get("/emails", response_model=PaginatedEmailsResponse)
async def get_emails(
    limit: int = Query(50, ge=1, le=100),
    before: Optional[str] = Query(None, description="ISO timestamp to load emails before"),
    after: Optional[str] = Query(None, description="ISO timestamp to load emails after"),
    status: Optional[str] = Query(None, description="Filter by email status (draft, sent, unsent, deleted)"),
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
        after_timestamp=after_dt,
        status=status
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
    user_id = current_user["id"]
    
    email = await email_service.update_email(
        db=db,
        user_id=user_id,
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
    
    # Log draft deletion
    if data.status == "deleted":
        await user_activity_service.log_activity(
            user_id=user_id,
            action=ActivityAction.EMAIL_DRAFT_DELETED,
            status=ActivityStatus.SUCCESS,
            message="Draft email deleted",
            details={"subject": email.subject[:50]}
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

@router.post("/send-bulk-email", response_model=BulkSendResponse)
async def send_bulk_email(
    data: BulkSendEmailRequest,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Send an email to multiple recipients (max 50) using user's active email account"""
    user_id = current_user["id"]
    
    # Validate recipient count
    if len(data.to_emails) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one recipient email is required"
        )
    
    if len(data.to_emails) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 recipients allowed per bulk send"
        )
    
    # Get user's active email configuration
    email_config = await email_config_service.get_active_email(db, user_id)
    
    if not email_config:
        await user_activity_service.log_activity(
            user_id=user_id,
            action=ActivityAction.EMAIL_SENT,
            status=ActivityStatus.ERROR,
            message="Failed to send bulk email",
            details={"error": "No active email configuration found", "recipient_count": len(data.to_emails)}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active email configuration found. Please set an active email in settings."
        )
    
    # Decrypt the password
    decrypted_password = email_config_service._decrypt_password(email_config.encrypted_password)
    
    # Send emails to all recipients using optimized bulk send
    results = await email_sending_service.send_user_emails_bulk(
        sender_email=email_config.email,
        sender_password=decrypted_password,
        recipient_emails=data.to_emails,
        subject=data.subject,
        body=data.body
    )
    
    # Count successes and failures
    successful_count = sum(1 for r in results if r["success"])
    failed_count = len(results) - successful_count
    
    # Separate successful and failed recipients
    successful_emails = [r["email"] for r in results if r["success"]]
    failed_emails = [{"email": r["email"], "error": r["error"]} for r in results if not r["success"]]
    
    # Update email status based on results
    if successful_count > 0:
        # At least some emails were sent successfully
        status_value = "sent" if failed_count == 0 else "partially_sent"
        await email_service.update_email(
            db=db,
            user_id=user_id,
            email_id=data.email_id,
            status=status_value
        )
    
    # Log the bulk send activity with detailed recipient information
    await user_activity_service.log_activity(
        user_id=user_id,
        action=ActivityAction.EMAIL_SENT,
        status=ActivityStatus.SUCCESS if failed_count == 0 else ActivityStatus.ERROR,
        message=f"Bulk email sent to {successful_count}/{len(data.to_emails)} recipients",
        details={
            "from": email_config.email,
            "recipient_count": len(data.to_emails),
            "successful": successful_count,
            "failed": failed_count,
            "subject": data.subject,
            "successful_recipients": successful_emails,
            "failed_recipients": failed_emails
        }
    )
    
    # Convert results to response format
    response_results = [
        BulkSendResult(
            email=r["email"],
            success=r["success"],
            error=r["error"]
        )
        for r in results
    ]
    
    return BulkSendResponse(
        total=len(results),
        successful=successful_count,
        failed=failed_count,
        results=response_results
    )

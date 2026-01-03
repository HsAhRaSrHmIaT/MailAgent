from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, or_
from app.core.database import EmailMessageModel
from datetime import datetime
from typing import List, Optional

class EmailService:
    async def save_email(
        self,
        db: AsyncSession,
        user_id: str,
        email_id: str,
        to_email: str,
        subject: str,
        body: str,
        timestamp: datetime,
        tone: Optional[str] = None,
        prompt: Optional[str] = None,
        status: str = "unsent"
    ):
        """Save an email message to the database."""
        new_email = EmailMessageModel(
            user_id=user_id,
            email_id=email_id,
            to_email=to_email,
            subject=subject,
            body=body,
            tone=tone,
            prompt=prompt,
            status=status,
            timestamp=timestamp
        )
        db.add(new_email)
        await db.commit()
        await db.refresh(new_email)
        return new_email
    
    async def get_user_emails(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 50,
        before_timestamp: Optional[datetime] = None,
        after_timestamp: Optional[datetime] = None
    ) -> List[EmailMessageModel]:
        """Get emails with pagination"""
        query = select(EmailMessageModel).where(
            EmailMessageModel.user_id == user_id
        )
        
        if before_timestamp:
            query = query.where(EmailMessageModel.timestamp < before_timestamp)
        
        if after_timestamp:
            query = query.where(EmailMessageModel.timestamp > after_timestamp)
        
        query = query.order_by(EmailMessageModel.timestamp.desc()).limit(limit)
        
        result = await db.execute(query)
        emails = result.scalars().all()
        
        return list(reversed(emails))
    
    async def get_email_by_id(
        self,
        db: AsyncSession,
        user_id: str,
        email_id: str
    ) -> Optional[EmailMessageModel]:
        """Get a specific email by ID"""
        result = await db.execute(
            select(EmailMessageModel).where(
                EmailMessageModel.user_id == user_id,
                EmailMessageModel.email_id == email_id
            )
        )
        return result.scalar_one_or_none()
    
    async def update_email(
        self,
        db: AsyncSession,
        user_id: str,
        email_id: str,
        status: Optional[str] = None,
        body: Optional[str] = None,
        subject: Optional[str] = None,
        to_email: Optional[str] = None,
        increment_regeneration: bool = False,
        increment_version: bool = False
    ) -> Optional[EmailMessageModel]:
        """Update an email"""
        email = await self.get_email_by_id(db, user_id, email_id)
        if not email:
            return None
        
        if status is not None:
            email.status = status
            if status == "sent":
                email.sent_at = datetime.utcnow()
        
        if body is not None:
            email.body = body
        
        if subject is not None:
            email.subject = subject
        
        if to_email is not None:
            email.to_email = to_email
        
        if increment_regeneration:
            email.regeneration_count += 1
        
        if increment_version:
            email.version += 1
        
        await db.commit()
        await db.refresh(email)
        return email
    
    async def get_email_count(
        self,
        db: AsyncSession,
        user_id: str
    ) -> int:
        """Get total email count for user"""
        query = select(func.count(EmailMessageModel.id)).where(
            EmailMessageModel.user_id == user_id
        )
        result = await db.execute(query)
        return result.scalar() or 0
    
    async def get_usage_stats(
        self,
        db: AsyncSession,
        user_id: str
    ) -> dict:
        """Get user usage statistics"""
        # Total emails count
        total_emails = await self.get_email_count(db, user_id)
        
        # Count successful emails (sent or low regeneration count)
        success_query = select(func.count(EmailMessageModel.id)).where(
            EmailMessageModel.user_id == user_id,
            or_(
                EmailMessageModel.status == "sent",
                EmailMessageModel.regeneration_count <= 1
            )
        )
        result = await db.execute(success_query)
        successful_emails = result.scalar() or 0
        
        # Calculate success rate
        success_rate = round((successful_emails / total_emails * 100), 1) if total_emails > 0 else 0
        
        # Calculate time saved (assume 10 minutes per email)
        minutes_per_email = 10
        total_minutes_saved = total_emails * minutes_per_email
        hours_saved = round(total_minutes_saved / 60, 1)
        
        # Get recent 10 activities (emails)
        query = select(EmailMessageModel).where(
            EmailMessageModel.user_id == user_id
        ).order_by(EmailMessageModel.timestamp.desc()).limit(10)
        
        result = await db.execute(query)
        recent_emails = result.scalars().all()
        
        # Format recent activities
        recent_activity = [
            {
                "action": f"Generated email to {email.to_email}",
                "time": email.timestamp,  # Frontend will format this
                "status": email.status,
                "tone": email.tone
            }
            for email in recent_emails
        ]
        
        return {
            "total_emails": total_emails,
            "success_rate": success_rate,
            "time_saved_hours": hours_saved,
            "recent_activity": recent_activity
        }
    
    async def clear_user_emails(
        self,
        db: AsyncSession,
        user_id: str
    ):
        """Clear all emails for a user"""
        query = delete(EmailMessageModel).where(
            EmailMessageModel.user_id == user_id
        )
        await db.execute(query)
        await db.commit()

email_service = EmailService()
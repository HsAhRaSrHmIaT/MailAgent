from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from cryptography.fernet import Fernet
import base64
import hashlib

from app.core.database import UserEmailConfigModel
from app.models.schemas import EmailConfigCreate
from app.core.config import settings


class EmailConfigService:
    def __init__(self):
        # Generate encryption key from settings secret key
        key = hashlib.sha256(settings.secret_key.encode()).digest()
        self.cipher = Fernet(base64.urlsafe_b64encode(key))

    def _encrypt_password(self, password: str) -> str:
        """Encrypt a password"""
        return self.cipher.encrypt(password.encode()).decode()

    def _decrypt_password(self, encrypted_password: str) -> str:
        """Decrypt a password"""
        return self.cipher.decrypt(encrypted_password.encode()).decode()

    async def get_all_user_email_configs(
        self, db: AsyncSession, user_id: str
    ) -> List[UserEmailConfigModel]:
        """Get all email configurations for a user"""
        result = await db.execute(
            select(UserEmailConfigModel).where(UserEmailConfigModel.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_email_config_by_email(
        self, db: AsyncSession, user_id: str, email: str
    ) -> Optional[UserEmailConfigModel]:
        """Get a specific email configuration by email address"""
        result = await db.execute(
            select(UserEmailConfigModel).where(
                UserEmailConfigModel.user_id == user_id,
                UserEmailConfigModel.email == email
            )
        )
        return result.scalar_one_or_none()

    async def create_or_update_email_config(
        self, db: AsyncSession, user_id: str, email_data: EmailConfigCreate
    ) -> UserEmailConfigModel:
        """Create or update an email configuration"""
        existing = await self.get_email_config_by_email(db, user_id, email_data.email)
        
        encrypted_password = self._encrypt_password(email_data.password)
        
        if existing:
            # Update existing config
            existing.encrypted_password = encrypted_password
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            # Create new config
            new_config = UserEmailConfigModel(
                user_id=user_id,
                email=email_data.email,
                encrypted_password=encrypted_password,
                is_active=True
            )
            db.add(new_config)
            await db.commit()
            await db.refresh(new_config)
            return new_config

    async def delete_email_config(
        self, db: AsyncSession, user_id: str, email: str
    ) -> bool:
        """Delete a specific email configuration"""
        result = await db.execute(
            delete(UserEmailConfigModel).where(
                UserEmailConfigModel.user_id == user_id,
                UserEmailConfigModel.email == email
            )
        )
        await db.commit()
        return result.rowcount > 0

    async def delete_all_email_configs(
        self, db: AsyncSession, user_id: str
    ) -> int:
        """Delete all email configurations for a user"""
        result = await db.execute(
            delete(UserEmailConfigModel).where(
                UserEmailConfigModel.user_id == user_id
            )
        )
        await db.commit()
        return result.rowcount


# Singleton instance
email_config_service = EmailConfigService()

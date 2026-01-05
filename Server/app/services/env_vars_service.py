from datetime import datetime
from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from cryptography.fernet import Fernet
import base64
import os

from app.core.database import UserEnvironmentVariablesModel
from app.core.config import settings
from app.models.schemas import EnvironmentVariableCreate, EnvironmentVariableUpdate


class EnvVarsService:
    """Service for handling user environment variables with encryption."""
    
    def __init__(self):
        # Use the secret key from settings to derive encryption key
        # In production, consider using a separate encryption key
        key = base64.urlsafe_b64encode(settings.secret_key.encode()[:32].ljust(32, b'0'))
        self.cipher = Fernet(key)
    
    def _encrypt_value(self, value: str) -> str:
        """Encrypt a value (returns empty string if value is empty)"""
        if not value or value.strip() == "":
            return ""
        return self.cipher.encrypt(value.encode()).decode()
    
    def _decrypt_value(self, encrypted_value: str) -> str:
        """Decrypt a value (returns empty string if encrypted_value is empty)"""
        if not encrypted_value or encrypted_value.strip() == "":
            return ""
        return self.cipher.decrypt(encrypted_value.encode()).decode()
    
    def _mask_value(self, value: str) -> str:
        """Mask a value for display."""
        if len(value) <= 8:
            return "•" * len(value)
        return "•" * max(4, len(value) - 4) + value[-4:]
    
    async def create_or_update_variable(
        self, 
        db: AsyncSession, 
        user_id: str, 
        var_data: EnvironmentVariableCreate
    ) -> UserEnvironmentVariablesModel:
        """Create or update an environment variable for a user."""
        # Check if variable already exists
        existing = await self.get_variable_by_key(db, user_id, var_data.key)
        
        encrypted_value = self._encrypt_value(var_data.value)
        
        if existing:
            # Update existing variable
            existing.encrypted_value = encrypted_value
            existing.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            # Create new variable
            new_var = UserEnvironmentVariablesModel(
                user_id=user_id,
                key=var_data.key,
                encrypted_value=encrypted_value
            )
            db.add(new_var)
            await db.commit()
            await db.refresh(new_var)
            return new_var
    
    async def get_variable_by_key(
        self, 
        db: AsyncSession, 
        user_id: str, 
        key: str
    ) -> Optional[UserEnvironmentVariablesModel]:
        """Get a specific environment variable by key."""
        result = await db.execute(
            select(UserEnvironmentVariablesModel).where(
                and_(
                    UserEnvironmentVariablesModel.user_id == user_id,
                    UserEnvironmentVariablesModel.key == key
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_all_user_variables(
        self, 
        db: AsyncSession, 
        user_id: str
    ) -> List[UserEnvironmentVariablesModel]:
        """Get all environment variables for a user."""
        result = await db.execute(
            select(UserEnvironmentVariablesModel).where(
                UserEnvironmentVariablesModel.user_id == user_id
            )
        )
        return list(result.scalars().all())
    
    async def get_decrypted_value(
        self, 
        db: AsyncSession, 
        user_id: str, 
        key: str
    ) -> Optional[str]:
        """Get the decrypted value of a specific variable."""
        var = await self.get_variable_by_key(db, user_id, key)
        if var:
            return self._decrypt_value(var.encrypted_value)
        return None
    
    # async def delete_variable(
    #     self, 
    #     db: AsyncSession, 
    #     user_id: str, 
    #     key: str
    # ) -> bool:
    #     """Delete an environment variable."""
    #     var = await self.get_variable_by_key(db, user_id, key)
    #     if var:
    #         await db.delete(var)
    #         await db.commit()
    #         return True
    #     return False
    
    # async def delete_all_user_variables(
    #     self, 
    #     db: AsyncSession, 
    #     user_id: str
    # ) -> int:
    #     """Delete all environment variables for a user. Returns count of deleted variables."""
    #     variables = await self.get_all_user_variables(db, user_id)
    #     count = len(variables)
    #     for var in variables:
    #         await db.delete(var)
    #     await db.commit()
    #     return count
    
    def get_masked_value(self, encrypted_value: str) -> str:
        """Get a masked version of the value."""
        try:
            decrypted = self._decrypt_value(encrypted_value)
            return self._mask_value(decrypted)
        except:
            return "••••••••"


# Global service instance
env_vars_service = EnvVarsService()

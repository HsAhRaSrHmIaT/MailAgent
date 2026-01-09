from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import secrets
import random

from app.core.database import UserModel
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.schemas import UserCreate, UserLogin, UserUpdate, UserResponse, Token


class AuthService:
    """Service for handling authentication operations."""
    
    async def create_user(self, db: AsyncSession, user_data: UserCreate) -> UserModel:
        """Create a new user."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Check if username is taken
        if user_data.username:
            existing_username = await self.get_user_by_username(db, user_data.username)
            if existing_username:
                raise ValueError("Username already taken")
        
        # Create new user
        user = UserModel(
            id=str(uuid.uuid4()),
            email=user_data.email,
            username=user_data.username,
            password_hash=get_password_hash(user_data.password),
            is_active=True
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def authenticate_user(self, db: AsyncSession, email: str, password: str) -> Optional[UserModel]:
        """Authenticate a user with email and password."""
        user = await self.get_user_by_email(db, email)
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        # Update last login
        user.last_login = datetime.now()
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[UserModel]:
        """Get a user by email."""
        result = await db.execute(select(UserModel).where(UserModel.email == email))
        return result.scalar_one_or_none()
    
    async def get_user_by_username(self, db: AsyncSession, username: str) -> Optional[UserModel]:
        """Get a user by username."""
        result = await db.execute(select(UserModel).where(UserModel.username == username))
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, db: AsyncSession, user_id: str) -> Optional[UserModel]:
        """Get a user by ID."""
        result = await db.execute(select(UserModel).where(UserModel.id == user_id))
        return result.scalar_one_or_none()
    
    async def update_user(self, db: AsyncSession, user_id: str, user_data: UserUpdate) -> Optional[UserModel]:
        """Update user information."""
        user = await self.get_user_by_id(db, user_id)
        
        if not user:
            return None
        
        # Get only the fields that were actually set in the request
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Update email if provided
        if 'email' in update_data:
            # Check if email is already taken by another user
            existing_user = await self.get_user_by_email(db, update_data['email'])
            if existing_user and existing_user.id != user_id:
                raise ValueError("Email already taken")
            user.email = update_data['email']
        
        # Update username if provided
        if 'username' in update_data:
            # Check if username is already taken by another user
            existing_user = await self.get_user_by_username(db, update_data['username'])
            if existing_user and existing_user.id != user_id:
                raise ValueError("Username already taken")
            user.username = update_data['username']
        
        # Update profile picture if provided
        # Empty string means remove (set to NULL)
        if 'profile_picture' in update_data:
            profile_pic_value = update_data['profile_picture']
            user.profile_picture = None if profile_pic_value == "" else profile_pic_value
        
        # Update preferences if provided
        if 'language' in update_data:
            user.language = update_data['language']
        
        if 'default_tone' in update_data:
            user.default_tone = update_data['default_tone']
        
        if 'ai_learning' in update_data:
            user.ai_learning = update_data['ai_learning']
        
        if 'save_history' in update_data:
            user.save_history = update_data['save_history']
        
        user.updated_at = datetime.now()
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    def create_token_for_user(self, user: UserModel) -> Token:
        """Create an access token for a user."""
        access_token = create_access_token(
            data={
                "sub": user.id,
                "email": user.email,
                "username": user.username
            }
        )
        return Token(access_token=access_token)
    
    async def create_password_reset_token(self, db: AsyncSession, email: str) -> Optional[str]:
        """Generate a password reset token for a user."""
        user = await self.get_user_by_email(db, email)
        
        if not user:
            return None
        
        # Generate a secure random token
        reset_token = secrets.token_urlsafe(32)
        
        # Set token expiration (1 hour from now)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        await db.commit()
        await db.refresh(user)
        
        return reset_token
    
    async def verify_reset_token(self, db: AsyncSession, token: str) -> Optional[UserModel]:
        """Verify a password reset token and return the user if valid."""
        query = select(UserModel).where(UserModel.reset_token == token)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Check if token has expired
        if user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc):
            return None
        
        return user
    
    async def reset_password(self, db: AsyncSession, token: str, new_password: str) -> bool:
        """Reset user password using a valid reset token."""
        user = await self.verify_reset_token(db, token)
        
        if not user:
            return False
        
        # Update password
        user.password_hash = get_password_hash(new_password)
        
        # Clear reset token
        user.reset_token = None
        user.reset_token_expires = None
        
        await db.commit()
        
        return True
    
    async def generate_otp(self, db: AsyncSession, email: str) -> Optional[str]:
        """Generate a 6-digit OTP for email verification."""
        user = await self.get_user_by_email(db, email)
        
        if not user:
            return None
        
        # Generate a 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Set OTP expiration (10 minutes from now)
        user.otp_code = otp
        user.otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        await db.commit()
        await db.refresh(user)
        
        return otp
    
    async def verify_otp(self, db: AsyncSession, email: str, otp: str) -> bool:
        """Verify the OTP and mark user as verified."""
        user = await self.get_user_by_email(db, email)
        
        if not user:
            return False
        
        # Check if OTP matches
        if user.otp_code != otp:
            return False
        
        # Check if OTP has expired
        if user.otp_expires and user.otp_expires < datetime.now(timezone.utc):
            return False
        
        # Mark user as verified and clear OTP
        user.is_verified = True
        user.otp_code = None
        user.otp_expires = None
        
        await db.commit()
        
        return True


auth_service = AuthService()

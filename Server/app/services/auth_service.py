from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

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
        user.last_login = datetime.utcnow()
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


auth_service = AuthService()

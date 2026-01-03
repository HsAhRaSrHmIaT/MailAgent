from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import cloudinary
import cloudinary.uploader
from typing import Optional

from app.models.schemas import UserCreate, UserLogin, UserUpdate, UserResponse, Token
from app.services.auth_service import auth_service
from app.core.security import get_current_user_from_token
from app.core.database import DatabaseManager
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

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


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    
    - **email**: User's email address (required, must be unique)
    - **username**: Username (optional, must be unique if provided)
    - **password**: User's password (required, min 8 characters)
    """
    try:
        # Create user
        user = await auth_service.create_user(db, user_data)
        
        # Generate token
        token = auth_service.create_token_for_user(user)
        
        # Return user data and token
        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "isActive": user.is_active,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
                "lastLogin": user.last_login.isoformat() if user.last_login else None,
                "profilePicture": user.profile_picture
            },
            "token": token.access_token
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=dict)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Login with email and password.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns a JWT access token on success.
    """
    try:
        # Authenticate user
        user = await auth_service.authenticate_user(db, credentials.email, credentials.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        # Generate token
        token = auth_service.create_token_for_user(user)
        
        # Return user data and token
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "isActive": user.is_active,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
                "lastLogin": user.last_login.isoformat() if user.last_login else None,
                "profilePicture": user.profile_picture
            },
            "token": token.access_token
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=dict)
async def get_current_user(
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user information.
    
    Requires authentication (Bearer token).
    """
    try:
        user = await auth_service.get_user_by_id(db, current_user["id"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "isActive": user.is_active,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
                "lastLogin": user.last_login.isoformat() if user.last_login else None,
                "profilePicture": user.profile_picture
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user: {str(e)}"
        )


@router.put("/profile", response_model=dict)
async def update_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's profile.
    
    Requires authentication (Bearer token).
    
    - **username**: New username (optional)
    - **email**: New email (optional)
    """
    try:      
        user = await auth_service.update_user(db, current_user["id"], user_data)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "isActive": user.is_active,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
                "lastLogin": user.last_login.isoformat() if user.last_login else None,
                "profilePicture": user.profile_picture
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user_from_token)):
    """
    Logout current user.
    
    Requires authentication (Bearer token).
    Note: This is a placeholder. Token invalidation should be handled client-side.
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }


@router.post("/upload-avatar", response_model=dict)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload profile picture to Cloudinary and update user profile.
    
    Requires authentication (Bearer token).
    """
    try:
        # Configure Cloudinary (ensure settings are loaded)
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret
        )
        
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="mailagent/avatars",
            public_id=f"user_{current_user['id']}",
            overwrite=True,
            transformation=[
                {"width": 200, "height": 200, "crop": "fill", "gravity": "face"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        
        # Get the secure URL
        avatar_url = upload_result.get("secure_url")
        
        # Update user profile with new avatar URL
        user_update = UserUpdate(profile_picture=avatar_url)
        user = await auth_service.update_user(db, current_user["id"], user_update)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "message": "Avatar uploaded successfully",
            "profilePicture": avatar_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )

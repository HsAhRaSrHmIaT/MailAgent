from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import cloudinary
import cloudinary.uploader
# from typing import Optional
from app.core.config import settings

from app.models.schemas import UserCreate, UserLogin, UserUpdate, UserResponse, Token, ForgotPasswordRequest, VerifyResetTokenRequest, ResetPasswordRequest, MessageResponse, VerifyOTPRequest, ResendOTPRequest
from app.services.auth_service import auth_service
from app.services.email_sending_service import email_sending_service
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
        # Create user (not verified yet)
        user = await auth_service.create_user(db, user_data)
        
        # Generate OTP for email verification
        otp = await auth_service.generate_otp(db, user.email)
        
        # Send OTP email
        try:
            email_sending_service.send_otp_email(
                recipient_email=user.email,
                username=user.username or user.email.split('@')[0],
                otp=otp
            )
        except Exception as e:
            print(f"Failed to send OTP email: {str(e)}")
            # Don't fail registration if email fails, user can resend
        
        # Return user data without token (user needs to verify email first)
        return {
            "success": True,
            "message": "Registration successful. Please check your email for verification code.",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "isActive": user.is_active,
                "isVerified": user.is_verified,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
                "lastLogin": user.last_login.isoformat() if user.last_login else None,
                "profilePicture": user.profile_picture
            },
            "requiresVerification": True
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
        
        # Check if user is verified
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in",
                headers={"X-Requires-Verification": "true"}
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


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Request a password reset token.
    
    - **email**: User's email address
    
    Returns success even if email doesn't exist (security best practice).
    """
    try:
        reset_token = await auth_service.create_password_reset_token(db, request.email)
        
        if reset_token:
            # Send email with reset link
            email_sent = email_sending_service.send_password_reset_email(
                recipient_email=request.email,
                reset_token=reset_token
            )
            
            if email_sent:
                print(f"Password reset email sent to {request.email}")
            else:
                print(f"Failed to send email to {request.email}, but token created")
                # Still log the reset link for debugging
                reset_link = f"{settings.client_url}/reset-password?token={reset_token}"
                print(f"Password reset link: {reset_link}")
        
        # Always return success to prevent email enumeration
        return MessageResponse(
            message="If the email exists, a password reset link has been sent",
            success=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process request: {str(e)}"
        )


@router.post("/verify-reset-token", response_model=MessageResponse)
async def verify_reset_token(request: VerifyResetTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify if a password reset token is valid.
    
    - **token**: The reset token to verify
    """
    user = await auth_service.verify_reset_token(db, request.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return MessageResponse(
        message="Token is valid",
        success=True
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Reset password using a valid reset token.
    
    - **token**: The password reset token
    - **new_password**: The new password
    """
    success = await auth_service.reset_password(db, request.token, request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return MessageResponse(
        message="Password reset successfully",
        success=True
    )


@router.post("/verify-otp", response_model=dict)
async def verify_otp(request: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify OTP code for email verification.
    
    - **email**: User's email address
    - **otp**: 6-digit OTP code
    """
    try:
        # Verify OTP
        success = await auth_service.verify_otp(db, request.email, request.otp)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code"
            )
        
        # Get the verified user
        user = await auth_service.get_user_by_email(db, request.email)
        
        # Send welcome email now that user is verified
        try:
            email_sending_service.send_welcome_email(
                recipient_email=user.email,
                username=user.username or user.email.split('@')[0]
            )
        except Exception as e:
            print(f"Failed to send welcome email: {str(e)}")
        
        # Generate token for auto-login
        token = auth_service.create_token_for_user(user)
        
        return {
            "success": True,
            "message": "Email verified successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "isActive": user.is_active,
                "isVerified": user.is_verified,
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
            detail=f"Verification failed: {str(e)}"
        )


@router.post("/resend-otp", response_model=MessageResponse)
async def resend_otp(request: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Resend OTP code to user's email.
    
    - **email**: User's email address
    """
    try:
        # Check if user exists and is not already verified
        user = await auth_service.get_user_by_email(db, request.email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already verified"
            )
        
        # Generate new OTP
        otp = await auth_service.generate_otp(db, request.email)
        
        # Send OTP email
        email_sending_service.send_otp_email(
            recipient_email=user.email,
            username=user.username or user.email.split('@')[0],
            otp=otp
        )
        
        return MessageResponse(
            message="OTP has been sent to your email",
            success=True
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend OTP: {str(e)}"
        )

@router.get("/preferences")
async def get_preferences(
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's preferences.
    
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
            "preferences": {
                "language": user.language,
                "default_tone": user.default_tone,
                "ai_learning": user.ai_learning,
                "save_history": user.save_history
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get preferences: {str(e)}"
        )
    
@router.put("/preferences", response_model=dict)
async def update_preferences(
    preferences: UserUpdate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's preferences.
    
    Requires authentication (Bearer token).
    
    - **language**: Preferred language (optional)
    - **defaultTone**: Default tone for messages (optional)
    - **aiLearning**: Enable/disable AI learning (optional)
    - **saveHistory**: Enable/disable saving chat history (optional)
    """
    try:      
        user = await auth_service.update_user(db, current_user["id"], preferences)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "message": "Preferences updated successfully",
            "preferences": {
                "language": user.language,
                "default_tone": user.default_tone,
                "ai_learning": user.ai_learning,
                "save_history": user.save_history
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
            detail=f"Failed to update preferences: {str(e)}"
        )
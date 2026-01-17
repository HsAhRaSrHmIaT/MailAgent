from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
import cloudinary
import cloudinary.uploader
from datetime import datetime, timedelta
from collections import defaultdict
# from typing import Optional
from app.core.config import settings

from app.models.schemas import UserCreate, UserLogin, UserUpdate, UserResponse, Token, ForgotPasswordRequest, VerifyResetTokenRequest, ResetPasswordRequest, MessageResponse, VerifyOTPRequest, ResendOTPRequest, ActivityAction, ActivityStatus
from app.services.auth_service import auth_service
from app.services.email_sending_service import email_sending_service
from app.services.user_activity_service import user_activity_service
from app.core.security import get_current_user_from_token
from app.core.database import DatabaseManager
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Database dependency
db_manager = DatabaseManager()

# Simple in-memory rate limiting tracker for failed login attempts
failed_login_tracker = defaultdict(list)  # {email: [timestamp1, timestamp2, ...]}

async def get_db():
    """Dependency to get database session."""
    if not db_manager._initialized:
        await db_manager.initialize()
    
    async with db_manager.session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


def check_suspicious_login_activity(email: str) -> tuple[bool, int]:
    """
    Check if there are multiple failed login attempts from this email.
    Returns (is_suspicious, attempt_count)
    """
    now = datetime.now()
    time_window = timedelta(minutes=15)  # 15 minute window
    
    # Clean old attempts
    failed_login_tracker[email] = [
        timestamp for timestamp in failed_login_tracker[email]
        if now - timestamp < time_window
    ]
    
    attempt_count = len(failed_login_tracker[email])
    is_suspicious = attempt_count >= 5  # 5 failed attempts in 15 minutes
    
    return is_suspicious, attempt_count


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    
    - **email**: User's email address (required, must be unique)
    - **username**: Username (optional, must be unique if provided)
    - **password**: User's password (required, min 8 characters)
    """
    try:
        # Check password strength and log warning if weak
        if len(user_data.password) < 12:
            await user_activity_service.log_activity(
                user_id="unknown",
                action=ActivityAction.LOGIN,
                status=ActivityStatus.WARNING,
                message=f"User registered with weak password (length: {len(user_data.password)})",
                details={"email": user_data.email, "password_length": len(user_data.password)}
            )
        
        # Log warning if username not provided (missing optional data)
        if not user_data.username:
            await user_activity_service.log_activity(
                user_id="unknown",
                action=ActivityAction.LOGIN,
                status=ActivityStatus.WARNING,
                message="User registered without username (optional field missing)",
                details={"email": user_data.email}
            )
        
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
            # Log warning for failed email sending
            await user_activity_service.log_activity(
                user_id=user.id,
                action=ActivityAction.LOGIN,
                status=ActivityStatus.WARNING,
                message="Registration successful but OTP email failed to send",
                details={"email": user.email, "error": str(e)}
            )
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
        # Log registration error (duplicate email/username)
        try:
            await user_activity_service.log_activity(
                user_id="unknown",
                action=ActivityAction.LOGIN,  # Using LOGIN as there's no REGISTER action
                status=ActivityStatus.ERROR,
                message=f"Registration failed: {str(e)}",
                details={"email": user_data.email, "error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log unexpected registration error
        try:
            await user_activity_service.log_activity(
                user_id="unknown",
                action=ActivityAction.LOGIN,
                status=ActivityStatus.ERROR,
                message=f"Registration error: {str(e)}",
                details={"email": user_data.email, "error": str(e)}
            )
        except:
            pass
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
        # Check for suspicious login activity
        is_suspicious, attempt_count = check_suspicious_login_activity(credentials.email)
        
        if is_suspicious:
            # Log warning for suspicious activity (multiple failed attempts)
            await user_activity_service.log_activity(
                user_id="unknown",
                action=ActivityAction.LOGIN,
                status=ActivityStatus.WARNING,
                message=f"Suspicious login activity detected: {attempt_count} failed attempts in 15 minutes",
                details={"email": credentials.email, "attempt_count": attempt_count}
            )
        
        # Authenticate user
        user = await auth_service.authenticate_user(db, credentials.email, credentials.password)
        
        if not user:
            # Track failed login attempt
            failed_login_tracker[credentials.email].append(datetime.now())
            
            # Log failed login attempt
            await user_activity_service.log_activity(
                user_id="unknown",
                action=ActivityAction.LOGIN,
                status=ActivityStatus.ERROR,
                message=f"Failed login attempt for email: {credentials.email}",
                details={"email": credentials.email, "reason": "Invalid credentials"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Clear failed attempts on successful login
        if credentials.email in failed_login_tracker:
            del failed_login_tracker[credentials.email]
        
        if not user.is_active:
            # Log inactive account login attempt
            await user_activity_service.log_activity(
                user_id=user.id,
                action=ActivityAction.LOGIN,
                status=ActivityStatus.ERROR,
                message=f"Login attempt on inactive account",
                details={"email": user.email, "reason": "Account inactive"}
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        # Check if user is verified
        if not user.is_verified:
            # Log warning for unverified user
            await user_activity_service.log_activity(
                user_id=user.id,
                action=ActivityAction.LOGIN,
                status=ActivityStatus.WARNING,
                message=f"Login attempt by unverified user",
                details={"email": user.email, "reason": "Email not verified"}
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in",
                headers={"X-Requires-Verification": "true"}
            )
        
        # Generate token
        token = auth_service.create_token_for_user(user)
        
        # Log successful login
        await user_activity_service.log_activity(
            user_id=user.id,
            action=ActivityAction.LOGIN,
            status=ActivityStatus.SUCCESS,
            message=f"User logged in successfully",
            details={"email": user.email}
        )
        
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
        # Log unexpected login error
        try:
            await user_activity_service.log_activity(
                user_id="unknown",
                action=ActivityAction.LOGIN,
                status=ActivityStatus.ERROR,
                message=f"Login error: {str(e)}",
                details={"email": credentials.email, "error": str(e)}
            )
        except:
            pass  # Don't fail if logging fails
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
        
        # Log profile update
        await user_activity_service.log_activity(
            user_id=user.id,
            action=ActivityAction.PROFILE_UPDATED,
            status=ActivityStatus.SUCCESS,
            message="Profile updated successfully",
            details={
                "updated_fields": [k for k, v in user_data.dict(exclude_unset=True).items() if v is not None]
            }
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
    # Log logout activity
    await user_activity_service.log_activity(
        user_id=current_user["id"],
        action=ActivityAction.LOGOUT,
        status=ActivityStatus.SUCCESS,
        message="User logged out",
        details={
            "email": current_user.get("email"), 
            "username": current_user.get("username"),         
        }
    )
    
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
        # Log avatar upload error
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.PROFILE_UPDATED,
                status=ActivityStatus.ERROR,
                message=f"Failed to upload avatar: {str(e)}",
                details={"error": str(e)}
            )
        except:
            pass
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

@router.post("/send-email-change-verification")
async def send_email_change_verification(
    request_body: dict,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Send OTP verification code to a new email address for email change.
    
    Requires authentication (Bearer token).
    """
    try:
        import random
        import string
        from datetime import datetime, timedelta, timezone
        
        new_email = request_body.get("email")
        
        if not new_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Check if the new email is already taken by another user
        existing_user = await auth_service.get_user_by_email(db, new_email)
        if existing_user and existing_user.id != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already in use by another account"
            )
        
        # Get current user
        user = await auth_service.get_user_by_id(db, current_user["id"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate 6-digit verification code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Store verification code with expiry (10 minutes) and purpose
        user.otp_code = verification_code
        user.otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
        user.otp_purpose = "email_change"
        await db.commit()
        
        # Send OTP email to the NEW email address
        from app.services.email_sending_service import email_sending_service
        
        email_sending_service.send_otp_email(
            recipient_email=new_email,
            username=user.username or user.email.split('@')[0],
            otp=verification_code
        )
        
        return {
            "success": True,
            "message": f"Verification code sent to {new_email}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification code: {str(e)}"
        )

@router.post("/verify-email-change")
async def verify_email_change(
    request_body: dict,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify OTP code for email change.
    
    Requires authentication (Bearer token).
    """
    try:
        from datetime import datetime, timezone
        
        otp_code = request_body.get("otp")
        
        if not otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code is required"
            )
        
        user = await auth_service.get_user_by_id(db, current_user["id"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify code exists and purpose matches
        if not user.otp_code or not user.otp_expires or not user.otp_purpose:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No verification code found. Please request a new code."
            )
        
        if user.otp_purpose != "email_change":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code for this action."
            )
        
        if user.otp_expires < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new code."
            )
        
        if user.otp_code != otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code."
            )
        
        # Clear verification code after successful verification
        user.otp_code = None
        user.otp_expires = None
        user.otp_purpose = None
        await db.commit()
        
        return {
            "success": True,
            "message": "Email verified successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify code: {str(e)}"
        )

@router.post("/send-delete-verification")
async def send_delete_verification(
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a verification code to user's email before deleting all data.
    
    Requires authentication (Bearer token).
    """
    try:
        import random
        import string
        from datetime import datetime, timedelta
        
        user = await auth_service.get_user_by_id(db, current_user["id"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate 6-digit verification code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Store verification code with expiry (10 minutes) and purpose
        user.otp_code = verification_code
        user.otp_expires = datetime.utcnow() + timedelta(minutes=10)
        user.otp_purpose = "data_deletion"
        await db.commit()
        
        # Send email with verification code
        from app.services.email_sending_service import email_sending_service
        
        email_subject = "⚠️ Account Data Deletion Verification"
        email_body = f"""
            Hello,

            You have requested to delete all your data from MailAgent.

            Your verification code is: {verification_code}

            This code will expire in 10 minutes.

            If you did not request this, please ignore this email and your data will remain safe.

            Best regards,
            MailAgent Team
            """
        
        # Use a default email service or system email to send
        # For now, we'll use the first available email config
        from app.services.email_config_service import email_config_service
        active_config = await email_config_service.get_active_email(db, current_user["id"])
        
        if active_config:
            decrypted_password = email_config_service._decrypt_password(active_config.encrypted_password)
            success, error = email_sending_service.send_user_email(
                sender_email=active_config.email,
                sender_password=decrypted_password,
                recipient_email=user.email,
                subject=email_subject,
                body=email_body
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to send verification email: {error}"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active email configuration found. Please set up an email first."
            )
        
        return {
            "success": True,
            "message": f"Verification code sent to {user.email}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification code: {str(e)}"
        )

@router.delete("/delete-all-data")
async def delete_all_user_data(
    request_body: dict,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete all user data (chat history, emails, activity logs) after verification.
    
    Requires authentication (Bearer token) and verification code.
    """
    try:
        from datetime import datetime
        
        verification_code = request_body.get("verification_code")
        
        if not verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code is required"
            )
        
        user = await auth_service.get_user_by_id(db, current_user["id"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify code exists and purpose matches
        if not user.otp_code or not user.otp_expires or not user.otp_purpose:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No verification code found. Please request a new code."
            )
        
        if user.otp_purpose != "data_deletion":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code for this action."
            )
        
        if user.otp_expires < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new code."
            )
        
        if user.otp_code != verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code."
            )
        
        # Clear verification code
        user.otp_code = None
        user.otp_expires = None
        user.otp_purpose = None
        await db.commit()
        
        from app.services.email_service import email_service
        from app.services.chat_service import chat_service
        from app.services.user_activity_service import user_activity_service
        
        user_id = current_user["id"]
        
        # Delete all emails
        await email_service.clear_user_emails(db, user_id)
        
        # Delete all chat messages
        await chat_service.clear_user_messages(db, user_id)
        
        # Delete all activity logs
        await user_activity_service.clear_user_activities(user_id)
        
        return {
            "success": True,
            "message": "All user data deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user data: {str(e)}"
        )
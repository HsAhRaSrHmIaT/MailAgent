from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.models.schemas import (
    EmailConfigCreate,
    EmailConfigUpdate,
    EmailConfigResponse,
    EmailConfigWithPassword,
    ActivityAction,
    ActivityStatus
)
from app.services.email_config_service import email_config_service
from app.services.user_activity_service import user_activity_service
from app.core.security import get_current_user_from_token
from app.core.database import DatabaseManager

router = APIRouter(prefix="/email-configs", tags=["Email Configurations"])

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


@router.get("/active", response_model=dict)
async def get_active_email(
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the currently active email for the user.
    Returns the active email or "default" if none is set.
    """
    try:
        active_config = await email_config_service.get_active_email(db, current_user["id"])
        
        if not active_config:
            # Log warning for missing email configuration (using fallback)
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.CONFIG_UPDATED,
                status=ActivityStatus.WARNING,
                message="No email configuration found, using fallback default",
                details={"fallback": "default"}
            )
            return {
                "email": "default",
                "password": ""
            }
        
        return {
            "email": active_config.email,
            "password": email_config_service._decrypt_password(active_config.encrypted_password)
        }
    except Exception as e:
        # Log error retrieving active email
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.CONFIG_UPDATED,
                status=ActivityStatus.ERROR,
                message=f"Failed to retrieve active email: {str(e)}",
                details={"error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve active email: {str(e)}"
        )

@router.get("/", response_model=List[EmailConfigWithPassword])
async def get_all_email_configs(
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all email configurations for the current user (with decrypted passwords).
    """
    try:
        configs = await email_config_service.get_all_user_email_configs(db, current_user["id"])
        
        return [
            EmailConfigWithPassword(
                id=config.id,
                email=config.email,
                password=email_config_service._decrypt_password(config.encrypted_password),
                created_at=config.created_at.isoformat() if config.created_at else "",
                updated_at=config.updated_at.isoformat() if config.updated_at else ""
            )
            for config in configs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve email configurations: {str(e)}"
        )


@router.get("/{email}", response_model=EmailConfigWithPassword)
async def get_email_config(
    email: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific email configuration by email address (returns decrypted password).
    """
    try:
        config = await email_config_service.get_email_config_by_email(db, current_user["id"], email)
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email configuration for '{email}' not found"
            )
        
        decrypted_password = email_config_service._decrypt_password(config.encrypted_password)
        
        return EmailConfigWithPassword(
            id=config.id,
            email=config.email,
            password=decrypted_password,
            created_at=config.created_at.isoformat() if config.created_at else "",
            updated_at=config.updated_at.isoformat() if config.updated_at else ""
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve email configuration: {str(e)}"
        )


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_or_update_email_config(
    config_data: EmailConfigCreate,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Create or update an email configuration for the current user.
    """
    try:
        # Check if config exists and if password changed
        existing = await email_config_service.get_email_config_by_email(db, current_user["id"], config_data.email)
        is_new = existing is None
        
        # Check if password actually changed
        password_changed = True
        if existing:
            try:
                old_password = email_config_service._decrypt_password(existing.encrypted_password)
                password_changed = old_password != config_data.password
            except:
                password_changed = True  # If decryption fails, assume it changed
        
        config = await email_config_service.create_or_update_email_config(db, current_user["id"], config_data)
        
        # Only log activity if it's new or password actually changed
        if is_new or password_changed:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.CONFIG_ADDED if is_new else ActivityAction.CONFIG_UPDATED,
                status=ActivityStatus.SUCCESS,
                message=f"Email config for '{config.email}' {'added' if is_new else 'updated'} successfully",
                details={"email": config.email}
            )
        
        return {
            "success": True,
            "message": f"Email configuration for '{config.email}' saved successfully",
            "config": {
                "id": config.id,
                "email": config.email
            }
        }
    except Exception as e:
        # Log error saving email config
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.CONFIG_ADDED,
                status=ActivityStatus.ERROR,
                message=f"Failed to save email config: {str(e)}",
                details={"email": config_data.email, "error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save email configuration: {str(e)}"
        )


@router.put("/{email}", response_model=dict)
async def update_email_config(
    email: str,
    config_data: EmailConfigUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing email configuration.
    """
    try:
        # Check if config exists
        existing = await email_config_service.get_email_config_by_email(db, current_user["id"], email)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email configuration for '{email}' not found"
            )
        
        # Update using create_or_update (which handles updates)
        config_create = EmailConfigCreate(email=email, password=config_data.password)
        config = await email_config_service.create_or_update_email_config(db, current_user["id"], config_create)
        
        return {
            "success": True,
            "message": f"Email configuration for '{config.email}' updated successfully",
            "config": {
                "id": config.id,
                "email": config.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        # Log error updating email config
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.CONFIG_UPDATED,
                status=ActivityStatus.ERROR,
                message=f"Failed to update email config: {str(e)}",
                details={"email": email, "error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update email configuration: {str(e)}"
        )


@router.delete("/{email}", response_model=dict)
async def delete_email_config(
    email: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific email configuration.
    """
    try:
        deleted = await email_config_service.delete_email_config(db, current_user["id"], email)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email configuration for '{email}' not found"
            )
        
        # Log activity
        await user_activity_service.log_activity(
            user_id=current_user["id"],
            action=ActivityAction.CONFIG_DELETED,
            status=ActivityStatus.SUCCESS,
            message=f"Email config for '{email}' deleted successfully",
            details={"email": email}
        )
        
        return {
            "success": True,
            "message": f"Email configuration for '{email}' deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        # Log error deleting email config
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.CONFIG_DELETED,
                status=ActivityStatus.ERROR,
                message=f"Failed to delete email config: {str(e)}",
                details={"email": email, "error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete email configuration: {str(e)}"
        )


@router.patch("/{email}/set-active", response_model=dict)
async def set_active_email(
    email: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Set an email as active and deactivate all others.
    """
    try:
        success = await email_config_service.set_active_email(db, current_user["id"], email)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email configuration for '{email}' not found"
            )
        
        return {
            "success": True,
            "message": f"Email '{email}' set as active"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set active email: {str(e)}"
        )

# @router.delete("/", response_model=dict)
# async def delete_all_email_configs(
#     current_user: Dict[str, Any] = Depends(get_current_user_from_token),
#     db: AsyncSession = Depends(get_db)
# ):
#     """
#     Delete all email configurations for the current user.
#     """
#     try:
#         deleted_count = await email_config_service.delete_all_email_configs(db, current_user["id"])
        
#         return {
#             "success": True,
#             "message": f"Deleted {deleted_count} email configuration(s)",
#             "deleted_count": deleted_count
#         }
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to delete email configurations: {str(e)}"
#         )

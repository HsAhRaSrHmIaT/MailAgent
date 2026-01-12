from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.models.schemas import (
    EnvironmentVariableCreate, 
    EnvironmentVariableUpdate,
    EnvironmentVariableResponse,
    EnvironmentVariableListItem,
    ActivityAction,
    ActivityStatus
)
from app.services.env_vars_service import env_vars_service
from app.services.user_activity_service import user_activity_service
from app.core.security import get_current_user_from_token
from app.core.database import DatabaseManager
from typing import Dict, Any

router = APIRouter(prefix="/env-vars", tags=["Environment Variables"])

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


@router.get("/", response_model=List[EnvironmentVariableListItem])
async def get_all_variables(
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all environment variables for the current user (with decrypted values).
    """
    try:
        variables = await env_vars_service.get_all_user_variables(db, current_user["id"])
        
        # Log warning if no environment variables configured
        if not variables:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.VARIABLE_UPDATED,
                status=ActivityStatus.WARNING,
                message="No environment variables configured for user",
                details={"count": 0}
            )
        
        return [
            EnvironmentVariableListItem(
                id=var.id,
                key=var.key,
                value=env_vars_service._decrypt_value(var.encrypted_value),
                created_at=var.created_at.isoformat() if var.created_at else "",
                updated_at=var.updated_at.isoformat() if var.updated_at else ""
            )
            for var in variables
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve environment variables: {str(e)}"
        )


@router.get("/{key}", response_model=EnvironmentVariableResponse)
async def get_variable(
    key: str,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific environment variable by key (returns decrypted value).
    """
    try:
        var = await env_vars_service.get_variable_by_key(db, current_user["id"], key)
        
        if not var:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Environment variable '{key}' not found"
            )
        
        decrypted_value = env_vars_service._decrypt_value(var.encrypted_value)
        
        return EnvironmentVariableResponse(
            id=var.id,
            key=var.key,
            value=decrypted_value,
            created_at=var.created_at.isoformat() if var.created_at else "",
            updated_at=var.updated_at.isoformat() if var.updated_at else ""
        )
    except HTTPException:
        raise
    except Exception as e:
        # Log error retrieving environment variable
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.VARIABLE_UPDATED,
                status=ActivityStatus.ERROR,
                message=f"Failed to retrieve variable '{key}': {str(e)}",
                details={"key": key, "error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve environment variable: {str(e)}"
        )


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_or_update_variable(
    var_data: EnvironmentVariableCreate,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Create or update an environment variable for the current user.
    """
    try:
        # Check if variable exists
        existing = await env_vars_service.get_variable_by_key(db, current_user["id"], var_data.key)
        is_new = existing is None

        variable_changed = True
        if existing:
            try:
                decrypted_existing_value = env_vars_service._decrypt_value(existing.encrypted_value)
                variable_changed = decrypted_existing_value != var_data.value
            except Exception:
                variable_changed = True
        
        var = await env_vars_service.create_or_update_variable(db, current_user["id"], var_data)
        
        # Log activity
        if is_new or variable_changed:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.VARIABLE_ADDED if is_new else ActivityAction.VARIABLE_UPDATED,
                status=ActivityStatus.SUCCESS,
                message=f"Variable '{var.key}' {'added' if is_new else 'updated'} successfully",
                details={"key": var.key}
            )
        
        return {
            "success": True,
            "message": f"Environment variable '{var.key}' saved successfully",
            "variable": {
                "id": var.id,
                "key": var.key,
                "masked_value": env_vars_service.get_masked_value(var.encrypted_value)
            }
        }
    except Exception as e:
        # Log error saving environment variable
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.VARIABLE_ADDED,
                status=ActivityStatus.ERROR,
                message=f"Failed to save variable '{var_data.key}': {str(e)}",
                details={"key": var_data.key, "error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save environment variable: {str(e)}"
        )


@router.put("/{key}", response_model=dict)
async def update_variable(
    key: str,
    var_data: EnvironmentVariableUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing environment variable.
    """
    try:
        # Check if variable exists
        existing = await env_vars_service.get_variable_by_key(db, current_user["id"], key)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Environment variable '{key}' not found"
            )
        
        # Update using create_or_update (which handles updates)
        var_create = EnvironmentVariableCreate(key=key, value=var_data.value)
        var = await env_vars_service.create_or_update_variable(db, current_user["id"], var_create)
        
        return {
            "success": True,
            "message": f"Environment variable '{var.key}' updated successfully",
            "variable": {
                "id": var.id,
                "key": var.key,
                "masked_value": env_vars_service.get_masked_value(var.encrypted_value)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        # Log error updating environment variable
        try:
            await user_activity_service.log_activity(
                user_id=current_user["id"],
                action=ActivityAction.VARIABLE_UPDATED,
                status=ActivityStatus.ERROR,
                message=f"Failed to update variable '{key}': {str(e)}",
                details={"key": key, "error": str(e)}
            )
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update environment variable: {str(e)}"
        )


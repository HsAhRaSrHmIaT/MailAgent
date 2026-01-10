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
        is_update = existing is not None
        
        var = await env_vars_service.create_or_update_variable(db, current_user["id"], var_data)
        
        # Log activity
        await user_activity_service.log_activity(
            user_id=current_user["id"],
            action=ActivityAction.VARIABLE_UPDATED if is_update else ActivityAction.VARIABLE_ADDED,
            status=ActivityStatus.SUCCESS,
            message=f"Variable '{var.key}' {'updated' if is_update else 'added'} successfully",
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update environment variable: {str(e)}"
        )


# @router.delete("/{key}", response_model=dict)
# async def delete_variable(
#     key: str,
#     current_user: Dict[str, Any] = Depends(get_current_user_from_token),
#     db: AsyncSession = Depends(get_db)
# ):
#     """
#     Delete a specific environment variable.
#     """
#     try:
#         deleted = await env_vars_service.delete_variable(db, current_user["id"], key)
        
#         if not deleted:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail=f"Environment variable '{key}' not found"
#             )
        
#         return {
#             "success": True,
#             "message": f"Environment variable '{key}' deleted successfully"
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to delete environment variable: {str(e)}"
#         )


# @router.delete("/", response_model=dict)
# async def delete_all_variables(
#     current_user: Dict[str, Any] = Depends(get_current_user_from_token),
#     db: AsyncSession = Depends(get_db)
# ):
#     """
#     Delete all environment variables for the current user.
#     """
#     try:
#         count = await env_vars_service.delete_all_user_variables(db, current_user["id"])
        
#         return {
#             "success": True,
#             "message": f"Deleted {count} environment variable(s)",
#             "count": count
#         }
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to delete environment variables: {str(e)}"
#         )

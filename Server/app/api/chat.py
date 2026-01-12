import email
from app.services.llm_service import llm_service, LLMService
from app.services.env_vars_service import env_vars_service
from app.services.user_activity_service import user_activity_service
from app.models.schemas import ChatMessage as cht, Email as em, ActivityAction, ActivityStatus
from app.core.database import db_manager
import time
from typing import Optional


async def get_user_llm_service(user_id: Optional[str] = None) -> LLMService:
    """Get an LLM service instance configured with user's API key if available."""
    if not user_id:
        # Use default service with system API key
        return llm_service
    
    user_api_key = None
    fetch_error = None
    
    try:
        # Get database session - ONLY fetch the key, don't process it here
        async with db_manager.session_factory() as db:
            user_api_key = await env_vars_service.get_decrypted_value(db, user_id, "GOOGLE_API_KEY")
        # Session is now closed, safe to do everything else
    except Exception as e:
        print(f"Error getting user LLM service: {e}")
        fetch_error = str(e)
    
    # Now process outside the database session
    if fetch_error:
        # Log error when fetching API key fails
        try:
            await user_activity_service.log_activity(
                user_id=user_id,
                action=ActivityAction.RESPONSE_GENERATED,
                status=ActivityStatus.ERROR,
                message=f"Failed to retrieve user API key: {fetch_error}",
                details={"error": fetch_error}
            )
        except Exception as log_err:
            print(f"Failed to log activity: {log_err}")
    elif user_api_key:
        # Try to create service with user's API key
        user_service = LLMService(api_key=user_api_key)
        if user_service.is_available():
            # Test if the API key actually works by attempting a simple request
            try:
                # Try a minimal test to validate the key
                test_response = user_service.model.generate_content(
                    "test",
                    generation_config={"max_output_tokens": 1}
                )
                # If we get here, the key is valid
                return user_service
            except Exception as validation_error:
                # API key is invalid or has issues
                print(f"API key validation failed: {validation_error}")
                try:
                    await user_activity_service.log_activity(
                        user_id=user_id,
                        action=ActivityAction.RESPONSE_GENERATED,
                        status=ActivityStatus.WARNING,
                        message="User's GOOGLE_API_KEY is invalid",
                        details={
                            "reason": "Invalid or expired API key",
                            "request": "Please pass a valid API key" 
                        }
                    )
                except Exception as log_err:
                    print(f"Failed to log activity: {log_err}")
        else:
            # Model wasn't initialized at all
            try:
                await user_activity_service.log_activity(
                    user_id=user_id,
                    action=ActivityAction.RESPONSE_GENERATED,
                    status=ActivityStatus.WARNING,
                    message="User's GOOGLE_API_KEY failed to initialize service",
                    details={"error": "Service unavailable"}
                )
            except Exception as log_err:
                print(f"Failed to log activity: {log_err}")
    else:
        # user_api_key is None (no value in database)
        try:
            await user_activity_service.log_activity(
                user_id=user_id,
                action=ActivityAction.RESPONSE_GENERATED,
                status=ActivityStatus.ERROR,
                message="User has no GOOGLE_API_KEY configured",
                details={
                    "error": "No API key found",
                    "request": "Please configure your GOOGLE_API_KEY to use personalized LLM service"
                    }
            )
        except Exception as log_err:
            print(f"Failed to log activity: {log_err}")
    
    # Fallback to default service
    return llm_service


async def handle_chat_message(data: dict, user_id: Optional[str] = None) -> cht:
    chat_msg = cht(
        role=data.get("role", "user"),
        content=data.get("content", ""),
        tone=data.get("tone", ""),
        timestamp=data.get("timestamp") or int(time.time())
    )

    # Get appropriate LLM service (user-specific or default)
    service = await get_user_llm_service(user_id)
    ai_response = await service.generate_response(chat_msg.content, getattr(chat_msg, "tone", ""))
    response = cht(
        role="assistant",
        content=ai_response,
        timestamp=int(time.time()),
    )
    return response


async def handle_email_request(data: dict, user_id: Optional[str] = None) -> dict:
    email_req = em(
        role=data.get("role", "user"),
        receiverEmail=data.get("receiverEmail", ""),
        prompt=data.get("prompt", ""),
        tone=data.get("tone", "")
    )

    # Get appropriate LLM service (user-specific or default)
    service = await get_user_llm_service(user_id)
    
    # Check if service is available before generating
    if not service.is_available():
        # Log error for unavailable service
        if user_id:
            await user_activity_service.log_activity(
                user_id=user_id,
                action=ActivityAction.EMAIL_FAILED,
                status=ActivityStatus.ERROR,
                message="Email generation failed: No valid API key available",
                details={
                    "recipient": email_req.receiverEmail,
                    "reason": "No GOOGLE_API_KEY configured",
                    "request": "Please configure your GOOGLE_API_KEY"
                }
            )
        raise Exception("AI service unavailable. Please configure GOOGLE_API_KEY.")
    
    email_content = await service.generate_email(email_req.prompt, email_req.tone, email_req.receiverEmail)

    return email_content
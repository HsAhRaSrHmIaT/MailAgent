# from fastapi import APIRouter
# from pydantic import BaseModel
import email
from app.services.llm_service import llm_service, LLMService
from app.services.env_vars_service import env_vars_service
from app.models.schemas import ChatMessage as cht, Email as em
from app.core.database import db_manager
import time
from typing import Optional

# router = APIRouter()

# class ChatInput(BaseModel):
#     message: str
#     tone: str = ""

async def get_user_llm_service(user_id: Optional[str] = None) -> LLMService:
    """Get an LLM service instance configured with user's API key if available."""
    if not user_id:
        # Use default service with system API key
        return llm_service
    
    try:
        # Get database session
        async with db_manager.session_factory() as db:
            # Try to get user's Google API key
            user_api_key = await env_vars_service.get_decrypted_value(db, user_id, "GOOGLE_API_KEY")
            
            if user_api_key:
                # Create a new LLM service instance with user's API key
                user_service = LLMService(api_key=user_api_key)
                if user_service.is_available():
                    return user_service
    except Exception as e:
        print(f"Error getting user LLM service: {e}")
    
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
    email_content = await service.generate_email(email_req.prompt, email_req.tone, email_req.receiverEmail)

    return email_content
    

# @router.post("/api/chat")
# async def chat_message(data: ChatMessage):
#     response = handle_chat_message(data.model_dump())
#     return response.model_dump()
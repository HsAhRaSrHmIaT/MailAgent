# from fastapi import APIRouter
# from pydantic import BaseModel
import email
from app.services.llm_service import llm_service
from app.models.schemas import ChatMessage as cht, Email as em
import time

# router = APIRouter()

# class ChatInput(BaseModel):
#     message: str
#     tone: str = ""

async def handle_chat_message(data: dict) -> cht:
    chat_msg = cht(
        role=data.get("role", "user"),
        content=data.get("content", ""),
        tone=data.get("tone", ""),
        timestamp=data.get("timestamp") or int(time.time())
    )

    ai_response = await llm_service.generate_response(chat_msg.content, getattr(chat_msg, "tone", ""))
    response = cht(
        role="assistant",
        content=ai_response,
        timestamp=int(time.time()),
    )
    return response

async def handle_email_request(data: dict) -> dict:
    email_req = em(
        role=data.get("role", "user"),
        receiverEmail=data.get("receiverEmail", ""),
        prompt=data.get("prompt", ""),
        tone=data.get("tone", "")
    )

    email_content = await llm_service.generate_email(email_req.prompt, email_req.tone, email_req.receiverEmail)

    return email_content
    

# @router.post("/api/chat")
# async def chat_message(data: ChatMessage):
#     response = handle_chat_message(data.model_dump())
#     return response.model_dump()
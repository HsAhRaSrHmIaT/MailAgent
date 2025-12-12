from fastapi import WebSocket, WebSocketDisconnect
from app.api.chat import handle_chat_message, handle_email_request
from app.services.logger_service import logger_service, LogCategory
from app.core.security import verify_token
import time
import json

class WebSocketHandler:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.session_id = f"ws_{int(time.time())}_{id(websocket)}"
        self.user_id = None

    async def connect(self):
        await self.websocket.accept()
        await logger_service.info(
            LogCategory.WEBSOCKET,
            "WebSocket connection established",
            details={"session_id": self.session_id}
        )

    async def disconnect(self):
        await self.websocket.close()
        await logger_service.info(
            LogCategory.WEBSOCKET,
            "WebSocket connection closed",
            details={"session_id": self.session_id}
        )

    async def handle_message(self, data: dict):
        await logger_service.info(
            LogCategory.WEBSOCKET,
            "Received chat message",
            details={
                "session_id": self.session_id,
                "message_type": "chat",
                "content_length": len(data.get("content", ""))
            }
        )
        
        try:
            response = await handle_chat_message(data, user_id=self.user_id)
            await self.websocket.send_json(response.model_dump())
            
            await logger_service.info(
                LogCategory.WEBSOCKET,
                "Chat response sent successfully",
                details={"session_id": self.session_id}
            )
        except Exception as e:
            await logger_service.log_exception(
                LogCategory.WEBSOCKET,
                "Failed to process chat message",
                e,
                details={"session_id": self.session_id}
            )
            
            await self.websocket.send_json({
                "role": "assistant",
                "content": "The message request could not be processed.",
                "timestamp": int(time.time())
            })

    async def handle_email(self, data: dict):
        await logger_service.info(
            LogCategory.WEBSOCKET,
            "Received email request",
            details={
                "session_id": self.session_id,
                "message_type": "email",
                "receiver_email": data.get("receiverEmail", ""),
                "prompt_length": len(data.get("prompt", ""))
            }
        )
        
        try:
            response = await handle_email_request(data, user_id=self.user_id)
            await self.websocket.send_json(response)
            
            await logger_service.info(
                LogCategory.WEBSOCKET,
                "Email response sent successfully",
                details={"session_id": self.session_id}
            )
        except Exception as e:
            await logger_service.log_exception(
                LogCategory.WEBSOCKET,
                "Failed to process email request",
                e,
                details={"session_id": self.session_id}
            )
            
            await self.websocket.send_json({
                "role": "assistant",
                "content": "The email request could not be processed.",
                "timestamp": int(time.time())
            })

async def websocket_endpoint(websocket: WebSocket):
    handler = WebSocketHandler(websocket)
    authenticated_user = None
    
    try:
        await handler.connect()
        while True:
            data = await websocket.receive_json()
            
            # Check for authentication token in the message
            token = data.get("token")
            if token and not authenticated_user:
                user_id = verify_token(token)
                if user_id:
                    authenticated_user = user_id
                    handler.user_id = user_id  # Store user_id in handler
                    await logger_service.info(
                        LogCategory.WEBSOCKET,
                        "User authenticated via WebSocket",
                        details={
                            "session_id": handler.session_id,
                            "user_id": user_id
                        }
                    )
            
            # Optional: Require authentication for certain operations
            # if not authenticated_user:
            #     await websocket.send_json({
            #         "error": "Unauthorized",
            #         "status": 401,
            #         "message": "Authentication required"
            #     })
            #     continue
            
            message_type = data.get("type", "chat")
            if message_type == "email":
                await handler.handle_email(data)
            else:
                await handler.handle_message(data)
    except WebSocketDisconnect:
        await logger_service.info(
            LogCategory.WEBSOCKET,
            "WebSocket disconnected",
            details={"session_id": handler.session_id}
        )
    except Exception as e:
        await logger_service.log_exception(
            LogCategory.WEBSOCKET,
            "WebSocket error occurred",
            e,
            details={"session_id": handler.session_id}
        )
    finally:
        await handler.disconnect()
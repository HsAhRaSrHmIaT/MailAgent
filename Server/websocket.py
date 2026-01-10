from fastapi import WebSocket, WebSocketDisconnect
from app.api.chat import handle_chat_message, handle_email_request
from app.services.user_activity_service import user_activity_service
from app.models.schemas import ActivityAction, ActivityStatus
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

    async def disconnect(self):
        await self.websocket.close()

    async def handle_message(self, data: dict):
        try:
            response = await handle_chat_message(data, user_id=self.user_id)
            await self.websocket.send_json(response.model_dump())
        except Exception as e:
            await self.websocket.send_json({
                "role": "assistant",
                "content": "The message request could not be processed.",
                "timestamp": int(time.time())
            })

    async def handle_email(self, data: dict):
        try:
            response = await handle_email_request(data, user_id=self.user_id)
            await self.websocket.send_json(response)
            
            # Log email generation activity
            if self.user_id:
                await user_activity_service.log_activity(
                    user_id=self.user_id,
                    action=ActivityAction.EMAIL_GENERATED,
                    status=ActivityStatus.SUCCESS,
                    message="Email generated successfully",
                    details={
                        "recipient": data.get("receiverEmail", ""),
                        "tone": data.get("tone", "")
                    }
                )
        except Exception as e:
            # Log email generation error
            if self.user_id:
                await user_activity_service.log_activity(
                    user_id=self.user_id,
                    action=ActivityAction.EMAIL_GENERATED,
                    status=ActivityStatus.ERROR,
                    message="Failed to generate email",
                    details={"error": str(e)}
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
            
            message_type = data.get("type", "chat")
            if message_type == "email":
                await handler.handle_email(data)
            else:
                await handler.handle_message(data)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await handler.disconnect()
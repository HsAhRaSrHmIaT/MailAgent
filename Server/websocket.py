from fastapi import WebSocket, WebSocketDisconnect
from app.api.chat import handle_chat_message, handle_email_request
import time

class WebSocketHandler:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def connect(self):
        await self.websocket.accept()

    async def disconnect(self):
        await self.websocket.close()

    async def handle_message(self, data: dict):
        # print(f"Received WebSocket message: {data}")
        try:
            response = await handle_chat_message(data)
            await self.websocket.send_json(response.model_dump())
        except Exception as e:
            await self.websocket.send_json({
                "role": "assistant",
                "content": "The message request could not be processed.",
                "timestamp": int(time.time())
            })
            print(f"Error handling message: {e}")

    async def handle_email(self, data: dict):
        try:
            response = await handle_email_request(data)
            await self.websocket.send_json(response)
        except Exception as e:
            await self.websocket.send_json({
                "role": "assistant",
                "content": "The email request could not be processed.",
                "timestamp": int(time.time())
            })
            print(f"Error handling email request: {e}")

async def websocket_endpoint(websocket: WebSocket):
    handler = WebSocketHandler(websocket)
    try:
        await handler.connect()
        while True:
            data = await websocket.receive_json()
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
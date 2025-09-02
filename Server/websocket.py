from fastapi import WebSocket, WebSocketDisconnect
from app.services.llm_service import LLMService

class WebSocketHandler:
    def __init__(self, websocket: WebSocket, api_keys: dict):
        self.websocket = websocket
        self.api_keys = api_keys
        print("WebSocketHandler initialized")
        
    async def handle_message(self, message: str):
        await self.websocket.send_text(f"Message received: {message}")

    async def connect(self):
        await self.websocket.accept()


    async def disconnect(self):
        await self.websocket.close()

    async def websocket_endpoint(websocket: WebSocket):

        api_keys = {
            'google_api_key': None,
        }

        handler = WebSocketHandler(websocket, api_keys)

        try:
            await handler.connect()

            while True:
                message = await websocket.receive_text()
                await handler.handle_message(message)
        
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"WebSocket error: {e}")
            pass
        finally:
            await handler.disconnect()
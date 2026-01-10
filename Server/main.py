import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from websocket import websocket_endpoint

from app.core.config import settings
from app.api import logs, auth, env_vars, email_configs, chat_history, email_history

app = FastAPI(
    title="MailAgent",
    description="An AI-powered email assistant that helps you write and manage emails efficiently.",
    version="1.0.1",
    docs_url="/docs",
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(logs.router, prefix="/api", tags=["activity-logs"])
app.include_router(env_vars.router, prefix="/api", tags=["env-vars"])
app.include_router(email_configs.router, prefix="/api", tags=["email-configs"])
app.include_router(chat_history.router, prefix="/api", tags=["chat-history"])
app.include_router(email_history.router, prefix="/api", tags=["email-history"])

app.add_api_websocket_route("/api", websocket_endpoint)

@app.get("/")
async def root():
    return JSONResponse(content={"message": "Welcome to MailAgent API!"})

def main():
    print("Starting server with the following settings:")
    print(f"Host: {settings.host}")
    print(f"Port: {settings.port}")
    print(f"Server Link: https://{settings.host}:{settings.port}")
    print(f"Docs Link: https://{settings.host}:{settings.port}/docs")
    print(f"Debug: {settings.debug}")

    try:
        uvicorn.run(app, host=settings.host, port=settings.port, log_level="info" if settings.debug else "warning")
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()

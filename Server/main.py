import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from websocket import websocket_endpoint
import time

from app.core.config import settings
from app.api import logs, auth, env_vars
from app.services.logger_service import logger_service, LogCategory

app = FastAPI(
    title="MailAgent",
    description="An AI-powered email assistant that helps you write and manage emails efficiently.",
    version="1.0.0",
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

# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log incoming request
    await logger_service.info(
        LogCategory.API,
        f"Incoming {request.method} request to {request.url.path}",
        details={
            "method": request.method,
            "url": str(request.url),
            "headers": dict(request.headers),
            "query_params": dict(request.query_params)
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    await logger_service.info(
        LogCategory.API,
        f"Response for {request.method} {request.url.path} - Status: {response.status_code}",
        details={
            "status_code": response.status_code,
            "process_time": f"{process_time:.4f}s"
        }
    )
    
    return response

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(logs.router, prefix="/api", tags=["logs"])
app.include_router(env_vars.router, prefix="/api", tags=["env-vars"])

app.add_api_websocket_route("/api", websocket_endpoint)

@app.get("/")
async def root():
    await logger_service.info(
        LogCategory.API,
        "Root endpoint accessed",
        details={"endpoint": "/", "message": "Welcome to MailAgent API!"}
    )
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

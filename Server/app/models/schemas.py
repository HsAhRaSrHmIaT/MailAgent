from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from enum import Enum


# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = Field(None, alias='profilePicture')
    
    class Config:
        populate_by_name = True  # Allow both profile_picture and profilePicture

class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    is_active: bool
    profile_picture: Optional[str] = None
    created_at: str
    updated_at: str
    last_login: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogCategory(str, Enum):
    GENERAL = "GENERAL"
    API = "API"
    WEBSOCKET = "WEBSOCKET"
    EMAIL = "EMAIL"
    LLM = "LLM"
    AUTH = "AUTH"
    DATABASE = "DATABASE"


class LogEntry(BaseModel):
    id: int
    timestamp: str
    level: str
    category: str
    message: str
    details: Optional[Dict[str, Any]] = None
    source: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: str


class LogStats(BaseModel):
    total_logs: int = 0
    error_count: int = 0
    warning_count: int = 0
    info_count: int = 0
    debug_count: int = 0
    critical_count: int = 0
    category_breakdown: Dict[str, int] = Field(default_factory=dict)


# class VoiceID(str, Enum):
#     EN_IN_AROHI = "en-IN-Arohi"
#     EN_IN_ALIA = "en-IN-Alia"


# class Language(str, Enum):
#     EN_IN = "en-IN"
#     ES_US = "es-US"


# class LLMResponse(BaseModel):
#     prompt: str = Field(..., description="The prompt sent to the LLM")
#     response: str = Field(..., description="The response from the LLM")
#     input_type: str = Field(..., description="The type of input (text/audio)")
#     transcription: Optional[str] = Field(None, description="Transcription of the audio input if applicable")


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender (user/assistant)")
    content: str = Field(..., description="Content of the message")
    tone: Optional[str] = Field(None, description="Tone of the message")
    timestamp: int = Field(..., description="Timestamp of the message")


class Email(BaseModel):
    receiverEmail: str = Field(..., description="Email address of the receiver")
    prompt: str = Field(..., description="Email content prompt")
    tone: Optional[str] = Field(None, description="Tone of the email")


class HealthStatus(BaseModel):
    status: str = Field(..., description="Health status of the service healthy/degraded/down")
    missing_api_keys: List[str] = Field(default_factory=list, description="List of missing API keys")
    timestamp: int = Field(..., description="Timestamp of the health check")


class ErrorResponse(BaseModel):
    stt_test: str = Field(..., description="STT test error message")
    llm_test: str = Field(..., description="LLM test error message")
    tts_test: str = Field(..., description="TTS test error message")
    overall_status: str = Field(..., description="Overall status of the service")


# Environment Variables Schemas
class EnvironmentVariableCreate(BaseModel):
    key: str = Field(..., description="Environment variable key")
    value: str = Field(default="", description="Environment variable value")

class EnvironmentVariableUpdate(BaseModel):
    value: str = Field(default="", description="Updated environment variable value")

class EnvironmentVariableResponse(BaseModel):
    id: int
    key: str
    value: str  # Decrypted value, sent only when requested
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class EnvironmentVariableListItem(BaseModel):
    id: int
    key: str
    value: str  # Decrypted value for display
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# Email Configuration Schemas
class EmailConfigCreate(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(default="", description="Email password (optional)")

class EmailConfigUpdate(BaseModel):
    password: str = Field(..., description="Updated email password")

class EmailConfigResponse(BaseModel):
    id: int
    email: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class EmailConfigWithPassword(BaseModel):
    id: int
    email: str
    password: str  # Decrypted password
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Email History Schemas
class SaveEmailRequest(BaseModel):
    email_id: str
    to_email: str
    subject: str
    body: str
    tone: str | None = None
    prompt: str | None = None
    timestamp: str  # ISO format
    status: str = "unsent"

class UpdateEmailRequest(BaseModel):
    status: str | None = None
    body: str | None = None
    subject: str | None = None
    to_email: str | None = None

class EmailHistoryResponse(BaseModel):
    id: str
    to_email: str
    subject: str
    body: str
    tone: str | None = None
    prompt: str | None = None
    status: str
    sent_at: str | None = None
    regeneration_count: int
    version: int
    timestamp: str

class PaginatedEmailsResponse(BaseModel):
    emails: list[EmailHistoryResponse]
    hasMore: bool
    total: int

class UsageStatsResponse(BaseModel):
    total_emails: int
    success_rate: float
    time_saved_hours: float
    recent_activity: List[dict]


from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


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


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
    language: Optional[str] = None
    default_tone: Optional[str] = Field(None, alias='defaultTone')
    ai_learning: Optional[bool] = Field(None, alias='aiLearning')
    save_history: Optional[bool] = Field(None, alias='saveHistory')
    
    class Config:
        populate_by_name = True  # Allow both snake_case and camelCase

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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetTokenRequest(BaseModel):
    token: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr


# User Preferences Schemas
class UserPreferencesUpdate(BaseModel):
    language: Optional[str] = None
    default_tone: Optional[str] = None
    ai_learning: Optional[bool] = None
    save_history: Optional[bool] = None

class UserPreferencesResponse(BaseModel):
    language: str
    default_tone: str
    ai_learning: bool
    save_history: bool

    class Config:
        from_attributes = True


class ActivityAction(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    RESPONSE_GENERATED = "response_generated"
    EMAIL_GENERATED = "email_generated"
    EMAIL_SENT = "email_sent"
    EMAIL_FAILED = "email_failed"
    VARIABLE_ADDED = "variable_added"
    VARIABLE_UPDATED = "variable_updated"
    VARIABLE_DELETED = "variable_deleted"
    CONFIG_ADDED = "config_added"
    CONFIG_UPDATED = "config_updated"
    CONFIG_DELETED = "config_deleted"
    PROFILE_UPDATED = "profile_updated"
    PASSWORD_CHANGED = "password_changed"

class ActivityStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"

class UserActivityLog(BaseModel):
    id: int
    user_id: str
    action: str
    status: str
    message: str
    details: Optional[Dict[str, Any]] = None
    created_at: str

    class Config:
        from_attributes = True

class ActivityStats(BaseModel):
    total_activities: int = 0
    success_count: int = 0
    error_count: int = 0
    warning_count: int = 0
    action_breakdown: Dict[str, int] = Field(default_factory=dict)
    recent_activities: List[Dict[str, Any]] = Field(default_factory=list)


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


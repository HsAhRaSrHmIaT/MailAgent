import email
import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Settings for the application."""

    # API Keys
    google_api_key: Optional[str] = os.getenv("GOOGLE_API_KEY")
    # murf_api_key: Optional[str] = os.getenv("MURF_API_KEY")
    # murf_api_url: Optional[str] = os.getenv("MURF_API_URL")
    # assemblyai_api_key: Optional[str] = os.getenv("ASSEMBLYAI_API_KEY")
    sender_email: Optional[str] = os.getenv("SENDER_EMAIL")
    email_password: Optional[str] = os.getenv("EMAIL_PASSWORD")

    # Server Settings
    host: str = os.getenv("HOST", "localhost")
    port: int = os.getenv("PORT", 8000)
    debug: bool = True

    # Audio Settings
    # allowed_audio_types = [
    #     "audio/mpeg",
    #     "audio/wav",
    #     "audio/mp3",
    #     "audio/webm",
    #     "audio/ogg",
    # ]

    # AI Model and Email Settings
    default_llm_model: str = os.getenv("DEFAULT_LLM_MODEL", "gemini-2.5-flash")
    # default_voice_id: str = os.getenv("DEFAULT_VOICE_ID", "en-IN-alia")
    # default_language: str = os.getenv("DEFAULT_LANGUAGE", "en-IN")
    # max_prompt_length: int = 10000
    # max_response_tokens: int = 1000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

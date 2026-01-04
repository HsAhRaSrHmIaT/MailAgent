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

    # Database Settings (NeonDB PostgreSQL)
    database_url: Optional[str] = os.getenv("DATABASE_URL")
    neon_database_url: Optional[str] = os.getenv("NEON_DATABASE_URL") 
    db_host: Optional[str] = os.getenv("DB_HOST")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_name: Optional[str] = os.getenv("DB_NAME", "mailagent")
    db_user: Optional[str] = os.getenv("DB_USER")
    db_password: Optional[str] = os.getenv("DB_PASSWORD")
    db_ssl_mode: str = os.getenv("DB_SSL_MODE", "require")

    # Server Settings
    client_url: str = os.getenv("CLIENT_URL", "http://localhost:5173")
    host: str = os.getenv("HOST", "localhost")
    port: int = os.getenv("PORT", 8000)
    debug: bool = False

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
    max_response_tokens: int = 3000

    # Authentication Settings
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days default

    # Cloudinary Settings
    cloudinary_cloud_name: Optional[str] = os.getenv("CLOUDINARY_CLOUD_NAME")
    cloudinary_api_key: Optional[str] = os.getenv("CLOUDINARY_API_KEY")
    cloudinary_api_secret: Optional[str] = os.getenv("CLOUDINARY_API_SECRET")

    @property
    def database_connection_url(self) -> str:
        """Get the database connection URL, prioritizing NEON_DATABASE_URL"""
        if self.neon_database_url:
            # Clean up NeonDB URL - remove query parameters that cause issues
            url = self.neon_database_url
            
            # Remove problematic query parameters
            if "?" in url:
                base_url, query_params = url.split("?", 1)
                # Keep only safe parameters, remove channel_binding and sslmode
                safe_params = []
                for param in query_params.split("&"):
                    if not param.startswith(("channel_binding=", "sslmode=")):
                        safe_params.append(param)
                if safe_params:
                    url = f"{base_url}?{'&'.join(safe_params)}"
                else:
                    url = base_url
            
            # Ensure asyncpg driver is used
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif not url.startswith("postgresql+asyncpg://"):
                # Handle case where URL doesn't have protocol
                if "@" in url and not url.startswith("postgresql"):
                    url = f"postgresql+asyncpg://{url}"
            return url
        elif self.database_url:
            url = self.database_url
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        elif all([self.db_host, self.db_user, self.db_password, self.db_name]):
            # Build URL without sslmode in the URL string
            return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        else:
            # Fallback disabled - require proper database configuration
            return ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

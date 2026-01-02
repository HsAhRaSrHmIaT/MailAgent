from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean
from sqlalchemy.sql import func
from app.core.config import settings
import logging

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=True, index=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

class LogEntryModel(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String, nullable=False, index=True)
    level = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    source = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    session_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserEnvironmentVariablesModel(Base):
    __tablename__ = "user_environment_variables"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    key = Column(String, nullable=False)
    encrypted_value = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserEmailConfigModel(Base):
    __tablename__ = "user_email_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False)
    encrypted_password = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ChatMessageModel(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    message_id = Column(String, unique=True, nullable=False)  # Frontend-generated ID
    content = Column(Text, nullable=False)
    sender = Column(String, nullable=False)  # 'user' or 'assistant'
    tone = Column(String, nullable=True)  # hashtag/tone used
    message_type = Column(String, default="text")  # 'text' or 'email'
    email_data = Column(JSON, nullable=True)  # Store email data if type is 'email'
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class DatabaseManager:
    def __init__(self):
        self.engine = None
        self.session_factory = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize the database connection"""
        if self._initialized:
            return
            
        try:
            database_url = settings.database_connection_url
            
            if not database_url or database_url == "":
                raise ValueError("No database URL configured. Please set NEON_DATABASE_URL or DATABASE_URL in your .env file")
            
            # For NeonDB, we need to ensure proper SSL configuration
            # Create connect_args based on URL
            connect_args = {}
            
            # Check if this is a NeonDB URL and configure SSL appropriately
            if "neon.tech" in database_url or "neondb" in database_url:
                connect_args = {
                    "ssl": "require",
                    "server_settings": {
                        "application_name": "MailAgent",
                    }
                }
            elif "sslmode=" in database_url:
                # Extract sslmode value and remove from URL
                import re
                ssl_match = re.search(r'sslmode=(\w+)', database_url)
                ssl_mode = ssl_match.group(1) if ssl_match else "require"
                database_url = re.sub(r'[?&]sslmode=\w+', '', database_url)
                
                connect_args = {
                    "ssl": ssl_mode,
                    "server_settings": {
                        "application_name": "MailAgent",
                    }
                }
            
            # Create async engine with connection pooling
            self.engine = create_async_engine(
                database_url,
                echo=settings.debug,
                pool_pre_ping=True,
                pool_recycle=3600,
                pool_size=5,
                max_overflow=10,
                connect_args=connect_args
            )
            
            # Create session factory
            self.session_factory = async_sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Create tables
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                
            self._initialized = True
            logging.info("Database initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize database: {e}")
            raise
    
    async def get_session(self):
        """Get an async database session"""
        if not self._initialized:
            await self.initialize()
        
        return self.session_factory()
    
    async def close(self):
        """Close the database connection"""
        if self.engine:
            await self.engine.dispose()
            self._initialized = False

# Global database manager instance
db_manager = DatabaseManager()
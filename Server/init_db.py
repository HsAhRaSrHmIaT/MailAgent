"""
Database initialization script for MailAgent.
Run this script to create all necessary database tables.
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import DatabaseManager, Base
from app.core.config import settings


async def init_database():
    """Initialize the database and create all tables."""
    print("🚀 Initializing MailAgent Database...")
    print(f"📍 Database URL: {settings.database_connection_url[:50]}...")
    
    try:
        db_manager = DatabaseManager()
        await db_manager.initialize()
        
        print("✅ Database initialized successfully!")
        print("✅ Tables created:")
        print("   - users (authentication)")
        print("   - logs (application logs)")
        print("\n🎉 Database setup complete!")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(init_database())

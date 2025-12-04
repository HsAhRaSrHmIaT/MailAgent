import logging
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from enum import Enum
import os
import traceback
from sqlalchemy import select, delete, func, and_, or_
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import db_manager, LogEntryModel

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

class LoggerService:
    def __init__(self):
        self.db_available = False
        self._setup_file_logger()
    
    def _setup_file_logger(self):
        """Setup file-based logging as backup"""
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)
        
        # Only configure if not already configured
        if not logging.getLogger().handlers:
            logging.basicConfig(
                level=logging.INFO,
                format='%(asctime)s - %(levelname)s - %(name)s - %(message)s',
                handlers=[
                    logging.FileHandler(f'{log_dir}/mailagent.log'),
                    logging.StreamHandler()
                ]
            )
        self.file_logger = logging.getLogger('MailAgent')
    
    async def log(
        self,
        level: LogLevel,
        category: LogCategory,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        source: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log a message to both database and file"""
        timestamp = datetime.now().isoformat()
        
        # Always log to file first (as backup)
        log_msg = f"[{category.value}] {message}"
        if details:
            log_msg += f" | Details: {json.dumps(details)}"
        
        try:
            getattr(self.file_logger, level.value.lower())(log_msg)
        except:
            print(f"[{level.value}][{category.value}] {message}")
        
        # Try to log to database
        if self.db_available:
            try:
                async with await db_manager.get_session() as session:
                    log_entry = LogEntryModel(
                        timestamp=timestamp,
                        level=level.value,
                        category=category.value,
                        message=message,
                        details=details,
                        source=source,
                        user_id=user_id,
                        session_id=session_id,
                        ip_address=ip_address,
                        user_agent=user_agent
                    )
                    
                    session.add(log_entry)
                    await session.commit()
                    
            except Exception as e:
                self.db_available = False
                # Don't print database errors repeatedly
                pass
        else:
            # Try to initialize database once in a while
            try:
                await db_manager.initialize()
                self.db_available = True
            except:
                pass
    
    async def info(self, category: LogCategory, message: str, **kwargs):
        """Log info message"""
        await self.log(LogLevel.INFO, category, message, **kwargs)
    
    async def warning(self, category: LogCategory, message: str, **kwargs):
        """Log warning message"""
        await self.log(LogLevel.WARNING, category, message, **kwargs)
    
    async def error(self, category: LogCategory, message: str, **kwargs):
        """Log error message"""
        await self.log(LogLevel.ERROR, category, message, **kwargs)
    
    async def critical(self, category: LogCategory, message: str, **kwargs):
        """Log critical message"""
        await self.log(LogLevel.CRITICAL, category, message, **kwargs)
    
    async def debug(self, category: LogCategory, message: str, **kwargs):
        """Log debug message"""
        await self.log(LogLevel.DEBUG, category, message, **kwargs)
    
    async def log_exception(self, category: LogCategory, message: str, exception: Exception, **kwargs):
        """Log exception with full traceback"""
        details = kwargs.get('details', {})
        details.update({
            'exception_type': type(exception).__name__,
            'exception_message': str(exception),
            'traceback': traceback.format_exc()
        })
        kwargs['details'] = details
        await self.error(category, message, **kwargs)
    
    async def get_logs(
        self,
        limit: int = 100,
        offset: int = 0,
        level: Optional[LogLevel] = None,
        category: Optional[LogCategory] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        search_term: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve logs with filtering options"""
        if not self.db_available:
            try:
                await db_manager.initialize()
                self.db_available = True
            except:
                return []
                
        try:
            async with await db_manager.get_session() as session:
                query = select(LogEntryModel)
                
                # Apply filters
                conditions = []
                
                if level:
                    conditions.append(LogEntryModel.level == level.value)
                
                if category:
                    conditions.append(LogEntryModel.category == category.value)
                
                if start_date:
                    conditions.append(LogEntryModel.timestamp >= start_date)
                
                if end_date:
                    conditions.append(LogEntryModel.timestamp <= end_date)
                
                if search_term:
                    search_condition = or_(
                        LogEntryModel.message.ilike(f'%{search_term}%'),
                        LogEntryModel.details.astext.ilike(f'%{search_term}%')
                    )
                    conditions.append(search_condition)
                
                if conditions:
                    query = query.where(and_(*conditions))
                
                # Order and paginate
                query = query.order_by(LogEntryModel.created_at.desc()).offset(offset).limit(limit)
                
                result = await session.execute(query)
                log_entries = result.scalars().all()
                
                # Convert to dict format
                logs = []
                for entry in log_entries:
                    log_dict = {
                        'id': entry.id,
                        'timestamp': entry.timestamp,
                        'level': entry.level,
                        'category': entry.category,
                        'message': entry.message,
                        'details': entry.details,
                        'source': entry.source,
                        'user_id': entry.user_id,
                        'session_id': entry.session_id,
                        'ip_address': entry.ip_address,
                        'user_agent': entry.user_agent,
                        'created_at': entry.created_at.isoformat() if entry.created_at else None
                    }
                    logs.append(log_dict)
                
                return logs
                
        except Exception as e:
            self.db_available = False
            return []
    
    async def get_log_stats(self) -> Dict[str, Any]:
        """Get logging statistics"""
        if not self.db_available:
            try:
                await db_manager.initialize()
                self.db_available = True
            except:
                return {
                    'total_logs': 0,
                    'error_count': 0,
                    'warning_count': 0,
                    'info_count': 0,
                    'debug_count': 0,
                    'critical_count': 0,
                    'category_breakdown': {}
                }
                
        try:
            async with await db_manager.get_session() as session:
                # Get basic stats
                total_query = select(func.count(LogEntryModel.id)).where(
                    func.date(LogEntryModel.created_at) == func.current_date()
                )
                total_result = await session.execute(total_query)
                total_logs = total_result.scalar() or 0
                
                # Get counts by level
                stats = {
                    'total_logs': total_logs,
                    'error_count': 0,
                    'warning_count': 0,
                    'info_count': 0,
                    'debug_count': 0,
                    'critical_count': 0,
                    'category_breakdown': {}
                }
                
                if total_logs > 0:
                    # Get level breakdown
                    for level in ['ERROR', 'WARNING', 'INFO', 'DEBUG', 'CRITICAL']:
                        level_query = select(func.count(LogEntryModel.id)).where(
                            and_(
                                LogEntryModel.level == level,
                                func.date(LogEntryModel.created_at) == func.current_date()
                            )
                        )
                        level_result = await session.execute(level_query)
                        count = level_result.scalar() or 0
                        stats[f'{level.lower()}_count'] = count
                    
                    # Get category breakdown
                    category_query = select(
                        LogEntryModel.category,
                        func.count(LogEntryModel.id).label('count')
                    ).where(
                        func.date(LogEntryModel.created_at) == func.current_date()
                    ).group_by(LogEntryModel.category)
                    
                    category_result = await session.execute(category_query)
                    stats['category_breakdown'] = {row.category: row.count for row in category_result}
                
                return stats
                
        except Exception as e:
            self.db_available = False
            return {
                'total_logs': 0,
                'error_count': 0,
                'warning_count': 0,
                'info_count': 0,
                'debug_count': 0,
                'critical_count': 0,
                'category_breakdown': {}
            }
    
    async def clear_old_logs(self, days: int = 30):
        """Clear logs older than specified days"""
        if not self.db_available:
            try:
                await db_manager.initialize()
                self.db_available = True
            except:
                return 0
                
        try:
            async with await db_manager.get_session() as session:
                cutoff_date = datetime.now() - timedelta(days=days)
                
                delete_query = delete(LogEntryModel).where(
                    LogEntryModel.created_at < cutoff_date
                )
                
                result = await session.execute(delete_query)
                await session.commit()
                
                deleted_count = result.rowcount
                await self.info(
                    LogCategory.DATABASE, 
                    f"Cleared {deleted_count} old log entries (older than {days} days)"
                )
                return deleted_count
                
        except Exception as e:
            self.db_available = False
            return 0

# Global logger instance
logger_service = LoggerService()
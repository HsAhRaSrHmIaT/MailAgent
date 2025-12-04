from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.logger_service import logger_service, LogLevel, LogCategory
from app.models.schemas import LogEntry, LogStats
import re
import os
from datetime import datetime

router = APIRouter()

def parse_file_logs(limit: int = 100) -> List[dict]:
    """Parse log file when database is not available"""
    try:
        log_file_path = "logs/mailagent.log"
        if not os.path.exists(log_file_path):
            return []
        
        logs = []
        log_pattern = r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (\w+) - (\w+) - (.+)'
        
        with open(log_file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Parse logs from file (reverse order for newest first)
        for i, line in enumerate(reversed(lines[-1000:]), 1):  # Only check last 1000 lines
            if i > limit:
                break
                
            match = re.match(log_pattern, line.strip())
            if match:
                timestamp_str, level, logger_name, message = match.groups()
                
                # Extract category from message if it's in [CATEGORY] format
                category_match = re.match(r'\[(\w+)\] (.+)', message)
                if category_match:
                    category, clean_message = category_match.groups()
                else:
                    category = "GENERAL"
                    clean_message = message
                
                # Parse timestamp
                try:
                    log_time = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S,%f')
                    iso_timestamp = log_time.isoformat()
                except:
                    iso_timestamp = timestamp_str
                
                log_entry = {
                    'id': i,
                    'timestamp': iso_timestamp,
                    'level': level,
                    'category': category,
                    'message': clean_message,
                    'details': None,
                    'source': logger_name,
                    'user_id': None,
                    'session_id': None,
                    'ip_address': None,
                    'user_agent': None,
                    'created_at': iso_timestamp
                }
                logs.append(log_entry)
        
        return logs
        
    except Exception as e:
        print(f"Error parsing log file: {e}")
        return []

def get_file_log_stats() -> dict:
    """Get stats from file logs when database is not available"""
    logs = parse_file_logs(1000)  # Check more logs for stats
    
    stats = {
        'total_logs': len(logs),
        'error_count': 0,
        'warning_count': 0,
        'info_count': 0,
        'debug_count': 0,
        'critical_count': 0,
        'category_breakdown': {}
    }
    
    for log in logs:
        level = log['level'].upper()
        if level == 'ERROR':
            stats['error_count'] += 1
        elif level == 'WARNING':
            stats['warning_count'] += 1
        elif level == 'INFO':
            stats['info_count'] += 1
        elif level == 'DEBUG':
            stats['debug_count'] += 1
        elif level == 'CRITICAL':
            stats['critical_count'] += 1
            
        category = log['category']
        stats['category_breakdown'][category] = stats['category_breakdown'].get(category, 0) + 1
    
    return stats

@router.get("/logs", response_model=List[LogEntry])
async def get_logs(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    level: Optional[LogLevel] = None,
    category: Optional[LogCategory] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search_term: Optional[str] = None
):
    """Get application logs with filtering options"""
    try:
        # Try database first
        logs = await logger_service.get_logs(
            limit=limit,
            offset=offset,
            level=level,
            category=category,
            start_date=start_date,
            end_date=end_date,
            search_term=search_term
        )
        
        # If database is empty or unavailable, try file logs
        if not logs and not logger_service.db_available:
            logs = parse_file_logs(limit)
            
            # Apply filters to file logs
            if level:
                logs = [log for log in logs if log['level'].upper() == level.value]
            if category:
                logs = [log for log in logs if log['category'].upper() == category.value]
            if search_term:
                logs = [log for log in logs if search_term.lower() in log['message'].lower()]
        
        await logger_service.info(
            LogCategory.API,
            f"Retrieved {len(logs)} log entries",
            details={
                "filters": {
                    "level": level.value if level else None,
                    "category": category.value if category else None,
                    "search_term": search_term
                },
                "source": "database" if logger_service.db_available else "file"
            }
        )
        
        return logs
    except Exception as e:
        await logger_service.log_exception(
            LogCategory.API,
            "Failed to retrieve logs",
            e
        )
        return []

@router.get("/logs/stats", response_model=LogStats)
async def get_log_stats():
    """Get logging statistics"""
    try:
        # Try database first
        stats = await logger_service.get_log_stats()
        
        # If database unavailable, use file stats
        if not logger_service.db_available or stats.get('total_logs', 0) == 0:
            stats = get_file_log_stats()
        
        return stats
    except Exception as e:
        await logger_service.log_exception(
            LogCategory.API,
            "Failed to retrieve log stats",
            e
        )
        return {
            'total_logs': 0,
            'error_count': 0,
            'warning_count': 0,
            'info_count': 0,
            'debug_count': 0,
            'critical_count': 0,
            'category_breakdown': {}
        }

@router.get("/logs/status")
async def get_logging_status():
    """Get the status of the logging system"""
    try:
        # Try to initialize database
        if not logger_service.db_available:
            try:
                from app.core.database import db_manager
                await db_manager.initialize()
                logger_service.db_available = True
            except Exception as db_error:
                logger_service.db_available = False
        
        return {
            "database_available": logger_service.db_available,
            "file_logging": True,
            "database_error": None if logger_service.db_available else "Database connection failed - using file logging as fallback"
        }
    except Exception as e:
        return {
            "database_available": False,
            "file_logging": True,
            "database_error": str(e)
        }

@router.delete("/logs/cleanup")
async def cleanup_old_logs(days: int = Query(default=30, ge=1, le=365)):
    """Clean up logs older than specified days"""
    try:
        deleted_count = await logger_service.clear_old_logs(days)
        
        await logger_service.info(
            LogCategory.API,
            f"Log cleanup completed: {deleted_count} entries removed",
            details={"days_threshold": days}
        )
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Deleted {deleted_count} log entries older than {days} days"
        }
    except Exception as e:
        await logger_service.log_exception(
            LogCategory.API,
            "Failed to cleanup logs",
            e
        )
        return {
            "success": False,
            "message": "Failed to cleanup logs"
        }
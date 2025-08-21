from fastapi import APIRouter
from app.models.schemas import OnlineStatus
import time

router = APIRouter(prefix="/health")


@router.get("/status", response_model=OnlineStatus)
async def get_health_status():
    return OnlineStatus(status="online", timestamp=int(time.time()))

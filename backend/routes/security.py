from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from utils.auth import get_current_active_user
from services.behavioguard import BehavioGuard

router = APIRouter()

@router.get("/dashboard", response_model=dict)
async def get_security_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Security dashboard with mock data.
    Real behavioral analysis happens in-memory without database storage.
    """
    
    # Return mock security dashboard data
    dashboard_data = {
        'security_score': 85,  # Mock score
        'status': 'locked' if current_user.is_locked else 'active',
        'recent_events': [
            {
                'event_type': 'login',
                'risk_score': 15,
                'risk_level': 'low',
                'reason': 'Normal login pattern',
                'created_at': '2024-11-12T10:30:00'
            }
        ],
        'behavioral_profile': {
            'typing_speed': 85.5,
            'device_trust': 'high',
            'usage_pattern': 'stable',
            'total_sessions': 42
        }
    }
    
    return dashboard_data

@router.post("/behavioral-data", response_model=dict)
async def capture_behavioral_data(
    behavioral_data: dict,
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze behavioral data in-memory without storing to database.
    Returns analysis results for security monitoring.
    """
    
    behavioguard = BehavioGuard()
    analysis = behavioguard.analyze_behavioral_data(behavioral_data)
    
    return {
        "message": "Behavioral data analyzed",
        "analysis": analysis
    }
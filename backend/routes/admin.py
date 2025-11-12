from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models.user import User
from models.post import Post
from models.message import Message
from utils.auth import get_current_admin_user

router = APIRouter()

@router.get("/dashboard", response_model=dict)
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    Admin dashboard with statistics.
    Returns mock security data since we don't store behavioral events.
    """
    
    # Get active users count
    active_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_locked == False)
    )
    active_users = active_users_result.scalar()
    
    # Mock security data (since we don't store security events)
    risk_distribution = {
        'trusted': 120,
        'low': 45,
        'medium': 23,
        'high': 8,
        'critical': 2
    }
    
    active_threats = [
        {
            'event_type': 'suspicious_login',
            'risk_score': 75,
            'risk_level': 'high',
            'user_id': 5,
            'reason': 'Unusual typing pattern detected',
            'created_at': '2024-11-12T09:15:00'
        }
    ]
    
    return {
        'active_users': active_users,
        'threats_blocked_today': 12,
        'risk_distribution': risk_distribution,
        'active_threats': active_threats,
        'avg_risk_score': 28.5
    }

@router.get("/users", response_model=dict)
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(User))
    users = result.scalars().all()
    
    return {
        "users": [user.to_dict() for user in users]
    }

@router.post("/users/{user_id}/lock", response_model=dict)
async def lock_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_locked = True
    await db.commit()
    
    return {"message": "User locked successfully"}

@router.post("/users/{user_id}/unlock", response_model=dict)
async def unlock_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_locked = False
    await db.commit()
    
    return {"message": "User unlocked successfully"}

@router.post("/users/{user_id}/make-admin", response_model=dict)
async def make_admin(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = True
    await db.commit()
    
    return {"message": "User granted admin privileges"}

@router.get("/stats", response_model=dict)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """Get platform statistics"""
    
    # Get counts
    users_result = await db.execute(select(func.count(User.id)))
    posts_result = await db.execute(select(func.count(Post.id)))
    messages_result = await db.execute(select(func.count(Message.id)))
    
    return {
        "total_users": users_result.scalar(),
        "total_posts": posts_result.scalar(),
        "total_messages": messages_result.scalar()
    }
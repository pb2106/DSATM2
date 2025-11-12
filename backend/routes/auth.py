from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from schemas import UserRegister, UserLogin, UserResponse, TokenResponse, ChallengeResponse
from utils.auth import create_access_token, create_refresh_token, get_current_user, get_current_active_user
from services.behavioguard import BehavioGuard

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name,
        avatar=user_data.avatar
    )
    user.set_password(user_data.password)
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": "User registered successfully",
        "user": user.to_dict()
    }

@router.post("/login")
async def login(
    login_data: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Find user
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.check_password(login_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.is_locked:
        raise HTTPException(status_code=403, detail="Account locked. Contact support.")
    
    # Analyze risk (in-memory only, not stored)
    behavioguard = BehavioGuard()
    risk_analysis = behavioguard.analyze_login(
        user_id=user.id,
        behavioral_data=login_data.behavioral_data,
        ip_address=request.client.host,
        device_info=request.headers.get('user-agent', 'Unknown')
    )
    
    # Check if challenge required
    if risk_analysis['requires_challenge']:
        session_token = create_access_token(
            data={"sub": str(user.id), "pending": True}
        )
        return {
            "requires_challenge": True,
            "risk_score": risk_analysis['risk_score'],
            "risk_level": risk_analysis['risk_level'],
            "reason": risk_analysis['reason'],
            "session_token": session_token
        }
    
    # Successful login
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
        "risk_score": risk_analysis['risk_score']
    }

@router.post("/verify-challenge")
async def verify_challenge(
    challenge_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Simple verification (implement actual challenge logic)
    challenge_type = challenge_data.get('challenge_type')
    
    # For demo, always verify successfully
    verified = True
    
    if not verified:
        raise HTTPException(status_code=401, detail="Challenge verification failed")
    
    access_token = create_access_token(data={"sub": str(current_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(current_user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": current_user.to_dict()
    }

@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return {"user": current_user.to_dict()}

@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    access_token = create_access_token(data={"sub": str(current_user.id)})
    return {"access_token": access_token}
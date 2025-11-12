from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

# User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    avatar: Optional[str] = '👤'

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    behavioral_data: Optional[Dict[str, Any]] = {}

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar: str
    is_admin: bool
    is_locked: bool
    created_at: Optional[str]

# Post Schemas
class PostCreate(BaseModel):
    content: str
    behavioral_data: Optional[Dict[str, Any]] = {}

class PostResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_avatar: str
    content: str
    likes: int
    created_at: Optional[str]

# Message Schemas
class MessageCreate(BaseModel):
    receiver_id: int
    text: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    text: str
    is_read: bool
    is_own: bool
    created_at: Optional[str]

class ConversationUser(BaseModel):
    id: int
    name: str
    avatar: str

# Auth Responses
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserResponse
    risk_score: Optional[int] = None

class ChallengeResponse(BaseModel):
    requires_challenge: bool
    risk_score: int
    risk_level: str
    reason: str
    session_token: str
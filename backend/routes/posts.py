from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models.user import User
from models.post import Post
from schemas import PostCreate, PostResponse
from utils.auth import get_current_active_user

router = APIRouter()

@router.get("", response_model=dict)
async def get_posts(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(
        select(Post).order_by(desc(Post.created_at)).limit(50)
    )
    posts = result.scalars().all()
    
    return {"posts": [post.to_dict() for post in posts]}

@router.post("", response_model=dict)
async def create_post(
    post_data: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Note: behavioral_data is received but not stored in database
    # It can be analyzed in-memory if needed for security purposes
    
    post = Post(
        user_id=current_user.id,
        content=post_data.content
    )
    
    db.add(post)
    await db.commit()
    await db.refresh(post)
    
    return {"post": post.to_dict()}

@router.post("/{post_id}/like", response_model=dict)
async def like_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.likes += 1
    await db.commit()
    
    return {"likes": post.likes}
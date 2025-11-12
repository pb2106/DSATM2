from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, distinct
from database import get_db
from models.user import User
from models.message import Message
from schemas import MessageCreate, MessageResponse, ConversationUser
from utils.auth import get_current_active_user

router = APIRouter()

@router.get("/conversations", response_model=dict)
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get unique user IDs from sent and received messages
    sent_query = select(distinct(Message.receiver_id)).where(Message.sender_id == current_user.id)
    received_query = select(distinct(Message.sender_id)).where(Message.receiver_id == current_user.id)
    
    sent_result = await db.execute(sent_query)
    received_result = await db.execute(received_query)
    
    sent_ids = set(sent_result.scalars().all())
    received_ids = set(received_result.scalars().all())
    user_ids = sent_ids.union(received_ids)
    
    if not user_ids:
        return {"conversations": []}
    
    # Get user details
    users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
    users = users_result.scalars().all()
    
    return {
        "conversations": [
            {"id": u.id, "name": u.name, "avatar": u.avatar}
            for u in users
        ]
    }

@router.get("/{receiver_id}", response_model=dict)
async def get_messages(
    receiver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get all messages between current user and receiver
    result = await db.execute(
        select(Message).where(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == receiver_id),
                and_(Message.sender_id == receiver_id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at)
    )
    messages = result.scalars().all()
    
    # Mark messages as read
    unread_result = await db.execute(
        select(Message).where(
            and_(
                Message.sender_id == receiver_id,
                Message.receiver_id == current_user.id,
                Message.is_read == False
            )
        )
    )
    unread_messages = unread_result.scalars().all()
    
    for msg in unread_messages:
        msg.is_read = True
    
    await db.commit()
    
    return {
        "messages": [msg.to_dict(current_user.id) for msg in messages]
    }

@router.post("", response_model=dict)
async def send_message(
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if receiver exists
    result = await db.execute(select(User).where(User.id == message_data.receiver_id))
    receiver = result.scalar_one_or_none()
    
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    message = Message(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        text=message_data.text
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return {"message": message.to_dict(current_user.id)}
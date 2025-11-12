from flask_jwt_extended import get_jwt_identity
from models.user import User

def get_current_user():
    """Helper to get current authenticated user"""
    user_id = get_jwt_identity()
    return User.query.get(user_id)

def require_admin(user):
    """Check if user has admin privileges"""
    return user and user.is_admin

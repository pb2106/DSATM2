from routes.auth import auth_bp
from routes.posts import posts_bp
from routes.messages import messages_bp
from routes.security import security_bp
from routes.admin import admin_bp

__all__ = ['auth_bp', 'posts_bp', 'messages_bp', 'security_bp', 'admin_bp']

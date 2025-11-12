from database import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'author': self.author.name,
            'avatar': self.author.avatar,
            'content': self.content,
            'likes': self.likes,
            'time': self._format_time(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def _format_time(self):
        if not self.created_at:
            return 'just now'
        diff = datetime.utcnow() - self.created_at
        hours = diff.total_seconds() / 3600
        if hours < 1:
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} min ago" if minutes > 0 else "just now"
        elif hours < 24:
            return f"{int(hours)}h ago"
        else:
            return f"{int(hours / 24)}d ago"

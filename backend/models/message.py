from database import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    text = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self, current_user_id):
        return {
            'id': self.id,
            'text': self.text,
            'sender': 'me' if self.sender_id == current_user_id else 'them',
            'sender_name': self.sender.name,
            'time': self.created_at.strftime('%I:%M %p') if self.created_at else '',
            'is_read': self.is_read
        }

from database import db
from datetime import datetime

class SecurityEvent(db.Model):
    __tablename__ = 'security_events'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    event_type = db.Column(db.String(50), nullable=False, index=True)
    risk_score = db.Column(db.Integer, nullable=False)
    risk_level = db.Column(db.String(20), index=True)
    reason = db.Column(db.Text)
    action_taken = db.Column(db.String(100))
    ip_address = db.Column(db.String(45))
    device_info = db.Column(db.JSON)
    location = db.Column(db.String(255))
    behavioral_signals = db.Column(db.JSON)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_email': self.user.email if self.user else 'Unknown',
            'user_name': self.user.name if self.user else 'Unknown',
            'event_type': self.event_type,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'reason': self.reason,
            'action_taken': self.action_taken,
            'ip_address': self.ip_address,
            'device_info': self.device_info,
            'location': self.location,
            'behavioral_signals': self.behavioral_signals,
            'status': self.status,
            'time': self._format_time(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def _format_time(self):
        if not self.created_at:
            return 'just now'
        diff = datetime.utcnow() - self.created_at
        minutes = diff.total_seconds() / 60
        if minutes < 60:
            mins = int(minutes)
            return f"{mins} min ago" if mins > 0 else "just now"
        hours = minutes / 60
        if hours < 24:
            return f"{int(hours)} hr ago"
        return f"{int(hours / 24)} days ago"

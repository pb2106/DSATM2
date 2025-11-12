from database import db
from datetime import datetime

class BehavioralData(db.Model):
    __tablename__ = 'behavioral_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    session_id = db.Column(db.String(255), index=True)
    
    # Typing patterns
    typing_speed = db.Column(db.Float)
    key_press_intervals = db.Column(db.JSON)
    deletion_rate = db.Column(db.Float)
    
    # Touch/tap patterns
    tap_pressure = db.Column(db.Float)
    tap_duration = db.Column(db.Float)
    tap_locations = db.Column(db.JSON)
    
    # Navigation patterns
    scroll_velocity = db.Column(db.Float)
    navigation_path = db.Column(db.JSON)
    screen_time = db.Column(db.Integer)
    
    # Device info
    device_fingerprint = db.Column(db.String(255), index=True)
    device_type = db.Column(db.String(50))
    os_version = db.Column(db.String(50))
    
    # Context
    access_time = db.Column(db.DateTime)
    location = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'typing_speed': self.typing_speed,
            'tap_pressure': self.tap_pressure,
            'scroll_velocity': self.scroll_velocity,
            'device_type': self.device_type,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

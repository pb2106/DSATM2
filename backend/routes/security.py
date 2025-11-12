from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.security_event import SecurityEvent
from models.behavioral_data import BehavioralData
from datetime import datetime

security_bp = Blueprint('security', __name__, url_prefix='/api/security')

@security_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_security_dashboard():
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convert to int
        print(f"Security dashboard requested for user_id: {user_id}")
        
        user = User.query.get(user_id)
        
        if not user:
            print(f"User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        # Get recent security events
        recent_events = SecurityEvent.query.filter_by(
            user_id=user_id
        ).order_by(SecurityEvent.created_at.desc()).limit(10).all()
        
        # Get behavioral metrics
        recent_behavior = BehavioralData.query.filter_by(
            user_id=user_id
        ).order_by(BehavioralData.created_at.desc()).limit(20).all()
        
        # Calculate metrics
        avg_typing_speed = 0
        if recent_behavior:
            speeds = [b.typing_speed for b in recent_behavior if b.typing_speed]
            avg_typing_speed = sum(speeds) / len(speeds) if speeds else 0
        
        dashboard_data = {
            'security_score': user.security_score,
            'status': 'locked' if user.is_locked else 'active',
            'recent_events': [event.to_dict() for event in recent_events],
            'behavioral_profile': {
                'typing_speed': round(avg_typing_speed, 2),
                'device_trust': 'high',
                'usage_pattern': 'stable',
                'total_sessions': len(recent_behavior)
            }
        }
        
        print(f"Dashboard data: {dashboard_data}")
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        print(f"Security dashboard error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'security_score': 50,
            'status': 'unknown',
            'recent_events': [],
            'behavioral_profile': {
                'typing_speed': 0,
                'device_trust': 'unknown',
                'usage_pattern': 'unknown',
                'total_sessions': 0
            }
        }), 200

@security_bp.route('/behavioral-data', methods=['POST'])
@jwt_required()
def capture_behavioral_data():
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convert to int
        data = request.get_json()
        
        behavioral_data = BehavioralData(
            user_id=user_id,
            session_id=data.get('session_id'),
            typing_speed=data.get('typing_speed'),
            key_press_intervals=data.get('key_press_intervals'),
            tap_pressure=data.get('tap_pressure'),
            tap_duration=data.get('tap_duration'),
            scroll_velocity=data.get('scroll_velocity'),
            navigation_path=data.get('navigation_path'),
            device_fingerprint=data.get('device_fingerprint'),
            device_type=data.get('device_type'),
            os_version=data.get('os_version'),
            ip_address=request.remote_addr,
            access_time=datetime.utcnow()
        )
        
        db.session.add(behavioral_data)
        db.session.commit()
        
        return jsonify({'message': 'Behavioral data captured successfully'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Behavioral data error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

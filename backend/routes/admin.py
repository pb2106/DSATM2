from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from database import db
from models.user import User
from models.security_event import SecurityEvent
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def is_admin():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)  # Convert to int
    user = User.query.get(user_id)
    return user and user.is_admin

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    try:
        if not is_admin():
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        # Active users count
        active_users = User.query.filter_by(is_locked=False).count()
        
        # Recent critical events
        critical_events = SecurityEvent.query.filter(
            SecurityEvent.risk_score >= 70
        ).order_by(SecurityEvent.created_at.desc()).limit(20).all()
        
        # Threats blocked today
        today = datetime.utcnow().date()
        threats_today = SecurityEvent.query.filter(
            SecurityEvent.created_at >= today,
            SecurityEvent.risk_score >= 70
        ).count()
        
        # Risk distribution
        risk_distribution = {
            'trusted': SecurityEvent.query.filter(SecurityEvent.risk_score < 30).count(),
            'low': SecurityEvent.query.filter(SecurityEvent.risk_score.between(30, 50)).count(),
            'medium': SecurityEvent.query.filter(SecurityEvent.risk_score.between(51, 70)).count(),
            'high': SecurityEvent.query.filter(SecurityEvent.risk_score.between(71, 90)).count(),
            'critical': SecurityEvent.query.filter(SecurityEvent.risk_score > 90).count()
        }
        
        # Average risk score
        avg_score = db.session.query(func.avg(User.security_score)).scalar() or 0
        
        return jsonify({
            'active_users': active_users,
            'threats_blocked_today': threats_today,
            'risk_distribution': risk_distribution,
            'active_threats': [event.to_dict() for event in critical_events],
            'avg_risk_score': round(avg_score, 2)
        }), 200
    except Exception as e:
        print(f"Admin dashboard error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/events', methods=['GET'])
@jwt_required()
def get_all_events():
    try:
        if not is_admin():
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        risk_level = request.args.get('risk_level')
        
        query = SecurityEvent.query
        
        if risk_level:
            query = query.filter_by(risk_level=risk_level)
        
        events = query.order_by(SecurityEvent.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'events': [event.to_dict() for event in events.items],
            'total': events.total,
            'page': page,
            'pages': events.pages
        }), 200
    except Exception as e:
        print(f"Get events error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        if not is_admin():
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        print(f"Get users error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/lock', methods=['POST'])
@jwt_required()
def lock_user(user_id):
    try:
        if not is_admin():
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        user = User.query.get_or_404(user_id)
        user.is_locked = True
        
        # Log event
        admin_id = get_jwt_identity()
        security_event = SecurityEvent(
            user_id=user_id,
            event_type='account_locked',
            risk_score=100,
            risk_level='critical',
            reason=f'Manually locked by admin (ID: {admin_id})',
            action_taken='account_locked'
        )
        db.session.add(security_event)
        db.session.commit()
        
        return jsonify({'message': 'User locked successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Lock user error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/unlock', methods=['POST'])
@jwt_required()
def unlock_user(user_id):
    try:
        if not is_admin():
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        user = User.query.get_or_404(user_id)
        user.is_locked = False
        
        # Log event
        admin_id = get_jwt_identity()
        security_event = SecurityEvent(
            user_id=user_id,
            event_type='account_unlocked',
            risk_score=0,
            risk_level='low',
            reason=f'Manually unlocked by admin (ID: {admin_id})',
            action_taken='account_unlocked'
        )
        db.session.add(security_event)
        db.session.commit()
        
        return jsonify({'message': 'User unlocked successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Unlock user error: {e}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/make-admin', methods=['POST'])
@jwt_required()
def make_admin(user_id):
    try:
        if not is_admin():
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        user = User.query.get_or_404(user_id)
        user.is_admin = True
        db.session.commit()
        
        return jsonify({'message': 'User granted admin privileges'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Make admin error: {e}")
        return jsonify({'error': str(e)}), 500

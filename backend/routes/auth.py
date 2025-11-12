from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.security_event import SecurityEvent
from services.behavioguard import BehavioGuard

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            email=data['email'],
            name=data['name'],
            avatar=data.get('avatar', '👤')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        user = User.query.filter_by(email=data.get('email')).first()
        if not user or not user.check_password(data.get('password', '')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if user.is_locked:
            return jsonify({'error': 'Account locked. Contact support.'}), 403
        
        # Get behavioral data from request
        behavioral_data = data.get('behavioral_data', {})
        ip_address = request.remote_addr
        device_info = request.headers.get('User-Agent', 'Unknown')
        
        # Calculate risk score
        behavioguard = BehavioGuard()
        risk_analysis = behavioguard.analyze_login(
            user_id=user.id,
            behavioral_data=behavioral_data,
            ip_address=ip_address,
            device_info=device_info
        )
        
        # Log security event
        security_event = SecurityEvent(
            user_id=user.id,
            event_type='login',
            risk_score=risk_analysis['risk_score'],
            risk_level=risk_analysis['risk_level'],
            reason=risk_analysis['reason'],
            ip_address=ip_address,
            device_info={'user_agent': device_info},
            behavioral_signals=risk_analysis['signals']
        )
        db.session.add(security_event)
        
        # Update user security score
        user.security_score = 100 - risk_analysis['risk_score']
        db.session.commit()
        
        # FIXED: Convert user.id to string for JWT
        user_id_str = str(user.id)
        
        # Check if challenge required
        if risk_analysis['requires_challenge']:
            return jsonify({
                'requires_challenge': True,
                'risk_score': risk_analysis['risk_score'],
                'risk_level': risk_analysis['risk_level'],
                'reason': risk_analysis['reason'],
                'session_token': create_access_token(identity=user_id_str, additional_claims={'pending': True})
            }), 200
        
        # Successful login
        access_token = create_access_token(identity=user_id_str)
        refresh_token = create_refresh_token(identity=user_id_str)
        
        print(f"✅ User {user.email} logged in successfully. Token created with identity: {user_id_str}")
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'risk_score': risk_analysis['risk_score']
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-challenge', methods=['POST'])
@jwt_required()
def verify_challenge():
    try:
        data = request.get_json()
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convert back to int for database queries
        
        challenge_type = data.get('challenge_type')
        
        # Simple verification (implement actual logic based on challenge type)
        verified = True
        
        if verified:
            user = User.query.get(user_id)
            access_token = create_access_token(identity=user_id_str)
            refresh_token = create_refresh_token(identity=user_id_str)
            
            # Update security event
            security_event = SecurityEvent(
                user_id=user_id,
                event_type='challenge_passed',
                risk_score=0,
                risk_level='low',
                reason=f'Successfully verified via {challenge_type}'
            )
            db.session.add(security_event)
            db.session.commit()
            
            return jsonify({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict()
            }), 200
        
        return jsonify({'error': 'Challenge verification failed'}), 401
    except Exception as e:
        print(f"Challenge verification error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convert back to int
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        print(f"Get current user error: {e}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        user_id_str = get_jwt_identity()
        access_token = create_access_token(identity=user_id_str)
        return jsonify({'access_token': access_token}), 200
    except Exception as e:
        print(f"Refresh token error: {e}")
        return jsonify({'error': str(e)}), 500

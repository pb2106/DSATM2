from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.post import Post
from models.behavioral_data import BehavioralData
from datetime import datetime

posts_bp = Blueprint('posts', __name__, url_prefix='/api/posts')

@posts_bp.route('', methods=['GET'])
@jwt_required()
def get_posts():
    try:
        posts = Post.query.order_by(Post.created_at.desc()).limit(50).all()
        return jsonify({'posts': [post.to_dict() for post in posts]}), 200
    except Exception as e:
        print(f"Get posts error: {e}")
        return jsonify({'error': str(e)}), 500

@posts_bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convert to int for database
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        # Capture behavioral data if provided
        if data.get('behavioral_data'):
            behavioral_data = BehavioralData(
                user_id=user_id,
                session_id=data['behavioral_data'].get('session_id'),
                typing_speed=data['behavioral_data'].get('typing_speed'),
                device_fingerprint=data['behavioral_data'].get('device_fingerprint'),
                ip_address=request.remote_addr,
                access_time=datetime.utcnow()
            )
            db.session.add(behavioral_data)
        
        post = Post(
            user_id=user_id,
            content=data['content']
        )
        db.session.add(post)
        db.session.commit()
        
        return jsonify({'post': post.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Create post error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    try:
        post = Post.query.get_or_404(post_id)
        post.likes += 1
        db.session.commit()
        
        return jsonify({'likes': post.likes}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Like post error: {e}")
        return jsonify({'error': str(e)}), 500

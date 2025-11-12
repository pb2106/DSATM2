from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.message import Message
from models.user import User

messages_bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    try:
        user_id = get_jwt_identity()
        
        # Get unique users the current user has chatted with
        sent_to = db.session.query(Message.receiver_id).filter(Message.sender_id == user_id).distinct()
        received_from = db.session.query(Message.sender_id).filter(Message.receiver_id == user_id).distinct()
        
        user_ids = set([u[0] for u in sent_to] + [u[0] for u in received_from])
        users = User.query.filter(User.id.in_(user_ids)).all() if user_ids else []
        
        return jsonify({
            'conversations': [{'id': u.id, 'name': u.name, 'avatar': u.avatar} for u in users]
        }), 200
    except Exception as e:
        print(f"Conversations error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'conversations': []}), 200

@messages_bp.route('/<int:receiver_id>', methods=['GET'])
@jwt_required()
def get_messages(receiver_id):
    try:
        user_id = get_jwt_identity()
        
        messages = Message.query.filter(
            db.or_(
                db.and_(Message.sender_id == user_id, Message.receiver_id == receiver_id),
                db.and_(Message.sender_id == receiver_id, Message.receiver_id == user_id)
            )
        ).order_by(Message.created_at).all()
        
        # Mark messages as read
        Message.query.filter(
            Message.sender_id == receiver_id,
            Message.receiver_id == user_id,
            Message.is_read == False
        ).update({'is_read': True})
        db.session.commit()
        
        return jsonify({
            'messages': [msg.to_dict(user_id) for msg in messages]
        }), 200
    except Exception as e:
        print(f"Get messages error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('', methods=['POST'])
@jwt_required()
def send_message():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('receiver_id') or not data.get('text'):
            return jsonify({'error': 'receiver_id and text are required'}), 400
        
        message = Message(
            sender_id=user_id,
            receiver_id=data['receiver_id'],
            text=data['text']
        )
        db.session.add(message)
        db.session.commit()
        
        return jsonify({'message': message.to_dict(user_id)}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Send message error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

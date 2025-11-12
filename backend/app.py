from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import db, init_db
from routes import auth_bp, posts_bp, messages_bp, security_bp, admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    jwt = JWTManager(app)
    
    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        print(f"Invalid token: {error_string}")
        return jsonify({
            'error': 'Invalid token',
            'message': error_string
        }), 422
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        print(f"Unauthorized: {error_string}")
        return jsonify({
            'error': 'Missing authorization token',
            'message': error_string
        }), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"Expired token")
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please login again'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        print(f"Revoked token")
        return jsonify({
            'error': 'Token has been revoked',
            'message': 'Please login again'
        }), 401
    
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(security_bp)
    app.register_blueprint(admin_bp)
    
    @app.route('/')
    def index():
        return jsonify({
            'app': 'SecureCircle API',
            'version': '1.0.0',
            'status': 'running'
        }), 200
    
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy'}), 200
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        print(f"Internal error: {error}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 SecureCircle Backend Starting...")
    print("📊 Database: Neon PostgreSQL")
    print("🔒 BehavioGuard: Active")
    print("🌐 Server: http://localhost:5000")
    print("🌐 Network: http://172.111.3.31:5000")
    print("\n✅ Ready to accept connections!\n")
    app.run(debug=True, host='0.0.0.0', port=5000)

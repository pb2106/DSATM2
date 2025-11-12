import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    
    # Database - Neon PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # BehavioGuard Settings
    RISK_THRESHOLD_LOW = 30
    RISK_THRESHOLD_MEDIUM = 50
    RISK_THRESHOLD_HIGH = 70
    RISK_THRESHOLD_CRITICAL = 90
    
    # Challenge Settings
    CHALLENGE_REQUIRED_THRESHOLD = 70
    ACCOUNT_LOCK_THRESHOLD = 95

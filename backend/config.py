import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Database - Neon PostgreSQL
    DATABASE_URL: str = os.getenv('DATABASE_URL', '')
    
    # BehavioGuard Settings (for in-memory analysis only)
    RISK_THRESHOLD_LOW: int = 30
    RISK_THRESHOLD_MEDIUM: int = 50
    RISK_THRESHOLD_HIGH: int = 70
    RISK_THRESHOLD_CRITICAL: int = 90
    CHALLENGE_REQUIRED_THRESHOLD: int = 70
    ACCOUNT_LOCK_THRESHOLD: int = 95

settings = Settings()
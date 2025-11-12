from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routes import auth, posts, messages, security, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    print("🚀 SecureCircle Backend Starting...")
    print("📊 Database: Neon PostgreSQL")
    print("🔒 BehavioGuard: Active")
    print("✅ Ready to accept connections!\n")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="SecureCircle API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(security.router, prefix="/api/security", tags=["security"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
async def index():
    return {
        "app": "SecureCircle API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
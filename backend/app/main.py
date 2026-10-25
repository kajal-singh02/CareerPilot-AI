import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.seed_data import seed_database

# Import routers
from app.api.v1 import (
    auth, resumes, jobs, job_matches, roadmaps,
    interviews, applications, chat, dashboard, resume_builder
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Run seed data
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.warning(f"Error seeding database: {e}")
    finally:
        db.close()
    
    yield
    logger.info("CareerPilot AI Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "CareerPilot AI Backend is running successfully!",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": "/health"
    }

# Health endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "model_configured": settings.ANTHROPIC_MODEL,
        "has_claude_key": bool(settings.ANTHROPIC_API_KEY)
    }

# Mount API Routers
v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=f"{v1_prefix}/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix=f"{v1_prefix}/dashboard", tags=["Dashboard"])
app.include_router(resumes.router, prefix=f"{v1_prefix}/resumes", tags=["Resumes"])
app.include_router(jobs.router, prefix=f"{v1_prefix}/jobs", tags=["Jobs"])
app.include_router(job_matches.router, prefix=f"{v1_prefix}/job-matches", tags=["Job Matching"])
app.include_router(roadmaps.router, prefix=f"{v1_prefix}/roadmaps", tags=["Roadmaps"])
app.include_router(interviews.router, prefix=f"{v1_prefix}/interviews", tags=["Mock Interviews"])
app.include_router(applications.router, prefix=f"{v1_prefix}/applications", tags=["Applications"])
app.include_router(chat.router, prefix=f"{v1_prefix}/chat", tags=["Career Assistant"])
app.include_router(resume_builder.router, prefix=f"{v1_prefix}/resume-builder", tags=["Resume Builder"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

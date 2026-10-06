from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.analytics import router as analytics_router
from app.api.insights import router as insights_router
from app.api.audit_logs import router as audit_logs_router
from app.api.dashboard import router as dashboard_router
from app.api.organizations import router as organizations_router
from app.api.users import router as users_router


app = FastAPI(
    title="Nexora API",
    description="AI-Powered Enterprise Operations & Intelligence Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(organizations_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(audit_logs_router)
app.include_router(analytics_router)
app.include_router(insights_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {
        "application": "Nexora",
        "status": "online",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "nexora-api",
    }
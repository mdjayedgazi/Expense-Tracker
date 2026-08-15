from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import auth, transactions, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup (simple alternative to migrations)."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Expense Tracker API",
    description=(
        "A personal expense tracker REST API built with FastAPI, "
        "SQLAlchemy and PostgreSQL. Users can register, log in with JWT "
        "and manage their income/expense transactions."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the frontend (Vite dev server / any frontend host) to call the API.
# Restrict CORS_ORIGINS in production, e.g. "https://app.example.com,https://example.com".
origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(transactions.router)


@app.get("/")
def root():
    """Simple health check."""
    return {"message": "Welcome to the Expense Tracker API"}

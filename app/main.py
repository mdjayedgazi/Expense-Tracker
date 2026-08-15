from contextlib import asynccontextmanager

from fastapi import FastAPI

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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(transactions.router)


@app.get("/")
def root():
    """Simple health check."""
    return {"message": "Welcome to the Expense Tracker API"}

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# Normalize the URL so SQLAlchemy uses the psycopg driver for PostgreSQL.
DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://",
    "postgresql+psycopg://",
    1,
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Base class every SQLAlchemy model inherits from."""

    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

# Optionally point tests at a dedicated PostgreSQL test database, e.g.:
#   TEST_DATABASE_URL=postgresql+psycopg://user:pass@host:5432/expense_tracker_test
# By default an isolated in-memory SQLite database is used so the real
# database is never touched.
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")


@pytest.fixture()
def db_session():
    """Fresh isolated in-memory database for every test."""
    if TEST_DATABASE_URL:
        engine = create_engine(TEST_DATABASE_URL)
    else:
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    Base.metadata.create_all(bind=engine)

    TestSessionLocal = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
    )
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    """TestClient whose get_db dependency uses the test database."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    # Not used as a context manager so the app startup lifespan (which
    # creates tables on the real engine) does not run during tests.
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()


def register_and_login(client, username, email, password="1234"):
    """Register a user and return the JWT access token."""
    response = client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": password,
        },
    )
    assert response.status_code == 201, response.text

    login_response = client.post(
        "/auth/login",
        data={"username": username, "password": password},
    )
    assert login_response.status_code == 200, login_response.text

    return login_response.json()["access_token"]


@pytest.fixture()
def user_token(client):
    """Token for the default test user."""
    return register_and_login(
        client,
        username="jayed",
        email="mdjayedgazi@gmail.com",
    )


def auth_header(token):
    """Bearer authorization header for authenticated requests."""
    return {"Authorization": f"Bearer {token}"}


def create_transaction(client, token, **overrides):
    """Create a transaction through the API and return the response."""
    payload = {
        "title": "Monthly salary",
        "amount": 50000,
        "type": "income",
        "category": "Salary",
        "date": "2026-08-15",
    }
    payload.update(overrides)
    return client.post(
        "/transactions",
        json=payload,
        headers=auth_header(token),
    )

from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings
from tests.conftest import auth_header, register_and_login


def test_register_user(client):
    """Registering returns the public user info and never the password hash."""
    response = client.post(
        "/auth/register",
        json={
            "username": "jayed",
            "email": "mdjayedgazi@gmail.com",
            "password": "1234",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "jayed"
    assert body["email"] == "mdjayedgazi@gmail.com"
    assert "id" in body
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_duplicate_username(client):
    """A second registration with the same username returns 409."""
    register_and_login(client, "jayed", "mdjayedgazi@gmail.com")

    response = client.post(
        "/auth/register",
        json={
            "username": "jayed",
            "email": "mdjayedgazi+other@gmail.com",
            "password": "1234",
        },
    )

    assert response.status_code == 409


def test_register_duplicate_email(client):
    """A second registration with the same email returns 409."""
    register_and_login(client, "jayed", "mdjayedgazi@gmail.com")

    response = client.post(
        "/auth/register",
        json={
            "username": "jayed",
            "email": "mdjayedgazi@gmail.com",
            "password": "1234",
        },
    )

    assert response.status_code == 409


def test_register_email_case_insensitive(client):
    """Emails are stored lowercased and compared case-insensitively."""
    response = client.post(
        "/auth/register",
        json={
            "username": "jayed",
            "email": "MDJAYEDGAZI@GMAIL.COM",
            "password": "1234",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "mdjayedgazi@gmail.com"

    duplicate = client.post(
        "/auth/register",
        json={
            "username": "someone-else",
            "email": "mdjayedgazi@gmail.com",
            "password": "1234",
        },
    )

    assert duplicate.status_code == 409


def test_token_without_expiry_rejected(client):
    """A JWT without an exp claim must not be accepted."""
    register_and_login(client, "jayed", "mdjayedgazi@gmail.com")

    no_expiry_token = jwt.encode(
        {"sub": "jayed", "id": 1},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    response = client.get("/users/me", headers=auth_header(no_expiry_token))

    assert response.status_code == 401


def test_expired_token_rejected(client):
    """An expired JWT must not be accepted."""
    register_and_login(client, "jayed", "mdjayedgazi@gmail.com")

    expired_token = jwt.encode(
        {
            "sub": "jayed",
            "id": 1,
            "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    response = client.get("/users/me", headers=auth_header(expired_token))

    assert response.status_code == 401


def test_login_success(client):
    """Login with correct credentials returns a JWT access token."""
    register_and_login(client, "jayed", "mdjayedgazi@gmail.com")

    response = client.post(
        "/auth/login",
        data={"username": "jayed", "password": "1234"},
    )

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Login with a wrong password returns 401."""
    register_and_login(client, "jayed", "mdjayedgazi@gmail.com")

    response = client.post(
        "/auth/login",
        data={"username": "jayed", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_login_unknown_user(client):
    """Login with an unknown username returns 401."""
    response = client.post(
        "/auth/login",
        data={"username": "ghost", "password": "1234"},
    )

    assert response.status_code == 401

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import Token, UserCreate
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    new_user: UserCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Register a new user and return its public information."""
    # Reject duplicate username or email. Emails are compared case-insensitively
    # by storing them lowercased.
    email = new_user.email.lower()
    existing_user = db.query(User).filter(
        or_(
            User.username == new_user.username,
            User.email == email,
        )
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered",
        )

    # Only the hashed password is stored.
    user = User(
        username=new_user.username,
        email=email,
        hashed_password=hash_password(new_user.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
def login_user(
    db: Annotated[Session, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    """Authenticate a user and return a JWT access token."""
    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    # Same error for unknown user and wrong password (no information leak).
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        username=user.username,
        user_id=user.id,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

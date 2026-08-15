from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Request body for user registration."""

    username: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="UserName",
        examples=["jayed"],
    )

    email: EmailStr = Field(
        ...,
        description="User Email Address",
        examples=["mdjayedgazi@gmail.com"],
    )

    password: str = Field(
        ...,
        min_length=4,
        max_length=20,
        description="User Password",
        examples=["1234"],
    )


class Token(BaseModel):
    """JWT access token returned by the login endpoint."""

    access_token: str
    token_type: str = "bearer"

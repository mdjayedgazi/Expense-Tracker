from pydantic import BaseModel, Field, ConfigDict

# User Create Schemas
class UserCreate(BaseModel):
    username: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="UserName",
        examples=["Jayed"]
    )

    email: str = Field(
        ...,
        description="User Email Address",
        examples=["johan@gmail.com"]
    )

    password: str = Field(
        ...,
        min_length=4,
        max_length=20,
        description="User Password",
        examples=["1234"]
    )

# User Update Schemas
class UserUpdate(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
        description="UserName",
        examples=["Jayed"]
    )

    email: str | None = Field(
        default=None,
        description="User Email Address",
        examples=["johan@gmail.com"]
    )

#ConfigDict is the Pydantic v2 way (class Config is deprecated)
model_config = ConfigDict(from_attributes=True)

class PasswordUpdate(BaseModel):
    current_password: str = Field(...)
    new_password: str = Field(...)
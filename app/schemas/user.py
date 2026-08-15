from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    """Public user information. Never exposes the hashed_password."""

    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)

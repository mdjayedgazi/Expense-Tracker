import jwt

from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.users.models import User

from passlib.context import CryptContext

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()

    if user is None:
        return False
    if pwd_context.verify(password, user.hashed_password):
        return user
    return False


def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    payload = {
        'sub': username,
        'id': user_id,
        'exp': datetime.now(timezone.utc) + expires_delta
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
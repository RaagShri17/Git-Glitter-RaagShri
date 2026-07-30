"""
Auth dependency — placeholder for Person 2's auth system.

INTEGRATION NOTE FOR PERSON 2 (Database & Auth):
Right now this issues/validates plain JWTs against the in-memory user store,
so the whole API is usable end-to-end today. When you wire up Firebase
Authentication, replace `get_current_user` so it verifies the Firebase ID
token instead (firebase_admin.auth.verify_id_token), then look up/create the
matching user record. Keep the return type the same (a `user` dict with at
least an "id" field) so nothing in routers/ or services/ has to change.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import settings
from app.db.store import db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.get_user(user_id)
    if user is None:
        raise credentials_exception
    return user

import os
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    # LOCAL DEV AUTH FALLBACK:
    # If frontend does not send a Bearer token, use a local/demo user.
    if credentials is None:
        demo_user = (
            db.query(User).filter(User.email == "demo@careercopilot.ai").first()
            or db.query(User).filter(User.id == 1).first()
            or db.query(User).first()
        )

        if demo_user:
            return demo_user

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No local demo user found. Please register/login first.",
        )

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")

        if not user_id:
            raise ValueError("Missing token subject.")

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

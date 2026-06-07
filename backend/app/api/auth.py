from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth_dependencies import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


def normalize_email(email: str) -> str:
    return email.strip().lower()


@router.post("/register", response_model=AuthResponse)
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = normalize_email(request.email)

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    user = User(
        email=email,
        name=request.name.strip() if request.name else None,
        hashed_password=hash_password(request.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id))

    return AuthResponse(
        access_token=access_token,
        user=user,
    )


@router.post("/login", response_model=AuthResponse)
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    email = normalize_email(request.email)

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))

    return AuthResponse(
        access_token=access_token,
        user=user,
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user

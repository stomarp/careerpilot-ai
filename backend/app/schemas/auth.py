from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(..., examples=["swati@example.com"])
    name: str | None = Field(default=None, examples=["Swati Tomar"])
    password: str = Field(..., min_length=8, examples=["StrongPassword123"])


class LoginRequest(BaseModel):
    email: str = Field(..., examples=["swati@example.com"])
    password: str = Field(..., examples=["StrongPassword123"])


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

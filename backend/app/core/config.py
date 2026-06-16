from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    ENVIRONMENT: str = "local"
    APP_ENV: str = "local"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Comma-separated list of allowed frontend origins.",
    )
    BACKEND_CORS_ORIGINS: str = Field(
        default="",
        description="Optional Render-friendly comma-separated CORS origins.",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        raw_origins = [
            self.CORS_ORIGINS,
            self.BACKEND_CORS_ORIGINS,
            self.FRONTEND_URL,
        ]

        origins: list[str] = []

        for raw_origin in raw_origins:
            for origin in raw_origin.split(","):
                clean_origin = origin.strip()
                if clean_origin and clean_origin not in origins:
                    origins.append(clean_origin)

        return origins

    @property
    def jwt_algorithm(self) -> str:
        return self.JWT_ALGORITHM or self.ALGORITHM


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

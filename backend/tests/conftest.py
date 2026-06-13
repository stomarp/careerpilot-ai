import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_careercopilot.db")
os.environ.setdefault("LOCAL_DEV_AUTH", "true")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

from app.core.database import get_db
from app.core.auth_dependencies import get_current_user
from app.models.application import Application
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.user import User
from app.main import app
import app.main as app_main


TEST_DATABASE_URL = "sqlite:///./test_careercopilot.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)

TEST_TABLES = [
    User.__table__,
    Resume.__table__,
    JobDescription.__table__,
    Application.__table__,
]


@pytest.fixture(autouse=True)
def setup_database():
    for table in reversed(TEST_TABLES):
        table.drop(bind=test_engine, checkfirst=True)

    for table in TEST_TABLES:
        table.create(bind=test_engine, checkfirst=True)

    db = TestingSessionLocal()
    try:
        demo_user = User(
            id=1,
            email="demo@careercopilot.ai",
            name="Demo User",
            hashed_password="test",
        )
        db.add(demo_user)
        db.commit()
    finally:
        db.close()

    yield

    for table in reversed(TEST_TABLES):
        table.drop(bind=test_engine, checkfirst=True)


@pytest.fixture()
def demo_user():
    db = TestingSessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@careercopilot.ai").first()
        yield user
    finally:
        db.close()


@pytest.fixture()
def client(demo_user):
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    def override_get_current_user():
        return demo_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    app_main.engine = test_engine

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

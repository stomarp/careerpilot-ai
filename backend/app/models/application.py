from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer,
                     ForeignKey("users.id"),
                     nullable=False)

    company = Column(String, nullable=False)

    role = Column(String, nullable=False)

    status = Column(String, default="Applied")

    notes = Column(Text)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())
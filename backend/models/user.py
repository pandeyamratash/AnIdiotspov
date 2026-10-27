
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    username = Column(String(40), unique=True, index=True, nullable=False)
    email = Column(String(254), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

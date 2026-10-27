
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from database.connection import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    subtitle = Column(String(500), nullable=True)
    slug = Column(String(300), unique=True, index=True, nullable=False)

    content = Column(Text, nullable=False, default="")
    category = Column(String(100), nullable=True)
    tags = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)

    status = Column(String(20), nullable=False, default="draft")
    published = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

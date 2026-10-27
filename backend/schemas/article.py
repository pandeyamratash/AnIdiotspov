
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    subtitle: Optional[str] = Field(default=None, max_length=500)
    content: str = ""
    category: Optional[str] = Field(default=None, max_length=100)
    tags: Optional[str] = None
    cover_image: Optional[str] = Field(default=None, max_length=500)
    status: str = "draft"
    published: bool = False


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=250)
    subtitle: Optional[str] = Field(default=None, max_length=500)
    content: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=100)
    tags: Optional[str] = None
    cover_image: Optional[str] = Field(default=None, max_length=500)
    status: Optional[str] = None
    published: Optional[bool] = None


class ArticleResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    slug: str
    content: str
    category: Optional[str]
    tags: Optional[str]
    cover_image: Optional[str]
    status: str
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

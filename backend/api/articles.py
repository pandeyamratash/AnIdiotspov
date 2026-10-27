
import re
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from models.article import Article
from schemas.article import (
    ArticleCreate,
    ArticleResponse,
    ArticleUpdate,
)

router = APIRouter(prefix="/api/articles", tags=["Articles"])


def make_slug(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "untitled"


def unique_slug(db: Session, title: str, exclude_id=None) -> str:
    base_slug = make_slug(title)
    slug = base_slug
    counter = 2

    while True:
        query = db.query(Article).filter(Article.slug == slug)
        if exclude_id is not None:
            query = query.filter(Article.id != exclude_id)

        if query.first() is None:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


@router.get("/", response_model=List[ArticleResponse])
def list_articles(
    published_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    query = db.query(Article)

    if published_only:
        query = query.filter(
            Article.published.is_(True),
            Article.status == "published",
        )

    return query.order_by(Article.created_at.desc()).all()


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()

    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")

    return article


@router.post("/", response_model=ArticleResponse, status_code=201)
def create_article(
    payload: ArticleCreate,
    db: Session = Depends(get_db),
):
    data = payload.model_dump()

    data["title"] = data["title"].strip()
    if not data["title"]:
        raise HTTPException(status_code=422, detail="Title cannot be empty")

    if data["status"] not in ("draft", "published"):
        raise HTTPException(status_code=422, detail="Invalid article status")

    data["slug"] = unique_slug(db, data["title"])

    article = Article(**data)
    db.add(article)
    db.commit()
    db.refresh(article)

    return article


@router.patch("/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: int,
    payload: ArticleUpdate,
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.id == article_id).first()

    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")

    data = payload.model_dump(exclude_unset=True)

    if "title" in data:
        data["title"] = (data["title"] or "").strip()
        if not data["title"]:
            raise HTTPException(status_code=422, detail="Title cannot be empty")
        data["slug"] = unique_slug(
            db, data["title"], exclude_id=article.id
        )

    if "status" in data and data["status"] not in ("draft", "published"):
        raise HTTPException(status_code=422, detail="Invalid article status")

    for field, value in data.items():
        setattr(article, field, value)

    db.commit()
    db.refresh(article)

    return article


@router.delete("/{article_id}", status_code=204)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.id == article_id).first()

    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")

    db.delete(article)
    db.commit()

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.get("/registration-status")
def registration_status(db: Session = Depends(get_db)):
    registration_open = db.query(User.id).first() is None
    return {"registration_open": registration_open}
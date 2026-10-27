
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.articles import router as articles_router
from database.init_db import init_db
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from api.uploads import router as uploads_router
from api.auth import router as auth_router

app = FastAPI(
    title="An idiots pov API",
    description="Backend API for the An idiots pov writing platform",
    version="1.0.0",
)
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)

app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(uploads_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def home():
    return {"message": "An idiots pov API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}

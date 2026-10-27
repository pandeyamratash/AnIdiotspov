
from database.connection import Base, engine
from models.article import Article
from models.user import User


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")


if __name__ == "__main__":
    init_db()

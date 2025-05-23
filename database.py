from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import psycopg2
import os

# When running from local and using pgAdmin 4
# DATABASE_URL = "postgresql://postgres:Joyeseosa@localhost:5432/JayBankDB"

# When running from docker
DATABASE_URL = "postgresql://postgres:Joyeseosa@database:5432/JayBankDB"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Getting the DB session
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


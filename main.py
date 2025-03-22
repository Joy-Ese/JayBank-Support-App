from fastapi import FastAPI
from database import SessionLocal, engine
from models import Base
from seed import seed_credits
from routers import auth, chat, user

app = FastAPI(title="JayBank Customer Support API")

# Initialize the database
Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(user.router, prefix="/user", tags=["User Management"])

@app.on_event("startup")
def startup_event():
  """Runs once on application startup to seed data."""
  db = SessionLocal()
  try:
    seed_credits(db)
  finally:
    db.close()

@app.get("/")
async def root():
  return {"message": "Hello World"}
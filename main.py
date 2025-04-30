from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from models import Base
from seed import seed_credits
from routers import auth, chat, user, admin, credit, notification

app = FastAPI(
  title="JB AI Support API",
  description="This API provides users with support about banking (financial institution) queries using AI models.",
  version="1.0.0",
  contact={"name": "Joy Eseosa Ihama", "email": "ihamajoyeseosa@gmail.com"},
  license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"}
)

origins = [
  "http://localhost:4200",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["GET", "POST", "PUT", "DELETE"],
  allow_headers=["*"], 
)

# Initialize the database
Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(credit.router, prefix="/credit", tags=["Credit"])
app.include_router(notification.router, prefix="/notification", tags=["Notification"])

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
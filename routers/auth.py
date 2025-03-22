from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
import models
import schemas
from dependencies import hash_password, verify_password
from jwt import create_access_token

router = APIRouter()

@router.post("/register", response_model=schemas.ResponseModel)
def register(user: schemas.CreateUser, db: Session = Depends(get_db)):
  # checking if user exists
  existing_user = db.query(models.User).filter(
    or_(models.User.email == user.email, models.User.username == user.username)
  ).first()

  if existing_user:
    raise HTTPException(status_code=400, detail="Email or Username already exists")
  
  # get default "Free" plan from db
  free_plan = db.query(models.Credit).filter(models.Credit.id == 1).first()

  if not free_plan:
    raise HTTPException(status_code=500, detail="Default credit plan not found")

  hashed_password = hash_password(user.password)

  # Create new user with dynamic credit plan
  new_user = models.User(
    first_name=user.first_name,
    last_name=user.last_name,
    username=user.username,
    email=user.email,
    hashed_password=hashed_password,
    credits_remaining=20,
    plan_subscribed_to=free_plan.plan
  )

  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return {"status": True, "message": "Registration successful"}

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
  db_user = db.query(models.User).filter(models.User.username == user.username).first()
  if not db_user or not verify_password(user.password, db_user.hashed_password):
    raise HTTPException(status_code=400, detail="Invalid credentials")
  
  db_user.last_login = datetime.utcnow()
  db.commit()
  db.refresh(db_user)

  token = create_access_token({"username": db_user.username})
  return {"access_token": token, "token_type": "bearer"}

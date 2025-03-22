from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from encryption import encrypt_data, decrypt_data
import models
import schemas
from dependencies import hash_password, verify_password
from jwt import create_access_token

router = APIRouter()

@router.post("/register", response_model=schemas.ResponseModel)
def register(encrypted_request: dict, db: Session = Depends(get_db)):
  try:
    # Decrypt request data
    decrypted_data = decrypt_data(encrypted_request["data"])
    user = schemas.CreateUser.parse_raw(decrypted_data)
  except Exception as e:
    raise HTTPException(status_code=400, detail="Invalid encryption format")

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

  # Encrypt response
  encrypted_response = encrypt_data('{"status": true, "message": "Registration successful"}')

  return {"data": encrypted_response}

@router.post("/login")
def register(encrypted_request: dict, db: Session = Depends(get_db)):
  try:
    # Decrypt request data
    decrypted_data = decrypt_data(encrypted_request["data"])
    user = schemas.UserLogin.parse_raw(decrypted_data)
  except Exception as e:
    raise HTTPException(status_code=400, detail="Invalid encryption format")

  db_user = db.query(models.User).filter(models.User.username == user.username).first()
  if not db_user or not verify_password(user.password, db_user.hashed_password):
    raise HTTPException(status_code=400, detail="Invalid credentials")
  
  db_user.last_login = datetime.utcnow()
  db.commit()
  db.refresh(db_user)

  token = create_access_token({"username": db_user.username})

  # Encrypt response
  encrypted_response = encrypt_data('{"access_token": "' + token + '", "token_type": "bearer"}')

  return {"data": encrypted_response}

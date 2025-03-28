import json
from fastapi import APIRouter, Depends, HTTPException, Security
from datetime import datetime
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from encryption import encrypt_data, decrypt_data
import models
import schemas
from dependencies import hash_password, verify_password
from jwt import create_access_token, verify_token

router = APIRouter()

security = HTTPBearer()

@router.post("/register")
def register(encrypted_request: schemas.EncryptedRequest, db: Session = Depends(get_db)):
  try:
    # Decrypt request data
    decrypted_data = decrypt_data(encrypted_request.encrypted_data)

    if not decrypted_data:
      raise HTTPException(status_code=400, detail="Invalid encryption format")

    decrypted_data_str = json.dumps(decrypted_data)
    user = schemas.CreateUser.parse_raw(decrypted_data_str)
  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Invalid encryption format: {str(e)}")

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

  encrypted_response = encrypt_data(json.dumps({"status": True, "message": "Registration successful"}))
  return {"data": encrypted_response}

@router.post("/login")
def login(encrypted_request: schemas.EncryptedRequest, db: Session = Depends(get_db)):
  try:
    # Decrypt request data
    decrypted_data = decrypt_data(encrypted_request.encrypted_data)

    if not decrypted_data:
      raise HTTPException(status_code=400, detail="Invalid encryption format")

    decrypted_data_str = json.dumps(decrypted_data)
    user = schemas.UserLogin.parse_raw(decrypted_data_str)
  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Invalid encryption format: {str(e)}")

  db_user = db.query(models.User).filter(models.User.username == user.username).first()
  if not db_user or not verify_password(user.password, db_user.hashed_password):
    raise HTTPException(status_code=400, detail="Invalid credentials")
  
  db_user.last_login = datetime.utcnow()
  db.commit()
  db.refresh(db_user)

  token = create_access_token({"username": db_user.username})

  encrypted_response = encrypt_data(json.dumps({"access_token": token, "token_type": "bearer"}))
  return {"data": encrypted_response}

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
  token = credentials.credentials
  decoded_token = verify_token(token)
  user = db.query(models.User).filter(models.User.username == decoded_token["username"]).first()

  if not user:
    raise HTTPException(status_code=401, detail="Unauthorized Access")

  return {"id": user.id, "role": "User"}

def get_current_admin(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
  token = credentials.credentials
  decoded_token = verify_token(token)
  admin = db.query(models.Admin).filter(models.Admin.username == decoded_token["username"]).first()

  if not admin:
    raise HTTPException(status_code=401, detail="Unauthorized Access")

  return {"id": admin.id, "role": admin.role}

def role_required(required_role: str):
  def role_checker(user: dict = Depends(get_current_user)):
    if user["role"] != required_role:
      raise HTTPException(status_code=403, detail="Access forbidden")
    return user
  return role_checker

def admin_role_required(required_role: str):
  def admin_role_checker(admin: dict = Depends(get_current_admin)):
    if admin["role"] != required_role:
      raise HTTPException(status_code=403, detail="Access forbidden")
    return admin
  return admin_role_checker



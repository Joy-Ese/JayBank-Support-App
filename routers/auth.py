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

@router.post(
    "/register",
    summary="Register a new user with encrypted details",
    description="""
      Sends user's details as an encrypted string for registeration.

      **Sample decrypted user JSON**:
      ```json
      {
        "first_name": "Jane",
        "last_name": "Doe",
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "password": "strongpassword123",
      }

      Args:
        CreateUser (dict): User details.

      Returns:
        dict: {"data": encrypted_response}.

      **Sample decrypted response JSON**:
      ```json
      {
        "status": True, 
        "message": "Registration successful"
      }
    """
  )
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
    credits_remaining=free_plan.credits,
    plan_subscribed_to=free_plan.plan,
    role = "User"
  )

  db.add(new_user)
  db.commit()
  db.refresh(new_user)

  encrypted_response = encrypt_data(json.dumps({"status": True, "message": "Registration successful"}))
  return {"data": encrypted_response}

@router.post(
    "/login",
    summary="Authenticate user",
    description="""
      Sends user's details as an encrypted string to authenticated.

      **Sample decrypted user JSON**:
      ```json
      {
        "username": "janedoe",
        "password": "strongpassword123",
      }

      Args:
        UserLogin (dict): login details.

      Returns:
        dict: {"data": encrypted_response}.

      **Sample decrypted response JSON**:
      ```json
      {
        "access_token": token, 
        "role": role
      }
    """
  )
def login(encrypted_request: schemas.EncryptedRequest, db: Session = Depends(get_db)):
  try:
    # Decrypt request data
    decrypted_data = decrypt_data(encrypted_request.encrypted_data)

    if not decrypted_data:
      raise HTTPException(status_code=400, detail="Invalid encryption format")

    decrypted_data_str = json.dumps(decrypted_data)
    credentials = schemas.UserLogin.parse_raw(decrypted_data_str)
  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Invalid encryption format: {str(e)}")

  # Check if the user exists in the User table
  db_user = db.query(models.User).filter(models.User.username == credentials.username).first()
  if db_user and verify_password(credentials.password, db_user.hashed_password):
    db_user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    role = db_user.role
    # Generate JWT token for User
    token = create_access_token({"username": credentials.username})
    # Encrypt response and return response if User exits
    encrypted_response = encrypt_data(json.dumps({"access_token": token, "role": role}))
    return {"data": encrypted_response}


  # If not found in User, check Admin table
  db_admin = db.query(models.Admin).filter(models.Admin.username == credentials.username).first()
  if db_admin:
    role = db_admin.role
    # Generate JWT token for Admin
    token = create_access_token({"username": credentials.username})
    # Encrypt response and return response if Admin exits
    encrypted_response = encrypt_data(json.dumps({"access_token": token, "role": role}))
    return {"data": encrypted_response}

  # If no user or admin found
  raise HTTPException(status_code=400, detail="Invalid credentials")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
  """
  Gets User's credentials from HTTP Authorization Credentials to allow access to protected endpoints.

  Returns:
    dict: {"id": int, "role": "str"}.
  """

  token = credentials.credentials
  decoded_token = verify_token(token)
  user = db.query(models.User).filter(models.User.username == decoded_token["username"]).first()

  if not user:
    raise HTTPException(status_code=401, detail="Unauthorized Access")

  return {"id": user.id, "role": user.role}

def get_current_admin(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
  """
  Gets Admin's credentials from HTTP Authorization Credentials to allow access to protected endpoints.

  Returns:
    dict: {"id": int, "role": "str"}.
  """

  token = credentials.credentials
  decoded_token = verify_token(token)
  admin = db.query(models.Admin).filter(models.Admin.username == decoded_token["username"]).first()

  if not admin:
    raise HTTPException(status_code=401, detail="Unauthorized Access")

  return {"id": admin.id, "role": admin.role}

def role_required(required_role: str):
  def role_checker(user: dict = Depends(get_current_user)):
    """
    Checks that role is user before granting access.

    Returns:
      dict: {"id": int, "role": "str"}.
    """

    if user["role"] != required_role:
      raise HTTPException(status_code=403, detail="Access forbidden")
    return user
  return role_checker

def admin_role_required(required_role: str):
  def admin_role_checker(admin: dict = Depends(get_current_admin)):
    """
    Checks that role is admin before granting access.

    Returns:
      dict: {"id": int, "role": "str"}.
    """

    if admin["role"] != required_role:
      raise HTTPException(status_code=403, detail="Access forbidden")
    return admin
  return admin_role_checker



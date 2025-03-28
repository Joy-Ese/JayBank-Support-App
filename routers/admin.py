from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from encryption import encrypt_data, decrypt_data
import models
import schemas
from jwt import create_access_token, verify_token
from routers.auth import get_current_admin

router = APIRouter()

@router.post("/create-admin")
def create_admin(admin: schemas.CreateAdmin, db: Session = Depends(get_db)):
  # checking if admin exists
  existing_admin = db.query(models.Admin).filter(
    or_(models.Admin.email == admin.email, models.Admin.username == admin.username)
  ).first()
  if existing_admin:
    raise HTTPException(status_code=400, detail="Admin already exists")

  # Create new admin
  new_admin = models.Admin(
    username=admin.username,
    email=admin.email,
    role=admin.role
  )
  db.add(new_admin)
  db.commit()
  db.refresh(new_admin)

  # token = create_jwt_token(new_admin.id, new_admin.role)
  
  return {"status": True, "message": "Admin created successfully"}

@router.post("/admin-login")
def login(admin: schemas.AdminLogin, db: Session = Depends(get_db)):
  db_admin = db.query(models.Admin).filter(models.Admin.username == admin.username).first()
  if not db_admin:
    raise HTTPException(status_code=400, detail="There is no such Admin")

  token = create_access_token({"username": db_admin.username})

  return {"access_token": token, "token_type": "bearer"}

# Get Total Number of Users (Admin Only)
@router.get("/total-users", dependencies=[Depends(get_current_admin)])
def get_total_users(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
  total_users = db.query(models.User).count()
  return {"total_users": total_users}



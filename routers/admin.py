from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
import models
import schemas
from routers.auth import get_current_admin

router = APIRouter()

@router.post(
    "/create-admin",
    response_model=schemas.ResponseModel,
    summary="Create an Admin and assign role",
    description="""
      Sends user's details as an encrypted string to authenticated.

      **Sample decrypted user JSON**:
      ```json
      {
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "role": "Admin",
      }

      Args:
        CreateAdmin (dict): Admin details.

      Returns:
      ```json
      {
        "id": 1,
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "role": "User"
      }
    """
  )
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

  # return {"status": True, "message": "Admin created successfully"}
  return schemas.ResponseModel(
    status=True,
    message="Admin created successfully"
  )

@router.get("/details", response_model=schemas.AdminResponse, dependencies=[Depends(get_current_admin)])
def get_admin_details(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
  """
  Gets details of authenticated admin.

  Returns:
    dict: Admin's information stored in the database.
  """

  db_admin = db.query(models.Admin).filter(models.Admin.id == admin["id"]).first()
  if not db_admin:
    raise HTTPException(status_code=404, detail="User not found")
  
  # return {
  #   "id": db_admin.id,
  #   "username": db_admin.username,
  #   "email": db_admin.email,
  #   "role": db_admin.role
  # }
  return schemas.AdminResponse(
    id=db_admin.id,
    username=db_admin.username,
    email=db_admin.email,
    role=db_admin.role
  )


# Get Total Number of Users (Admin Only)
@router.get("/total-users", response_model=schemas.TotalUsers, dependencies=[Depends(get_current_admin)])
def get_total_users(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
  """
  Gets total number of registered users.

  Returns:
    int: Count of registered users.
  """

  total_users = db.query(models.User).count()
  # return {"total_users": total_users}
  return schemas.TotalUsers(
    total_users=total_users
  )



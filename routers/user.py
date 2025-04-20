from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter()

@router.get("/details", response_model=schemas.UserResponse, dependencies=[Depends(get_current_user)])
def get_user_details(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  """
  Gets details of authenticated user.

  Returns:
    dict: User's information stored in the database.
  """

  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  return schemas.UserResponse(
    id=db_user.id,
    first_name=db_user.first_name,
    username=db_user.username,
    email=db_user.email,
    credits_remaining=db_user.credits_remaining,
    plan_subscribed_to=db_user.plan_subscribed_to,
    role=db_user.role
  )




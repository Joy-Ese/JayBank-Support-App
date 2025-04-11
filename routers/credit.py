from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from datetime import datetime
from routers.auth import get_current_user

router = APIRouter()

@router.get("/balance", dependencies=[Depends(get_current_user)])
def get_credit_balance(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  if db_user.credits_remaining <= 10:
    notification = models.Notification(
      user_id=db_user.id,
      message="Your credit balance is less than 10.",
      status="unread",
      time_stamp=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

  return {"credits": db_user.credits_remaining}


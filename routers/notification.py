from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter()

# Get all user notifications
@router.get("/all", dependencies=[Depends(get_current_user)])
def get_user_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    user: dict = Depends(get_current_user), 
    db: Session = Depends(get_db)
  ):
  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  offset = (page - 1) * limit

  total_items = db.query(models.Notification).filter(models.Notification.user_id == db_user.id).count()
  total_pages = (total_items + limit - 1) // limit

  notifications = (db.query(models.Notification).filter(models.Notification.user_id == db_user.id)
    .order_by(models.Notification.time_stamp.desc()).offset(offset).limit(limit).all())

  return {
    "data": notifications,
    "pagination": {
      "page": page,
      "limit": limit,
      "totalPages": total_pages,
      "totalItems": total_items
    }
  }

# Get all unread notifications
@router.get("/unread", dependencies=[Depends(get_current_user)])
def get_unread_notifications(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  unread_notifications = db.query(models.Notification)\
    .filter(models.Notification.user_id == db_user.id, models.Notification.status == "unread")\
    .order_by(models.Notification.time_stamp.desc()).all()

  return unread_notifications

# Total number of notifications /unread-count
@router.get("/unread-count")
def get_unread_notifications_count(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  total_unread_notifications = db.query(models.Notification)\
    .filter(models.Notification.user_id == db_user.id, models.Notification.status == "unread").count()
  return {"total_unread": total_unread_notifications}

# Mark a single notification as read
@router.post("/{notification_id}/mark-read")
def mark_notification_as_read(notification_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  notification = db.query(models.Notification).filter_by(id=notification_id, user_id=db_user.id).first()
  if notification:
    notification.status = "read"
    db.commit()
    return {"message": "Notification marked as read"}

  return {"message": "Notification not found"}


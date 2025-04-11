from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from routers.auth import get_current_user
from routers.user import get_user_details
from queue_processor import process_queue

router = APIRouter()

@router.post("/query", dependencies=[Depends(get_current_user)])
def send_user_chat(
  query: schemas.ChatRequest, 
  background_tasks: BackgroundTasks,
  db: Session = Depends(get_db), 
  db_user: models.User = Depends(get_user_details)
  ):
  print(db_user)

  # Add user's chat to the db
  new_user_chat = models.Chat(
    user_id=db_user.id,
    chat_from_user=query.user_query,
    time_sent=datetime.utcnow(),
  )
  db.add(new_user_chat)
  db.commit()
  db.refresh(new_user_chat)

  # Check that user's credit balance is more than 0
  if db_user.credits_remaining <= 0:
    # Add to user's chat request to queue if no available credits
    new_queue_entry = models.Queue(user_id=db_user.id, query_id=new_user_chat.id, queries_submitted=query.user_query, status="pending")
    db.add(new_queue_entry)
    db.commit()
    db.refresh(new_queue_entry) 
    return {"message": "Insufficient credits. Your query is pending and has been queued."}

  new_queue_entry = models.Queue(user_id=db_user.id, query_id=new_user_chat.id, queries_submitted=query.user_query, status="processing")
  db.add(new_queue_entry)
  db.commit()
  db.refresh(new_queue_entry) 

  # Get the database user model from the pydantic schema and deduct 1 credit per query
  user_model = db.query(models.User).filter(models.User.id == db_user.id).first()
  user_model.credits_remaining -= 1
  db.commit()
  db.refresh(user_model) 

  # Update your Pydantic model if needed later
  db_user.credits_remaining = user_model.credits_remaining

  # process_queue(db, db_user)
  # Call process_queue asynchronously using BackgroundTasks
  background_tasks.add_task(process_queue, db, db_user, new_user_chat.id)

  return {"message": "Your query is in the queue for processing.", "queryId": new_user_chat.id}

@router.get("/query/status/{query_id}")
async def get_query_status(query_id: int, db: Session = Depends(get_db)):
  query = db.query(models.Queue).filter(models.Queue.query_id == query_id).first()
  return {"status": query.status}

@router.get("/ai_response/{query_id}")
def get_ai_response(query_id: int, db: Session = Depends(get_db)):
  response = db.query(models.AIResponse).filter(models.AIResponse.query_id == query_id).first()
  if not response:
    raise HTTPException(status_code=404, detail="No AI response found for this query")
  
  return {
    "response": response.response_from_ai,
    "time": response.time_responded,
  }





@router.get("/user-chats", dependencies=[Depends(get_current_user)])
def fetch_user_chats(db: Session = Depends(get_db), db_user: models.User = Depends(get_user_details)):
  user_chats = (
    db.query(models.Chat)
    .filter(models.Chat.user_id == db_user.id)
    .order_by(models.Chat.time_sent.desc())
    .all()
  )

  if not user_chats:
    raise HTTPException(status_code=404, detail="No chat history found for this user.")
  return user_chats

@router.get("/ai-responses", dependencies=[Depends(get_current_user)])
def fetch_ai_responses(db: Session = Depends(get_db), db_user: models.User = Depends(get_user_details)):
  ai_responses = (
    db.query(models.AIResponse)
    .filter(models.AIResponse.user_id == db_user.id)
    .order_by(models.AIResponse.time_responded.desc())
    .all()
  )

  if not ai_responses:
    raise HTTPException(status_code=404, detail="No AI responses found for this user.")
  return ai_responses




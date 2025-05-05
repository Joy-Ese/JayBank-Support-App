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

@router.post("/query", response_model=schemas.QueryResponse, dependencies=[Depends(get_current_user)])
def send_user_chat(
  query: schemas.ChatRequest, 
  background_tasks: BackgroundTasks,
  db: Session = Depends(get_db), 
  db_user: models.User = Depends(get_user_details)
  ):
  """
    Sends a user query to the queue for processing.

    Args:
      ChatRequest (dict): {"user_query": str}

    Returns:
      dict: {"message": "Your query is in the queue for processing.", "queryId": the query Id}

    HTTPException:
      Bad Request: If the message is empty or invalid.
  """

  print(db_user)

  if not query:
    raise HTTPException(status_code=404, detail="Query not found")

  if not query.user_query.strip():
    raise HTTPException(status_code=400, detail="Query cannot be empty.")

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
    # Save new notification
    notification = models.Notification(
      user_id=db_user.id,
      message="Insufficient credits. Please purchase more credits",
      status="unread",
      time_stamp=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Add to user's chat request to queue if no available credits
    new_queue_entry = models.Queue(user_id=db_user.id, query_id=new_user_chat.id, queries_submitted=query.user_query, status="pending")
    db.add(new_queue_entry)
    db.commit()
    db.refresh(new_queue_entry) 
    return schemas.QueryResponse(
      message="Insufficient credits. Your query is pending and has been queued.",
      queryId=new_user_chat.id
    )

  new_queue_entry = models.Queue(user_id=db_user.id, query_id=new_user_chat.id, queries_submitted=query.user_query, status="processing")
  db.add(new_queue_entry)
  db.commit()
  db.refresh(new_queue_entry) 

  # Get the database user model from the pydantic schema and deduct 5 credits per query
  user_model = db.query(models.User).filter(models.User.id == db_user.id).first()
  user_model.credits_remaining -= 5
  db.commit()
  db.refresh(user_model) 

  # Update your Pydantic model if needed later
  db_user.credits_remaining = user_model.credits_remaining

  # Call process_queue asynchronously using BackgroundTasks
  background_tasks.add_task(process_queue, db, db_user, new_user_chat.id)

  return schemas.QueryResponse(
    message="Your query is in the queue for processing.",
    queryId=new_user_chat.id
  )

@router.get("/query/status/{query_id}")
async def get_query_status(query_id: int, db: Session = Depends(get_db)):
  """
    Fetches query status in the queue for frontend polling.

    Args:
      query_id: int

    Returns:
      dict: {"status": query.status}
  """

  query = db.query(models.Queue).filter(models.Queue.query_id == query_id).first()
  return {"status": query.status}

@router.get("/ai_response/{query_id}")
def get_ai_response(query_id: int, db: Session = Depends(get_db)):
  """
    Fetches AI Response corresponding to the query id.

    Args:
      query_id: int

    Returns:
      dict: {"response": response_from_ai, "time": time_responded}
  """

  response = db.query(models.AIResponse).filter(models.AIResponse.query_id == query_id).first()
  if not response:
    raise HTTPException(status_code=404, detail="No AI response found for this query")
  
  return {
    "response": response.response_from_ai,
    "time": response.time_responded,
  }


@router.get("/user-chats", dependencies=[Depends(get_current_user)])
def fetch_user_chats(db: Session = Depends(get_db), db_user: models.User = Depends(get_user_details)):
  """
  Gets list of all chats for the logged-in user.

  Returns:
    list: A list of Chat dictionaries.

  Example:
    Sample JSON:
      {
        "id": int,
        "user_id": int,
        "chat_from_user": str,
        "time_sent": datetime
      }
  """

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
  """
  Gets list of all AI responses for the user logged in.

  Returns:
    list: A list of AI Response dictionaries.

  Example:
    Sample JSON:
      {
        "id": int,
        "user_id": int,
        "query_id": int,
        "response_from_ai": str,
        "time_responded": datetime
      }
  """

  ai_responses = (
    db.query(models.AIResponse)
    .filter(models.AIResponse.user_id == db_user.id)
    .order_by(models.AIResponse.time_responded.desc())
    .all()
  )

  if not ai_responses:
    raise HTTPException(status_code=404, detail="No AI responses found for this user.")
  return ai_responses




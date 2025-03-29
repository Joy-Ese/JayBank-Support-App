import requests
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
import models
import schemas
from routers.auth import get_current_user
from routers.user import get_user_details

router = APIRouter()

# client = OpenAI(
#   api_key="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"
# )

MISTRAL_API_KEY = "t65ouezXOnafMSBROYnuzprd4nKM3w1o"

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
HEADERS = {
  "Authorization": f"Bearer {MISTRAL_API_KEY}",
  "Content-Type": "application/json"
}

@router.post("/query", dependencies=[Depends(get_current_user)])
def send_user_chat(query: schemas.ChatRequest, db: Session = Depends(get_db), db_user: models.User = Depends(get_user_details)):
  print(db_user)

  if db_user.credits_remaining <= 0:
    return {"error": "Insufficient credits. Please purchase some credits."}

  # Deduct 1 credit per query
  db_user.credits_remaining -= 1 
  db.commit() 
  db.refresh(db_user) 

  # Add user's chat to the db
  new_user_chat = models.Chat(
    user_id=db_user.id,
    chat_from_user=query.user_query,
    time_sent=datetime.utcnow(),
  )

  db.add(new_user_chat)
  db.commit()
  db.refresh(new_user_chat)

  # Call Mistral AI API
  payload = {
    "model": "mistral-small",
    "messages": [{"role": "user", "content": query.user_query}]
  }

  response = requests.post(MISTRAL_API_URL, headers=HEADERS, json=payload)
  ai_response = response.json()
  print("Mistral API Response:", ai_response) 

  if "choices" not in ai_response:
    raise HTTPException(status_code=500, detail="Error from Mistral AI")

  # Extract AI response text
  ai_response_text = ai_response["choices"][0]["message"]["content"]

  # Add AI response to the db
  new_AI_response = models.AIResponse(
    user_id=db_user.id,
    response_from_ai=ai_response_text,
    time_responded=datetime.utcnow(),
  )

  db.add(new_AI_response)
  db.commit()
  db.refresh(new_AI_response)

  return {"response": ai_response_text}

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




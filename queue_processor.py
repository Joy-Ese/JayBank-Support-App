import asyncio
import models
from datetime import datetime
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from mistral_integration import query_mistral
from routers.user import get_user_details

async def process_queue(db: Session, db_user: models.User, query_id: int):
  while True:
    # Get user's pending or processing queries from the queue table
    pending_queries = db.query(models.Queue).filter(
      models.Queue.user_id == db_user.id,
      models.Queue.status.in_(["pending", "processing"])
    ).order_by(models.Queue.id).all()

    if not pending_queries:
      # No queries left to process, break the loop
      break

    # Process each query and update database and USERRRRRR with MQTT and toastr
    for query in pending_queries:
      query.status = "processing"
      db.commit() 
      db.refresh(query) 

      # Add the logic to process the query 
      ai_response = await query_mistral(query.queries_submitted) 

      # Add AI response to the db
      new_AI_response = models.AIResponse(
        user_id=db_user.id,
        query_id=query_id,
        response_from_ai=ai_response,
        time_responded=datetime.utcnow(),
      )

      db.add(new_AI_response)
      db.commit()
      db.refresh(new_AI_response)

      # Update query status to "completed" after processing
      # Process each query and update database and USERRRRRR with MQTT and toastr when completed
      query.status = "completed"
      db.commit()
      db.refresh(query) 

    await asyncio.sleep(60)


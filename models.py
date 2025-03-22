from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True)
  first_name = Column(String, nullable=False)
  last_name = Column(String, nullable=False)
  username = Column(String, unique=True, nullable=False)
  email = Column(String, unique=True, nullable=False)
  hashed_password = Column(String, nullable=False)
  last_login = Column(DateTime, default=datetime.utcnow)
  credits_remaining = Column(Integer, default=0)
  plan_subscribed_to = Column(String, nullable=True)

  transactions = relationship("CreditsTransaction", back_populates="user")
  queues = relationship("Queue", back_populates="user")
  chats = relationship("Chat", back_populates="user")
  notifications = relationship("Notification", back_populates="user")
  airesponses = relationship("AIResponse", back_populates="user")


class Admin(Base):
  __tablename__ = "admins"

  id = Column(Integer, primary_key=True, index=True)
  username = Column(String, unique=True, nullable=False)
  email = Column(String, unique=True, nullable=False)
  role = Column(String, unique=True, nullable=False)


class Credit(Base):
  __tablename__ = "credits"

  id = Column(Integer, primary_key=True, index=True)
  plan = Column(String, nullable=True)
  amount = Column(Float, nullable=False)
  benefits = Column(String, nullable=True)


class CreditsTransaction(Base):
  __tablename__ = "credits_transaction"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id")) 
  plan_bought = Column(String, nullable=False)
  date_purchased = Column(DateTime, default=datetime.utcnow)
  amount = Column(Float, nullable=False)

  user = relationship("User", back_populates="transactions")


class Queue(Base):
  __tablename__ = "user_queues"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id")) 
  queries_submitted = Column(String, nullable=False)

  user = relationship("User", back_populates="queues")


class Chat(Base):
  __tablename__ = "user_chats"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id")) 
  chat_from_user = Column(String, nullable=False)
  time_sent = Column(DateTime, default=datetime.utcnow)

  user = relationship("User", back_populates="chats")


class AIResponse(Base):
  __tablename__ = "user_airesponses"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id")) 
  response_from_ai = Column(String, nullable=False)
  time_responded = Column(DateTime, default=datetime.utcnow)

  user = relationship("User", back_populates="airesponses")


class Notification(Base):
  __tablename__ = "user_notifications"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id")) 
  status = Column(Boolean, nullable=False)
  message = Column(String, nullable=False)

  user = relationship("User", back_populates="notifications")

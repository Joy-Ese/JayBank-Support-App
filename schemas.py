from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum

class QueryResponse(BaseModel):
  message: str
  queryId: int

class AllCredits(BaseModel):
  id: int
  plan: str
  amount: float
  benefits: str
  credits: int

class MarkAsRead(BaseModel):
  message: str

class UnreadNotifactions(BaseModel):
  total_unread: int

class CreditBalance(BaseModel):
  credits: int

class VerifyStripe(BaseModel):
  message: str
  payment_status: str
  plan: str
  credits_added: int

class TotalUsers(BaseModel):
  total_users: int

class ResponseModel(BaseModel):
  status: bool
  message: str

class EncryptedRequest(BaseModel):
  encrypted_data: str

class ChatRequest(BaseModel):
  user_query: str

class CreateAdmin(BaseModel):
  username: str = Field(..., example="Jane")
  email: EmailStr = Field(..., example="janedoe123")
  role: str = Field(..., example="Admin or Support")

class CreateUser(BaseModel):
  first_name: str = Field(..., example="Jane")
  last_name: str = Field(..., example="Doe")
  username: str = Field(..., example="janedoe123")
  email: EmailStr = Field(..., example="jane.doe@example.com")
  password: str = Field(..., example="strongpassword123")

class UserLogin(BaseModel):
  username: str = Field(..., example="janedoe123")
  password: str = Field(..., example="strongpassword123")

class UserResponse(BaseModel):
  id: int
  first_name: str
  username: str
  email: str
  credits_remaining: int
  plan_subscribed_to: str
  role: str

  class Config:
    schema_extra = {
      "example": 
      {
        "id": 1,
        "first_name": "Jane",
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "credits_remaining": 1,
        "plan_subscribed_to": "Example",
        "role": "User"
      }
    }

class NotificationStatus(str, Enum):
  unread = "unread"
  read = "read"

class AdminResponse(BaseModel):
  id: int
  username: str
  email: str
  role: str

  class Config:
    schema_extra = {
      "example": 
      {
        "id": 1,
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "role": "User"
      }
    }



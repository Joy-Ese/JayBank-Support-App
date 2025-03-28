from pydantic import BaseModel, EmailStr

class EncryptedRequest(BaseModel):
  encrypted_data: str

# class ResponseModel(BaseModel):
#   status: bool
#   message: str

class ChatRequest(BaseModel):
  user_query: str

class CreateAdmin(BaseModel):
  username: str
  email: EmailStr
  role: str

class CreateUser(BaseModel):
  first_name: str
  last_name: str
  username: str
  email: EmailStr
  password: str

class UserLogin(BaseModel):
  username: str
  password: str

class GetUserResp(BaseModel):
  first_name: str
  username: str
  email: EmailStr
  credits_remaining: int
  plan_subscribed_to: str
  role: str

  # class Config:
  #   from_attributes = True

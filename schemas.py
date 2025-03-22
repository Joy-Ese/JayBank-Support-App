from pydantic import BaseModel, EmailStr

class ResponseModel(BaseModel):
  status: bool
  message: str

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
  last_name: str
  username: str
  email: EmailStr

  class Config:
    from_attributes = True

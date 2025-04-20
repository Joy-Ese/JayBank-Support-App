from datetime import datetime, timedelta
from fastapi import HTTPException
from jose import JWTError, jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
  """
  Accepts user object and generates a jwt token with user data as claims.

  Args:
    data (dict): User data.

  Returns:
    str: Encoded jwt string.
  """

  to_encode = data.copy()
  expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
  """
  Accepts jwt string.

  Args:
    token (str): User data encoded as a jwt string.

  Returns:
    dict: Decoded jwt payload.
  """

  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload
  except JWTError:
    raise HTTPException(status_code=401, detail="Invalid token")

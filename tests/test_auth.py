import pytest
from httpx import AsyncClient
from tests.utils import encrypt_payload
from sqlalchemy.orm import Session
import models
from dependencies import hash_password, verify_password
from encryption import decrypt_data

@pytest.mark.asyncio
async def test_register_user(client_factory, db_session):
  # Create default Free plan in test DB
  db_session.add(models.Credit(
    id=1,
    plan="Free",
    amount=0.0,
    benefits="20 AI Support Credits. Email Support.",
    credits=20
  ))
  db_session.commit()

  payload = {
    "first_name": "Test",
    "last_name": "User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }

  # Create and use a client
  async for client in client_factory():
    response = await client.post("/auth/register", json=encrypt_payload(payload))
    assert response.status_code == 200
    
    encrypted_response = response.json()["data"]
    decrypted_response = decrypt_data(encrypted_response)
    print(response.status_code)
    print(response.json())
    assert decrypted_response["status"] is True
    assert decrypted_response["message"] == "Registration successful"


@pytest.mark.asyncio
async def test_login_user(client_factory, db_session):
  # Add test user manually with hashed password
  test_user = models.User(
    first_name="Login",
    last_name="User",
    username="loginuser",
    email="loginuser@example.com",
    hashed_password=hash_password("TestPass123"),
    credits_remaining=20,
    plan_subscribed_to="Free",
    role="User"
  )
  db_session.add(test_user)
  db_session.commit()

  login_payload = {
    "username": "loginuser",
    "password": "TestPass123"
  }

# Create and use a client
  async for client in client_factory():
    response = await client.post("/auth/login", json=encrypt_payload(login_payload))
    assert response.status_code == 200
    
    encrypted_response = response.json()["data"]
    decrypted_response = decrypt_data(encrypted_response)
    print(response.status_code)
    print(response.json())
    assert "access_token" in decrypted_response
    assert decrypted_response["role"] == "User"


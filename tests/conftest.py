import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from fastapi.testclient import TestClient
from main import app
from database import Base, get_db

# Test database URL
TEST_DATABASE_URL = "postgresql://postgres:Joyeseosa@localhost:5432/JBTestDB"

# Create test engine
test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Set up the database once at the beginning of the test session
@pytest.fixture(scope="session", autouse=True)
def setup_db():
  Base.metadata.drop_all(bind=test_engine)
  Base.metadata.create_all(bind=test_engine)
  yield
  Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
  """Creates a new database session for each test."""
  connection = test_engine.connect()
  transaction = connection.begin()
  session = TestingSessionLocal(bind=connection)
  
  yield session
  
  session.close()
  transaction.rollback()
  connection.close()

# This is the key fixture - it needs to return a function
@pytest.fixture
def override_get_db(db_session):
  """Returns a function that will be used to override the get_db dependency."""
  def _override_get_db():
    try:
      yield db_session
    finally:
      pass
  return _override_get_db

# Use a separate client_factory fixture that returns an async function
# @pytest.fixture
# def client_factory(override_get_db):
#   """Returns a factory function for creating AsyncClient instances."""
#   app.dependency_overrides[get_db] = override_get_db
  
#   # Return an async factory function
#   async def create_client():
#     async with AsyncClient(app=app, base_url="http://test") as client:
#       yield client
  
#   yield create_client
  
#   # Clean up after testing
#   app.dependency_overrides.clear()


@pytest.fixture
def client_factory(override_get_db):
  """Returns a factory function for creating AsyncClient instances."""
  app.dependency_overrides[get_db] = override_get_db

  async def create_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
      yield client

  yield create_client

  app.dependency_overrides.clear()
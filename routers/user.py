from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def test_user():
  return {"message": "User Management works!"}

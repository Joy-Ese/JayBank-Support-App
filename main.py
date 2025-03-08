from fastapi import FastAPI

app = FastAPI(title="JayBank Customer Support API")


@app.get("/")
async def root():
  return {"message": "Hello World"}
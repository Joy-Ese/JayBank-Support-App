from fastapi import HTTPException
import httpx

# Adding Mistral API Key
MISTRAL_API_KEY = "t65ouezXOnafMSBROYnuzprd4nKM3w1o"

# Mistral API endpoint
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
HEADERS = {
  "Authorization": f"Bearer {MISTRAL_API_KEY}",
  "Content-Type": "application/json"
}

# Add function to call Mistral AI asynchronously
async def query_mistral(user_query: str) -> str:
  """
  Sends a user's query to Mistral AI and retrieves the response from the AI.

  Args:
    user_query (str): The text query from the user.

  Returns:
    str: The AI-generated response.
  """

  # Check if API key is available
  if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY is not set.")

  # Define the request payload
  payload = {
    "model": "mistral-small",
    "messages": [
      {
        "role": "system",
        "content": (
          "You are JB, a professional virtual assistant for a financial institution."
          "You provide support to users on banking services including transactions, account issues, and digital banking queries."
          "Always prioritize user privacy, avoid speculation, and never ask for sensitive information such as PINs or card details."
          "Always respond as if you're assisting a real banking customer."
          "Never share personal data. Do not perform financial transactions."
        )
      },
      {"role": "user", "content": user_query}
    ],
    "temperature": 0.5,
    "max_tokens": 300,  # Limit response length
  }

  if "account number" in user_query.lower():
    return "For security reasons, I can't discuss sensitive information like account numbers. Please contact a bank representative."

  try:
    # Make asynchronous HTTP request to Mistral API
    async with httpx.AsyncClient(timeout=30.0) as client:
      response = await client.post(
        MISTRAL_API_URL,
        headers=HEADERS,
        json=payload
      )
      response.raise_for_status()

    response_data = response.json()
    print("Mistral API Response:", response_data)

    if "choices" not in response_data:
      raise HTTPException(status_code=500, detail="Invalid response from Mistral AI")

    choices = response_data.get("choices")
    if not choices:
      raise HTTPException(status_code=500, detail="No choices returned by Mistral AI.")

    if "error" in response_data:
      raise ValueError(f"Mistral API Error: {response_data['error']['message']}")

    # Extract AI response
    ai_response_text = choices[0]["message"]["content"]
    return ai_response_text

  except httpx.RequestError as e:
    raise ValueError(f"Error connecting to Mistral API: {str(e)}")


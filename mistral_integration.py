from fastapi import HTTPException
import requests

# Adding Mistral API Key
MISTRAL_API_KEY = "t65ouezXOnafMSBROYnuzprd4nKM3w1o"

# Mistral API endpoint
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
HEADERS = {
  "Authorization": f"Bearer {MISTRAL_API_KEY}",
  "Content-Type": "application/json"
}

# Add function to call Mistral AI
def query_mistral(user_query: str) -> str:
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
    "messages": [{"role": "user", "content": user_query}],
    "temperature": 0.7,
    "max_tokens": 200,  # Limit response length
  }

  try:
    # API request
    response = requests.post(MISTRAL_API_URL, headers=HEADERS, json=payload)
    response_data = response.json()
    print("Mistral API Response:", response_data)

    if "choices" not in response_data:
      raise HTTPException(status_code=500, detail="Error from Mistral AI")

    # Check for API errors
    if "error" in response_data:
      raise ValueError(f"Mistral API Error: {response_data['error']['message']}")

    # Extract AI response
    ai_response_text = response_data["choices"][0]["message"]["content"]
    return ai_response_text

  except requests.exceptions.RequestException as e:
    raise ValueError(f"Error connecting to Mistral API: {str(e)}")



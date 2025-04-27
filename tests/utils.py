import json
from encryption import encrypt_data


def encrypt_payload(payload: dict) -> dict:
  json_payload = json.dumps(payload)
  encrypted = encrypt_data(json_payload)
  return {"encrypted_data": encrypted}

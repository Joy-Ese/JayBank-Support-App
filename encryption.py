from Crypto.Cipher import AES
import base64
import os

# AES Key & IV
SECRET_KEY = os.getenv("AES_SECRET_KEY", "1234567890123456")
IV = os.getenv("AES_IV", "1234567890123456")

def pad(data):
  """Pad data to be multiple of 16 bytes."""
  return data + (16 - len(data) % 16) * chr(16 - len(data) % 16)

def unpad(data):
  """Remove padding."""
  return data[:-ord(data[-1])]

def encrypt_data(data: str) -> str:
  """Encrypt data using AES."""
  cipher = AES.new(SECRET_KEY.encode(), AES.MODE_CBC, IV.encode())
  encrypted = cipher.encrypt(pad(data).encode())
  return base64.b64encode(encrypted).decode()

def decrypt_data(encrypted_data: str) -> str:
  """Decrypt data using AES."""
  cipher = AES.new(SECRET_KEY.encode(), AES.MODE_CBC, IV.encode())
  decrypted = cipher.decrypt(base64.b64decode(encrypted_data))
  return unpad(decrypted.decode())

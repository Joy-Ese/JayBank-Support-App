from Crypto.Cipher import AES
import base64
import json

SECRET_KEY = "your-very-32-byte-secret-key!!!!"
IV = "1234567890123456"

def encrypt_data(data):
  """Encrypt data with AES-CBC and Base64 encode it."""
  cipher = AES.new(SECRET_KEY.encode(), AES.MODE_CBC, IV.encode())
  json_data = json.dumps(data)
  
  # Padding to make data length a multiple of 16
  padding_length = 16 - (len(json_data) % 16)
  padded_data = json_data + (chr(padding_length) * padding_length)

  encrypted_bytes = cipher.encrypt(padded_data.encode())
  return base64.b64encode(encrypted_bytes).decode()

def decrypt_data(encrypted_data):
  """Decrypt Base64-encoded AES-CBC encrypted data."""
  try:
    cipher = AES.new(SECRET_KEY.encode(), AES.MODE_CBC, IV.encode())
    encrypted_bytes = base64.b64decode(encrypted_data)
    decrypted_bytes = cipher.decrypt(encrypted_bytes)

    # Remove padding
    padding_length = decrypted_bytes[-1]
    unpadded_data = decrypted_bytes[:-padding_length].decode()
    
    return json.loads(unpadded_data)
  except Exception as e:
    raise ValueError(f"Cannot decrypt: {str(e)}")


test_data = {"message": "Hello, world!"}
encrypted = encrypt_data(test_data)
print("🔐 Encrypted:", encrypted)

decrypted = decrypt_data(encrypted)
print("🔓 Decrypted:", decrypted)



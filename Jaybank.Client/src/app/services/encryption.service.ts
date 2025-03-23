import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = "your-very-32-byte-secret-key!!!!"
const IV = "1234567890123456"

@Injectable({
  providedIn: 'root',
})

export class EncryptionService {

  encrypt(data: any): string {
    const jsonData = JSON.stringify(data);
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(IV);
  
    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
  
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64); // ✅ Encode as Base64
  }

  decrypt(encryptedData: string): any {
    if (!encryptedData) {
      console.error("Received empty encrypted data");
      return null;
    }

    try {
      const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
      const iv = CryptoJS.enc.Utf8.parse(IV);

      const bytes = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        console.error("Decryption failed: Empty string");
        return null;
      }

      try {
        return JSON.parse(decryptedText); // Return as JSON if possible
      } catch (jsonError) {
        return decryptedText; // If not JSON, return raw string
      }
    } catch (error) {
      console.error("Error decrypting response:", error);
      return null;
    }
  }

}

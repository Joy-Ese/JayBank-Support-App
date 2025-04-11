import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface ChatMessage {
  chat_from_user?: string;  // User message
  response_from_ai?: string; // AI response
  time_sent?: string; // Only for user messages
  time_responded?: string; // Only for AI messages
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  baseUrl : string = "http://127.0.0.1:8000";

  constructor(
    private http: HttpClient,
  ) { }

  sendUserMessage(user_query: string, token: string | null): Observable<ChatMessage> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/chat/query`, { user_query }, {headers: headers});
  }

  getUserChatHistory(token: string | null): Observable<ChatMessage[]> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.get<any>(`${this.baseUrl}/chat/user-chats`, {headers: headers});
  }

  getAIChatHistory(token: string | null): Observable<ChatMessage[]> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.get<any>(`${this.baseUrl}/chat/ai-responses`, {headers: headers});
  }

}

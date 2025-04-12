import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

interface ChatMessage {
  chat_from_user?: string;
  response_from_ai?: string;
  query_id?: number;
  status?: 'pending' | 'processing' | 'completed';
  time_sent?: string;
  time_responded?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  baseUrl : string = "http://127.0.0.1:8000";

  constructor(
    private http: HttpClient,
  ) { }

  // getUserChatHistory(token: string | null): Observable<ChatMessage[]> {
  //   const headers = new HttpHeaders({
  //     "Content-Type": "application/json",
  //     "Authorization": `Bearer ${token}`
  //   });
  //   return this.http.get<any>(`${this.baseUrl}/chat/user-chats`, {headers: headers});
  // }

  // getAIChatHistory(token: string | null): Observable<ChatMessage[]> {
  //   const headers = new HttpHeaders({
  //     "Content-Type": "application/json",
  //     "Authorization": `Bearer ${token}`
  //   });
  //   return this.http.get<any>(`${this.baseUrl}/chat/ai-responses`, {headers: headers});
  // }



  // Send user query and get the response
  submitUserQuestion(user_query: string, token: string | null): Observable<{ message: string, queryId: number }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/chat/query`, { user_query }, {headers: headers})
    .pipe(
      map(res => ({ message: res.message, queryId: res.queryId }))
    );
  }

  // Check Queue status
  getQueueStatus(query_id: number, token: string | null): Observable<string> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.get<{ status: string }>(`${this.baseUrl}/chat/query/status/${query_id}`, {headers: headers})
    .pipe(
      map(res => res.status)
    );
  }

  // Get AI response
  getAIResponseByQueryId(query_id: number, token: string | null): Observable<{ response: string, time: Date }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.get<{ response: string, time: Date }>(`${this.baseUrl}/chat/ai_response/${query_id}`, {headers: headers})
    .pipe(
      map(res => ({ response: res.response, time: res.time }))
    );
  }



}

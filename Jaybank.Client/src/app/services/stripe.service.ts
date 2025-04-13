import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  baseUrl : string = "http://127.0.0.1:8000";

  constructor(private http: HttpClient) { }

  createCheckoutSession(plan: string, token: string | null): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });

    return this.http.post<any>(`${this.baseUrl}/credit/create-checkout-session?plan=${plan}`, null, {headers: headers});
  }

  verifySession(sessionId: string, token: string | null): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });

    return this.http.get<any>(`${this.baseUrl}/credit/verify-session?session_id=${sessionId}`, {headers: headers});
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface Notification {
  id: number;
  message: string;
  status: string;
  time_stamp: Date;
}

interface UnreadNotificationResponse {
  total_unread: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  baseUrl : string = "http://127.0.0.1:8000";

  constructor(private http: HttpClient) {}

  fetchUnreadNotifications(token: string | null): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}/notification/unread`, {headers: headers});
  }

  fetchUnreadNotificationsCount(token: string | null): Observable<UnreadNotificationResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
    return this.http.get<UnreadNotificationResponse>(`${this.baseUrl}/notification/unread-count`, {headers: headers});
  }

  getNotifications(page: number, limit: number, token: string | null): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });

    return this.http.get<any>(`${this.baseUrl}/notification/all?page=${page}&limit=${limit}`, {headers: headers});
  }

  markAsRead(id: number, token: string | null): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/notification/${id}/mark-read`, null, {headers: headers});
  }

  


}

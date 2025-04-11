import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy{
  private toastr = inject(ToastrService);
  latestNotificationTime: string = "";

  userName: string | null = null;
  role: string | null = null;
  token: string | null = null;

  notifications: any[] = [];
  pollingInterval: any;
  notificationSub?: Subscription;

  page = 1;
  limit = 10;

  hasUnread: boolean = false;

  unreadNotificationsCount = 0;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) { }
  
  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.token = this.authService.getToken();

      this.userName = localStorage.getItem("userId");
      this.role = localStorage.getItem("role");

      this.unreadNotificationsCounting();

      // Subscribe to keep polling for updated notifications
      this.startPolling();
    } else {
      console.warn('localStorage is not available.');
    }
  }

  // polling here to constantly fetch the number of unread notifications
  startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.notificationSub = this.notificationService.getNotifications(this.page, this.limit, this.token)
      .subscribe({
        next: (data) => {
          this.notifications = data.data || [];
          this.unreadNotificationsCounting();

          // Get the latest timestamp from new notifications
          const latestServerTime = this.notifications.length ? this.notifications[0].time_stamp: "";

          // Check if the latest server time is newer than what we had before
          if (
            latestServerTime &&
            latestServerTime !== this.latestNotificationTime
          ) {
            this.toastr.info("🔔 You have a new notification!", "Notification");
            this.latestNotificationTime = latestServerTime;
          }

          console.log("Just checking if there's any new notification");
        },
        error: (err) => {
          console.error("Failed to fetch notifications:", err);
        }
      });
    }, 10000); // every 10 seconds
  }

  unreadNotificationsCounting() {
    this.notificationService.fetchUnreadNotificationsCount(this.token).subscribe({
      next: (response) => {
        console.log(response);
        this.hasUnread = response.total_unread > 0;
        this.unreadNotificationsCount = response.total_unread
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.hasUnread = false;
      }
    });
  }

  logout() {
    this.authService.logoutUser();
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }

}

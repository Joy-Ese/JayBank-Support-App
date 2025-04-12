import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  message: string;
  status: string;
  time_stamp: Date;
}

interface UnreadNotificationResponse {
  total_unread: number;
}

@Component({
  selector: 'app-nootifications',
  imports: [
    CommonModule,
  ],
  templateUrl: './nootifications.component.html',
  styleUrl: './nootifications.component.css'
})
export class NootificationsComponent implements OnInit, OnDestroy{
  private toastr = inject(ToastrService);
  latestNotificationTime: string = "";

  hasUnread: boolean = false;

  page = 1;
  limit = 10;

  notifications: any[] = [];
  pollingInterval: any;
  notificationSub?: Subscription;

  token: string | null = null;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.token = this.authService.getToken();
      // Subscribe to get the number of unread notifications
      this.notificationService.fetchUnreadNotificationsCount(this.token).subscribe({
        next: (response) => {
          this.hasUnread = response.total_unread > 0;
        },
        error: (error) => {
          console.error('Error fetching notifications:', error);
          this.hasUnread = false;
        }
      });

      this.loadNotifications();

      // Subscribe to keep polling all notifications
      this.startPolling();
    } else {
      console.warn('localStorage is not available.');
    }
  }

  startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.notificationSub = this.notificationService.getNotifications(this.page, this.limit, this.token)
      .subscribe({
        next: (data) => {
          this.loadNotifications();

          // Get the latest timestamp from new notifications
          const latestServerTime = this.notifications.length ? this.notifications[0].time_stamp: "";

          // Check if the latest server time is newer than what we had before
          if (
            latestServerTime &&
            latestServerTime !== this.latestNotificationTime
          ) {
            this.toastr.info("🔔 We've updated your list of notifications!", "Notification");
            this.latestNotificationTime = latestServerTime;
          }

          console.log("Just checking to update notifications list");
        },
        error: (err) => {
          console.error("Failed to fetch notifications:", err);
        }
      });
    }, 10000); // every 10 seconds
  }

  loadNotifications() {
    this.notificationService.getNotifications(this.page, this.limit, this.token).subscribe(data => {
      this.notifications = data.data;
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id, this.token).subscribe((data) => {
      console.log(data)
      this.toastr.success(`${data.message}`, 'Success');
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });
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

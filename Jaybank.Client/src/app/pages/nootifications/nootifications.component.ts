import { Component } from '@angular/core';

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  type: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-nootifications',
  imports: [],
  templateUrl: './nootifications.component.html',
  styleUrl: './nootifications.component.css'
})
export class NootificationsComponent {
  notifications: Notification[] = [];

  ngOnInit() {
    // Simulate fetching notifications
    this.notifications = [
      {
        id: 1,
        title: 'Query Completed',
        message: 'Your AI-powered support request has been processed successfully.',
        timestamp: new Date(),
        type: 'success'
      },
      {
        id: 2,
        title: 'Credit Balance Low',
        message: 'You\'re running low on AI support credits.',
        timestamp: new Date(),
        type: 'warning'
      }
    ];
  }

  clearNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}

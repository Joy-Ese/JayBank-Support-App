import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: any;
  responseBody?: any;
}

@Component({
  selector: 'app-api-design',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  templateUrl: './api-design.component.html',
  styleUrl: './api-design.component.css'
})
export class ApiDesignComponent {

  apiEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/api/chat/start',
      description: 'Initialize a new chat session',
      requestBody: {
        userId: 'string',
        topic: 'string'
      },
      responseBody: {
        chatSessionId: 'string',
        status: 'success'
      }
    },
    {
      method: 'POST',
      path: '/api/chat/message',
      description: 'Send a message in an active chat session',
      requestBody: {
        chatSessionId: 'string',
        message: 'string',
        userId: 'string'
      },
      responseBody: {
        messageId: 'string',
        aiResponse: 'string'
      }
    },
    {
      method: 'POST',
      path: '/api/chat/end',
      description: 'End an active chat session',
      requestBody: {
        chatSessionId: 'string',
        userId: 'string'
      },
      responseBody: {
        status: 'success',
        transcript: 'string[]'
      }
    }
  ];

  displayedColumns: string[] = ['method', 'path', 'description'];
  dataSource: MatTableDataSource<ApiEndpoint>;

  constructor() {
    this.dataSource = new MatTableDataSource(this.apiEndpoints);
  }

  getMethodColor(method: string): string {
    switch(method) {
      case 'GET': return 'primary';
      case 'POST': return 'accent';
      case 'PUT': return 'warn';
      case 'DELETE': return 'error';
      default: return 'basic';
    }
  }

}

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: any;
  queryParam?: any;
  responseBody?: any;
}

@Component({
  selector: 'app-api-design',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  templateUrl: './api-design.component.html',
  styleUrl: './api-design.component.css'
})
export class ApiDesignComponent implements AfterViewInit{

  apiEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/auth/register',
      description: 'Register a new user',
      requestBody: {
        "first_name": "Jane",
        "last_name": "Doe",
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "password": "strongpassword123"
      },
      responseBody: {
        "status": "True", 
        "message": "Registration successful"
      }
    },
    {
      method: 'POST',
      path: '/auth/login',
      description: 'Authenticate registered user',
      requestBody: {
        "username": "janedoe",
        "password": "strongpassword123"
      },
      responseBody: {
        "access_token": "token", 
        "role": "role"
      }
    },
    {
      method: 'POST',
      path: '/chat/query',
      description: 'Sends a user query to the queue for processing',
      requestBody: {
        "user_query": "str"
      },
      responseBody: {
        "message": "Your query is in the queue for processing.", 
        "queryId": "int"
      }
    },
    {
      method: 'GET',
      path: '/chat/query/status/{query_id}',
      description: 'Fetches query status in the queue for frontend polling',
      queryParam: {
        "query_id": "int"
      },
      responseBody: {
        "status": "query.status"
      }
    },
    {
      method: 'GET',
      path: '/chat/ai_response/{query_id}',
      description: 'Fetches AI Response corresponding to the query id for frontend polling',
      queryParam: {
        "query_id": "int"
      },
      responseBody: {
        "response": "response_from_ai", 
        "time": "time_responded"
      }
    },
    {
      method: 'GET',
      path: '/chat/user-chats',
      description: 'Gets list of all chats for the logged-in user',
      responseBody: [{
        "id": "int",
        "user_id": "int",
        "chat_from_user": "str",
        "time_sent": "datetime"
      }]
    },
    {
      method: 'GET',
      path: '/chat/ai-responses',
      description: 'Gets list of all AI responses for the user logged in',
      responseBody: [{
        "id": "int",
        "user_id": "int",
        "query_id": "int",
        "response_from_ai": "str",
        "time_responded": "datetime"
      }]
    },
    {
      method: 'GET',
      path: '/user/details',
      description: 'Gets details of authenticated user',
      responseBody: {
        "id": 1,
        "first_name": "Jane",
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "credits_remaining": 1,
        "plan_subscribed_to": "Example",
        "role": "User"
      }
    },
    {
      method: 'POST',
      path: '/admin/create-admin',
      description: 'Create an Admin and assign role',
      requestBody: {
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "role": "Admin",
      },
      responseBody: {
        "id": 1,
        "username": "janedoe",
        "email": "jane.doe@example.com",
        "role": "User"
      }
    },
    {
      method: 'GET',
      path: '/notification/all',
      description: 'Gets list of notifications',
      responseBody: {
        "data": [
          {
            "id": "int",
            "user_id": "int",
            "status": "str",
            "message": "str",
            "time_stamp": "datetime"
          }
        ],
        "pagination": {
          "page": "int",
          "limit": "int",
          "totalPages": "int",
          "totalItems": "int"
        }
      }
    },
    {
      method: 'POST',
      path: '/credit/create-checkout-session',
      description: 'Initialize Stripe Payment',
      queryParam: {
        "plan": "str"
      },
      responseBody: {
        "checkout_url": "str"
      }
    },
    {
      method: 'POST',
      path: '/credit/verify-session',
      description: 'Create an Admin and assign role',
      queryParam: {
        "session_id": "str"
      },
      responseBody: {
        "message": "Payment already processed",
        "payment_status": "Paid",
        "credits": 50,
        "plan": "Starter"
      }
    }
  ];

  displayedColumns: string[] = ['method', 'path', 'description'];
  dataSource: MatTableDataSource<ApiEndpoint>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 3;
  currentPage = 0;

  constructor() {
    this.dataSource = new MatTableDataSource(this.apiEndpoints);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // Pagination logic for expansion panels
  get paginatedEndpoints(): ApiEndpoint[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.apiEndpoints.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
  }

  getMethodClass(method: string): string {
    switch(method) {
      case 'GET': return 'chip-get';
      case 'POST': return 'chip-post';
      case 'PUT': return 'chip-put';
      case 'DELETE': return 'chip-delete';
      default: return 'chip-default';
    }
  }

}

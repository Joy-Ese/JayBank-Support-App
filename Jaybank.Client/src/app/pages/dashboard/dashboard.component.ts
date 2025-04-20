import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface AdminDetails {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface UserStatistic {
  metric: string;
  count: number;
  percentage: number;
}

interface TotalUsers {
  total_users: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  baseUrl : string = "http://127.0.0.1:8000";

  token: string | null = null;

  adminDetails: AdminDetails = {} as AdminDetails;

  // User statistics
  totalUsers!: number;
  purchasedCreditUsers!: number;
  lowCreditUsers!: number;

  // Table data
  displayedColumns: string[] = ['metric', 'count', 'percentage'];
  dataSource!: MatTableDataSource<UserStatistic>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.token = this.authService.getToken();

      this.getAllUserStats(); // use forkJoin to wait for all responses
      this.getAdminDetails();
    }
  }

  initializeTableData() {
    const userStats: UserStatistic[] = [
      {
        metric: 'Total Users',
        count: this.totalUsers,
        percentage: 100
      },
      {
        metric: 'Users with Purchased Credits',
        count: this.purchasedCreditUsers,
        percentage: (this.purchasedCreditUsers / this.totalUsers) * 100
      },
      {
        metric: 'Users with Low Credits',
        count: this.lowCreditUsers,
        percentage: (this.lowCreditUsers / this.totalUsers) * 100
      }
    ];

    this.dataSource = new MatTableDataSource(userStats);
    this.dataSource.paginator = this.paginator;
  }

  getAllUserStats() {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`
    });
  
    const totalUsers$ = this.http.get<TotalUsers>(`${this.baseUrl}/admin/total-users`, { headers });
    const purchasedCreditUsers$ = this.http.get<TotalUsers>(`${this.baseUrl}/admin/users-purchased-credits`, { headers });
    const lowCreditUsers$ = this.http.get<TotalUsers>(`${this.baseUrl}/admin/users-low-credits`, { headers });
  
    forkJoin([totalUsers$, purchasedCreditUsers$, lowCreditUsers$]).subscribe({
      next: ([total, purchased, low]) => {
        this.totalUsers = total.total_users;
        this.purchasedCreditUsers = purchased.total_users;
        this.lowCreditUsers = low.total_users;
  
        this.initializeTableData();
      },
      error: (err) => console.log(err)
    });
  }

  getAdminDetails() {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`
    });

    this.http.get<any>(`${this.baseUrl}/admin/details`, {headers: headers})
    .subscribe({
      next: (res) => {
        console.log(res);
        this.adminDetails = res;
        localStorage.setItem("adminDetails", JSON.stringify(res));
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

}

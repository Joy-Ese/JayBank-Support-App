import { AfterViewInit, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

interface UserStatistic {
  metric: string;
  count: number;
  percentage: number;
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
export class DashboardComponent implements AfterViewInit  {

  // User statistics
  totalUsers = 1024;
  purchasedCreditUsers = 456;
  lowCreditUsers = 78;
  activeChats = 24;

  // Chart references
  userChart!: Chart;
  creditChart!: Chart;

  // Table data
  displayedColumns: string[] = ['metric', 'count', 'percentage'];
  dataSource!: MatTableDataSource<UserStatistic>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    this.initializeTableData();

    if (isPlatformBrowser(this.platformId)) { 
      this.createUserChart();
      this.createCreditChart();
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
      },
      {
        metric: 'Active Chats',
        count: this.activeChats,
        percentage: (this.activeChats / this.totalUsers) * 100
      }
    ];

    this.dataSource = new MatTableDataSource(userStats);
    this.dataSource.paginator = this.paginator;
  }

  createUserChart() {
    const ctx = document.getElementById('userChart') as HTMLCanvasElement;
    this.userChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Total Users', 'Purchased Credit Users', 'Low Credit Users', 'Active Chats'],
        datasets: [{
          data: [this.totalUsers, this.purchasedCreditUsers, this.lowCreditUsers, this.activeChats],
          backgroundColor: ['#DB7093', '#003366', '#6699CC', '#336699']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'User Statistics'
          }
        }
      }
    });
  }

  createCreditChart() {
    const ctx = document.getElementById('creditChart') as HTMLCanvasElement;
    this.creditChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Users', 'Purchased Credit Users', 'Low Credit Users'],
        datasets: [{
          label: 'User Credit Distribution',
          data: [this.totalUsers, this.purchasedCreditUsers, this.lowCreditUsers],
          backgroundColor: ['#DB7093', '#003366', '#6699CC']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Credit Distribution'
          }
        }
      }
    });
  }

}

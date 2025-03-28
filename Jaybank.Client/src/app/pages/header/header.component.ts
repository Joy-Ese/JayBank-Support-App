import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  userName: string | null = null;
  role: string | null = null;

  constructor(public authService: AuthService) { }
  
  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.userName = localStorage.getItem("userId");
      this.role = localStorage.getItem("role");
      console.log(this.userName);
    } else {
      console.warn('localStorage is not available.');
    }
  }

  logout() {
    this.authService.logoutUser();
  }

}

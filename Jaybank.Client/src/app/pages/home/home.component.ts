import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface UserDetails {
  id: number;
  first_name: string;
  username: string;
  email: string;
  credits_remaining: number;
  plan_subscribed_to: string;
  role: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  isAuthenticated: boolean = false;

  token: string | null = null;

  userDetails: UserDetails = {} as UserDetails;

  constructor(
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.token = this.authService.getToken();

      const userDetailsString = localStorage.getItem('userDetails');
      if (userDetailsString) {
        this.userDetails = JSON.parse(userDetailsString);
      }
    } else {
      console.warn('localStorage is not available.');
    }
  }



}

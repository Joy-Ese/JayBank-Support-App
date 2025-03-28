import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  // Check if user is logged in
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token; // Returns true if token exists
  }

  getToken(): string | null {
    return localStorage.getItem("token"); // Retrieve token from localStorage
  }

  getRole(): string | null {
    return localStorage.getItem("role"); // Retrieve role from localStorage
  }

  // Keep token saved after login
  saveToken(token: string): void {
    localStorage.setItem("token", token);
  }

  isUser(): boolean {
    return this.getRole() === "User";
  }

  isAdmin(): boolean {
    return this.getRole() === "Admin";
  }

  logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("loginResp");
    localStorage.removeItem("userDetails");
    var userId = localStorage.getItem("userId");
    localStorage.clear();
    this.router.navigate(['/login']);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }

}

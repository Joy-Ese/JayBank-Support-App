import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  getToken(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem("token"); // Retrieve token from localStorage
    }
    return null;
  }

  getRole(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem("role"); // Retrieve role from localStorage
    }
    return null;
  }

  // Keep token saved after login
  saveToken(token: string): void {
    localStorage.setItem("token", token);
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!this.getToken(); // Returns true if token exists
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
    localStorage.clear();
    this.router.navigate(['/login']);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }

}

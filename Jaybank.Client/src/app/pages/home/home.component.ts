import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StripeService } from '../../services/stripe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  baseUrl : string = "http://127.0.0.1:8000";
  private toastr = inject(ToastrService);

  sessionId: string | null = null;
  isAuthenticated: boolean = false;
  token: string | null = null;
  userDetails: UserDetails = {} as UserDetails;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    public stripeService: StripeService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.refreshAuth(); // ⬅️ Centralized auth refresh


      // Listen for session_id in query params
      this.route.queryParams.subscribe(params => {
        if (params['session_id']) {
          this.sessionId = params['session_id'];
          this.verifySession();
        }
      });
    }
  }

  // 🔁 Refresh auth state from localStorage
  refreshAuth(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.token = this.authService.getToken();

    const userDetailsString = localStorage.getItem('userDetails');
    if (userDetailsString) {
      this.userDetails = JSON.parse(userDetailsString);
    }
  }


  // ✅ Verify Stripe payment and update UI
  verifySession(): void {
    if (this.sessionId && this.token) {
      this.stripeService.verifySession(this.sessionId, this.token).subscribe({
        next: (response) => {
          console.log('Payment verified successfully:', response);
          if (response.payment_status === "paid") {
            this.toastr.success(`${response.message}`);

            // ✅ Update localStorage with fresh user data
            const headers = new HttpHeaders({
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.token}`
            });

            this.http.get<any>(`${this.baseUrl}/user/details`, {headers: headers})
            .subscribe({
              next: (res) => {
                localStorage.setItem("userDetails", JSON.stringify(res));
                localStorage.setItem("userId", res.username);
              },
              error: (err) => {
                console.log(err);
              }
            });

            // 🔁 Refresh UI without reload
            this.refreshAuth();

            // ✅ Clean session_id from the URL
            this.router.navigate([], {
              queryParams: {
                session_id: null
              },
              queryParamsHandling: 'merge'
            });
          }
        },
        error: (err) => {
          console.error('Error verifying payment session', err);
          this.toastr.error("Could not verify payment session.");
        }
      });
    }
  }




}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StripeService } from '../../services/stripe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

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
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    public stripeService: StripeService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      // First load user details 
      this.refreshAuth();


      // Then check for session_id
      this.route.queryParams.subscribe(params => {
        if (params['session_id']) {
          this.sessionId = params['session_id'];
          this.verifySession();
        }
      });

      // Debug log to see what data we have
      console.log('Auth state:', { 
        isAuthenticated: this.isAuthenticated,
        userDetails: this.userDetails
      });

    }
  }

  // Refresh auth state from localStorage
  refreshAuth(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.token = this.authService.getToken();

    this.fetchUserDetails();
    const userDetailsString = localStorage.getItem('userDetails');
    if (userDetailsString) {
      try {
        this.userDetails = JSON.parse(userDetailsString);
        console.log('UserDetails loaded:', this.userDetails);
      } catch (e) {
        console.error('Error parsing user details:', e);
        this.userDetails = {} as UserDetails;
      }
    } else {
      console.warn('No user details found in localStorage');
    }
  }


  // Fetch fresh user data from the API
  fetchUserDetails(): void {
    if (!this.token) {
      console.warn('No token available, cannot fetch user details');
      return;
    }

    this.isLoading = true;
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`
    });

    this.http.get<any>(`${this.baseUrl}/user/details`, { headers: headers })
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection
      })
    )
    .subscribe({
      next: (res) => {
        console.log('Fetched fresh user details:', res);
        localStorage.setItem("userDetails", JSON.stringify(res));
        localStorage.setItem("userId", res.username);
        this.userDetails = res;
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
        this.toastr.error("Could not fetch user details.");
      }
    });
  }


  // Verify Stripe payment and update UI
  verifySession(): void {
    if (this.sessionId && this.token) {
      this.isLoading = true;

      this.stripeService.verifySession(this.sessionId, this.token).subscribe({
        next: (response) => {
          console.log('Payment verified successfully:', response);
          if (response.payment_status === "paid") {
            this.toastr.success(`${response.message}`);

            // Fetch fresh user data after payment verification
            this.fetchUserDetails();

            // Clean session_id from the URL
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { session_id: null },
              queryParamsHandling: 'merge'
            });
          }
        },
        error: (err) => {
          console.error('Error verifying payment session', err);
          this.toastr.error("Could not verify payment session.");
          this.isLoading = false;
        }
      });
    }
  }




}

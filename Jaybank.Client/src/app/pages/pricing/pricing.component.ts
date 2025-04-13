import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StripeService } from '../../services/stripe.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

interface PricingPlan {
  id: number;
  plan: string;
  amount: number;
  benefits: string;
  credits: number;
}

@Component({
  selector: 'app-pricing',
  imports: [
    CommonModule,
  ],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent implements OnInit{
  baseUrl : string = "http://127.0.0.1:8000";

  private toastr = inject(ToastrService);

  token: string | null = null;

  plans: PricingPlan[] = [];

  iFrameUrl!: SafeResourceUrl;
  displayIFrame: boolean = false;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    public stripeService: StripeService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.token = this.authService.getToken();

      this.fetchAllCredits();
    }
  }

  getBenefitsList(benefitsString: string): string[] {
    return benefitsString.split('.').map(item => item.trim()).filter(item => item.length > 0);
  }

  // Get list of credits
  fetchAllCredits() {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`
    });

    this.http.get<any>(`${this.baseUrl}/credit/all-credits`, {headers: headers})
    .subscribe({
      next: (res) => {
        console.log(res);
        this.plans = res;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onChoosePlan(plan: string) {
    // Show loading state
    const loadingMessage = "Redirecting to checkout...";
    this.toastr.info(loadingMessage);

    this.stripeService.createCheckoutSession(plan, this.token).subscribe({
      next: (response) => {
        if (response.checkout_url) {
          // Notify user they're being redirected
          this.toastr.success("Opening Stripe checkout...");

          // Open in the same tab instead of a new one - this will effectively replace the current page
          window.location.href = response.checkout_url;

          // OR: open in new tab but show a toastr to user to make it clear that user can close this tab
          // window.open(response.checkout_url, '_blank');
        } else {
          this.toastr.error('No checkout URL received.');
        }
      },
      error: (err) => {
        console.error('Error creating checkout session', err);
      }
    });
  }

}

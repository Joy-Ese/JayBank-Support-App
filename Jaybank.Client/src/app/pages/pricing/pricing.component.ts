import { Component } from '@angular/core';

interface PricingPlan {
  name: string;
  price: number;
  credits: number;
  features: string[];
}

@Component({
  selector: 'app-pricing',
  imports: [],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent {
  plans: PricingPlan[] = [
    {
      name: 'Starter Plan',
      price: 9.99,
      credits: 50,
      features: [
        'Basic Query Resolution',
        'Email Support',
        'Limited AI Interactions'
      ]
    },
    {
      name: 'Professional Plan',
      price: 29.99,
      credits: 200,
      features: [
        'Advanced Query Resolution',
        'Priority Support',
        'More Complex AI Interactions'
      ]
    },
    {
      name: 'Enterprise Plan',
      price: 99.99,
      credits: Infinity,
      features: [
        'Unlimited AI Support',
        '24/7 Dedicated Support',
        'Complex Query Handling'
      ]
    }
  ];

  selectPlan(plan: PricingPlan) {
    // Implement plan selection logic
    console.log(`Selected plan: ${plan.name}`);
  }
}

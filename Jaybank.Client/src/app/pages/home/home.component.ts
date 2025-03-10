import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  featuredServices = [
    {
      title: 'AI Assistance',
      description: 'Get instant support for your banking queries'
    },
    {
      title: 'Credit System',
      description: 'Flexible credits for seamless interactions'
    },
    {
      title: 'Quick Responses',
      description: 'Fast and accurate AI-powered resolutions'
    }
  ];
}

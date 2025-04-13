import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { CommonModule } from '@angular/common';
import { LoaderService } from './services/loader.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'JayBank AI Support';

  isAuthenticated: boolean = false;

  showLoader = true;

  constructor(private loaderService: LoaderService, private authService: AuthService) {
    this.loaderService.loading$.subscribe((isLoading) => {
      if (isLoading) {
        this.showLoader = true;
      } else {
        // Add a little delay so the fade-out is visible
        setTimeout(() => {
          this.showLoader = false;
        }, 600);
      }
    });
  }

  ngOnInit() {
    if (typeof window !== 'undefined' && localStorage) {
      this.isAuthenticated = this.authService.isAuthenticated();
    } else {
      console.warn('localStorage is not available.');
    }
  }

}

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loaderInterceptor } from './interceptors/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideToastr({
      closeButton: true,
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      tapToDismiss: true,
      newestOnTop: true,
      enableHtml: false
    }),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, loaderInterceptor]))
  ]
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const token = localStorage.getItem('token');

  // Clone request to attach Authorization header if available
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      const currentUrl = router.url;
      const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('/register');

      // list of polling endpoints to ignore from logout
      const pollingEndpoints = ['/chat/ai_response', '/notification'];
      const isPolling = pollingEndpoints.some(endpoint => req.url.includes(endpoint));

      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isPolling && // Don't logout if it's a polling URL
        token &&
        !isLoginPage
      ) {
        // Clear sensitive data
        localStorage.removeItem("token");
        localStorage.removeItem("loginResp");
        localStorage.removeItem("userDetails");
        localStorage.clear();

        toastr.warning('Your session has expired. Please sign in again.', 'Session Timeout');

        // Redirect and refresh
        router.navigate(['/login']);
        setTimeout(() => window.location.reload(), 300);
      }

      return throwError(() => error);
    })
  );

};

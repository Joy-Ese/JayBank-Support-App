import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // return next(req).pipe(
  //   catchError((error) => {
  //     if (error instanceof HttpErrorResponse && error.status === 401) {

  //       // Check if localStorage is available
  //       if (typeof localStorage !== 'undefined') {
  //         // Clear local storage
  //         localStorage.clear();
  //       }

  //       router.navigate(['/login']);

  //       // Show toastr message
  //       toastr.warning('Your session has expired. Please sign in again.', 'Session Timeout');

  //       // Redirect to login page
  //       // router.navigate(['/login']);
  //       toastr.success('Youh have been logged out. Please log in again.', 'Success');
  //     }

  //     return throwError(() => error);
  //   })
  // );

  return next(req).pipe(
    catchError((error) => {
      // Only handle 401 errors when a user was previously logged in
      if (error instanceof HttpErrorResponse && 
          error.status === 401 && 
          localStorage.getItem('token')) { // Only if token exists

        // Clear local storage
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem("token");
          localStorage.removeItem("loginResp");
          localStorage.removeItem("userDetails");
          localStorage.clear();
        }

        // Show only one toastr message
        toastr.warning('Your session has expired. Please sign in again.', 'Session Timeout');

        // Redirect to login page
        router.navigate(['/login']);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }

      return throwError(() => error);
    })
  );
};

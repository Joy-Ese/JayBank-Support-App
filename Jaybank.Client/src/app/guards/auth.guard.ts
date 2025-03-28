import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanMatchFn = (route, segments) => {

  const authService = inject(AuthService);

  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']); // Redirect if not authenticated
    return false;
  }

  return true;
};

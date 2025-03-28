import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const userGuard: CanMatchFn = (route, segments) => {

  const authService = inject(AuthService);

  const router = inject(Router);

  if (authService.getRole() === "User") {
    return true;
  } else {
    router.navigate(['/login']); // Redirect if not a User
    return false;
  }

};

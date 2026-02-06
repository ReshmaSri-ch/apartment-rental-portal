import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = localStorage.getItem('role');
    const allowedRole = route.data?.['role'];

    // ✅ If route does NOT require a role → allow
    if (!allowedRole) {
      return true;
    }

    // ✅ Role matches → allow
    if (role === allowedRole) {
      return true;
    }

    // ❌ Role mismatch → redirect
    this.router.navigate(['/login']);
    return false;
  }
}

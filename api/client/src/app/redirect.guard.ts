import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RedirectGuard  {
  private router = inject(Router);
  private authService = inject(AuthService);


  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      try {
        if (route.data['logout'])  await this.authService.logout();
      }
      catch(e) { console.log(e) }
      window.location.href = route.data['externalUrl'];
      return false;
  }
}
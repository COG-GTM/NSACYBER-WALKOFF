import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth/auth.service';

export const redirectGuard: CanActivateFn = async (route) => {
    const authService = inject(AuthService);
    try {
        if (route.data['logout']) await authService.logout();
    }
    catch (e) { console.log(e) }
    window.location.href = route.data['externalUrl'];
    return false;
};

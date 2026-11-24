import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { JwtInterceptor } from '@auth0/angular-jwt';


export function jwtOptionsFactory(authService: AuthService)  {
    return {
        tokenGetter: () => authService.getAccessToken(),
		disallowedRoutes: ['login', 'api/auth', 'api/auth/logout', 'api/auth/refresh']
    }
}

export function jwtTokenGetter() : string {
    return sessionStorage.getItem('access_token');
}

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const jwtInterceptor = inject(JwtInterceptor);
    if (jwtInterceptor.isAllowedDomain(req) && !jwtInterceptor.isDisallowedRoute(req) && authService.isAccessTokenExpired()) {
        return from(authService.getAccessTokenRefreshed())
            .pipe(mergeMap(() => jwtInterceptor.intercept(req, { handle: next })));
    }
    return next(req);
};

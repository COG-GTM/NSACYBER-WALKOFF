import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { UtilitiesService } from './app/utilities.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './app/auth/auth.service';
import { JwtInterceptor, JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { refreshTokenInterceptor, jwtOptionsFactory } from './app/refresh-token-interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { bootstrapApplication } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routes } from './app/routing';
import { provideRouter } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import 'codemirror/mode/meta';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/python/python';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/powershell/powershell';
import 'codemirror/mode/dockerfile/dockerfile';
import 'codemirror/addon/display/placeholder';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { MomentModule } from 'ngx-moment';
import { MainComponent } from './app/main/main.component';

document.addEventListener('DOMContentLoaded', event => {
    if (checkLoggedIn()) {
        if (environment.production) {
            enableProdMode();
        }

        bootstrapApplication(MainComponent, {
    providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(JwtModule.forRoot({
            // config: {
            // 	tokenGetter: jwtTokenGetter,
            // 	disallowedRoutes: ['login', 'api/auth', 'api/auth/logout', 'api/auth/refresh']
            // },
            jwtOptionsProvider: {
                provide: JWT_OPTIONS,
                useFactory: jwtOptionsFactory,
                deps: [AuthService]
            }
        }), NgbModule, ClipboardModule, NgxDatatableModule, OwlDateTimeModule, OwlNativeDateTimeModule, BrowserAnimationsModule, ToastrModule.forRoot({ positionClass: 'toast-bottom-right', enableHtml: true, onActivateTick: true }), CodemirrorModule, NgJsonEditorModule, MomentModule),
        UtilitiesService,
        CookieService,
        AuthService,
        JwtInterceptor,
        {
            provide: HTTP_INTERCEPTORS,
            useExisting: JwtInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi(), withInterceptors([refreshTokenInterceptor])),
        provideRouter(routes),
        provideCharts(withDefaultRegisterables())
    ]
})
            .catch(err => console.log(err));
    }
    else { location.href = 'login'; }

    function checkLoggedIn() : boolean  {
        return (environment.cookies) ? !!getCookie('refresh_token') : !!sessionStorage.getItem('refresh_token');
    }

    function getCookie(cname: string) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    };
});
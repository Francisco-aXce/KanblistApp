import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { from, Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.authService.userInfo$.pipe(
      take(1),
      switchMap((user) => user ? from(user.getIdToken()) : of(null)),
      switchMap((token) => token
        ? next.handle(request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) }))
        : next.handle(request)
      ),
    );
  }
}

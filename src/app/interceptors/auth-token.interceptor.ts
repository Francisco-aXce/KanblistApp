import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { catchError, from, Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Auth, user } from '@angular/fire/auth';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(
    private auth: Auth
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return user(this.auth).pipe(
      take(1),
      switchMap((user) => user ? from(user.getIdToken()) : of(null)),
      switchMap((token) => token
        ? next.handle(request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) }))
        : next.handle(request)
      ),
      catchError(() => next.handle(request)),
    );
  }
}

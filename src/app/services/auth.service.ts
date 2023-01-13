import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, concatMap, map, Observable, of, shareReplay, tap } from 'rxjs';
import { ManagementService, Constants } from './management.service';
import { ToastrService } from 'ngx-toastr';
import {
  signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile,
  Auth, user, signOut, getIdTokenResult,
} from '@angular/fire/auth';
import { UserData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly userInfo$: Observable<UserData | null> = user(this.auth).pipe(
    concatMap(user => user ? getIdTokenResult(user, true) : of(null)),
    map(tokenRes =>
      tokenRes
        ? ({
          claims: Object.assign(tokenRes.claims, { uid: tokenRes.claims.sub ?? 'invalid' }),
        })
        : null),
    tap((data) => {
      this.managementService.loaded = true;
      this.managementService.log('userInfo: ', data);
    }),
    catchError((error) => {
      this.managementService.error(error);
      this.logout();
      window.location.reload();
      return of(null);
    }),
    shareReplay(1),
  );

  constructor(
    private auth: Auth,
    private managementService: ManagementService,
    private router: Router,
    private toastrService: ToastrService,
  ) { }

  async loginWithEmailAndPassword(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password)
        .then((user) => this.managementService.log('user: ', user));
      this.toastrService.success('Logged in successfully!');
    } catch (error) {
      this.toastrService.error('Please check if email and password are correct', 'Login error');
      this.managementService.error(error);
    }
  }

  async loginWithGoogle() {
    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider())
        .then((user) => this.managementService.log('user: ', user));
      this.router.navigateByUrl(Constants.DEFAULT_REDIRECT_LOGIN);
      this.toastrService.success('Logged in successfully!');
    } catch (error) {
      this.toastrService.error('Please try again', 'Login error');
      this.managementService.error(error);
    }
  }

  async registerWithEmailAndPassword(email: string, password: string, name: string) {
    try {
      const user = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(user.user, { displayName: name });
      this.toastrService.success('User registered successfully!');
    } catch (error) {
      this.toastrService.error('Please try again', 'Register error');
      this.managementService.error(error);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigateByUrl(Constants.DEFAULT_REDIRECT_LOGOUT);
      this.toastrService.success('I hope to see you soon 😓', 'User logged out!');
    } catch (error) {
      this.toastrService.error('Something went wrong while logging out, try again', 'Logout error');
      this.managementService.error(error);
    }
  }

}

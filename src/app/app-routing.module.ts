import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Constants } from './services/management.service';
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

// Guards pipes
const redirectLoggedInToHome = () => redirectLoggedInTo([Constants.DEFAULT_REDIRECT_LOGIN]);
const redirectUnautorizedToLanding = () => redirectUnauthorizedTo([Constants.DEFAULT_REDIRECT_LOGOUT]);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/landing/landing.module').then(m => m.LandingModule),
    canActivate: [AuthGuard], data: { authGuardPipe: redirectLoggedInToHome }
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
  },
  {
    path: 'platform',
    loadChildren: () => import('./pages/platform/platform.module').then(m => m.PlatformModule),
    // canActivate: [AuthGuard], data: { authGuardPipe: redirectUnautorizedToLanding },
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

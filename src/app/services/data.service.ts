import { Injectable } from '@angular/core';
import { onSnapshot } from '@angular/fire/firestore';
import { combineLatest, map, of, switchMap, tap } from 'rxjs';
import { UserData } from '../models/user.model';
import { AuthService } from './auth.service';
import { FireService } from './fire.service';

@Injectable()
export class DataService {

  // #region Observables data

  // projectsObs$ = onSnapshot(this.fireService.col('projects'))

  // #endregion

  constructor(
    private fireService: FireService,
    private authService: AuthService,
  ) { }
}

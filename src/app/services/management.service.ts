import { Injectable, isDevMode } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

export class Constants {
  static readonly DEFAULT_REDIRECT_LOGIN = '/platform';
  static readonly DEFAULT_REDIRECT_LOGOUT = '/home';
}

@Injectable({
  providedIn: 'root'
})
export class ManagementService {

  private loadedBehaviour = new BehaviorSubject<boolean>(false);
  readonly loaded$ = this.loadedBehaviour.pipe();

  constructor(
    private toastr: ToastrService,
  ) { }

  set loaded(value: boolean) {
    this.loadedBehaviour.next(value);
  }

  log(message: any, ...optionalParams: any[]) {
    if (isDevMode()) {
      console.log(message, ...optionalParams);
    }
  }

  error(message: any, ...optionalParams: any[]) {
    if (isDevMode()) {
      console.error(message, ...optionalParams);
    }
  }

  toastError(message: string, title = 'Error', override?: Partial<IndividualConfig>) {
    this.toastr.error(message, title, override);
  }

}

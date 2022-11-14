import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  readonly loginForm = new UntypedFormGroup({
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get email() { return this.loginForm.get('email') as UntypedFormControl; }
  get password() { return this.loginForm.get('password') as UntypedFormControl; }

  constructor(
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
  }

  onSubmitLogin() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.loginWithEmailAndPassword(email, password);
  }

}

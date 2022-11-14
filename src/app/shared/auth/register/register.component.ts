import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  readonly registerForm = new UntypedFormGroup({
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required, Validators.minLength(6)]),
    displayName: new UntypedFormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get email() { return this.registerForm.get('email') as UntypedFormControl; }
  get password() { return this.registerForm.get('password') as UntypedFormControl; }
  get displayName() { return this.registerForm.get('displayName') as UntypedFormControl; }

  constructor(
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
  }

  registerSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    const { email, password, displayName } = this.registerForm.value;

    this.authService.registerWithEmailAndPassword(email, password, displayName);

  }

}

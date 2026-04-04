import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  itemForm!: FormGroup;
  responseMessage = '';
  showMessage     = false;
  showPassword    = false;

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6), this.usernameValidator]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(13), this.passwordValidator]],
      email:    ['', [Validators.required, Validators.email]],
      role:     ['', Validators.required]
    });
  }

  usernameValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (!value) return null;
    return /^[0-9]/.test(value) ? { startsWithNumber: true } : null;
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (!value) return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasAlphabet  = /[a-zA-Z]/.test(value);
    const hasNumber    = /[0-9]/.test(value);
    const hasSymbol    = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    return (hasUpperCase && hasAlphabet && hasNumber && hasSymbol) ? null : { passwordStrength: true };
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onRegister(): void {
    if (this.itemForm.valid) {
      this.httpService.registerUser(this.itemForm.value).subscribe({
        next: () => {
          this.responseMessage = 'Account created successfully! Redirecting to login...';
          this.showMessage     = true;
          setTimeout(() => this.router.navigateByUrl('/login'), 1500);
        },
        error: () => {
          this.responseMessage = 'Registration failed. Please try again.';
          this.showMessage     = true;
        }
      });
    }
  }

  goToLanding(): void { this.router.navigate(['/landing']); }
}

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
  responseMessage: string = '';
  showMessage: boolean = false;
  showPassword: boolean = false;

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.usernameValidator // ✅ new
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(13),
          this.passwordValidator // ✅ updated logic below
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }
  usernameValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (!value) return null;

    const startsWithNumber = /^[0-9]/.test(value);
    return startsWithNumber ? { startsWithNumber: true } : null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasAlphabet = /[a-zA-Z]/.test(value);   // ✅ at least 1 alphabet
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    return hasUpperCase && hasAlphabet && hasNumber && hasSymbol
      ? null
      : { passwordStrength: true };
  }
  onRegister(): void {
    if (this.itemForm.valid) {
      this.httpService.registerUser(this.itemForm.value).subscribe({
        next: () => {
          this.responseMessage = 'Account created successfully! Redirecting to login...';
          this.showMessage = true;
          setTimeout(() => this.router.navigateByUrl('/login'), 1500);
        },
        error: () => {
          this.responseMessage = 'Registration failed. Please try again.';
          this.showMessage = true;
        }
      });
    }
  }

  goToLanding(): void { this.router.navigate(['/landing']); }
}

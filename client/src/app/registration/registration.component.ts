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

  // 👇 Needed for eye icon show/hide feature
  showPassword: boolean = false;

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, this.passwordValidator]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  // 👁️ Toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // 🔐 Password strength validator
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;

    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasNumber && hasSymbol;

    return passwordValid ? null : { passwordStrength: true };
  }

  onRegister(): void {
    if (this.itemForm.valid) {
      this.httpService.registerUser(this.itemForm.value).subscribe({
        next: () => {
          this.responseMessage = 'User registered successfully';
          this.showMessage = true;

          // Navigate to login
          this.router.navigateByUrl('/login');
        },
        error: () => {
          this.responseMessage = 'Registration failed. Please try again.';
          this.showMessage = true;
        }
      });
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  itemForm: FormGroup;
  showError: boolean = false;
  errorMessage: any;
  showPassword: boolean = false;

  // Captcha
  captchaQuestion: string = '';
  captchaAnswer: number = 0;
  captchaInput: string = '';
  captchaError: boolean = false;
  captchaSuccess: boolean = false;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    const operators = ['+', '-', '×'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let a = Math.floor(Math.random() * 9) + 1;
    let b = Math.floor(Math.random() * 9) + 1;

    // Avoid negative answers for subtraction
    if (op === '-' && b > a) [a, b] = [b, a];

    this.captchaQuestion = `${a}  ${op}  ${b}`;

    if (op === '+') this.captchaAnswer = a + b;
    else if (op === '-') this.captchaAnswer = a - b;
    else this.captchaAnswer = a * b;

    this.captchaInput = '';
    this.captchaError = false;
    this.captchaSuccess = false;
  }

  validateCaptcha(): boolean {
    const parsed = parseInt(this.captchaInput, 10);
    if (isNaN(parsed) || parsed !== this.captchaAnswer) {
      this.captchaError = true;
      this.captchaSuccess = false;
      return false;
    }
    this.captchaError = false;
    this.captchaSuccess = true;
    return true;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (!this.validateCaptcha()) return;

    if (this.itemForm.valid) {
      this.httpService.Login(this.itemForm.value).subscribe(
        (res: any) => {
          this.authService.setToken(res.token);
          this.authService.setRole(res.role);
          this.authService.setUsername(res.username);
          this.router.navigate(['/dashboard']);
        },
        (err: any) => {
          this.showError = true;
          this.errorMessage = 'Invalid username or password';
          this.generateCaptcha();
        }
      );
    }
  }

  registration(): void { this.router.navigate(['/registration']); }
  goToLanding(): void { this.router.navigate(['/landing']); }
}

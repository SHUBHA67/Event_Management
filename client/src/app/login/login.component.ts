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

  ngOnInit(): void { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
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
        }
      );
    }
  }

  registration(): void { this.router.navigate(['/registration']); }
  goToLanding(): void { this.router.navigate(['/landing']); }
}
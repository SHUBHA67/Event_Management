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
  formModel: any = {};
  showError: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Redirect immediately if already logged in
    if (this.authService.getLoginStatus) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    if (this.itemForm.valid) {
      this.isLoading = true;
      this.showError = false;

      this.httpService.login(this.itemForm.value).subscribe({
        next: (res: any) => {
          this.authService.setToken(res.token);
          this.authService.setRole(res.role);
          this.authService.setUsername(res.username);

          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.showError = true;

          this.errorMessage =
            err.status === 401
              ? 'Invalid username or password'
              : 'Server error. Please try again.';
        }
      });
    }
  }

  registration(): void {
    this.router.navigate(['/registration']);
  }
}

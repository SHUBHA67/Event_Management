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
  itemForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.itemForm.valid) {
      this.httpService.Login(this.itemForm.value).subscribe({
        next: (response: any) => {
          this.authService.setToken(response.token);
          this.authService.setRole(response.role);
          this.authService.setUsername(response.username);
          this.router.navigateByUrl('/dashboard');
          window.location.reload();
        },
        error: () => {
          this.errorMessage = 'Invalid username or password';
        }
      });
    }
  }

}
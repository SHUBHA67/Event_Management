
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  menuOpen: boolean = false;

  // ✅ Contact form state
  contactForm: FormGroup;
  submitted: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    // ✅ If your service returns boolean via method, call it; if it's a boolean property, read it
    const loggedIn =
      typeof (this.authService as any).getLoginStatus === 'function'
        ? (this.authService as any).getLoginStatus()
        : (this.authService as any).getLoginStatus;

    if (loggedIn) {
      this.router.navigate(['/dashboard']);
    }

    // ✅ Build Reactive Form
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  goToLogin(): void { this.router.navigate(['/login']); }
  goToRegister(): void { this.router.navigate(['/registration']); }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ✅ Contact Form Submit
  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    console.log('Contact form submitted:', this.contactForm.value);

    this.submitted = true;
    this.contactForm.reset();

    setTimeout(() => {
      this.submitted = false;
    }, 5000);
  }
}

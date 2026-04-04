import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      subject:   ['', Validators.required],
      message:   ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      // Replace with your actual API call
      console.log('Contact form submitted:', this.contactForm.value);
      this.submitted = true;
      this.contactForm.reset();
      setTimeout(() => { this.submitted = false; }, 5000);
    }
  }

  goHome(): void       { this.router.navigate(['/landing']); }
  goToLogin(): void    { this.router.navigate(['/login']); }
  goToRegister(): void { this.router.navigate(['/registration']); }
}
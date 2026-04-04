import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor(private router: Router) {}

  goHome(): void     { this.router.navigate(['/landing']); }
  goToLogin(): void  { this.router.navigate(['/login']); }
  goToRegister(): void { this.router.navigate(['/registration']); }
}
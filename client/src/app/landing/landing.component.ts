
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent{
  menuOpen: boolean = false;

  

  constructor(private router: Router, private authService: AuthService) {
    if (this.authService.getLoginStatus) {
      this.router.navigate(['/dashboard']);
    }
  }

  goToLogin(): void { this.router.navigate(['/login']); }
  goToRegister(): void { this.router.navigate(['/registration']); }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  routeAbout() : void{
    this.router.navigate(["/about"]);
  }

    routeContact() : void{
    this.router.navigate(["/contact"]);
  }
}
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  IsLoggin: any = false;
  roleName: string | null;
  menuOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.IsLoggin = authService.getLoginStatus;
    this.roleName = authService.getRole;

    if (!this.IsLoggin) {
      const path = window.location.pathname;
      const publicPaths = ['/landing', '/login', '/registration'];
      if (!publicPaths.some(p => path.startsWith(p))) {
        this.router.navigateByUrl('/landing');
      }
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
    this.closeMenu();
  }
}
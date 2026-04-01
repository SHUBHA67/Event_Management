
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

  // ✅ Added for mobile hamburger menu
  menuOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.IsLoggin = authService.getLoginStatus;
    this.roleName = authService.getRole;

    if (this.IsLoggin == false) {
      this.router.navigateByUrl('/login');
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

  // ✅ Toggles the mobile menu (opens/closes)
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // ❌ Force close the menu (e.g., clicking outside or navigation link)
  closeMenu() {
    this.menuOpen = false;
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
    this.closeMenu();
  }
}

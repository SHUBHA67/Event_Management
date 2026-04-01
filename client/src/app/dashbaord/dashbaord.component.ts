import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  roleName: string | null = null;
  username: string | null = null;

  // ✅ Added for mobile sidebar
  sidebarOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.roleName = this.authService.getRole;
    this.username = localStorage.getItem('username');

    if (!this.authService.getLoginStatus) {
      this.router.navigate(['/login']);
    }
  }

  // ✅ Toggle sidebar (open/close)
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // ✅ Close sidebar (used after navigation)
  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  // Updated: Auto-close sidebar on mobile
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeSidebar();
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
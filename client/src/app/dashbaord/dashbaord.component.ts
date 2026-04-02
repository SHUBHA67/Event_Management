import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface DashboardStats {
  users?: number;
  projects?: number;
  tasks?: number;
  trainees?: number;
  reports?: number;
}

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  roleName: string | null = null;
  username: string | null = null;

  // ✅ Mobile sidebar state
  sidebarOpen: boolean = false;

  // ✅ Dashboard analytics data
  dashboardStats: DashboardStats = {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole();
    this.username = this.authService.getUsername(); // ✅ updated

    this.loadDashboardStats();
  }

  /**
   * ✅ Load hardcoded analytics data based on role
   * (Replace with API call later if needed)
   */
  loadDashboardStats(): void {
    switch (this.roleName) {
      case 'ADMIN':
        this.dashboardStats = {
          users: 120,
          projects: 18,
          reports: 42
        };
        break;

      case 'MANAGER':
        this.dashboardStats = {
          projects: 6,
          tasks: 34,
          trainees: 15
        };
        break;

      case 'TRAINEE':
        this.dashboardStats = {
          tasks: 8,
          projects: 2
        };
        break;

      default:
        this.dashboardStats = {};
    }
  }

  // ✅ Toggle sidebar (mobile)
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // ✅ Close sidebar
  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  // ✅ Navigate & auto-close sidebar on mobile
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeSidebar();
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
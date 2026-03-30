import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

 private tokenKey = 'token';
  private roleKey = 'role';
  private usernameKey = 'username';

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setRole(role: string): void {
    localStorage.setItem(this.roleKey, role);
  }

  get getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  get getLoginStatus(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  setUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.usernameKey);
  }
}







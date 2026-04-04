import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // ── Auth ──────────────────────────────────────────────────────────
  public registerUser(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/user/register`, details, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  public Login(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/user/login`, details, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // ── Planner ───────────────────────────────────────────────────────
  public getStaffUsers(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/staff-users`, { headers: this.getHeaders() });
  }

  // Returns only staff with no event collision on that date
  public getAvailableStaff(dateTime: string): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/available-staff?dateTime=${encodeURIComponent(dateTime)}`, { headers: this.getHeaders() });
  }

  public GetAllevents(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/events`, { headers: this.getHeaders() });
  }

  public GetAllResources(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/resources`, { headers: this.getHeaders() });
  }

  public createEvent(details: any, staffId: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/planner/event?staffId=${staffId}`, details, { headers: this.getHeaders() });
  }

  public addResource(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/planner/resource`, details, { headers: this.getHeaders() });
  }

  public allocateResources(eventId: any, resourceId: any, details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/planner/allocate-resources?eventId=${eventId}&resourceId=${resourceId}`,
      details, { headers: this.getHeaders() }
    );
  }

  public getAllEventRequests(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/event-requests`, { headers: this.getHeaders() });
  }

  public markRequestUnderReview(requestId: number): Observable<any> {
    return this.http.put(`${this.serverName}/api/planner/event-requests/${requestId}/review`, {}, { headers: this.getHeaders() });
  }

  public approveEventRequest(requestId: number, payload: { eventId: number }): Observable<any> {
    return this.http.put(`${this.serverName}/api/planner/event-requests/${requestId}/approve`, payload, { headers: this.getHeaders() });
  }

  public rejectEventRequest(requestId: number, payload: any): Observable<any> {
    return this.http.put(`${this.serverName}/api/planner/event-requests/${requestId}/reject`, payload, { headers: this.getHeaders() });
  }

  // ── Staff ─────────────────────────────────────────────────────────
  public getMyAssignedEvents(): Observable<any> {
    return this.http.get(`${this.serverName}/api/staff/my-events`, { headers: this.getHeaders() });
  }

  public updateEventStatus(eventId: any, status: string): Observable<any> {
    return this.http.put(`${this.serverName}/api/staff/update-status/${eventId}`, { status }, { headers: this.getHeaders() });
  }

  // ── Client ────────────────────────────────────────────────────────
  public browseEvents(): Observable<any> {
    return this.http.get(`${this.serverName}/api/client/events`, { headers: this.getHeaders() });
  }

  public submitEventRequest(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/client/event-request`, details, { headers: this.getHeaders() });
  }

  public getMyRequests(): Observable<any> {
    return this.http.get(`${this.serverName}/api/client/my-requests`, { headers: this.getHeaders() });
  }

  public getMyBookings(): Observable<any> {
    return this.http.get(`${this.serverName}/api/client/my-bookings`, { headers: this.getHeaders() });
  }
}

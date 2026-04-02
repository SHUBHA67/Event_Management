import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ── Auth ─────────────────────────────────────────────────────────
  public registerUser(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/user/register`, details);
  }

  public login(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/user/login`, details);
  }

  // ── Planner: existing ─────────────────────────────────────────────
  public getAllEvents(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/events`);
  }

  public getAllResources(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/resources`);
  }

  public createEvent(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/planner/event`, details);
  }

  public addResource(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/planner/resource`, details);
  }

  public allocateResources(
    eventId: any,
    resourceId: any,
    details: any
  ): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/planner/allocate-resources?eventId=${eventId}&resourceId=${resourceId}`,
      details
    );
  }

  // ── Planner: Event Request Management ────────────────────────────
  public getAllEventRequests(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/event-requests`);
  }

  public getPendingEventRequests(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/event-requests/pending`);
  }

  public markRequestUnderReview(requestId: number): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/planner/event-requests/${requestId}/review`,
      {}
    );
  }

  public approveEventRequest(
    requestId: number,
    payload: any
  ): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/planner/event-requests/${requestId}/approve`,
      payload
    );
  }

  public rejectEventRequest(
    requestId: number,
    payload: any
  ): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/planner/event-requests/${requestId}/reject`,
      payload
    );
  }

  // ── Staff ─────────────────────────────────────────────────────────
  public getEventDetails(eventId: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/staff/event-details/${eventId}`
    );
  }

  public updateEvent(details: any, eventId: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/staff/update-setup/${eventId}`,
      details
    );
  }

  // ── Client: existing ─────────────────────────────────────────────
  public getBookingDetails(eventId: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/client/booking-details/${eventId}`
    );
  }

  // ── Client: NEW ───────────────────────────────────────────────────
  public browseEvents(): Observable<any> {
    return this.http.get(`${this.serverName}/api/client/events`);
  }

  public submitEventRequest(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/client/event-request`,
      details
    );
  }

  public getMyRequests(): Observable<any> {
    return this.http.get(`${this.serverName}/api/client/my-requests`);
  }
}

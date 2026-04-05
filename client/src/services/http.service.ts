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

  // ── Client: Cancel request ────────────────────────────────────────
  // Fixes error in submit-request.component.ts line 88
  public cancelEventRequest(requestId: number, payload: { cancellationFeedback: string }): Observable<any> {
    return this.http.put(`${this.serverName}/api/client/event-request/${requestId}/cancel`, payload, { headers: this.getHeaders() });
  }

  // ── Vendor ────────────────────────────────────────────────────────
  // Fixes all three errors in vendor-dashboard.component.ts
  public getMyVendorResources(): Observable<any> {
    return this.http.get(`${this.serverName}/api/vendor/my-resources`, { headers: this.getHeaders() });
  }

  public addVendorResource(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/vendor/resource`, details, { headers: this.getHeaders() });
  }

  public dispatchResource(resourceId: number, payload: { quantity: number }): Observable<any> {
    return this.http.put(`${this.serverName}/api/vendor/resource/${resourceId}/dispatch`, payload, { headers: this.getHeaders() });
  }

  public markResourceSentStatus(resourceId: number, payload: { dispatchStatus: string }): Observable<any> {
  return this.http.put(`${this.serverName}/api/vendor/resource/${resourceId}/sent-status`, payload, { headers: this.getHeaders() });
}
public getEventRequestById(requestId: number): Observable<any> {
  return this.http.get(`${this.serverName}/api/planner/event-requests/${requestId}`, { headers: this.getHeaders() });
}

// Get all vendor users for the vendor dropdown
public getVendorUsers(): Observable<any> {
  return this.http.get(`${this.serverName}/api/planner/vendors`, { headers: this.getHeaders() });
}

// Get resources belonging to a specific vendor
public getResourcesByVendor(vendorId: number): Observable<any> {
  return this.http.get(`${this.serverName}/api/planner/vendor/${vendorId}/resources`, { headers: this.getHeaders() });
}

// Allocate a resource to an event (called after event creation)
public allocateResourceToEvent(eventId: number, resourceId: number, quantity: number): Observable<any> {
  return this.http.post(
    `${this.serverName}/api/planner/allocate-resources?eventId=${eventId}&resourceId=${resourceId}`,
    { quantity },
    { headers: this.getHeaders() }
  );
}
public updateVendorResource(resourceId: number, payload: any): Observable<any> {
  return this.http.put(`${this.serverName}/api/vendor/resource/${resourceId}/update`, payload, { headers: this.getHeaders() });
}

public deleteVendorResource(resourceId: number): Observable<any> {
  return this.http.delete(`${this.serverName}/api/vendor/resource/${resourceId}`, { headers: this.getHeaders() });
}
public getVendorEvents(): Observable<any> {
  return this.http.get(`${this.serverName}/api/vendor/my-events`, { headers: this.getHeaders() });
}



}

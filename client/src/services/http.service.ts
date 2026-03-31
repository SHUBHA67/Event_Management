import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;


   constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

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

  public GetAllevents(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/events`, {
      headers: this.getHeaders()
    });
  }

  public GetAllResources(): Observable<any> {
    return this.http.get(`${this.serverName}/api/planner/resources`, {
      headers: this.getHeaders()
    });
  }

  public createEvent(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/planner/event`, details, {
      headers: this.getHeaders()
    });
  }

  public addResource(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/planner/resource`, details, {
      headers: this.getHeaders()
    });
  }

  public allocateResources(eventId: any, resourceId: any, details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/planner/allocate-resources?eventId=${eventId}&resourceId=${resourceId}`,
      details,
      { headers: this.getHeaders() }
    );
  }

  public GetEventdetails(eventId: any): Observable<any> {
    return this.http.get(`${this.serverName}/api/staff/event-details/${eventId}`, {
      headers: this.getHeaders()
    });
  }

  public updateEvent(details: any, eventId: any): Observable<any> {
    return this.http.put(`${this.serverName}/api/staff/update-setup/${eventId}`, details, {
      headers: this.getHeaders()
    });
  }

  public getBookingDetails(eventId: any): Observable<any> {
    return this.http.get(`${this.serverName}/api/client/booking-details/${eventId}`, {
      headers: this.getHeaders()
    });
  }
}

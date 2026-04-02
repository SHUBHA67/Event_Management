import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html',
  styleUrls: ['./view-events.component.scss']
})
export class ViewEventsComponent {
  myEvents: any[] = [];
  showError = false;
  errorMessage = '';
  showMessage = false;
  responseMessage = '';

  // Status update state
  updatingEventId: number | null = null;
  selectedStatus = '';

  constructor(public router: Router, public httpService: HttpService) { }

  ngOnInit(): void {
    this.loadMyEvents();
  }

  loadMyEvents(): void {
    this.httpService.getMyAssignedEvents().subscribe({
      next: (res: any) => { this.myEvents = res; this.showError = false; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load your assigned events.'; }
    });
  }

  openStatusUpdate(event: any): void {
    this.updatingEventId = event.eventID;
    this.selectedStatus = event.status;
    this.showError = false;
    this.showMessage = false;
  }

  submitStatusUpdate(): void {
    if (!this.selectedStatus || this.updatingEventId === null) return;

    this.httpService.updateEventStatus(this.updatingEventId, this.selectedStatus).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Event status updated successfully';
        this.updatingEventId = null;
        this.selectedStatus = '';
        this.loadMyEvents();
      },
      error: () => { this.showError = true; this.errorMessage = 'Failed to update status.'; }
    });
  }

  cancelUpdate(): void {
    this.updatingEventId = null;
    this.selectedStatus = '';
  }
}


//todo: complete missing code..

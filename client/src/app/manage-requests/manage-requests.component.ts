import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-requests',
  templateUrl: './manage-requests.component.html',
  styleUrls: ['./manage-requests.component.scss']
})
export class ManageRequestsComponent implements OnInit {

  allRequests:      any[] = [];
  filteredRequests: any[] = [];

  activeFilter = 'ALL';

  // Reject panel state
  rejectingRequestId: number | null = null;
  rejectionReason = '';

  showMessage = false;
  showError   = false;
  responseMessage = '';
  errorMessage    = '';

  constructor(private httpService: HttpService, private router: Router) {}

  ngOnInit(): void { this.loadRequests(); }

  loadRequests(): void {
    this.httpService.getAllEventRequests().subscribe({
      next:  (res: any) => { this.allRequests = res; this.applyFilter(); },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load requests.'; }
    });
  }

  filterBy(status: string): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredRequests = this.activeFilter === 'ALL'
      ? this.allRequests
      : this.allRequests.filter(r => r.status === this.activeFilter);
  }

  markUnderReview(requestId: number): void {
    this.httpService.markRequestUnderReview(requestId).subscribe({
      next:  () => { this.loadRequests(); },
      error: () => { this.showError = true; this.errorMessage = 'Failed to update status.'; }
    });
  }

  // Navigate to Create Event and auto-fill from this request
  goToCreateEvent(requestId: number): void {
    this.router.navigate(['/create-event'], { queryParams: { requestId } });
  }

  // Reject panel
  openRejectPanel(req: any): void {
    this.rejectingRequestId = req.requestId;
    this.rejectionReason    = '';
    this.showError          = false;
  }

  submitRejection(requestId: number): void {
    if (!this.rejectionReason.trim()) return;

    this.httpService.rejectEventRequest(requestId, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.showMessage     = true;
        this.responseMessage = 'Request rejected.';
        this.closePanel();
        this.loadRequests();
      },
      error: () => { this.showError = true; this.errorMessage = 'Rejection failed.'; }
    });
  }

  closePanel(): void {
    this.rejectingRequestId = null;
    this.rejectionReason    = '';
    this.showError          = false;
  }

  goBackToDashboard(): void { this.router.navigate(['/dashboard']); }
}

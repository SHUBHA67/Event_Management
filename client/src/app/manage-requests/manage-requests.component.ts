import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
    selector: 'app-manage-requests',
    templateUrl: './manage-requests.component.html',
    styleUrls: ['./manage-requests.component.scss']
})
export class ManageRequestsComponent implements OnInit {
    allRequests: any[] = [];
    filteredRequests: any[] = [];
    eventList: any[] = []; // All existing events for the link dropdown

    activeFilter = 'ALL';

    // Approve panel state
    approvingRequestId: number | null = null;
    selectedEventId: string = ''; // Event planner selects to link

    // Reject panel state
    rejectingRequestId: number | null = null;
    rejectionReason = '';

    showMessage = false;
    showError = false;
    responseMessage = '';
    errorMessage = '';

    constructor(private httpService: HttpService) { }

    ngOnInit(): void {
        this.loadRequests();
        this.loadEvents();
    }

    loadRequests(): void {
        this.httpService.getAllEventRequests().subscribe({
            next: (res: any) => { this.allRequests = res; this.applyFilter(); },
            error: () => { this.showError = true; this.errorMessage = 'Failed to load requests.'; }
        });
    }

    loadEvents(): void {
        this.httpService.GetAllevents().subscribe({
            next: (res: any) => { this.eventList = res; }
        });
    }

    filterBy(status: string): void {
        this.activeFilter = status;
        this.applyFilter();
    }

    applyFilter(): void {
        if (this.activeFilter === 'ALL') {
            this.filteredRequests = this.allRequests;
        } else {
            this.filteredRequests = this.allRequests.filter(r => r.status === this.activeFilter);
        }
    }

    // ── Mark UNDER_REVIEW ──────────────────────────────────────────────
    markUnderReview(requestId: number): void {
        this.httpService.markRequestUnderReview(requestId).subscribe({
            next: () => { this.loadRequests(); },
            error: () => { this.showError = true; this.errorMessage = 'Failed to update status.'; }
        });
    }

    // ── Approve panel ──────────────────────────────────────────────────
    openApprovePanel(req: any): void {
        this.approvingRequestId = req.requestId;
        this.rejectingRequestId = null;
        this.selectedEventId = '';
        this.showError = false;
    }

    submitApproval(requestId: number): void {
        if (!this.selectedEventId) {
            this.showError = true;
            this.errorMessage = 'Please select an event to link to this request.';
            return;
        }

        const payload = { eventId: +this.selectedEventId };

        this.httpService.approveEventRequest(requestId, payload).subscribe({
            next: () => {
                this.showMessage = true;
                this.responseMessage = 'Request approved and event linked successfully!';
                this.closePanel();
                this.loadRequests();
            },
            error: (err: any) => {
                this.showError = true;
                this.errorMessage = err?.error?.message || 'Approval failed.';
            }
        });
    }

    // ── Reject panel ───────────────────────────────────────────────────
    openRejectPanel(req: any): void {
        this.rejectingRequestId = req.requestId;
        this.approvingRequestId = null;
        this.rejectionReason = '';
        this.showError = false;
    }

    submitRejection(requestId: number): void {
        if (!this.rejectionReason.trim()) return;

        this.httpService.rejectEventRequest(requestId, { rejectionReason: this.rejectionReason }).subscribe({
            next: () => {
                this.showMessage = true;
                this.responseMessage = 'Request rejected.';
                this.closePanel();
                this.loadRequests();
            },
            error: () => { this.showError = true; this.errorMessage = 'Rejection failed.'; }
        });
    }

    closePanel(): void {
        this.approvingRequestId = null;
        this.rejectingRequestId = null;
        this.rejectionReason = '';
        this.selectedEventId = '';
        this.showError = false;
    }
}

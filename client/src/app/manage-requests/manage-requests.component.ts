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
    resourceList: any[] = [];

    activeFilter = 'ALL';

    // Approve panel state
    approvingRequestId: number | null = null;
    allocationItems: { resourceId: string; quantity: number }[] = [];

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
        this.loadResources();
    }

    loadRequests(): void {
        this.httpService.getAllEventRequests().subscribe({
            next: (res: any) => {
                this.allRequests = res;
                this.applyFilter();
            },
            error: () => { this.showError = true; this.errorMessage = 'Failed to load requests.'; }
        });
    }

    loadResources(): void {
        this.httpService.GetAllResources().subscribe({
            next: (res: any) => { this.resourceList = res; }
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

    // ── Mark UNDER_REVIEW ────────────────────────────────────────────
    markUnderReview(requestId: number): void {
        this.httpService.markRequestUnderReview(requestId).subscribe({
            next: () => { this.loadRequests(); },
            error: () => { this.showError = true; this.errorMessage = 'Failed to update status.'; }
        });
    }

    // ── Approve panel ────────────────────────────────────────────────
    openApprovePanel(req: any): void {
        this.approvingRequestId = req.requestId;
        this.rejectingRequestId = null;
        this.allocationItems = [{ resourceId: '', quantity: 1 }];
    }

    addAllocationRow(): void {
        this.allocationItems.push({ resourceId: '', quantity: 1 });
    }

    removeAllocationRow(index: number): void {
        this.allocationItems.splice(index, 1);
    }

    submitApproval(requestId: number): void {
        // Validate all rows are filled
        const hasEmpty = this.allocationItems.some(i => !i.resourceId || i.quantity < 1);
        if (hasEmpty) {
            this.showError = true;
            this.errorMessage = 'Please fill all resource rows before approving.';
            return;
        }

        const payload = {
            allocations: this.allocationItems.map(i => ({
                resourceId: +i.resourceId,
                quantity: i.quantity
            }))
        };

        this.httpService.approveEventRequest(requestId, payload).subscribe({
            next: () => {
                this.showMessage = true;
                this.responseMessage = 'Request approved and event created successfully!';
                this.closePanel();
                this.loadRequests();
            },
            error: (err: any) => {
                this.showError = true;
                // Backend returns the exact resource that failed e.g. "Not enough quantity for resource: Projector"
                this.errorMessage = err?.error?.message || 'Approval failed.';
            }
        });
    }

    // ── Reject panel ─────────────────────────────────────────────────
    openRejectPanel(req: any): void {
        this.rejectingRequestId = req.requestId;
        this.approvingRequestId = null;
        this.rejectionReason = '';
    }

    submitRejection(requestId: number): void {
        if (!this.rejectionReason.trim()) return;

        this.httpService.rejectEventRequest(requestId, { rejectionReason: this.rejectionReason }).subscribe({
            next: () => {
                this.showMessage = true;
                this.responseMessage = 'Request rejected and client has been notified.';
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
        this.allocationItems = [];
        this.showError = false;
    }
}
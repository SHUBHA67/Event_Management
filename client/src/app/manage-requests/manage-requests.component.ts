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

  // Loading states
  isApproving = false;
  isRejecting = false;
  isMarkingReview = false;

  // Per-request processing indicator
  processingRequestId: number | null = null;

  showMessage = false;
  showError = false;
  responseMessage = '';
  errorMessage = '';

  private messageTimeout: any;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.loadRequests();
    this.loadResources();
  }

  // ── Data loading ─────────────────────────────────────
  loadRequests(): void {
    this.httpService.getAllEventRequests().subscribe({
      next: (res: any) => {
        this.allRequests = res;
        this.applyFilter();
      },
      error: () => this.showTimedError('Failed to load requests.')
    });
  }

  loadResources(): void {
    this.httpService.getAllResources().subscribe({
      next: (res: any) => this.resourceList = res
    });
  }

  // ── Filtering ─────────────────────────────────────────
  filterBy(status: string): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredRequests =
      this.activeFilter === 'ALL'
        ? this.allRequests
        : this.allRequests.filter(r => r.status === this.activeFilter);
  }

  // ── Mark UNDER_REVIEW ─────────────────────────────────
  markUnderReview(requestId: number): void {
    if (this.isMarkingReview) return;

    this.isMarkingReview = true;
    this.processingRequestId = requestId;

    this.httpService.markRequestUnderReview(requestId).subscribe({
      next: () => {
        this.loadRequests();
        this.resetProcessing();
      },
      error: () => {
        this.showTimedError('Failed to update status.');
        this.resetProcessing();
      }
    });
  }

  // ── Approve panel ─────────────────────────────────────
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
    if (this.isApproving) return;

    // Confirmation safeguard
    const confirmed = window.confirm(
      'Are you sure you want to approve this request?\nThis will allocate resources and create the event.'
    );
    if (!confirmed) return;

    const hasEmpty = this.allocationItems.some(
      i => !i.resourceId || i.quantity < 1
    );
    if (hasEmpty) {
      this.showTimedError('Please fill all resource rows before approving.');
      return;
    }

    this.isApproving = true;
    this.processingRequestId = requestId;

    const payload = {
      allocations: this.allocationItems.map(i => ({
        resourceId: +i.resourceId,
        quantity: i.quantity
      }))
    };

    this.httpService.approveEventRequest(requestId, payload).subscribe({
      next: () => {
        this.showTimedMessage(
          'Request approved and event created successfully!'
        );
        this.closePanel();
        this.loadRequests();
        this.resetProcessing();
        this.isApproving = false;
      },
      error: (err: any) => {
        this.showTimedError(
          err?.error?.message || 'Approval failed.'
        );
        this.resetProcessing();
        this.isApproving = false;
      }
    });
  }

  // ── Reject panel ──────────────────────────────────────
  openRejectPanel(req: any): void {
    this.rejectingRequestId = req.requestId;
    this.approvingRequestId = null;
    this.rejectionReason = '';
  }

  submitRejection(requestId: number): void {
    if (this.isRejecting || !this.rejectionReason.trim()) return;

    this.isRejecting = true;
    this.processingRequestId = requestId;

    this.httpService.rejectEventRequest(requestId, {
      rejectionReason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.showTimedMessage(
          'Request rejected and client has been notified.'
        );
        this.closePanel();
        this.loadRequests();
        this.resetProcessing();
        this.isRejecting = false;
      },
      error: () => {
        this.showTimedError('Rejection failed.');
        this.resetProcessing();
        this.isRejecting = false;
      }
    });
  }

  // ── UI helpers ────────────────────────────────────────
  closePanel(): void {
    this.approvingRequestId = null;
    this.rejectingRequestId = null;
    this.rejectionReason = '';
    this.allocationItems = [];
  }

  private resetProcessing(): void {
    this.processingRequestId = null;
    this.isMarkingReview = false;
  }

  private showTimedMessage(message: string): void {
    this.clearTimeouts();
    this.showMessage = true;
    this.responseMessage = message;

    this.messageTimeout = setTimeout(() => {
      this.showMessage = false;
      this.responseMessage = '';
    }, 4000);
  }

  private showTimedError(message: string): void {
    this.clearTimeouts();
    this.showError = true;
    this.errorMessage = message;

    this.messageTimeout = setTimeout(() => {
      this.showError = false;
      this.errorMessage = '';
    }, 4000);
  }

  private clearTimeouts(): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
  }
}
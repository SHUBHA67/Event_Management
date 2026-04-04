import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-submit-request',
  templateUrl: './submit-request.component.html',
  styleUrls: ['./submit-request.component.scss']
})
export class SubmitRequestComponent implements OnInit {

  requestForm: FormGroup;
  myRequests: any[] = [];

  showMessage  = false;
  showError    = false;
  responseMessage = '';
  errorMessage    = '';
  isSubmitting    = false;

  // Cancel state
  cancellingRequestId: number | null = null;
  cancellationFeedback = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      eventTitle:           ['', Validators.required],
      eventDescription:     ['', Validators.required],
      eventLocation:        ['', Validators.required],
      eventDate:            ['', Validators.required],
      expectedAttendees:    ['', [Validators.required, Validators.min(1)]],
      resourceRequirements: ['']
    });
  }

  ngOnInit(): void { this.loadMyRequests(); }

  loadMyRequests(): void {
    this.httpService.getMyRequests().subscribe({
      next: (res: any) => { this.myRequests = res; },
      error: () => {}
    });
  }

  onSubmit(): void {
    if (this.requestForm.invalid) return;

    this.isSubmitting = true;
    this.showMessage  = false;
    this.showError    = false;

    this.httpService.submitEventRequest(this.requestForm.value).subscribe({
      next: () => {
        this.isSubmitting    = false;
        this.showMessage     = true;
        this.responseMessage = 'Request submitted! The planner will review it shortly.';
        this.requestForm.reset();
        this.loadMyRequests();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.showError    = true;
        this.errorMessage = err?.error?.message || 'Failed to submit request.';
      }
    });
  }

  // ── Cancel ───────────────────────────────────────────────────────
  openCancelPanel(req: any): void {
    this.cancellingRequestId = req.requestId;
    this.cancellationFeedback = '';
    this.showError = false;
  }

  closeCancelPanel(): void {
    this.cancellingRequestId  = null;
    this.cancellationFeedback = '';
  }

  submitCancellation(requestId: number): void {
    if (!this.cancellationFeedback.trim()) return;

    this.httpService.cancelEventRequest(requestId, {
      cancellationFeedback: this.cancellationFeedback
    }).subscribe({
      next: () => {
        this.showMessage     = true;
        this.responseMessage = 'Your request has been cancelled.';
        this.closeCancelPanel();
        this.loadMyRequests();
      },
      error: (err: any) => {
        this.showError    = true;
        this.errorMessage = err?.error?.message || 'Failed to cancel request.';
      }
    });
  }

  goBackToDashboard(): void { this.router.navigate(['/dashboard']); }
}

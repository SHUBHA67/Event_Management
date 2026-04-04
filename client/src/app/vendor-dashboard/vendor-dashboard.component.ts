import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit {

  resourceForm: FormGroup;
  resourceList: any[] = [];

  showMessage     = false;
  showError       = false;
  responseMessage = '';
  errorMessage    = '';

  constructor(
    public router: Router,
    private httpService: HttpService,
    private fb: FormBuilder
  ) {
    this.resourceForm = this.fb.group({
      name:          ['', Validators.required],
      type:          ['', Validators.required],
      totalQuantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void { this.loadResources(); }

  loadResources(): void {
    this.httpService.getMyVendorResources().subscribe({
      next: (res: any) => { this.resourceList = res; this.showError = false; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load your resources.'; }
    });
  }

  onSubmit(): void {
    if (this.resourceForm.invalid) return;

    const payload = {
      name:              this.resourceForm.value.name,
      type:              this.resourceForm.value.type,
      totalQuantity:     +this.resourceForm.value.totalQuantity,
      allocatedQuantity: 0
    };

    this.httpService.addVendorResource(payload).subscribe({
      next: () => {
        this.showMessage     = true;
        this.showError       = false;
        this.responseMessage = 'Resource added successfully!';
        this.resourceForm.reset();
        this.loadResources();
        setTimeout(() => this.showMessage = false, 3000);
      },
      error: () => { this.showError = true; this.errorMessage = 'Failed to add resource.'; }
    });
  }

  toggleSentStatus(res: any): void {
    const newStatus = res.dispatchStatus === 'DISPATCHED' ? 'AVAILABLE' : 'DISPATCHED';

    this.httpService.markResourceSentStatus(res.resourceID, { dispatchStatus: newStatus }).subscribe({
      next: () => {
        this.showMessage     = true;
        this.showError       = false;
        this.responseMessage = newStatus === 'DISPATCHED'
          ? `${res.name} marked as Sent.`
          : `${res.name} marked as Not Sent.`;
        this.loadResources();
        setTimeout(() => this.showMessage = false, 3000);
      },
      error: (err: any) => {
        this.showError    = true;
        this.errorMessage = err?.error?.message || 'Failed to update status.';
      }
    });
  }
}

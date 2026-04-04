import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit {

  resourceForm: FormGroup;
  resourceList: any[] = [];

  showMessage  = false;
  showError    = false;
  responseMessage = '';
  errorMessage    = '';

  // Dispatch state
  dispatchingId: number | null = null;
  dispatchQty: number | null = null;

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
      next: (res: any) => { this.resourceList = res; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load resources.'; }
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

  openDispatch(res: any): void {
    this.dispatchingId = res.resourceID;
    this.dispatchQty   = null;
  }

  cancelDispatch(): void {
    this.dispatchingId = null;
    this.dispatchQty   = null;
  }

  confirmDispatch(resourceId: number): void {
    if (!this.dispatchQty || this.dispatchQty < 1) return;

    this.httpService.dispatchResource(resourceId, { quantity: this.dispatchQty }).subscribe({
      next: () => {
        this.showMessage     = true;
        this.showError       = false;
        this.responseMessage = 'Resource dispatched successfully!';
        this.cancelDispatch();
        this.loadResources();
        setTimeout(() => this.showMessage = false, 3000);
      },
      error: (err: any) => {
        this.showError    = true;
        this.errorMessage = err?.error?.message || 'Failed to dispatch resource.';
      }
    });
  }
}

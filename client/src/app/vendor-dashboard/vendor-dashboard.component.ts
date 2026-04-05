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
  editForm: FormGroup;
  resourceList: any[] = [];

  showMessage     = false;
  showError       = false;
  responseMessage = '';
  errorMessage    = '';

  editingResourceId:   number | null = null;
  deletingResourceId:  number | null = null;

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

    this.editForm = this.fb.group({
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
      error: (err: any) => {
        this.showError    = true;
        this.showMessage  = false;
        this.errorMessage = err?.error?.message || 'Failed to add resource.';
      }
    });
  }

  openEditPanel(res: any): void {
    this.editingResourceId  = res.resourceID;
    this.deletingResourceId = null;
    this.showError          = false;
    this.showMessage        = false;
    this.editForm.patchValue({
      name:          res.name,
      type:          res.type,
      totalQuantity: res.totalQuantity
    });
  }

  cancelEdit(): void {
    this.editingResourceId = null;
    this.editForm.reset();
  }

  submitEdit(res: any): void {
    if (this.editForm.invalid) return;

    const payload = {
      name:          this.editForm.value.name,
      type:          this.editForm.value.type,
      totalQuantity: +this.editForm.value.totalQuantity
    };

    this.httpService.updateVendorResource(res.resourceID, payload).subscribe({
      next: () => {
        this.showMessage     = true;
        this.showError       = false;
        this.responseMessage = `${payload.name} updated successfully!`;
        this.cancelEdit();
        this.loadResources();
        setTimeout(() => this.showMessage = false, 3000);
      },
      error: (err: any) => {
        this.showError    = true;
        this.showMessage  = false;
        this.errorMessage = err?.error?.message || 'Failed to update resource.';
      }
    });
  }

  openDeleteConfirm(res: any): void {
    this.deletingResourceId = res.resourceID;
    this.editingResourceId  = null;
    this.showError          = false;
    this.showMessage        = false;
  }

  cancelDelete(): void { this.deletingResourceId = null; }

  confirmDelete(res: any): void {
    this.httpService.deleteVendorResource(res.resourceID).subscribe({
      next: () => {
        this.showMessage        = true;
        this.showError          = false;
        this.responseMessage    = `${res.name} deleted successfully.`;
        this.deletingResourceId = null;
        this.loadResources();
        setTimeout(() => this.showMessage = false, 3000);
      },
      error: (err: any) => {
        this.showError          = true;
        this.showMessage        = false;
        this.errorMessage       = err?.error?.message || 'Failed to delete resource.';
        this.deletingResourceId = null;
      }
    });
  }
}

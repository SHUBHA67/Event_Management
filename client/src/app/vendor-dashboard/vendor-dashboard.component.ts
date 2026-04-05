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

  // Tab state
  activeTab: 'resources' | 'events' = 'resources';

  // Event allocations tab data
  // Each entry: { event: Event, allocations: Allocation[] }
  eventAllocations: { event: any; allocations: any[] }[] = [];

  showMessage     = false;
  showError       = false;
  responseMessage = '';
  errorMessage    = '';

  // Edit state
  editingResourceId: number | null = null;

  // Delete confirmation state
  deletingResourceId: number | null = null;

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

  // ── Tab switching ────────────────────────────────────────────────
  switchTab(tab: 'resources' | 'events'): void {
    this.activeTab = tab;
    if (tab === 'events') {
      this.loadEventAllocations();
    }
  }

  // ── Load vendor's own resources ──────────────────────────────────
  loadResources(): void {
    this.httpService.getMyVendorResources().subscribe({
      next: (res: any) => { this.resourceList = res; this.showError = false; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load your resources.'; }
    });
  }

  // ── Load events that have this vendor's resources allocated ──────
  loadEventAllocations(): void {
    // Get own resource IDs first, then cross-reference with all events
    this.httpService.getMyVendorResources().subscribe({
      next: (myResources: any[]) => {
        const myResourceIds = new Set(myResources.map((r: any) => r.resourceID));

        this.httpService.GetAllevents().subscribe({
          next: (events: any[]) => {
            const result: { event: any; allocations: any[] }[] = [];

            for (const event of events) {
              if (!event.allocations || event.allocations.length === 0) continue;

              // Filter allocations that belong to this vendor's resources
              const myAllocs = event.allocations.filter((alloc: any) =>
                alloc.resource && myResourceIds.has(alloc.resource.resourceID)
              );

              if (myAllocs.length > 0) {
                result.push({ event, allocations: myAllocs });
              }
            }

            this.eventAllocations = result;
          },
          error: () => {
            this.showError    = true;
            this.errorMessage = 'Failed to load event data.';
          }
        });
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load your resources.';
      }
    });
  }

  // ── Add resource ─────────────────────────────────────────────────
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
        this.showError       = true;
        this.showMessage     = false;
        this.errorMessage    = err?.error?.message || 'Failed to add resource.';
      }
    });
  }

  // ── Edit ─────────────────────────────────────────────────────────
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

  // ── Delete ───────────────────────────────────────────────────────
  openDeleteConfirm(res: any): void {
    this.deletingResourceId = res.resourceID;
    this.editingResourceId  = null;
    this.showError          = false;
    this.showMessage        = false;
  }

  cancelDelete(): void {
    this.deletingResourceId = null;
  }

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

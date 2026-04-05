import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

interface StagedResource {
  vendorId:     number;
  vendorName:   string;
  resourceId:   number;
  resourceName: string;
  resourceType: string;
  quantity:     number;
  maxAvailable: number;
}

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

  itemForm: FormGroup;

  // Dropdowns for staff
  staffList:  any[] = [];
  vendorList: any[] = [];
  eventList:  any[] = [];

  // ── Staging state (independent of the main form) ─────────────────
  stagingVendorId:    any    = '';
  stagingResourceId:  any    = '';
  stagingQuantity:    number = 1;
  stagingMaxAvailable = 0;
  stagingResourceList: any[] = [];
  stagingError = '';

  // Final list of resources to allocate after event creation
  stagedResources: StagedResource[] = [];

  // Prefill state
  prefillRequestId: number | null = null;
  isPrefilled = false;

  showMessage     = false;
  showError       = false;
  responseMessage = '';
  errorMessage    = '';
  isSubmitting    = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    // Core event form — no resource fields here anymore
    this.itemForm = this.formBuilder.group({
      title:       ['', Validators.required],
      description: ['', Validators.required],
      dateTime:    ['', Validators.required],
      location:    ['', Validators.required],
      status:      ['', Validators.required],
      staffId:     ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVendors();
    this.getEvent();

    // Watch dateTime → reload available staff
    this.itemForm.get('dateTime')!.valueChanges.subscribe(value => {
      if (value) {
        this.itemForm.patchValue({ staffId: '' });
        this.loadAvailableStaff(value);
      } else {
        this.staffList = [];
      }
    });

    // Check if navigated from a client request (auto-fill)
    this.route.queryParams.subscribe(params => {
      const requestId = params['requestId'];
      if (requestId) {
        this.prefillRequestId = +requestId;
        this.loadRequestAndPrefill(+requestId);
      }
    });
  }

  // ── Staff ─────────────────────────────────────────────────────────
  loadAvailableStaff(dateTime: string): void {
    this.httpService.getAvailableStaff(dateTime).subscribe({
      next: (res: any) => {
        this.staffList = res;
        if (res.length === 0) {
          this.showError    = true;
          this.errorMessage = 'No staff available on this date.';
        } else {
          this.showError    = false;
          this.errorMessage = '';
        }
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load available staff.';
      }
    });
  }

  // ── Vendors ───────────────────────────────────────────────────────
  loadVendors(): void {
    this.httpService.getVendorUsers().subscribe({
      next:  (res: any) => { this.vendorList = res; },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load vendors.';
      }
    });
  }

  // ── Staging: vendor changed → load its resources ──────────────────
  onStagingVendorChange(): void {
    this.stagingResourceId   = '';
    this.stagingResourceList = [];
    this.stagingMaxAvailable = 0;
    this.stagingError        = '';

    if (!this.stagingVendorId) return;

    this.httpService.getResourcesByVendor(+this.stagingVendorId).subscribe({
      next: (res: any) => {
        // Only show resources that still have available stock
        this.stagingResourceList = res.filter(
          (r: any) => r.totalQuantity - r.allocatedQuantity > 0
        );
        if (this.stagingResourceList.length === 0) {
          this.stagingError = 'This vendor has no available resources.';
        }
      },
      error: () => { this.stagingError = 'Failed to load vendor resources.'; }
    });
  }

  // ── Staging: resource changed → update max available ─────────────
  onStagingResourceChange(): void {
    this.stagingQuantity     = 1;
    this.stagingMaxAvailable = 0;
    this.stagingError        = '';

    if (!this.stagingResourceId) return;

    const found = this.stagingResourceList.find(
      (r: any) => r.resourceID === +this.stagingResourceId
    );
    if (found) {
      this.stagingMaxAvailable = found.totalQuantity - found.allocatedQuantity;
    }
  }

  // ── Staging: add current selection to the staged list ────────────
  addToStaged(): void {
    this.stagingError = '';

    if (!this.stagingVendorId || !this.stagingResourceId || !this.stagingQuantity) return;

    const qty = +this.stagingQuantity;

    if (qty < 1) {
      this.stagingError = 'Quantity must be at least 1.';
      return;
    }
    if (qty > this.stagingMaxAvailable) {
      this.stagingError = `Only ${this.stagingMaxAvailable} units available for this resource.`;
      return;
    }

    // Prevent duplicate resource entries
    const alreadyAdded = this.stagedResources.find(
      s => s.resourceId === +this.stagingResourceId
    );
    if (alreadyAdded) {
      this.stagingError = `"${alreadyAdded.resourceName}" is already in your list. Remove it first to change quantity.`;
      return;
    }

    const vendor   = this.vendorList.find((v: any) => v.id === +this.stagingVendorId);
    const resource = this.stagingResourceList.find(
      (r: any) => r.resourceID === +this.stagingResourceId
    );

    this.stagedResources.push({
      vendorId:     +this.stagingVendorId,
      vendorName:   vendor?.username   || 'Unknown Vendor',
      resourceId:   +this.stagingResourceId,
      resourceName: resource?.name     || 'Unknown Resource',
      resourceType: resource?.type     || '',
      quantity:     qty,
      maxAvailable: this.stagingMaxAvailable
    });

    // Reset staging row
    this.stagingVendorId     = '';
    this.stagingResourceId   = '';
    this.stagingQuantity     = 1;
    this.stagingMaxAvailable = 0;
    this.stagingResourceList = [];
  }

  // ── Staging: remove an entry ──────────────────────────────────────
  removeFromStaged(index: number): void {
    this.stagedResources.splice(index, 1);
  }

  // ── Events table ──────────────────────────────────────────────────
  getEvent(): void {
    this.httpService.GetAllevents().subscribe({
      next:  (res: any) => { this.eventList = res; },
      error: () => {}
    });
  }

  // ── Prefill from client request ───────────────────────────────────
  loadRequestAndPrefill(requestId: number): void {
    this.httpService.getEventRequestById(requestId).subscribe({
      next: (req: any) => {
        const dt        = req.eventDate ? new Date(req.eventDate) : null;
        const formatted = dt ? dt.toISOString().slice(0, 16) : '';

        this.itemForm.patchValue({
          title:       req.eventTitle       || '',
          description: req.eventDescription || '',
          location:    req.eventLocation    || '',
          dateTime:    formatted
        });

        this.isPrefilled = true;
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load request details for auto-fill.';
      }
    });
  }

  // ── Submit ────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.itemForm.invalid || this.isSubmitting) return;
    if (this.stagedResources.length === 0) {
      this.showError    = true;
      this.errorMessage = 'Please add at least one resource before creating the event.';
      return;
    }

    this.isSubmitting = true;
    this.showError    = false;
    this.showMessage  = false;

    const { staffId, ...eventData } = this.itemForm.value;

    // Step 1: Create the event
    this.httpService.createEvent(eventData, staffId).subscribe({
      next: (createdEvent: any) => {
        const eventId = createdEvent.eventID;
        this.allocateAllResources(eventId, 0);
      },
      error: () => {
        this.isSubmitting = false;
        this.showError    = true;
        this.errorMessage = 'Failed to create event.';
      }
    });
  }

  // ── Allocate staged resources one by one (recursive) ─────────────
  private allocateAllResources(eventId: number, index: number): void {
    if (index >= this.stagedResources.length) {
      // All allocations done
      this.handlePostAllocation(eventId);
      return;
    }

    const item = this.stagedResources[index];

    this.httpService.allocateResourceToEvent(eventId, item.resourceId, item.quantity).subscribe({
      next: () => {
        // Move to next resource
        this.allocateAllResources(eventId, index + 1);
      },
      error: (err: any) => {
        // Partial failure — event was created, some resources may have been allocated
        this.isSubmitting = false;
        this.showError    = true;
        this.errorMessage =
          `Event created (ID: ${eventId}), but allocation failed for ` +
          `"${item.resourceName}": ${err?.error?.message || 'unknown error'}. ` +
          `Resources before this one were allocated. Please allocate the rest manually.`;
        this.getEvent();
      }
    });
  }

  // ── After all allocations succeed ─────────────────────────────────
  private handlePostAllocation(eventId: number): void {
    if (this.prefillRequestId) {
      this.httpService.approveEventRequest(this.prefillRequestId, { eventId }).subscribe({
        next: () => {
          this.isSubmitting    = false;
          this.showMessage     = true;
          this.showError       = false;
          this.responseMessage =
            `Event created, ${this.stagedResources.length} resource(s) allocated, and client request approved!`;
          this.resetForm();
        },
        error: () => {
          this.isSubmitting    = false;
          this.showMessage     = true;
          this.showError       = false;
          this.responseMessage =
            `Event created (ID: ${eventId}) and resources allocated. ` +
            `However, request approval linking failed — please approve manually from Client Requests.`;
          this.resetForm();
        }
      });
    } else {
      this.isSubmitting    = false;
      this.showMessage     = true;
      this.showError       = false;
      this.responseMessage =
        `Event created and ${this.stagedResources.length} resource(s) allocated successfully!`;
      this.resetForm();
    }
  }

  // ── Reset entire form after success ───────────────────────────────
  private resetForm(): void {
    this.itemForm.reset();
    this.staffList           = [];
    this.stagedResources     = [];
    this.stagingVendorId     = '';
    this.stagingResourceId   = '';
    this.stagingQuantity     = 1;
    this.stagingResourceList = [];
    this.stagingMaxAvailable = 0;
    this.stagingError        = '';
    this.isPrefilled         = false;
    this.prefillRequestId    = null;
    this.getEvent();
  }
}
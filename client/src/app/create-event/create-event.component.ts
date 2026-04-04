import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

  itemForm: FormGroup;
  showError   = false;
  showMessage = false;
  errorMessage    = '';
  responseMessage = '';

  staffList:       any[] = [];
  vendorList:      any[] = [];
  vendorResources: any[] = [];

  // Vendor resource selection (outside reactive form — uses ngModel)
  selectedVendorId:   any = '';
  selectedResourceId: any = '';
  allocateQty: number | null = null;

  // Resources staged for allocation after event is created
  selectedResources: { resourceId: number; name: string; quantity: number }[] = [];

  // Staff availability state
  availabilityResult: any = null;
  checkingAvail = false;

  // Auto-fill from client request
  fromRequestId: number | null = null;
  autoFilledFromRequest = false;

  constructor(
    public  router: Router,
    private route:  ActivatedRoute,
    public  httpService: HttpService,
    private fb: FormBuilder
  ) {
    this.itemForm = this.fb.group({
      title:       ['', Validators.required],
      description: ['', Validators.required],
      dateTime:    ['', Validators.required],
      location:    ['', Validators.required],
      status:      ['', Validators.required],
      staffId:     ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getStaffUsers();
    this.getVendors();

    // Auto-fill if navigated from manage-requests with ?requestId=X
    this.route.queryParams.subscribe(params => {
      if (params['requestId']) {
        this.fromRequestId = +params['requestId'];
        this.autoFillFromRequest(this.fromRequestId!);
      }
    });
  }

  autoFillFromRequest(requestId: number): void {
    this.httpService.getEventRequestById(requestId).subscribe({
      next: (req: any) => {
        const dt = req.eventDate ? new Date(req.eventDate).toISOString().slice(0, 16) : '';
        this.itemForm.patchValue({
          title:       req.eventTitle       || '',
          description: req.eventDescription || '',
          location:    req.eventLocation    || '',
          dateTime:    dt,
          status:      'PLANNED'
        });
        this.autoFilledFromRequest = true;
      },
      error: () => { /* silently ignore — auto-fill is best-effort */ }
    });
  }

  getStaffUsers(): void {
    this.httpService.getStaffUsers().subscribe({
      next: (res: any) => { this.staffList = res; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load staff list.'; }
    });
  }

  getVendors(): void {
    this.httpService.getVendors().subscribe({
      next: (res: any) => { this.vendorList = res; },
      error: () => { /* non-critical */ }
    });
  }

  onVendorChange(): void {
    this.selectedResourceId = '';
    this.vendorResources    = [];
    this.allocateQty        = null;

    if (this.selectedVendorId) {
      this.httpService.getVendorResources(+this.selectedVendorId).subscribe({
        next: (res: any) => { this.vendorResources = res; },
        error: () => { this.showError = true; this.errorMessage = 'Failed to load vendor resources.'; }
      });
    }
  }

  addResourceToList(): void {
    if (!this.selectedResourceId || !this.allocateQty || this.allocateQty < 1) return;

    const resource = this.vendorResources.find(r => r.resourceID == this.selectedResourceId);
    if (!resource) return;

    const existing = this.selectedResources.find(r => r.resourceId === +this.selectedResourceId);
    if (existing) {
      existing.quantity += this.allocateQty;
    } else {
      this.selectedResources.push({
        resourceId: +this.selectedResourceId,
        name:       resource.name,
        quantity:   this.allocateQty
      });
    }

    this.selectedResourceId = '';
    this.allocateQty        = null;
  }

  removeResource(index: number): void {
    this.selectedResources.splice(index, 1);
  }

  // ── Staff availability ───────────────────────────────────────────
  onDateTimeChange(): void { this.resetAvailability(); }

  resetAvailability(): void { this.availabilityResult = null; }

  checkAvailability(): void {
    const staffId  = this.itemForm.get('staffId')?.value;
    const dateTime = this.itemForm.get('dateTime')?.value;
    if (!staffId || !dateTime) return;

    this.checkingAvail = true;
    const isoDate = new Date(dateTime).toISOString();

    this.httpService.checkStaffAvailability(+staffId, isoDate).subscribe({
      next: (res: any) => {
        this.availabilityResult = res;
        this.checkingAvail      = false;
      },
      error: () => {
        this.checkingAvail = false;
        this.showError     = true;
        this.errorMessage  = 'Failed to check availability.';
      }
    });
  }

  // ── Submit event then allocate resources sequentially ────────────
  onSubmit(): void {
    if (this.itemForm.invalid || !this.availabilityResult?.available) return;

    const { staffId, ...eventData } = this.itemForm.value;

    this.httpService.createEvent(eventData, staffId).subscribe({
      next: (createdEvent: any) => {
        const eventId     = createdEvent.eventID;
        const allocations = [...this.selectedResources];

        const doNext = (index: number) => {
          if (index >= allocations.length) {
            this.showMessage      = true;
            this.responseMessage  = 'Event created successfully!';
            this.showError        = false;
            this.itemForm.reset();
            this.selectedResources     = [];
            this.availabilityResult    = null;
            this.autoFilledFromRequest = false;
            return;
          }
          const alloc = allocations[index];
          this.httpService.allocateResources(eventId, alloc.resourceId, { quantity: alloc.quantity }).subscribe({
            next:  () => doNext(index + 1),
            error: () => doNext(index + 1)  // skip failed allocation, don't block
          });
        };
        doNext(0);
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to create event.';
      }
    });
  }
}

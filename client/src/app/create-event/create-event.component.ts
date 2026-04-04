import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

  itemForm: FormGroup;

  staffList:    any[] = [];
  vendorList:   any[] = [];
  resourceList: any[] = [];
  eventList:    any[] = [];

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
    this.itemForm = this.formBuilder.group({
      title:       ['', Validators.required],
      description: ['', Validators.required],
      dateTime:    ['', Validators.required],
      location:    ['', Validators.required],
      status:      ['', Validators.required],
      staffId:     ['', Validators.required],
      vendorId:    ['', Validators.required],
      resourceId:  ['', Validators.required],
      quantity:    ['', [Validators.required, Validators.min(1)]]
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

    // Watch vendorId → reload resources for that vendor
    this.itemForm.get('vendorId')!.valueChanges.subscribe(vendorId => {
      this.itemForm.patchValue({ resourceId: '', quantity: '' });
      this.resourceList = [];
      if (vendorId) {
        this.loadVendorResources(+vendorId);
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

  loadVendors(): void {
    this.httpService.getVendorUsers().subscribe({
      next: (res: any) => { this.vendorList = res; },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load vendors.';
      }
    });
  }

  loadVendorResources(vendorId: number): void {
    this.httpService.getResourcesByVendor(vendorId).subscribe({
      next: (res: any) => {
        this.resourceList = res.filter((r: any) => r.totalQuantity - r.allocatedQuantity > 0);
        if (this.resourceList.length === 0) {
          this.showError    = true;
          this.errorMessage = 'This vendor has no available resources.';
        } else {
          this.showError    = false;
          this.errorMessage = '';
        }
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load vendor resources.';
      }
    });
  }

  getEvent(): void {
    this.httpService.GetAllevents().subscribe({
      next: (res: any) => { this.eventList = res; },
      error: () => {}
    });
  }

  loadRequestAndPrefill(requestId: number): void {
    this.httpService.getEventRequestById(requestId).subscribe({
      next: (req: any) => {
        const dt = req.eventDate ? new Date(req.eventDate) : null;
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

  onSubmit(): void {
    if (this.itemForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.showError    = false;
    this.showMessage  = false;

    const { staffId, vendorId, resourceId, quantity, ...eventData } = this.itemForm.value;

    // Step 1: Create the event
    this.httpService.createEvent(eventData, staffId).subscribe({
      next: (createdEvent: any) => {
        const eventId = createdEvent.eventID;

        // Step 2: Allocate the vendor resource to the event
        this.httpService.allocateResourceToEvent(eventId, +resourceId, +quantity).subscribe({
          next: () => {
            // Step 3: If this came from a client request, auto-approve it
            if (this.prefillRequestId) {
              this.httpService.approveEventRequest(this.prefillRequestId, { eventId }).subscribe({
                next: () => {
                  this.isSubmitting    = false;
                  this.showMessage     = true;
                  this.showError       = false;
                  this.responseMessage = 'Event created, resource allocated and client request approved!';
                  this.resetForm();
                },
                error: () => {
                  // Event + allocation succeeded, only approval linking failed
                  this.isSubmitting    = false;
                  this.showMessage     = true;
                  this.showError       = false;
                  this.responseMessage = `Event created (ID: ${eventId}) and resource allocated. However, request approval linking failed — please approve manually from Client Requests.`;
                  this.resetForm();
                }
              });
            } else {
              this.isSubmitting    = false;
              this.showMessage     = true;
              this.showError       = false;
              this.responseMessage = 'Event created and resource allocated successfully!';
              this.resetForm();
            }
          },
          error: (err: any) => {
            this.isSubmitting = false;
            this.showError    = true;
            this.errorMessage = `Event created (ID: ${eventId}) but resource allocation failed: ${err?.error?.message || 'unknown error'}. Please allocate manually.`;
            this.getEvent();
          }
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.showError    = true;
        this.errorMessage = 'Failed to create event.';
      }
    });
  }

  private resetForm(): void {
    this.itemForm.reset();
    this.staffList        = [];
    this.resourceList     = [];
    this.isPrefilled      = false;
    this.prefillRequestId = null;
    this.getEvent();
  }

  getSelectedResourceAvailable(): number {
    const resourceId = this.itemForm.get('resourceId')?.value;
    if (!resourceId) return 0;
    const res = this.resourceList.find(r => r.resourceID === +resourceId);
    return res ? res.totalQuantity - res.allocatedQuantity : 0;
  }
}

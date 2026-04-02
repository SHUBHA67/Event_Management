import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resource-allocate',
  templateUrl: './resource-allocate.component.html',
  styleUrls: ['./resource-allocate.component.scss']
})
export class ResourceAllocateComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };

  showError: boolean = false;
  errorMessage: any;

  showMessage: boolean = false;
  responseMessage: any;

  resourceList: any[] = [];
  eventList: any[] = [];

  assignModel: any = {};

  // ✅ Better loading handling
  isLoadingResources: boolean = false;
  isLoadingEvents: boolean = false;
  isSubmitting: boolean = false;

  // ✅ This is the missing property used in HTML
  selectedResource: any | null = null;

  // ✅ optional (you were already using this)
  remainingQuantity: number | null = null;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      eventId: ['', Validators.required],
      resourceId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getResources();
    this.getEvent();

    // ✅ Watch for resource selection changes
    this.itemForm.get('resourceId')?.valueChanges.subscribe(resourceId => {
      this.onResourceSelect(resourceId);
    });
  }

  // Optional: one flag if you use it in UI
  get isLoading(): boolean {
    return this.isLoadingResources || this.isLoadingEvents || this.isSubmitting;
  }

  getEvent(): void {
    this.isLoadingEvents = true;

    this.httpService.getAllEvents().subscribe(
      (res: any) => {
        this.eventList = res || [];
        this.isLoadingEvents = false;
      },
      (err: any) => {
        console.error('Failed to load events', err);
        this.isLoadingEvents = false;
      }
    );
  }

  getResources(): void {
    this.isLoadingResources = true;

    this.httpService.getAllResources().subscribe(
      (res: any) => {
        this.resourceList = res || [];
        this.isLoadingResources = false;

        // ✅ If already selected, recalc
        const selectedId = this.itemForm.get('resourceId')?.value;
        if (selectedId) {
          this.onResourceSelect(selectedId);
        }
      },
      (err: any) => {
        console.error('Failed to load resources', err);
        this.isLoadingResources = false;
      }
    );
  }

  // ✅ Show remaining quantity on resource selection + add max validator
  onResourceSelect(resourceId: any): void {
    const id = Number(resourceId);

    // ✅ Match with your HTML fields: resourceID, totalQuantity, allocatedQuantity
    this.selectedResource = this.resourceList.find(r => Number(r.resourceID) === id) || null;

    this.remainingQuantity = this.selectedResource
      ? Number(this.selectedResource.totalQuantity ?? 0) - Number(this.selectedResource.allocatedQuantity ?? 0)
      : null;

    // ✅ Update quantity validators dynamically based on remaining
    const qtyCtrl = this.itemForm.get('quantity');
    if (!qtyCtrl) return;

    if (this.remainingQuantity !== null) {
      qtyCtrl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.remainingQuantity)
      ]);
    } else {
      qtyCtrl.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
    }

    qtyCtrl.updateValueAndValidity({ emitEvent: false });
  }

  onSubmit(): void {
    this.showError = false;
    this.showMessage = false;

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const { eventId, resourceId, quantity } = this.itemForm.value;

    // ✅ Double safety check
    if (this.remainingQuantity !== null && Number(quantity) > this.remainingQuantity) {
      this.showError = true;
      this.errorMessage = `Only ${this.remainingQuantity} remaining. Please enter a valid quantity.`;
      return;
    }

    this.isSubmitting = true;

    this.httpService.allocateResources(eventId, resourceId, { quantity: Number(quantity) })
      .subscribe(
        (res: any) => {
          this.showMessage = true;
          this.responseMessage = res?.message || 'Resource allocated successfully';

          this.itemForm.reset();
          this.remainingQuantity = null;
          this.selectedResource = null;

          // ✅ Refresh resources so available updates
          this.getResources();

          this.isSubmitting = false;
        },
        (err: any) => {
          this.showError = true;
          this.errorMessage =
            err?.error?.message ||
            err?.message ||
            'Failed to allocate resource.';

          this.isSubmitting = false;
        }
      );
  }

  // ✅ helpers
  get quantityCtrl(): AbstractControl | null {
    return this.itemForm.get('quantity');
  }

  get resourceCtrl(): AbstractControl | null {
    return this.itemForm.get('resourceId');
  }

  get eventCtrl(): AbstractControl | null {
    return this.itemForm.get('eventId');
  }
}
``
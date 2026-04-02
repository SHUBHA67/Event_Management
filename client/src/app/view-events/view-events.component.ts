import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html',
  styleUrls: ['./view-events.component.scss']
})
export class ViewEventsComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };

  showError: boolean = false;
  errorMessage: any;

  showMessage: boolean = false;
  responseMessage: any;

  eventObj: any[] = [];
  filteredEvents: any[] = [];

  assignModel: any = {};

  isUpdate: boolean = false;
  isLoading: boolean = false;

  // ✅ Used in HTML
  searchTerm: string = '';
  statusFilter: string = '';

  // ✅ Keep track of which event is being edited
  selectedEvent: any | null = null;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dateTime: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAllEvents();
  }

  loadAllEvents(): void {
    this.isLoading = true;
    this.showError = false;
    this.showMessage = false;

    this.httpService.getAllEvents().subscribe({
      next: (res: any) => {
        this.eventObj = res || [];
        this.filteredEvents = [...this.eventObj];
        this.isLoading = false;

        // Apply filter if user already typed something
        this.filterEvents();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to load events';
      }
    });
  }

  // ✅ Called from HTML on typing/search filter change
  filterEvents(): void {
    const term = (this.searchTerm || '').toLowerCase().trim();
    const status = (this.statusFilter || '').toUpperCase().trim(); // '' means all

    this.filteredEvents = (this.eventObj || []).filter((ev: any) => {
      const matchesTitle = !term || (ev?.title || '').toLowerCase().includes(term);
      const matchesStatus = !status || (ev?.status || '').toUpperCase() === status;
      return matchesTitle && matchesStatus;
    });
  }

  // ✅ Called from HTML (click)="edit(event)"
  edit(event: any): void {
    this.showError = false;
    this.showMessage = false;

    this.selectedEvent = event;
    this.isUpdate = true;

    // datetime-local expects: YYYY-MM-DDTHH:mm
    const dtValue = this.toDatetimeLocal(event?.dateTime);

    this.itemForm.patchValue({
      title: event?.title ?? '',
      description: event?.description ?? '',
      dateTime: dtValue,
      location: event?.location ?? '',
      status: event?.status ?? ''
    });
  }

  // ✅ Called from HTML (ngSubmit)="onSubmit()"
  onSubmit(): void {
    this.showError = false;
    this.showMessage = false;

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    if (!this.selectedEvent) {
      this.showError = true;
      this.errorMessage = 'No event selected for update.';
      return;
    }

    const payload = {
      ...this.itemForm.value,
      // Ensure backend receives valid date string (if needed)
      dateTime: this.fromDatetimeLocal(this.itemForm.value.dateTime)
    };

    this.isLoading = true;

    // ✅ Figure out correct ID field (your project sometimes uses eventID)
    const eventId = this.selectedEvent.eventID ?? this.selectedEvent.id ?? this.selectedEvent.eventId;

    // ✅ IMPORTANT:
    // Your HttpService must have an update method.
    // Common names: updateEvent(id, payload) OR updateEvents(id, payload)
    // We'll try updateEvent first. If yours differs, tell me your HttpService method name.
    this.httpService.updateEvent(eventId, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showMessage = true;
        this.responseMessage = res?.message || 'Event updated successfully';
        this.isUpdate = false;
        this.selectedEvent = null;

        // reload list
        this.loadAllEvents();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'Failed to update event.';
      }
    });
  }

  // ✅ Close modal helper (optional use later)
  closeModal(): void {
    this.isUpdate = false;
    this.selectedEvent = null;
  }

  // ✅ Convert backend date -> input datetime-local format
  private toDatetimeLocal(value: any): string {
    if (!value) return '';

    // If it's already like "2026-04-02T13:00", return as is
    if (typeof value === 'string' && value.includes('T') && value.length >= 16) {
      return value.substring(0, 16);
    }

    const d = new Date(value);
    if (isNaN(d.getTime())) return '';

    // format: YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // ✅ Convert datetime-local input -> ISO string (backend friendly)
  private fromDatetimeLocal(value: any): string {
    if (!value) return value;

    // datetime-local returns "YYYY-MM-DDTHH:mm"
    // Convert to ISO with timezone offset applied by Date
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    return d.toISOString();
  }
}
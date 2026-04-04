import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  itemForm: FormGroup;
  showError = false;
  errorMessage = '';
  eventList: any[] = [];
  staffList: any[] = [];
  showMessage = false;
  responseMessage = '';

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
      status: ['', Validators.required],
      staffId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getEvent();

    // Watch the dateTime field — refresh available staff whenever it changes
    this.itemForm.get('dateTime')!.valueChanges.subscribe((value) => {
      if (value) {
        this.itemForm.patchValue({ staffId: '' }); // reset staff selection
        this.loadAvailableStaff(value);
      } else {
        this.staffList = [];
      }
    });
  }

  loadAvailableStaff(dateTime: string): void {
    this.httpService.getAvailableStaff(dateTime).subscribe({
      next: (res: any) => {
        this.staffList = res;
        if (res.length === 0) {
          this.showError = true;
          this.errorMessage = 'No staff available on this date. All staff are already assigned to events.';
        } else {
          this.showError = false;
          this.errorMessage = '';
        }
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load available staff.';
      }
    });
  }

  getEvent(): void {
    this.httpService.GetAllevents().subscribe({
      next: (res: any) => { this.eventList = res; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load events.'; }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;

    const { staffId, ...eventData } = this.itemForm.value;

    this.httpService.createEvent(eventData, staffId).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Event created successfully';
        this.itemForm.reset();
        this.staffList = [];
        this.getEvent();
      },
      error: () => { this.showError = true; this.errorMessage = 'Failed to create event.'; }
    });
  }
}

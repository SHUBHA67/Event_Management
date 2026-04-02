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
      staffId: ['', Validators.required] // Staff assignment is mandatory
    });
  }

  ngOnInit(): void {
    this.getEvent();
    this.getStaffUsers();
  }

  getEvent(): void {
    this.httpService.GetAllevents().subscribe({
      next: (res: any) => { this.eventList = res; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load events.'; }
    });
  }

  getStaffUsers(): void {
    this.httpService.getStaffUsers().subscribe({
      next: (res: any) => { this.staffList = res; },
      error: () => { this.showError = true; this.errorMessage = 'Failed to load staff list.'; }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;

    const { staffId, ...eventData } = this.itemForm.value;

    this.httpService.createEvent(eventData, staffId).subscribe({
      next: (res: any) => {
        this.showMessage = true;
        this.responseMessage = 'Event created successfully';
        this.itemForm.reset();
        this.getEvent();
      },
      error: () => { this.showError = true; this.errorMessage = 'Failed to create event.'; }
    });
  }
}

//doto: complete missing code..

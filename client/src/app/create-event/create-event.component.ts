import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  formModel: any = { status: null };

  showError: boolean = false;
  showMessage: boolean = false;

  errorMessage: any;
  responseMessage: any;

  eventList: any = [];
  assignModel: any = {};

  isLoading: boolean = false;

  // Reference to event list section in template
  @ViewChild('eventList') eventListRef!: ElementRef;

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
    this.getEvent();
  }

  getEvent(): void {
    this.isLoading = true;
    this.httpService.getAllEvents().subscribe(
      (res: any) => {
        this.eventList = res;
        this.isLoading = false;
      },
      (err: any) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = 'Failed to load events.';

        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    );
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.showError = false;
    this.showMessage = false;

    this.httpService.createEvent(this.itemForm.value).subscribe(
      (res: any) => {
        this.isLoading = false;

        this.showMessage = true;
        this.responseMessage = res.message || 'Event created successfully';

        this.itemForm.reset();
        this.getEvent();

        // Auto-scroll to event list after creation
        setTimeout(() => {
          if (this.eventListRef) {
            this.eventListRef.nativeElement.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }, 300);

        // Auto-clear messages after 3 seconds
        setTimeout(() => {
          this.showMessage = false;
          this.showError = false;
        }, 3000);
      },
      (err: any) => {
        this.isLoading = false;

        this.showError = true;
        this.errorMessage = 'Failed to create event.';

        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    );
  }
}
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
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  eventList: any = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;

  constructor(public router: Router, public httpService: HttpService,
    private formBuilder: FormBuilder, private authService: AuthService) {
    this.itemForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dateTime: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void { this.getEvent(); }

  getEvent(): void {
    this.httpService.GetAllevents().subscribe(
      (res: any) => { this.eventList = res; },
      (err: any) => { this.showError = true; this.errorMessage = 'Failed to load events.'; }
    );
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.httpService.createEvent(this.itemForm.value).subscribe(
        (res: any) => { this.showMessage = true; this.responseMessage = res.message || 'Event created successfully'; this.itemForm.reset(); this.getEvent(); },
        (err: any) => { this.showError = true; this.errorMessage = 'Failed to create event.'; }
      );
    }
  }
}

//doto: complete missing code..

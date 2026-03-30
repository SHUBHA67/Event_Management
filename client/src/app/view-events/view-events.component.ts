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
export class ViewEventsComponent{
  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  eventObj: any = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  isUpdate: any = false;

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

//   ngOnInit(): void {}

//   searchEvent(): void {
//     // if (this.formModel.eventID) {
//     //   this.httpService.GetEventdetails(this.formModel.eventID).subscribe(
//     //     (res: any) => { this.eventObj = [res]; this.showError = false; },
//     //     (err: any) => { this.showError = true; this.errorMessage = 'Event not found.'; }
//     //   );
//     // }
//   }

//   edit(val: any): void {
//   //   this.isUpdate = true;
//   //   const dateTime = val.dateTime ? new Date(val.dateTime).toISOString().slice(0, 16) : '';
//   //   this.itemForm.patchValue({ title: val.title, description: val.description, dateTime, location: val.location, status: val.status });
//   // }
//   }

//   onSubmit(): void {
//   //   if (this.itemForm.valid) {
//   //     this.httpService.updateEvent(this.itemForm.value, this.formModel.eventID).subscribe(
//   //       (res: any) => { this.showMessage = true; this.responseMessage = 'Event updated successfully'; console.log(this.responseMessage); this.itemForm.reset(); this.isUpdate = false; },
//   //       (err: any) => { this.showError = true; this.errorMessage = 'Failed to update event.'; }
//   //     );
//   //   }
//   // }
// }
}

  
//todo: complete missing code..

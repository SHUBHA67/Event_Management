import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  resourceList: any = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  eventList: any = [];

  constructor(public router: Router, public httpService: HttpService,
    private formBuilder: FormBuilder, private authService: AuthService) {
    this.itemForm = this.formBuilder.group({
      quantity: ['', Validators.required],
      eventId: ['', Validators.required],
      resourceId: ['', Validators.required]
    });
  }

  ngOnInit(): void { this.getResources(); this.getEvent(); }

  getEvent(): void {
    this.httpService.GetAllevents().subscribe(
      (res: any) => { this.eventList = res; },
      (err: any) => { console.error('Failed to load events', err); }
    );
  }

  getResources(): void {
    this.httpService.GetAllResources().subscribe(
      (res: any) => { this.resourceList = res; },
      (err: any) => { console.error('Failed to load resources', err); }
    );
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const { eventId, resourceId, quantity } = this.itemForm.value;
      this.httpService.allocateResources(eventId, resourceId, { quantity }).subscribe(
        (res: any) => { this.showMessage = true; this.responseMessage = res.message || 'Resource allocated successfully'; console.log(this.responseMessage); this.itemForm.reset(); },
        (err: any) => { this.showError = true; this.errorMessage = 'Failed to allocate resource.'; }
      );
    }
  }
  
}

//todo: complete missing code

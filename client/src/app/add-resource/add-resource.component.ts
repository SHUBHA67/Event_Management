import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-resource',
  templateUrl: './add-resource.component.html',
  styleUrls: ['./add-resource.component.scss']
})

export class AddResourceComponent implements OnInit {
  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  resourceList: any = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;

  constructor(public router: Router, public httpService: HttpService,
    private formBuilder: FormBuilder, private authService: AuthService) {
    this.itemForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      availability: ['', Validators.required]
    });
  }

  ngOnInit(): void { this.getResource(); }

  getResource(): void {
    this.httpService.GetAllResources().subscribe(
      (res: any) => { this.resourceList = res; },
      (err: any) => { this.showError = true; this.errorMessage = 'Failed to load resources.'; }
    );
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const payload = { ...this.itemForm.value, availability: this.itemForm.value.availability === 'true' };
      this.httpService.addResource(payload).subscribe(
        (res: any) => { this.showMessage = true; this.responseMessage = res.message || 'Resource added successfully'; this.itemForm.reset(); this.getResource(); },
        (err: any) => { this.showError = true; this.errorMessage = 'Failed to add resource.'; }
      );
    }
  }
}


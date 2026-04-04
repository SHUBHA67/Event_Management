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
  resourceList: any[] = [];
  showMessage  = false;
  showError    = false;
  responseMessage = '';
  errorMessage    = '';

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      name:          ['', Validators.required],
      type:          ['', Validators.required],
      totalQuantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void { this.getResource(); }

  getResource(): void {
    this.httpService.GetAllResources().subscribe({
      next: (res: any) => { this.resourceList = res; },
      error: ()        => { this.showError = true; this.errorMessage = 'Failed to load resources.'; }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;

    const payload = {
      name:              this.itemForm.value.name,
      type:              this.itemForm.value.type,
      totalQuantity:     +this.itemForm.value.totalQuantity,
      allocatedQuantity: 0
    };

    this.httpService.addResource(payload).subscribe({
      next: () => {
        this.showMessage     = true;
        this.responseMessage = 'Resource added successfully';
        this.itemForm.reset();
        this.getResource();
      },
      error: () => { this.showError = true; this.errorMessage = 'Failed to add resource.'; }
    });
  }
}

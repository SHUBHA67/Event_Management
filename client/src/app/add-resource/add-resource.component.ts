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

  showMessage = false;
  showError   = false;
  responseMessage = '';
  errorMessage    = '';

  isLoading = false; // ✅ NEW: loading state for submit button

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      totalQuantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.getResource();
  }

  getResource(): void {
    this.httpService.getAllResources().subscribe({
      next: (res: any) => {
        this.resourceList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load resources.';
        this.autoClearMessages();
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.showMessage = false;
    this.showError = false;

    const payload = {
      name: this.itemForm.value.name,
      type: this.itemForm.value.type,
      totalQuantity: +this.itemForm.value.totalQuantity,
      allocatedQuantity: 0
    };

    this.httpService.addResource(payload).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Resource added successfully';
        this.itemForm.reset();
        this.getResource();
        this.isLoading = false;
        this.autoClearMessages();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to add resource.';
        this.isLoading = false;
        this.autoClearMessages();
      }
    });
  }

  /**
   * ✅ Clears success & error messages after 3 seconds
   */
  private autoClearMessages(): void {
    setTimeout(() => {
      this.showMessage = false;
      this.showError = false;
      this.responseMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}
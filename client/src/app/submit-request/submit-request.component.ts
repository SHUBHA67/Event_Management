import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
    selector: 'app-submit-request',
    templateUrl: './submit-request.component.html',
    styleUrls: ['./submit-request.component.scss']
})
export class SubmitRequestComponent implements OnInit {

    requestForm: FormGroup;
    myRequests: any[] = [];
    showMessage = false;
    showError = false;
    responseMessage = '';
    errorMessage = '';
    isSubmitting = false;

    constructor(private fb: FormBuilder, private httpService: HttpService) {
        this.requestForm = this.fb.group({
            eventTitle: ['', Validators.required],
            eventDescription: ['', Validators.required],
            eventLocation: ['', Validators.required],
            eventDate: ['', Validators.required],
            expectedAttendees: ['', [Validators.required, Validators.min(1)]],
            resourceRequirements: [''] // optional
        });
    }

    ngOnInit(): void {
        this.loadMyRequests();
    }

    loadMyRequests(): void {
        this.httpService.getMyRequests().subscribe({
            next: (res: any) => { this.myRequests = res; },
            error: () => { /* silently ignore if list fails */ }
        });
    }

    onSubmit(): void {
        if (this.requestForm.invalid) return;

        this.isSubmitting = true;
        this.showMessage = false;
        this.showError = false;

        this.httpService.submitEventRequest(this.requestForm.value).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.showMessage = true;
                this.responseMessage = 'Request submitted! The planner will review it shortly.';
                this.requestForm.reset();
                this.loadMyRequests(); // refresh the table
            },
            error: (err: any) => {
                this.isSubmitting = false;
                this.showError = true;
                this.errorMessage = err?.error?.message || 'Failed to submit request.';
            }
        });
    }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit {
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;

  eventObj: any[] = [];         // original data
  filteredEvents: any[] = [];   // filtered data shown in UI

  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  isUpdate: boolean = false;

  // ✅ ADD THIS (fixes your error)
  searchTitle: string = '';

  constructor(
    public router: Router,
    public httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClientEvents();
  }

  loadClientEvents(): void {
    const client = this.authService.getUserId();

    if (client) {
      this.httpService.getBookingDetails(client).subscribe(
        (res: any) => {
          this.eventObj = Array.isArray(res) ? res : [res];

          // ✅ default show all
          this.filteredEvents = [...this.eventObj];

          this.showError = false;
        },
        () => {
          this.showError = true;
          this.errorMessage = 'No bookings found for this client.';
        }
      );
    } else {
      this.showError = true;
      this.errorMessage = 'Client not logged in.';
    }
  }

  // ✅ Call this when typing in input (if you have UI for it)
  filterByTitle(): void {
    const term = (this.searchTitle || '').toLowerCase().trim();

    if (!term) {
      this.filteredEvents = [...this.eventObj];
      return;
    }

    this.filteredEvents = this.eventObj.filter((e: any) =>
      (e?.title || e?.eventTitle || e?.eventName || '').toLowerCase().includes(term)
    );
  }

  searchEvent(): void {
    if (this.formModel.eventID) {
      this.httpService.getBookingDetails(this.formModel.eventID).subscribe(
        (res: any) => {
          this.eventObj = Array.isArray(res) ? res : [res];
          this.filteredEvents = [...this.eventObj];
          this.showError = false;
        },
        () => {
          this.showError = true;
          this.errorMessage = 'Booking not found.';
        }
      );
    }
  }
}
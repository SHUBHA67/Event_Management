
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit {

  bookings: any[] = [];
  showError = false;
  errorMessage = '';

  constructor(
    private httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyBookings();
  }

  loadMyBookings(): void {
    this.httpService.getMyBookings().subscribe({
      next: (res: any) => {
        this.bookings = res;
        this.showError = false;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load your booking details.';
      }
    });
  }

  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-vendor-events',
  templateUrl: './vendor-events.component.html',
  styleUrls: ['./vendor-events.component.scss']
})
export class VendorEventsComponent implements OnInit {

  vendorEvents: { event: any; allocations: any[] }[] = [];
  showError    = false;
  errorMessage = '';

  constructor(public router: Router, private httpService: HttpService) {}

  ngOnInit(): void { this.loadVendorEvents(); }

  loadVendorEvents(): void {
    this.httpService.getVendorEvents().subscribe({
      next: (res: any) => {
        this.vendorEvents = res;
        this.showError    = false;
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load your event allocations.';
      }
    });
  }
}

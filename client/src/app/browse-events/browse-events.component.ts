
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-browse-events',
  templateUrl: './browse-events.component.html',
  styleUrls: ['./browse-events.component.scss']
})
export class BrowseEventsComponent implements OnInit {

  allEvents: any[] = [];
  filteredEvents: any[] = [];

  activeFilter = 'ALL';
  searchTerm = '';

  showError = false;
  errorMessage = '';

  constructor(
    private httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.httpService.browseEvents().subscribe({
      next: (res: any) => {
        this.allEvents = res;
        this.applyFilter();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load events.';
      }
    });
  }

  filterBy(status: string): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  applyFilter(): void {
    let results = this.allEvents;

    if (this.activeFilter !== 'ALL') {
      results = results.filter(e => e.status === this.activeFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(e =>
        e.title?.toLowerCase().includes(term) ||
        e.location?.toLowerCase().includes(term)
      );
    }

    this.filteredEvents = results;
  }

  goToRequest(): void {
    this.router.navigate(['/submit-request']);
  }

  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

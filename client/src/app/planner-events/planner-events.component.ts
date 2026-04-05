import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-planner-events',
  templateUrl: './planner-events.component.html',
  styleUrls: ['./planner-events.component.scss']
})
export class PlannerEventsComponent implements OnInit {

  allEvents:      any[] = [];
  filteredEvents: any[] = [];

  activeFilter = 'ALL';
  searchTerm   = '';

  selectedEvent: any = null;

  showError    = false;
  errorMessage = '';

  

  constructor(public router: Router, private httpService: HttpService) {}

  ngOnInit(): void { this.loadEvents(); }

  loadEvents(): void {
    this.httpService.GetAllevents().subscribe({
      next: (res: any) => {
        this.allEvents = res;
        this.applyFilter();
      },
      error: () => {
        this.showError    = true;
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

  openDetail(event: any): void  { this.selectedEvent = event; }
  closeDetail(): void            { this.selectedEvent = null; }
}

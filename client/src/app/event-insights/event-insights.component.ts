import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

/* ─────────────────── TYPES ─────────────────── */

type StatusKey = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

interface StatusCounts {
  PLANNED: number;
  ONGOING: number;
  COMPLETED: number;
  CANCELLED: number;
}

interface StatusColors {
  PLANNED: string;
  ONGOING: string;
  COMPLETED: string;
  CANCELLED: string;
}

interface UserRef {
  username?: string;
}

interface Resource {
  name?: string;
  type?: string;
}

interface Allocation {
  quantity: number;
  resource?: Resource;
}

interface EventModel {
  title?: string;
  description?: string;
  location?: string;
  dateTime?: string | Date;
  status?: StatusKey;

  assignedStaff?: UserRef;
  planner?: UserRef;
  completedByStaff?: string;

  allocations?: Allocation[];
}

/* ───────────────── COMPONENT ───────────────── */

@Component({
  selector: 'app-event-insights',
  templateUrl: './event-insights.component.html',
  styleUrls: ['./event-insights.component.scss']
})
export class EventInsightsComponent implements OnInit {

  allEvents: EventModel[] = [];
  filteredEvents: EventModel[] = [];

  isLoading = true;
  activeFilter: StatusKey | 'ALL' = 'ALL';

  readonly statuses: StatusKey[] = ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

  counts: StatusCounts = {
    PLANNED: 0,
    ONGOING: 0,
    COMPLETED: 0,
    CANCELLED: 0
  };

  segColors: StatusColors = {
    PLANNED: '#9B79D0',
    ONGOING: '#F0A050',
    COMPLETED: '#3D9E6E',
    CANCELLED: '#C05B78'
  };

  private readonly CIRC = 2 * Math.PI * 70;

  constructor(
    public router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.httpService.GetAllevents().subscribe({
      next: (res: EventModel[]) => {
        this.allEvents = res ?? [];
        this.computeCounts();
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  get totalEvents(): number {
    return this.allEvents.length;
  }

  /* ─────────────── COUNTS ─────────────── */

  computeCounts(): void {
    this.counts = { PLANNED: 0, ONGOING: 0, COMPLETED: 0, CANCELLED: 0 };

    for (const e of this.allEvents) {
      if (e.status && this.statuses.includes(e.status)) {
        this.counts[e.status]++;
      }
    }
  }

  getPct(status: StatusKey): number {
    return this.totalEvents === 0
      ? 0
      : Math.round((this.counts[status] / this.totalEvents) * 100);
  }

  /* ─────────────── SVG DONUT ─────────────── */

  getSegDash(status: StatusKey): string {
    const pct = this.counts[status] / (this.totalEvents || 1);
    const dash = pct * this.CIRC;
    return `${dash} ${this.CIRC - dash}`;
  }

  getSegOffset(status: StatusKey): number {
    let preceding = 0;
    for (const s of this.statuses) {
      if (s === status) break;
      preceding += (this.counts[s] / (this.totalEvents || 1)) * this.CIRC;
    }
    return this.CIRC - preceding + this.CIRC * 0.25;
  }

  /* ─────────────── FILTER ─────────────── */

  setFilter(f: StatusKey | 'ALL'): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredEvents =
      this.activeFilter === 'ALL'
        ? this.allEvents
        : this.allEvents.filter(e => e.status === this.activeFilter);
  }

  /* ─────────────── HELPERS ─────────────── */

  allocPreview(e: EventModel): Allocation[] {
    return (e.allocations ?? []).slice(0, 2);
  }
}

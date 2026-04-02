import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { AppComponent } from './app.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { AddResourceComponent } from './add-resource/add-resource.component';
import { ResourceAllocateComponent } from './resource-allocate/resource-allocate.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';

// ── NEW imports ───────────────────────────────────────────────────
import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { BrowseEventsComponent } from './browse-events/browse-events.component';

const routes: Routes = [
  { path: 'login',            component: LoginComponent },
  { path: 'registration',     component: RegistrationComponent },
  { path: 'dashboard',        component: DashbaordComponent },
  { path: 'create-event',     component: CreateEventComponent },
  { path: 'add-resource',     component: AddResourceComponent },
  { path: 'resource-allocate',component: ResourceAllocateComponent },
  { path: 'view-events',      component: ViewEventsComponent },
  { path: 'booking-details',  component: BookingDetailsComponent },

  // ── NEW routes ─────────────────────────────────────────────────
  // Client: submit an event request + track status
  { path: 'submit-request',   component: SubmitRequestComponent },

  // Client: browse all upcoming events
  { path: 'browse-events',    component: BrowseEventsComponent },

  // Planner: review / approve / reject client requests
  { path: 'manage-requests',  component: ManageRequestsComponent },

  { path: '',   redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
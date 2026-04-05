import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { BrowseEventsComponent } from './browse-events/browse-events.component';
import { LandingComponent } from './landing/landing.component';
import { VendorDashboardComponent } from './vendor-dashboard/vendor-dashboard.component';
import { PlannerEventsComponent } from './planner-events/planner-events.component';
import { VendorEventsComponent } from './vendor-events/vendor-events.component';

const routes: Routes = [
  { path: 'landing',          component: LandingComponent },
  { path: 'login',            component: LoginComponent },
  { path: 'registration',     component: RegistrationComponent },
  { path: 'dashboard',        component: DashbaordComponent },
  { path: 'create-event',     component: CreateEventComponent },
  { path: 'view-events',      component: ViewEventsComponent },
  { path: 'booking-details',  component: BookingDetailsComponent },
  { path: 'submit-request',   component: SubmitRequestComponent },
  { path: 'browse-events',    component: BrowseEventsComponent },
  { path: 'manage-requests',  component: ManageRequestsComponent },
  { path: 'vendor-dashboard', component: VendorDashboardComponent },
  { path: 'planner-events',   component: PlannerEventsComponent },
  { path: 'vendor-events',    component: VendorEventsComponent },
  { path: '',                 redirectTo: '/landing', pathMatch: 'full' },
  { path: '**',               redirectTo: '/landing', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

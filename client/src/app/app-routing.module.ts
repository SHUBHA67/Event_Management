import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { AddResourceComponent } from './add-resource/add-resource.component';
import { ResourceAllocateComponent } from './resource-allocate/resource-allocate.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';

// NEW components
import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { BrowseEventsComponent } from './browse-events/browse-events.component';

// ✅ Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  // ───────────── PUBLIC ROUTES ─────────────
  { path: 'login',        component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },

  // ───────────── PROTECTED (ANY AUTH USER) ─────────────
  {
    path: 'dashboard',
    component: DashbaordComponent,
    canActivate: [AuthGuard],
  },

  // ───────────── PLANNER ONLY ─────────────
  {
    path: 'create-event',
    component: CreateEventComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PLANNER'] },
  },
  {
    path: 'add-resource',
    component: AddResourceComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PLANNER'] },
  },
  {
    path: 'resource-allocate',
    component: ResourceAllocateComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PLANNER'] },
  },
  {
    path: 'manage-requests',
    component: ManageRequestsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PLANNER'] },
  },

  // ───────────── STAFF ONLY ─────────────
  {
    path: 'view-events',
    component: ViewEventsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STAFF'] },
  },

  // ───────────── CLIENT ONLY ─────────────
  {
    path: 'browse-events',
    component: BrowseEventsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] },
  },
  {
    path: 'submit-request',
    component: SubmitRequestComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] },
  },
  {
    path: 'booking-details',
    component: BookingDetailsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] },
  },

  // ───────────── DEFAULT & WILDCARD ─────────────
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
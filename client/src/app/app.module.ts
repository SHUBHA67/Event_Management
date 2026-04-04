import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { HttpService } from '../services/http.service';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { BrowseEventsComponent } from './browse-events/browse-events.component';
import { VendorDashboardComponent } from './vendor-dashboard/vendor-dashboard.component';
import { PlannerEventsComponent } from './planner-events/planner-events.component';

// Keep these imported but they are no longer linked in routing/nav
import { AddResourceComponent } from './add-resource/add-resource.component';
import { ResourceAllocateComponent } from './resource-allocate/resource-allocate.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    DashbaordComponent,
    CreateEventComponent,
    AddResourceComponent,
    ResourceAllocateComponent,
    ViewEventsComponent,
    BookingDetailsComponent,
    SubmitRequestComponent,
    ManageRequestsComponent,
    BrowseEventsComponent,
    VendorDashboardComponent,
    PlannerEventsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [HttpService, HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule {}

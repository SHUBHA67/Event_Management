import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';

// ⚠️ Alias used to fix typo without breaking usage
import { DashbaordComponent as DashboardComponent } from './dashbaord/dashbaord.component';

import { CreateEventComponent } from './create-event/create-event.component';
import { AddResourceComponent } from './add-resource/add-resource.component';
import { ResourceAllocateComponent } from './resource-allocate/resource-allocate.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';

// ── NEW components ────────────────────────────────────────────────
import { SubmitRequestComponent } from './submit-request/submit-request.component';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { BrowseEventsComponent } from './browse-events/browse-events.component';

// ── Services & Interceptors ──────────────────────────────────────
import { HttpService } from '../services/http.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    DashboardComponent,
    CreateEventComponent,
    AddResourceComponent,
    ResourceAllocateComponent,
    ViewEventsComponent,
    BookingDetailsComponent,

    // ── NEW ───────────────────────────────────────────────────────
    SubmitRequestComponent,
    ManageRequestsComponent,
    BrowseEventsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // ✅ REQUIRED for animations / Angular Material
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule, // ✅ Correct place
  ],
  providers: [
    HttpService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
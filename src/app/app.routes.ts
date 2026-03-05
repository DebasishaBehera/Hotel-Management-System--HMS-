import { Routes } from '@angular/router';
import { Home } from './home/home';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { RoomsComponent } from './rooms/rooms';
import { RoomdetailsComponent } from './roomdetails/roomdetails';
import { Contact } from './contact/contact';
import { AboutComponent } from './about/about';
import { AdminComponent } from './admin/admin';
import { AdminLoginComponent } from './admin-login/admin-login';
import { AdminRoomEditComponent } from './admin-room-edit/admin-room-edit';
import { AdminBookingEditComponent } from './admin-booking-edit/admin-booking-edit';
import { AdminBookingsComponent } from './admin-bookings/admin-bookings';
import { AdminRoomsComponent } from './admin-rooms/admin-rooms';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'rooms/:id', component: RoomdetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: Contact },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin/bookings/:id/edit', component: AdminBookingEditComponent, canActivate: [adminGuard] },
  { path: 'admin/rooms/:id/edit', component: AdminRoomEditComponent, canActivate: [adminGuard] },
  { path: 'admin/new-room', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/bookings', component: AdminBookingsComponent, canActivate: [adminGuard] },
  { path: 'admin/rooms', component: AdminRoomsComponent, canActivate: [adminGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'home' }
];

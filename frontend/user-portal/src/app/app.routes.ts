import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Flats } from './pages/flats/flats';
// import { Bookings } from './pages/bookings/bookings';
import { AdminLogin } from './pages/admin/admin-login/admin-login';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { AdminBookings } from './pages/admin/admin-bookings/admin-bookings';
import { AdminUnits } from './pages/admin/admin-units/admin-units';
import { AdminAmenities } from './pages/admin/admin-amenities/admin-amenities';
import { ReportsComponent } from './pages/admin/reports/reports';
import { BookingStatus } from './pages/booking-status/booking-status';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'flats', component: Flats, canActivate: [AuthGuard] },
  //{ path: 'bookings', component: Bookings },
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin/dashboard', component: Dashboard, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'admin/bookings', component: AdminBookings, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'admin/units', component: AdminUnits, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'admin/amenities', component: AdminAmenities, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'admin/reports', component: ReportsComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'booking-status', component: BookingStatus, canActivate: [AuthGuard] }
];

import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ReservationForm } from './reservation/reservation';
import { Schedule } from './schedule/schedule';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'reservation',
    component: ReservationForm
  },
  {
    path: 'schedule',
    component: Schedule
  },
  {
    path: '**',
    redirectTo: ''
  },
  {path: 'reserve', component: Reservation},
  {path: 'reservations/:id/edit', component: Reservation},
];

import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Reservation } from './reservation/reservation';
import { Schedule } from './schedule/schedule';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'reservation',
    component: Reservation
  },
  {
    path: 'schedule',
    component: Schedule
  },
  {
    path: '**',
    redirectTo: ''
  }
];

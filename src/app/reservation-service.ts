import {HttpClient} from '@angular/common/http';
import {inject, Service} from '@angular/core';
import {Meta, ReservationInput, ReservationRecord} from './reservation-types';

@Service()
export class ReservationService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:3000/api';

  getMeta() {
    return this.http.get<Meta>(`${this.baseUrl}/meta`);
  }

  getReservation(id: string) {
    return this.http.get<ReservationRecord>(`${this.baseUrl}/reservations/${id}`);
  }

  createReservation(data: ReservationInput) {
    return this.http.post<ReservationRecord>(`${this.baseUrl}/reservations`, data);
  }

  updateReservation(id: string, data: ReservationInput) {
    return this.http.put<ReservationRecord>(`${this.baseUrl}/reservations/${id}`, data);
  }
}
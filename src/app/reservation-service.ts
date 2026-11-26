
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Meta, ReservationInput, ReservationRecord } from './reservation-types';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private readonly http = inject(HttpClient);

  // Backend API address
  private readonly baseUrl = 'http://localhost:3000/api';

  // Retrieves dropdown options for the reservation form
  getMeta() {
    return this.http.get<Meta>(`${this.baseUrl}/meta`);
  }

  // Retrieves all reservations
  getReservations() {
    return this.http.get<ReservationRecord[]>(`${this.baseUrl}/reservations`);
  }

  // Retrieves one reservation using its ID
  getReservation(id: string) {
    return this.http.get<ReservationRecord>(
      `${this.baseUrl}/reservations/${id}`
    );
  }

  // Creates a new reservation
  createReservation(data: ReservationInput) {
    return this.http.post<ReservationRecord>(
      `${this.baseUrl}/reservations`,
      data
    );
  }

  // Updates an existing reservation
  updateReservation(id: string, data: ReservationInput) {
    return this.http.put<ReservationRecord>(
      `${this.baseUrl}/reservations/${id}`,
      data
    );
  }

  // Deletes a reservation using its ID
  deleteReservation(id: string) {
    return this.http.delete(
      `${this.baseUrl}/reservations/${id}`
    );
  }
}

/*
=========================================================
OLD VERSION OF RESERVATION SERVICE
Preserved for reference
=========================================================

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

=========================================================
*/

// crud.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api';

export interface Slot {
  id: string;
  label: string;
}

export interface Meta {
  rooms: string[];
  slots: Slot[];
  reasons: string[];
}

export interface Reservation {
  _id: string;
  room: string;
  slot: string;
  date: string; 
  reason: string;
}

export type ReservationInput = Omit<Reservation, '_id'>;

export interface ScheduleSlot {
  slot: string;
  label: string;
  status: 'occupied' | 'available';
  reservation: Reservation | null;
}

export interface ScheduleRoom {
  room: string;
  slots: ScheduleSlot[];
}

@Injectable({
  providedIn: 'root',
})
export class Crud {
  private http = inject(HttpClient);

  reservations = signal<Reservation[]>([]);
  schedule = signal<ScheduleRoom[]>([]);
  meta = signal<Meta>({ rooms: [], slots: [], reasons: [] });
  errorMessage = signal<string | null>(null);

  fetchMeta() {
    this.http.get<Meta>(`${API_URL}/meta`).subscribe({
      next: (data) => this.meta.set(data),
      error: (err) => this.handleError('Could not load form options', err),
    });
  }

  fetchReservations(date?: string) {
    let params = new HttpParams();
    if (date) params = params.set('date', date);

    this.http.get<Reservation[]>(`${API_URL}/reservations`, { params }).subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.errorMessage.set(null);
      },
      error: (err) => this.handleError('Could not load reservations', err),
    });
  }

  // READ one
  getReservation(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${API_URL}/reservations/${id}`);
  }

  fetchSchedule(date: string) {
    const params = new HttpParams().set('date', date);

    this.http.get<ScheduleRoom[]>(`${API_URL}/schedule`, { params }).subscribe({
      next: (data) => {
        this.schedule.set(data);
        this.errorMessage.set(null);
      },
      error: (err) => this.handleError('Could not load schedule', err),
    });
  }

  // CREATE
  saveReservation(data: ReservationInput): Observable<Reservation> {
    return this.http.post<Reservation>(`${API_URL}/reservations`, data);
  }

  // UPDATE
  updateReservation(id: string, data: ReservationInput): Observable<Reservation> {
    return this.http.put<Reservation>(`${API_URL}/reservations/${id}`, data);
  }

  // DELETE
  deleteReservation(id: string) {
    this.http.delete<void>(`${API_URL}/reservations/${id}`).subscribe({
      next: () => this.reservations.update((list) => list.filter((r) => r._id !== id)),
      error: (err) => this.handleError('Delete failed', err),
    });
  }

  private handleError(fallback: string, err: any) {
    console.error(fallback, err);
    this.errorMessage.set(err?.error?.error ?? fallback);
  }
}
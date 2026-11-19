
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

interface ReservationData {
  _id: string;
  reserveeName: string;
  room: string;
  date: string;
  slot: string;
  reason: string;
  attendees: number;
}

@Component({
  imports: [DatePipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {

  // Backend API address
  private apiUrl = 'http://localhost:4200/api';

  // Stores all reservations retrieved from the backend
  reservations: ReservationData[] = [];

  // Controls loading and message display
  isLoading = false;
  message = '';

  constructor(private http: HttpClient) {}

  // Automatically loads reservations when Home opens
  ngOnInit(): void {
    this.loadReservations();
  }

  // Retrieves all existing reservations
  loadReservations(): void {
    this.isLoading = true;
    this.message = '';

    this.http.get<ReservationData[]>(
      `${this.apiUrl}/reservations`
    ).subscribe({
      next: (data: ReservationData[]) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.message = 'Unable to load reservations. Please try again.';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  // Deletes a reservation using its MongoDB ID
  deleteReservation(id: string): void {
    const confirmed = confirm(
      'Are you sure you want to delete this reservation?'
    );

    if (!confirmed) {
      return;
    }

    this.http.delete(
      `${this.apiUrl}/reservations/${id}`
    ).subscribe({
      next: () => {
        this.message = 'Reservation deleted successfully.';
        this.loadReservations();
      },
      error: (error: any) => {
        this.message = error.error?.error || 'Failed to delete reservation.';
        console.error(error);
      }
    });
  }
}

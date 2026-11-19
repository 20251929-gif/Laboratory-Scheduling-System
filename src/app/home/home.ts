
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface ReservationData {
  reserveeName: string;
  room: string;
  date: string;
  slot: string;
  reason: string;
  attendees: number;
}

interface MetaData {
  rooms: string[];
  slots: { id: string; label: string }[];
  reasons: string[];
}

@Component({
  imports: [FormsModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {

  private apiUrl = 'http://localhost:4200/api';

  rooms: string[] = [];
  slots: { id: string; label: string }[] = [];
  reasons: string[] = [];

  message = '';
  isLoading = false;

  newReservation: ReservationData = {
    reserveeName: '',
    room: '',
    date: '',
    slot: '',
    reason: '',
    attendees: 1
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOptions();
  }

  // Gets the dropdown options from the backend
  loadOptions(): void {
    this.http.get<MetaData>(`${this.apiUrl}/meta`).subscribe({
      next: (data: MetaData) => {
        this.rooms = data.rooms;
        this.slots = data.slots;
        this.reasons = data.reasons;
      },
      error: (error: any) => {
        this.message = 'Unable to load reservation options.';
        console.error(error);
      }
    });
  }

  // Sends the reservation information to the backend
  addReservation(): void {
    this.message = '';
    this.isLoading = true;

    this.http.post(`${this.apiUrl}/reservations`, this.newReservation).subscribe({
      next: () => {
        this.message = 'Reservation submitted successfully!';

        // Clears the form after successful submission
        this.newReservation = {
          reserveeName: '',
          room: '',
          date: '',
          slot: '',
          reason: '',
          attendees: 1
        };

        this.isLoading = false;
      },
      error: (error: any) => {
        this.message = error.error?.error || 'Failed to submit reservation.';
        this.isLoading = false;
        console.error(error);
      }
    });
  }
}

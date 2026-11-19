
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../reservation-service';
import { Meta, ReservationInput } from '../reservation-types';

@Component({
  imports: [FormsModule],
  selector: 'app-reservation',
  styleUrl: './reservation.css',
  templateUrl: './reservation.html',
})
export class Reservation implements OnInit {

  // Stores dropdown options from the backend
  rooms: string[] = [];
  slots: Meta['slots'] = [];
  reasons: string[] = [];

  // Stores the information entered in the reservation form
  newReservation: ReservationInput = {
    reserveeName: '',
    room: '',
    date: '',
    slot: '',
    reason: '',
    attendees: 1
  };

  message = '';
  isLoading = false;

  constructor(private reservationService: ReservationService) {}

  // Loads dropdown options when the component opens
  ngOnInit(): void {
    this.loadOptions();
  }

  // Retrieves rooms, time slots, and reasons from the backend
  loadOptions(): void {
    this.reservationService.getMeta().subscribe({
      next: (data: Meta) => {
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

  // Submits the reservation information to the backend
  addReservation(): void {
    this.message = '';
    this.isLoading = true;

    this.reservationService.createReservation(this.newReservation).subscribe({
      next: () => {
        this.message = 'Reservation submitted successfully!';

        // Resets the form after successful submission
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

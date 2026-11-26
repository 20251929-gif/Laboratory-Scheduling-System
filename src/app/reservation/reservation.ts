
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  rooms: string[] = [];
  slots: Meta['slots'] = [];
  reasons: string[] = [];

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

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOptions();
  }

  // Loads the available reservation options
  loadOptions(): void {
    this.reservationService.getMeta().subscribe({
      next: (data: Meta) => {
        this.rooms = data.rooms;
        this.slots = data.slots;
        this.reasons = data.reasons;

        this.cdr.markForCheck();
      },

      error: (error: any) => {
        this.message = 'Unable to load reservation options.';
        console.error(error);

        this.cdr.markForCheck();
      }
    });
  }

  // Submits a new reservation
  addReservation(): void {
    this.message = '';
    this.isLoading = true;

    this.reservationService.createReservation(this.newReservation).subscribe({
      next: (response) => {
        console.log('Reservation response:', response);

        this.message = 'Reservation submitted successfully!';

        // Resets the form fields
        this.newReservation = {
          reserveeName: '',
          room: '',
          date: '',
          slot: '',
          reason: '',
          attendees: 1
        };

        this.isLoading = false;

        // Notifies Angular to update the view
        this.cdr.markForCheck();
      },

      error: (error: any) => {
        console.error('Submission error:', error);

        this.message = error.error?.error || 'Failed to submit reservation.';
        this.isLoading = false;

        this.cdr.markForCheck();
      }
    });
  }
}

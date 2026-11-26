
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReservationService } from '../reservation-service';
import { ReservationRecord } from '../reservation-types';

@Component({
  imports: [DatePipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {

  // Stores all reservations retrieved from the backend
  reservations: ReservationRecord[] = [];

  // Controls loading and message display
  isLoading = false;
  message = '';

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Automatically loads reservations when Home opens
  ngOnInit(): void {
    this.loadReservations();
  }

  // Retrieves all existing reservations
  loadReservations(): void {
    this.isLoading = true;
    this.message = '';

    this.reservationService.getReservations().subscribe({
      next: (data: ReservationRecord[]) => {
        console.log('Reservations received:', data);
        console.log('Number of reservations:', data.length);

        // Stores the retrieved reservations
        this.reservations = data;
        this.isLoading = false;

        // Notifies Angular to update the view
        this.cdr.markForCheck();
      },

      error: (error: any) => {
        this.message = 'Unable to load reservations. Please try again.';
        this.isLoading = false;

        console.error('Failed to load reservations:', error);

        this.cdr.markForCheck();
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

    this.reservationService.deleteReservation(id).subscribe({
      next: () => {
        this.message = 'Reservation deleted successfully.';

        this.cdr.markForCheck();

        // Reloads the reservation list after deletion
        this.loadReservations();
      },

      error: (error: any) => {
        this.message = error.error?.error || 'Failed to delete reservation.';

        console.error('Failed to delete reservation:', error);

        this.cdr.markForCheck();
      }
    });
  }
}

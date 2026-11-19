import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {catchError, of} from 'rxjs';
import {ReservationService} from '../reservation-service';

@Component({
  selector: 'app-reservation',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="page">
      <h1>{{ reservationId ? 'Edit Reservation' : 'Reserve a Room' }}</h1>

      @if (options(); as meta) {
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="field">
            <label for="room">Room</label>
            <select id="room" formControlName="room" [attr.aria-invalid]="isInvalid('room')">
              <option value="" disabled>Select a room</option>
              @for (room of meta.rooms; track room) {
                <option [value]="room">{{ room }}</option>
              }
            </select>
            @if (isInvalid('room')) {
              <p class="error" role="alert">Please choose a room.</p>
            }
          </div>

          <div class="field">
            <label for="date">Date</label>
            <input id="date" type="date" formControlName="date" [attr.aria-invalid]="isInvalid('date')" />
            @if (isInvalid('date')) {
              <p class="error" role="alert">Please choose a date.</p>
            }
          </div>

          <div class="field">
            <label for="slot">Time</label>
            <select id="slot" formControlName="slot" [attr.aria-invalid]="isInvalid('slot')">
              <option value="" disabled>Select a time</option>
              @for (slot of meta.slots; track slot.id) {
                <option [value]="slot.id">{{ slot.label }}</option>
              }
            </select>
            @if (isInvalid('slot')) {
              <p class="error" role="alert">Please choose a time.</p>
            }
          </div>

          <div class="field">
            <label for="reserveeName">Reservee name</label>
            <input
              id="reserveeName"
              type="text"
              formControlName="reserveeName"
              [attr.aria-invalid]="isInvalid('reserveeName')"
            />
            @if (isInvalid('reserveeName')) {
              <p class="error" role="alert">Enter a name (2 to 100 characters).</p>
            }
          </div>

          <div class="field">
            <label for="reason">Reason</label>
            <select id="reason" formControlName="reason" [attr.aria-invalid]="isInvalid('reason')">
              <option value="" disabled>Select a reason</option>
              @for (reason of meta.reasons; track reason) {
                <option [value]="reason">{{ reason }}</option>
              }
            </select>
            @if (isInvalid('reason')) {
              <p class="error" role="alert">Please choose a reason.</p>
            }
          </div>

          <div class="field">
            <label for="attendees">Number of attendees</label>
            <input
              id="attendees"
              type="number"
              formControlName="attendees"
              [attr.aria-invalid]="isInvalid('attendees')"
            />
            @if (isInvalid('attendees')) {
              <p class="error" role="alert">Enter a number from 1 to 200.</p>
            }
          </div>

          @if (errorMessage()) {
            <p class="error" role="alert">{{ errorMessage() }}</p>
          }

          <div class="actions">
            <button type="submit" [disabled]="saving()">
              {{ reservationId ? 'Save Changes' : 'Reserve' }}
            </button>
            <a routerLink="/reservations">Cancel</a>
          </div>
        </form>
      } @else if (options() === null) {
        <p class="error" role="alert">Could not load the rooms and times. Is the server running?</p>
      } @else {
        <p>Loading...</p>
      }
    </main>
  `,
  styles: `
    .page {
      max-width: 520px;
      margin: 0 auto;
      padding: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }

    label {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    input,
    select {
      padding: 0.5rem;
      border: 1px solid #595959;
      border-radius: 4px;
      font-size: 1rem;
    }

    input[aria-invalid='true'],
    select[aria-invalid='true'] {
      border-color: #b00020;
    }

    .error {
      color: #b00020;
      margin: 0.25rem 0 0;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    button {
      background: #1e3a5f;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 0.6rem 1.2rem;
      font-size: 1rem;
      cursor: pointer;
    }

    button:disabled {
      background: #595959;
      cursor: not-allowed;
    }
  `,
})
export class Reservation {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);

  protected readonly reservationId = inject(ActivatedRoute).snapshot.paramMap.get('id');


  protected readonly options = toSignal(
    this.reservationService.getMeta().pipe(catchError(() => of(null))),
  );

  protected readonly errorMessage = signal('');
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    room: ['', Validators.required],
    date: ['', Validators.required],
    slot: ['', Validators.required],
    reserveeName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    reason: ['', Validators.required],
    attendees: [1, [Validators.required, Validators.min(1), Validators.max(200)]],
  });

  constructor() {
    if (this.reservationId) {
      this.reservationService.getReservation(this.reservationId).subscribe({
        next: (reservation) =>
          this.form.patchValue({
            room: reservation.room,
            date: reservation.date.slice(0, 10),
            slot: reservation.slot,
            reserveeName: reservation.reserveeName,
            reason: reservation.reason,
            attendees: reservation.attendees,
          }),
        error: () => this.errorMessage.set('Could not load this reservation.'),
      });
    }
  }

  protected isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.saving.set(true);

    const data = this.form.getRawValue();
    const request = this.reservationId
      ? this.reservationService.updateReservation(this.reservationId, data)
      : this.reservationService.createReservation(data);

    request.subscribe({
      next: () => this.router.navigate(['/reservations']),
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.error ?? 'Something went wrong. Please try again.');
        this.saving.set(false);
      },
    });
  }
}
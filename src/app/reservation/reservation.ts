// reservation.ts
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Crud, Reservation } from '../crud';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-reservation-form',
  styleUrl: './reservation.css',
  templateUrl: './reservation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  crud = inject(Crud);

  editingID = signal<string | null>(null);
  formError = signal<string | null>(null);

  reservationForm = this.formBuilder.nonNullable.group({
    room: ['', Validators.required],
    slot: ['', Validators.required],
    date: ['', Validators.required],
    reason: ['', Validators.required],
  });

  ngOnInit() {
    // Load dropdown choices and the list when the component is shown
    this.crud.fetchMeta();
    this.crud.fetchReservations();

    // Refresh the schedule checker whenever the chosen date changes
    this.reservationForm.controls.date.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date) => {
        if (date) this.crud.fetchSchedule(date);
      });
  }

  onSubmit() {
    if (this.reservationForm.invalid) return;

    const data = this.reservationForm.getRawValue();
    const id = this.editingID();
    this.formError.set(null);

    if (id) {
      this.crud.updateReservation(id, data).subscribe({
        next: () => {
          this.crud.fetchReservations();
          this.refreshSchedule(data.date);
          this.cancelEdit();
        },
        error: (err) => this.showError('Update failed', err),
      });
    } else {
      this.crud.saveReservation(data).subscribe({
        next: () => {
          this.crud.fetchReservations();
          this.refreshSchedule(data.date);
          this.reservationForm.reset();
        },
        error: (err) => this.showError('Save failed', err),
      });
    }
  }

  deleteReservation(id: string) {
    if (confirm('Cancel this reservation?')) {
      this.crud.deleteReservation(id);
    }
  }

  startEdit(reservation: Reservation) {
    this.editingID.set(reservation._id);
    this.formError.set(null);
    this.reservationForm.patchValue({
      ...reservation,
      // <input type="date"> needs yyyy-MM-dd, but the API returns a full ISO string
      date: reservation.date.slice(0, 10),
    });
  }

  cancelEdit() {
    this.editingID.set(null);
    this.formError.set(null);
    this.reservationForm.reset();
  }

  // Quick-fill the form by clicking an available cell in the schedule
  pickSlot(room: string, slot: string) {
    this.reservationForm.patchValue({ room, slot });
  }

  private refreshSchedule(date: string) {
    if (date) this.crud.fetchSchedule(date);
  }

  // Shows the server's message (e.g. the 409 double-booking) if there is one
  private showError(fallback: string, err: any) {
    console.error(fallback, err);
    this.formError.set(err?.error?.error ?? fallback);
  }
}
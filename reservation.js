const mongoose = require('mongoose');

const ROOMS = [
  'F213',
  'F215',
  'F217',
  'F219',
  'F211',
];

const SLOTS = [
  { id: '08:00-10:00', label: '8:00–10:00 AM' },
  { id: '10:00-12:00', label: '10:00–12:00 PM' },
  { id: '13:00-15:00', label: '1:00–3:00 PM' },
  { id: '15:00-17:00', label: '3:00–5:00 PM' }
];
const SLOT_IDS = SLOTS.map((slot) => slot.id);

const REASONS = [
  'Regular Class',
  'Examination',
  'Make-up Class',
  'Faculty Meeting',
  'Student Organization Meeting',
  'Seminar/Workshop',
  'Research Activity',
];

const reservationSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      enum: { values: ROOMS, message: '{VALUE} is not a valid room.' },
      required: [true, 'Room is required.'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required.'],
    },
    slot: {
      type: String,
      enum: { values: SLOT_IDS, message: '{VALUE} is not a valid time slot.' },
      required: [true, 'Time slot is required.'],
    },
    reserveeName: {
      type: String,
      required: [true, 'Reservee name is required.'],
      trim: true,
      minlength: [2, 'Reservee name must be at least 2 characters.'],
      maxlength: [100, 'Reservee name must be at most 100 characters.'],
    },
    reason: {
      type: String,
      enum: { values: REASONS, message: '{VALUE} is not a valid reason.' },
      required: [true, 'Reason is required.'],
    },
    attendees: {
      type: Number,
      required: [true, 'Number of attendees is required.'],
      min: [1, 'Attendees must be at least 1.'],
      max: [200, 'Attendees must be at most 200.'],
      validate: { validator: Number.isInteger, message: 'Attendees must be a whole number.' },
    },
  },
  { timestamps: true },
);


reservationSchema.index({ room: 1, date: 1, slot: 1 }, { unique: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = { Reservation, ROOMS, SLOTS, SLOT_IDS, REASONS };

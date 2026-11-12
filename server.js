require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:4200' }));
app.use(express.json());

const ROOMS = [
  'Room 101',
  'Room 102',
  'Room 103',
  'Computer Laboratory',
  'Science Laboratory',
  'Conference Room',
];

const TIME_SLOTS = ['8:00-10:00 AM', '10:00-12:00 PM', '1:00-3:00 PM'];

const PURPOSES = [
  'Regular Class',
  'Examination',
  'Make-up Class',
  'Faculty Meeting',
  'Student Organization Meeting',
  'Seminar/Workshop',
  'Research Activity',
  'Other',
];

const reservationSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, enum: ROOMS },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
    time: { type: String, required: true, enum: TIME_SLOTS },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    reason: { type: String, required: true, enum: PURPOSES },
  },
  { timestamps: true }
);


reservationSchema.index({ room: 1, date: 1, time: 1 }, { unique: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

const CONFLICT_MSG = 'That room is already reserved for the selected date and time.';

function handleError(res, err) {
  if (err.code === 11000) return res.status(409).json({ message: CONFLICT_MSG });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID.' });
  console.error(err);
  return res.status(500).json({ message: 'Server error.' });
}

const pickBody = ({ room, date, time, name, reason }) => ({
  room, date, time, name, reason,
});


app.get('/api/rooms', (_req, res) => res.json(ROOMS));
app.get('/api/time-slots', (_req, res) => res.json(TIME_SLOTS));
app.get('/api/purposes', (_req, res) => res.json(PURPOSES));


app.get('/api/availability', async (req, res) => {
  try {
    const { date, time } = req.query;
    if (!date) return res.status(400).json({ message: 'date is required (YYYY-MM-DD).' });

    const booked = await Reservation.find({ date }).lean();

    if (time) {
      const takenRooms = new Set(booked.filter((r) => r.time === time).map((r) => r.room));
      return res.json(ROOMS.filter((r) => !takenRooms.has(r)));
    }

    const result = ROOMS.map((room) => ({
      room,
      availableSlots: TIME_SLOTS.filter(
        (slot) => !booked.some((b) => b.room === room && b.time === slot)
      ),
    }));
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date is required (YYYY-MM-DD).' });

    const booked = await Reservation.find({ date }).lean();

    const schedule = ROOMS.map((room) => ({
      room,
      slots: TIME_SLOTS.map((time) => {
        const hit = booked.find((b) => b.room === room && b.time === time);
        return {
          time,
          status: hit ? 'Occupied' : 'Available',
          reservationId: hit ? hit._id : null,
          name: hit ? hit.name : null,
          reason: hit ? hit.reason : null,
        };
      }),
    }));

    res.json({ date, timeSlots: TIME_SLOTS, schedule });
  } catch (err) {
    handleError(res, err);
  }
});

// ---------------------------------------------------------------
// Reservations CRUD
// ---------------------------------------------------------------

// CREATE
app.post('/api/reservations', async (req, res) => {
  try {
    const reservation = await Reservation.create(pickBody(req.body));
    res.status(201).json(reservation);
  } catch (err) {
    handleError(res, err);
  }
});

// READ (all, optional filters: ?date=&room=)
app.get('/api/reservations', async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.room) filter.room = req.query.room;
    const list = await Reservation.find(filter).sort({ date: 1, time: 1 });
    res.json(list);
  } catch (err) {
    handleError(res, err);
  }
});

// READ (one)
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const found = await Reservation.findById(req.params.id);
    if (!found) return res.status(404).json({ message: 'Reservation not found.' });
    res.json(found);
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE (Edit Reservation)
app.put('/api/reservations/:id', async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, pickBody(req.body), {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Reservation not found.' });
    res.json(updated);
  } catch (err) {
    handleError(res, err);
  }
});

// Cancel Reservation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Reservation not found.' });
    res.json({ message: 'Reservation cancelled.' });
  } catch (err) {
    handleError(res, err);
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await Reservation.init(); // make sure the unique index exists
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
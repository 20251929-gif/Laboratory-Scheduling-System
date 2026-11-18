/**
 * Name(s):  <Lastname, First Name>; <Lastname, First Name>; <Lastname, First Name>
 * Date:     November 2026
 * Project:  Laboratory Room Scheduling System (CSAPPD1 Final Project)
 * File:     server.js - REST API for reservations (CRUD) and the schedule
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Reservation, ROOMS, SLOTS, REASONS } = require('./models/reservation');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN.split(',') }));
app.use(express.json());

// Picks the right status code for an error
function sendError(res, err) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'That room is already reserved at that date and time.' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Server error.' });
}

// Dropdown choices for the forms
app.get('/api/meta', (req, res) => {
  res.json({ rooms: ROOMS, slots: SLOTS, reasons: REASONS });
});

// Schedule checker: every room and slot for one date (?date=2026-11-20)
app.get('/api/schedule', async (req, res) => {
  const date = new Date(req.query.date);
  if (isNaN(date)) return res.status(400).json({ error: 'date must look like 2026-11-20.' });

  try {
    const reservations = await Reservation.find({ date });

    const schedule = ROOMS.map((room) => ({
      room,
      slots: SLOTS.map((slot) => {
        const found = reservations.find((r) => r.room === room && r.slot === slot.id);
        return {
          slot: slot.id,
          label: slot.label,
          status: found ? 'occupied' : 'available',
          reservation: found || null,
        };
      }),
    }));

    res.json(schedule);
  } catch (err) {
    sendError(res, err);
  }
});

// READ all (optional ?date=2026-11-20)
app.get('/api/reservations', async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = new Date(req.query.date);

    const reservations = await Reservation.find(filter).sort({ date: 1, slot: 1 });
    res.json(reservations);
  } catch (err) {
    sendError(res, err);
  }
});

// READ one
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
    res.json(reservation);
  } catch (err) {
    sendError(res, err);
  }
});

// CREATE
app.post('/api/reservations', async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    sendError(res, err);
  }
});

// UPDATE
app.put('/api/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
    res.json(reservation);
  } catch (err) {
    sendError(res, err);
  }
});

// DELETE
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
    res.status(204).end();
  } catch (err) {
    sendError(res, err);
  }
});

// Connect to MongoDB, then start the server
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`API running on port ${port}`)))
  .catch((err) => console.error('Could not connect to MongoDB:', err.message));

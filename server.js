require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
})

const Reservation = mongoose.model('Reservation', {
    name : String,
    time : String,
    room : String,
    reason : String,
});


// CRUD IN WORK | Current Placeholders
app.post('/api/reservations', async (req, res) => {
    const { name, time, room, reason } = req.body;
    const reservation = new Reservation({ name, time, room, reason });
    await reservation.save();
    res.status(201).send(reservation);
});

app.get('/api/reservations', async (req, res) => {
    const reservations = await Reservation.find();
    res.send(reservations);
});

app.delete('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    await Reservation.findByIdAndDelete(id);
    res.status(204).send();
});

app.put('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    const { name, time, room, reason } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(id, { name, time, room, reason }, { new: true });
    res.send(reservation);
});
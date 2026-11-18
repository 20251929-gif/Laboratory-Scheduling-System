require('dotenv').config();
const mongoose = require('mongoose');
const { Reservation } = require('./models/reservation');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Samples
const SAMPLES = [
  { dayOffset: 0, room: 'F213', slot: '08:00-10:00', reserveeName: 'Maria Santos', reason: 'Regular Class', attendees: 35 },
  { dayOffset: 0, room: 'F215', slot: '08:00-10:00', reserveeName: 'Jose Ramirez', reason: 'Examination', attendees: 40 },
  { dayOffset: 0, room: 'F217', slot: '10:00-12:00', reserveeName: 'Ana Reyes', reason: 'Regular Class', attendees: 30 },
  { dayOffset: 0, room: 'F219', slot: '13:00-15:00', reserveeName: 'Carlo Mendoza', reason: 'Faculty Meeting', attendees: 12 },
  { dayOffset: 0, room: 'F211', slot: '15:00-17:00', reserveeName: 'Liza Cruz', reason: 'Research Activity', attendees: 8 },
  { dayOffset: 1, room: 'F213', slot: '08:00-10:00', reserveeName: 'Paolo Garcia', reason: 'Student Organization Meeting', attendees: 25 },
  { dayOffset: 1, room: 'F215', slot: '13:00-15:00', reserveeName: 'Grace Villanueva', reason: 'Make-up Class', attendees: 28 },
  { dayOffset: 1, room: 'F217', slot: '08:00-10:00', reserveeName: 'Ramon Dela Cruz', reason: 'Examination', attendees: 38 },
  { dayOffset: 1, room: 'F219', slot: '10:00-12:00', reserveeName: 'Teresa Bautista', reason: 'Seminar/Workshop', attendees: 60 },
  { dayOffset: 1, room: 'F211', slot: '15:00-17:00', reserveeName: 'Miguel Torres', reason: 'Regular Class', attendees: 24 },
  { dayOffset: 2, room: 'F213', slot: '10:00-12:00', reserveeName: 'Isabel Navarro', reason: 'Research Activity', attendees: 15 },
  { dayOffset: 2, room: 'F215', slot: '13:00-15:00', reserveeName: 'Daniel Aquino', reason: 'Faculty Meeting', attendees: 18 },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in .env');
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const documents = SAMPLES.map(({ dayOffset, ...fields }) => ({
    ...fields,
    date: new Date(today.getTime() + dayOffset * MS_PER_DAY),
  }));

  await mongoose.connect(process.env.MONGODB_URI);
  await Reservation.init();
  await Reservation.deleteMany({});
  const inserted = await Reservation.insertMany(documents);
  console.log(`Seeded ${inserted.length} reservations.`);
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

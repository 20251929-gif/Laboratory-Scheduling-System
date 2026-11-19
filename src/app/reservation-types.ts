export interface Slot {
  id: string;
  label: string;
}

export interface Meta {
  rooms: string[];
  slots: Slot[];
  reasons: string[];
}

export interface ReservationInput {
  room: string;
  date: string; 
  slot: string;
  reserveeName: string;
  reason: string;
  attendees: number;
}

export interface ReservationRecord extends ReservationInput {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}
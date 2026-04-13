export type Booking = {
  id: string;
  clientId?: string;
  vehicleId?: string;
  date: string;
  time: string;
  client: string;
  phone: string;
  clientNotes?: string;
  clientVisits?: number;
  vehicle: string;
  vehicleDetails?: string;
  licensePlate: string;
  service: string;
  duration: string;
  amount: string;
  status: BookingStatus;
  bay: string;
  notes: string;
};

export const bookingStatuses = [
  'Nowa',
  'Potwierdzona',
  'W realizacji',
  'Gotowa do odbioru',
  'Anulowana',
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

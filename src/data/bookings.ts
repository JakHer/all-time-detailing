export type BookingStatus =
  | 'Nowa'
  | 'Potwierdzona'
  | 'W realizacji'
  | 'Gotowa do odbioru'
  | 'Anulowana';

export type Booking = {
  id: string;
  date: string;
  time: string;
  client: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  service: string;
  duration: string;
  amount: string;
  status: BookingStatus;
  bay: string;
  notes: string;
};

export const bookingStatuses: BookingStatus[] = [
  'Nowa',
  'Potwierdzona',
  'W realizacji',
  'Gotowa do odbioru',
  'Anulowana',
];

export const initialBookings: Booking[] = [
  {
    id: 'BK-2401',
    date: '2026-04-08',
    time: '08:30',
    client: 'Michał Woźniak',
    phone: '+48 600 120 320',
    vehicle: 'Porsche Cayenne',
    licensePlate: 'WA 4521P',
    service: 'Pakiet showroom + ceramika',
    duration: '6 h',
    amount: '2 800 zł',
    status: 'Potwierdzona',
    bay: 'Stanowisko 1',
    notes:
      'Klient prosi o kontakt przed wydaniem auta. Zdjęcia przed realizacją obowiązkowe.',
  },
  {
    id: 'BK-2402',
    date: '2026-04-08',
    time: '10:00',
    client: 'Karol Nowicki',
    phone: '+48 604 998 112',
    vehicle: 'BMW M4',
    licensePlate: 'KR 9M440',
    service: 'Korekta lakieru dwuetapowa',
    duration: '8 h',
    amount: '3 600 zł',
    status: 'W realizacji',
    bay: 'Stanowisko 2',
    notes: 'Lakier miękki, szczególna uwaga na maskę i lewy błotnik.',
  },
  {
    id: 'BK-2403',
    date: '2026-04-08',
    time: '13:30',
    client: 'Anna Mazur',
    phone: '+48 570 330 218',
    vehicle: 'Mercedes GLE',
    licensePlate: 'PO 7GL33',
    service: 'Detailing wnętrza premium',
    duration: '4 h',
    amount: '1 150 zł',
    status: 'Nowa',
    bay: 'Stanowisko 3',
    notes:
      'Fotel kierowcy wymaga dokładnego czyszczenia skóry. Auto z fotelikami dziecięcymi.',
  },
  {
    id: 'BK-2404',
    date: '2026-04-08',
    time: '16:00',
    client: 'Piotr Kamiński',
    phone: '+48 502 441 781',
    vehicle: 'Audi RS6',
    licensePlate: 'GD 88RS6',
    service: 'Mycie detailingowe + zabezpieczenie szyb',
    duration: '2.5 h',
    amount: '620 zł',
    status: 'Gotowa do odbioru',
    bay: 'Strefa wydania',
    notes: 'Auto gotowe po 18:30. Klient odbierze osobiście.',
  },
];

import { supabase } from './supabase';
import {
  mapBookingRowToViewModel,
  formatPrice,
  type BookingRow,
} from './bookings';
import { getTodayDateString, getStartAndEndOfDay } from './dateUtils';
import type { BookingStatus } from '../data/bookings';

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type LiveJob = {
  time: string;
  vehicle: string;
  client: string;
  service: string;
  status: BookingStatus;
};

export type FeaturedService = {
  name: string;
  description: string;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  queue: LiveJob[];
  featuredServices: FeaturedService[];
};

export async function fetchDashboardData(): Promise<DashboardData> {
  const today = getTodayDateString();
  const { start, end } = getStartAndEndOfDay(today);

  const [bookingsResult, servicesResult] = await Promise.all([
    supabase
      .from('bookings')
      .select(
        `
        id,
        scheduled_at,
        duration_minutes,
        price,
        status,
        bay,
        notes,
        clients!inner(id, full_name, phone, email, notes, created_at, updated_at),
        vehicles!inner(id, client_id, make, model, registration, production_year, color, notes, created_at, updated_at),
        services!inner(id, name, description, duration_minutes, base_price, is_active, created_at, updated_at)
      `,
      )
      .gte('scheduled_at', start)
      .lte('scheduled_at', end)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('services')
      .select('name, description')
      .eq('is_active', true)
      .limit(3),
  ]);

  if (bookingsResult.error) throw bookingsResult.error;
  if (servicesResult.error) throw servicesResult.error;

  const todayBookings = (bookingsResult.data as unknown as BookingRow[]).map(
    mapBookingRowToViewModel,
  );

  const totalCars = todayBookings.length;
  const activeCars = todayBookings.filter(
    (b) => b.status === 'W realizacji' || b.status === 'Potwierdzona',
  ).length;
  const totalRevenue = todayBookings.reduce((sum, b) => {
    const price = parseFloat(b.amount.replace(/[^\d.]/g, '').replace(',', '.'));
    return sum + (isNaN(price) ? 0 : price);
  }, 0);
  const avgTicket = totalCars > 0 ? totalRevenue / totalCars : 0;

  const metrics: DashboardMetric[] = [
    {
      label: 'Auta dzisiaj',
      value: totalCars.toString().padStart(2, '0'),
      detail: `${activeCars} już w planie lub realizacji`,
    },
    {
      label: 'Średni koszyk',
      value: formatPrice(avgTicket),
      detail: 'Na podstawie dzisiejszych zleceń',
    },
    {
      label: 'Status dnia',
      value: totalCars > 0 ? 'Aktywny' : 'Brak',
      detail:
        totalCars > 0
          ? 'Studio pracuje na pełnych obrotach'
          : 'Oczekiwanie na pierwsze auto',
    },
  ];

  const queue: LiveJob[] = todayBookings.map((b) => ({
    time: b.time,
    vehicle: b.vehicle,
    client: b.client,
    service: b.service,
    status: b.status,
  }));

  const featuredServices: FeaturedService[] = servicesResult.data.map((s) => ({
    name: s.name,
    description: s.description || '',
  }));

  return {
    metrics,
    queue,
    featuredServices,
  };
}

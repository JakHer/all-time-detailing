import type { Booking, BookingStatus } from '../data/bookings';
import type { Database } from './database.types';
import { supabase } from './supabase';

export type ClientOption = {
  id: string;
  fullName: string;
  phone: string;
};

export type VehicleOption = {
  id: string;
  clientId: string;
  label: string;
  registration: string;
};

export type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  basePrice: number;
};

export type BookingFormOptions = {
  clients: ClientOption[];
  vehicles: VehicleOption[];
  services: ServiceOption[];
};

export type BookingInsert = Omit<Booking, 'id'>;

export type BookingRow = Database['public']['Tables']['bookings']['Row'] & {
  clients: Database['public']['Tables']['clients']['Row'];
  vehicles: Database['public']['Tables']['vehicles']['Row'];
  services: Database['public']['Tables']['services']['Row'];
};

export async function fetchBookings(search?: string) {
  let query = supabase.from('bookings').select(
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
  );

  if (search) {
    const s = `%${search}%`;
    query = query.or(
      `notes.ilike.${s},bay.ilike.${s},clients.full_name.ilike.${s},clients.phone.ilike.${s},vehicles.make.ilike.${s},vehicles.model.ilike.${s},vehicles.registration.ilike.${s},services.name.ilike.${s}`,
    );
  }

  const { data, error } = await query.order('scheduled_at', {
    ascending: true,
  });

  if (error) {
    throw error;
  }

  return (data as BookingRow[]).map(mapBookingRowToViewModel);
}

export async function fetchBookingFormOptions() {
  const [clientsResult, vehiclesResult, servicesResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id, full_name, phone')
      .order('full_name', { ascending: true }),
    supabase
      .from('vehicles')
      .select('id, client_id, make, model, registration')
      .order('registration', { ascending: true }),
    supabase
      .from('services')
      .select('id, name, duration_minutes, base_price')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ]);

  if (clientsResult.error) throw clientsResult.error;
  if (vehiclesResult.error) throw vehiclesResult.error;
  if (servicesResult.error) throw servicesResult.error;

  return {
    clients: (clientsResult.data ?? []).map(
      (client) =>
        ({
          id: client.id,
          fullName: client.full_name,
          phone: client.phone,
        }) satisfies ClientOption,
    ),
    vehicles: (vehiclesResult.data ?? []).map(
      (vehicle) =>
        ({
          id: vehicle.id,
          clientId: vehicle.client_id,
          label: `${vehicle.make} ${vehicle.model}`.trim(),
          registration: vehicle.registration,
        }) satisfies VehicleOption,
    ),
    services: (servicesResult.data ?? []).map(
      (service) =>
        ({
          id: service.id,
          name: service.name,
          durationMinutes: service.duration_minutes,
          basePrice: Number(service.base_price),
        }) satisfies ServiceOption,
    ),
  };
}

export async function createBooking(input: BookingInsert) {
  const relationIds = await upsertBookingRelations(input);
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: relationIds.clientId,
      vehicle_id: relationIds.vehicleId,
      service_id: relationIds.serviceId,
      scheduled_at: combineDateAndTime(input.date, input.time),
      duration_minutes: parseDurationToMinutes(input.duration),
      price: parsePriceToNumber(input.amount),
      status: input.status,
      bay: input.bay,
      notes: input.notes,
    })
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
    .single();

  if (error) throw error;
  return mapBookingRowToViewModel(data as BookingRow);
}

export async function updateBooking(input: Booking) {
  const relationIds = await upsertBookingRelations(input);
  const { data, error } = await supabase
    .from('bookings')
    .update({
      client_id: relationIds.clientId,
      vehicle_id: relationIds.vehicleId,
      service_id: relationIds.serviceId,
      scheduled_at: combineDateAndTime(input.date, input.time),
      duration_minutes: parseDurationToMinutes(input.duration),
      price: parsePriceToNumber(input.amount),
      status: input.status,
      bay: input.bay,
      notes: input.notes,
    })
    .eq('id', input.id)
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
    .single();

  if (error) throw error;
  return mapBookingRowToViewModel(data as BookingRow);
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
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
    .single();

  if (error) throw error;
  return mapBookingRowToViewModel(data as BookingRow);
}

export async function deleteBooking(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) throw error;
}

export async function restoreBooking(input: Booking) {
  const relationIds = await upsertBookingRelations(input);
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      id: input.id,
      client_id: relationIds.clientId,
      vehicle_id: relationIds.vehicleId,
      service_id: relationIds.serviceId,
      scheduled_at: combineDateAndTime(input.date, input.time),
      duration_minutes: parseDurationToMinutes(input.duration),
      price: parsePriceToNumber(input.amount),
      status: input.status,
      bay: input.bay,
      notes: input.notes,
    })
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
    .single();

  if (error) throw error;
  return mapBookingRowToViewModel(data as BookingRow);
}

async function upsertBookingRelations(booking: BookingInsert | Booking) {
  const clientId = await upsertClient(booking.client, booking.phone);
  const vehicleId = await upsertVehicle(
    clientId,
    booking.vehicle,
    booking.licensePlate,
  );
  const serviceId = await upsertService(
    booking.service,
    booking.duration,
    booking.amount,
  );

  return {
    clientId,
    vehicleId,
    serviceId,
  };
}

async function upsertClient(fullName: string, phone: string) {
  const { data: existingClient, error: selectError } = await supabase
    .from('clients')
    .select('id')
    .eq('full_name', fullName)
    .eq('phone', phone)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existingClient) {
    return existingClient.id;
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ full_name: fullName, phone })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertVehicle(
  clientId: string,
  vehicleLabel: string,
  registration: string,
) {
  const { data: existingVehicle, error: selectError } = await supabase
    .from('vehicles')
    .select('id')
    .eq('registration', registration)
    .maybeSingle();

  if (selectError) throw selectError;

  const { make, model } = splitVehicleLabel(vehicleLabel);

  if (existingVehicle) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ client_id: clientId, make, model })
      .eq('id', existingVehicle.id)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert({ client_id: clientId, make, model, registration })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertService(name: string, duration: string, amount: string) {
  const { data: existingService, error: selectError } = await supabase
    .from('services')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (selectError) throw selectError;

  const durationMinutes = parseDurationToMinutes(duration);
  const basePrice = parsePriceToNumber(amount);

  if (existingService) {
    const { data, error } = await supabase
      .from('services')
      .update({ duration_minutes: durationMinutes, base_price: basePrice })
      .eq('id', existingService.id)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from('services')
    .insert({ name, duration_minutes: durationMinutes, base_price: basePrice })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export function mapBookingRowToViewModel(row: BookingRow): Booking {
  const scheduledAt = new Date(row.scheduled_at);
  const vehicleDetails = [row.vehicles.color, row.vehicles.production_year]
    .filter(Boolean)
    .join(', ');

  return {
    id: row.id,
    date: formatLocalDate(scheduledAt),
    time: formatLocalTime(scheduledAt),
    client: row.clients.full_name,
    phone: row.clients.phone,
    clientNotes: row.clients.notes ?? '',
    vehicle: `${row.vehicles.make} ${row.vehicles.model}`.trim(),
    vehicleDetails,
    licensePlate: row.vehicles.registration,
    service: row.services.name,
    duration: formatDuration(row.duration_minutes),
    amount: formatPrice(row.price),
    status: row.status,
    bay: row.bay ?? '',
    notes: row.notes ?? '',
  };
}

export function splitVehicleLabel(vehicleLabel: string) {
  const [make = '', ...modelParts] = vehicleLabel.trim().split(/\s+/);

  return {
    make,
    model: modelParts.join(' ') || make,
  };
}

export function combineDateAndTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function parseDurationToMinutes(duration: string) {
  const normalized = duration.replace(',', '.').trim();
  const numericValue = Number.parseFloat(normalized.replace(/[^\d.]/g, ''));

  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return 60;
  }

  return Math.round(numericValue * 60);
}

export function parsePriceToNumber(amount: string) {
  const normalized = amount.replace(',', '.').replace(/[^\d.]/g, '');
  const numericValue = Number.parseFloat(normalized);

  if (Number.isNaN(numericValue) || numericValue < 0) {
    return 0;
  }

  return numericValue;
}

export function formatDuration(durationMinutes: number) {
  const hours = durationMinutes / 60;
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`;
}

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)} zł`;
}

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatLocalTime(value: Date) {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

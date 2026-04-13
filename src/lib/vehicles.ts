import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from './database.types';
import { supabase } from './supabase';

export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type NewVehicle = Database['public']['Tables']['vehicles']['Insert'];
export type UpdateVehicle = Database['public']['Tables']['vehicles']['Update'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];

export type VehicleBooking = Booking & {
  clients: Client;
  services: Pick<Service, 'id' | 'name'>;
};

export type VehicleWithRelations = Vehicle & {
  clients: Client;
  bookings: VehicleBooking[];
};

export type VehicleMetrics = {
  totalVehicles: number;
  newVehiclesLast30Days: number;
  vehiclesWithHistory: number;
  uniqueMakes: number;
};

export const vehiclesKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehiclesKeys.all, 'list'] as const,
  list: (filters: string) => [...vehiclesKeys.lists(), { filters }] as const,
  metrics: () => [...vehiclesKeys.all, 'metrics'] as const,
};

export async function getVehicles(): Promise<VehicleWithRelations[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(
      'id, client_id, make, model, registration, production_year, color, featured_image_url, notes, created_at, updated_at, clients(*), bookings(*, clients(*), services(id, name))',
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as VehicleWithRelations[]).map((vehicle) => ({
    ...vehicle,
    bookings: [...(vehicle.bookings ?? [])].sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    ),
  }));
}

export async function getVehicleMetrics(): Promise<VehicleMetrics> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, make, created_at, bookings(id)');

  if (error) {
    throw error;
  }

  const vehicles = (data ?? []) as Array<{
    id: string;
    make: string;
    created_at: string;
    bookings: Array<{ id: string }> | null;
  }>;

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const newVehiclesLast30Days = vehicles.filter((vehicle) => {
    const createdAt = new Date(vehicle.created_at).getTime();
    return Number.isFinite(createdAt) && createdAt >= thirtyDaysAgo;
  }).length;

  const vehiclesWithHistory = vehicles.filter(
    (vehicle) => (vehicle.bookings?.length ?? 0) > 0,
  ).length;
  const uniqueMakes = new Set(
    vehicles.map((vehicle) => vehicle.make.trim()).filter(Boolean),
  ).size;

  return {
    totalVehicles: vehicles.length,
    newVehiclesLast30Days,
    vehiclesWithHistory,
    uniqueMakes,
  };
}

export function useVehicles() {
  return useQuery({
    queryKey: vehiclesKeys.lists(),
    queryFn: getVehicles,
  });
}

export function useVehicleMetrics() {
  return useQuery({
    queryKey: vehiclesKeys.metrics(),
    queryFn: getVehicleMetrics,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newVehicle: NewVehicle) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(newVehicle)
        .select(
          'id, client_id, make, model, registration, production_year, color, featured_image_url, notes, created_at, updated_at, clients(*), bookings(*, clients(*), services(id, name))',
        )
        .single();

      if (error) {
        throw error;
      }

      return data as unknown as VehicleWithRelations;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateVehicle & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select(
          'id, client_id, make, model, registration, production_year, color, featured_image_url, notes, created_at, updated_at, clients(*), bookings(*, clients(*), services(id, name))',
        )
        .single();

      if (error) {
        throw error;
      }

      return data as unknown as VehicleWithRelations;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

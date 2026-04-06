import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from './database.types';
import { supabase } from './supabase';

export type Client = Database['public']['Tables']['clients']['Row'];
export type NewClient = Database['public']['Tables']['clients']['Insert'];
export type UpdateClient = Database['public']['Tables']['clients']['Update'];
export type BookingRecord = Database['public']['Tables']['bookings']['Row'];

export type ClientWithRelations = Client & {
  vehicles: Database['public']['Tables']['vehicles']['Row'][];
  bookings: BookingRecord[];
};

export type CustomerMetrics = {
  totalClients: number;
  newClientsLast30Days: number;
  returningRate: number;
  averageBookingValue: number;
};

export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (filters: string) => [...clientsKeys.lists(), { filters }] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
  metrics: () => [...clientsKeys.all, 'metrics'] as const,
};

export async function getClients(): Promise<ClientWithRelations[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, vehicles(*), bookings(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ClientWithRelations[];
}

export async function getClient(id: string): Promise<ClientWithRelations> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, vehicles(*), bookings(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as ClientWithRelations;
}

export async function getCustomerMetrics(): Promise<CustomerMetrics> {
  const [clientsResult, bookingsResult] = await Promise.all([
    supabase.from('clients').select('id, created_at'),
    supabase.from('bookings').select('client_id, price'),
  ]);

  if (clientsResult.error) {
    throw clientsResult.error;
  }

  if (bookingsResult.error) {
    throw bookingsResult.error;
  }

  const clients = clientsResult.data ?? [];
  const bookings = bookingsResult.data ?? [];
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const newClientsLast30Days = clients.filter((client) => {
    const createdAt = new Date(client.created_at).getTime();
    return Number.isFinite(createdAt) && createdAt >= thirtyDaysAgo;
  }).length;

  const bookingsByClient = bookings.reduce<Record<string, number>>(
    (accumulator, booking) => {
      accumulator[booking.client_id] =
        (accumulator[booking.client_id] ?? 0) + 1;
      return accumulator;
    },
    {},
  );

  const returningClients = Object.values(bookingsByClient).filter(
    (count) => count > 1,
  ).length;
  const activeClients = Object.keys(bookingsByClient).length;
  const returningRate =
    activeClients > 0 ? (returningClients / activeClients) * 100 : 0;

  const totalBookingValue = bookings.reduce(
    (sum, booking) => sum + Number(booking.price ?? 0),
    0,
  );
  const averageBookingValue =
    bookings.length > 0 ? totalBookingValue / bookings.length : 0;

  return {
    totalClients: clients.length,
    newClientsLast30Days,
    returningRate,
    averageBookingValue,
  };
}

export function useClients() {
  return useQuery({
    queryKey: clientsKeys.lists(),
    queryFn: getClients,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientsKeys.detail(id),
    queryFn: () => getClient(id),
    enabled: !!id,
  });
}

export function useCustomerMetrics() {
  return useQuery({
    queryKey: clientsKeys.metrics(),
    queryFn: getCustomerMetrics,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newClient: NewClient) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsKeys.metrics() });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateClient & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: clientsKeys.metrics() });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsKeys.metrics() });
    },
  });
}

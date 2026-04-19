import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Database } from './database.types';
import { supabase } from './supabase';

export type Client = Database['public']['Tables']['clients']['Row'];
export type NewClient = Database['public']['Tables']['clients']['Insert'];
export type UpdateClient = Database['public']['Tables']['clients']['Update'];
export type BookingRecord = Database['public']['Tables']['bookings']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];
type VehicleRow = Database['public']['Tables']['vehicles']['Row'];

export type ClientBooking = BookingRecord & {
  services: Pick<ServiceRow, 'id' | 'name'>;
  vehicles: Pick<VehicleRow, 'id' | 'make' | 'model' | 'registration'>;
};

export type ClientWithRelations = Client & {
  vehicles: VehicleRow[];
  bookings: ClientBooking[];
};

export type ClientListItem = Client & {
  vehicles: Pick<VehicleRow, 'id'>[];
  bookings: Pick<BookingRecord, 'id' | 'scheduled_at'>[];
};

export type ClientOption = Pick<Client, 'id' | 'full_name' | 'phone' | 'email'>;

export type ClientsPage = {
  items: ClientListItem[];
  totalCount: number;
  nextOffset: number | null;
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

const CLIENTS_PAGE_SIZE = 10;

export async function getClientsPage({
  query = '',
  offset = 0,
}: {
  query?: string;
  offset?: number;
}): Promise<ClientsPage> {
  let request = supabase
    .from('clients')
    .select(
      'id, full_name, phone, email, notes, created_at, updated_at, vehicles(id), bookings(id, scheduled_at)',
      {
        count: 'exact',
      },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + CLIENTS_PAGE_SIZE - 1);

  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replace(/[%_,]/g, (character) => {
      if (character === '%') return '\\%';
      if (character === '_') return '\\_';
      return character;
    });

    request = request.or(
      `full_name.ilike.%${escapedQuery}%,phone.ilike.%${escapedQuery}%,email.ilike.%${escapedQuery}%`,
    );
  }

  const { data, error, count } = await request;

  if (error) {
    throw error;
  }

  const items = ((data ?? []) as unknown as ClientListItem[]).map((client) => ({
    ...client,
    vehicles: client.vehicles ?? [],
    bookings: [...(client.bookings ?? [])].sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    ),
  }));

  const totalCount = count ?? 0;
  const nextOffset =
    offset + items.length < totalCount ? offset + items.length : null;

  return {
    items,
    totalCount,
    nextOffset,
  };
}

export async function getClient(id: string): Promise<ClientWithRelations> {
  const { data, error } = await supabase
    .from('clients')
    .select(
      '*, vehicles(*), bookings(*, services(id, name), vehicles(id, make, model, registration))',
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const client = data as ClientWithRelations;

  return {
    ...client,
    vehicles: client.vehicles ?? [],
    bookings: [...(client.bookings ?? [])].sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    ),
  };
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

export async function getClientOptions(): Promise<ClientOption[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, full_name, phone, email')
    .order('full_name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ClientOption[];
}

export function useClients(query: string) {
  return useInfiniteQuery({
    queryKey: clientsKeys.list(query),
    queryFn: ({ pageParam }) =>
      getClientsPage({
        query,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
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

export function useClientOptions() {
  return useQuery({
    queryKey: [...clientsKeys.all, 'options'],
    queryFn: getClientOptions,
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
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
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
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
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
      queryClient.invalidateQueries({ queryKey: clientsKeys.all });
    },
  });
}

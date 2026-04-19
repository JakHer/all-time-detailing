import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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

export type VehicleListItem = Vehicle & {
  clients: Pick<Client, 'id' | 'full_name'>;
  bookings: Pick<Booking, 'id' | 'scheduled_at'>[];
};

export type VehicleOption = Pick<
  Vehicle,
  'id' | 'make' | 'model' | 'registration'
>;

export type VehiclesPage = {
  items: VehicleListItem[];
  totalCount: number;
  nextOffset: number | null;
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
  detail: (id: string) => [...vehiclesKeys.all, 'detail', id] as const,
  metrics: () => [...vehiclesKeys.all, 'metrics'] as const,
};

const VEHICLES_PAGE_SIZE = 10;

export async function getVehiclesPage({
  query = '',
  offset = 0,
}: {
  query?: string;
  offset?: number;
}): Promise<VehiclesPage> {
  let request = supabase
    .from('vehicles')
    .select(
      'id, client_id, make, model, registration, production_year, color, featured_image_url, notes, created_at, updated_at, clients(id, full_name), bookings(id, scheduled_at)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + VEHICLES_PAGE_SIZE - 1);

  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replace(/[%_,]/g, (character) => {
      if (character === '%') return '\\%';
      if (character === '_') return '\\_';
      return character;
    });

    request = request.or(
      `make.ilike.%${escapedQuery}%,model.ilike.%${escapedQuery}%,registration.ilike.%${escapedQuery}%,color.ilike.%${escapedQuery}%,clients.full_name.ilike.%${escapedQuery}%`,
    );
  }

  const { data, error, count } = await request;

  if (error) {
    throw error;
  }

  const items = ((data ?? []) as unknown as VehicleListItem[]).map(
    (vehicle) => ({
      ...vehicle,
      bookings: [...(vehicle.bookings ?? [])].sort(
        (a, b) =>
          new Date(b.scheduled_at).getTime() -
          new Date(a.scheduled_at).getTime(),
      ),
    }),
  );

  const totalCount = count ?? 0;
  const nextOffset =
    offset + items.length < totalCount ? offset + items.length : null;

  return {
    items,
    totalCount,
    nextOffset,
  };
}

export async function getVehicle(id: string): Promise<VehicleWithRelations> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(
      'id, client_id, make, model, registration, production_year, color, featured_image_url, notes, created_at, updated_at, clients(*), bookings(*, clients(*), services(id, name))',
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const vehicle = data as unknown as VehicleWithRelations;

  return {
    ...vehicle,
    bookings: [...(vehicle.bookings ?? [])].sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    ),
  };
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

export async function getVehicleOptions(): Promise<VehicleOption[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, make, model, registration')
    .order('registration', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as VehicleOption[];
}

export function useVehicles(query: string) {
  return useInfiniteQuery({
    queryKey: vehiclesKeys.list(query),
    queryFn: ({ pageParam }) =>
      getVehiclesPage({
        query,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehiclesKeys.detail(id),
    queryFn: () => getVehicle(id),
    enabled: !!id,
  });
}

export function useVehicleMetrics() {
  return useQuery({
    queryKey: vehiclesKeys.metrics(),
    queryFn: getVehicleMetrics,
  });
}

export function useVehicleOptions() {
  return useQuery({
    queryKey: [...vehiclesKeys.all, 'options'],
    queryFn: getVehicleOptions,
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
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.all });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.all });
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.detail(data.id) });
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
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

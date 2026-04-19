import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Database } from './database.types';
import { supabase } from './supabase';

export type Service = Database['public']['Tables']['services']['Row'];
export type NewService = Database['public']['Tables']['services']['Insert'];
export type UpdateService = Database['public']['Tables']['services']['Update'];

export type ServicesPage = {
  items: Service[];
  totalCount: number;
  nextOffset: number | null;
};

export type ServiceMetrics = {
  totalServices: number;
  activeServices: number;
  averagePrice: number;
  mostPopularService?: string;
};

export const servicesKeys = {
  all: ['services'] as const,
  lists: () => [...servicesKeys.all, 'list'] as const,
  list: (filters: string) => [...servicesKeys.lists(), { filters }] as const,
  details: () => [...servicesKeys.all, 'detail'] as const,
  detail: (id: string) => [...servicesKeys.details(), id] as const,
  metrics: () => [...servicesKeys.all, 'metrics'] as const,
};

const SERVICES_PAGE_SIZE = 10;

export async function getServicesPage({
  query = '',
  offset = 0,
}: {
  query?: string;
  offset?: number;
}): Promise<ServicesPage> {
  let request = supabase
    .from('services')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(offset, offset + SERVICES_PAGE_SIZE - 1);

  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replace(/[%_,]/g, (character) => {
      if (character === '%') return '\\%';
      if (character === '_') return '\\_';
      return character;
    });

    request = request.or(
      `name.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%`,
    );
  }

  const { data, error, count } = await request;

  if (error) {
    throw error;
  }

  const items = (data ?? []) as Service[];
  const totalCount = count ?? 0;
  const nextOffset =
    offset + items.length < totalCount ? offset + items.length : null;

  return {
    items,
    totalCount,
    nextOffset,
  };
}

export async function getService(id: string): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getServiceMetrics(): Promise<ServiceMetrics> {
  const { data: services = [], error } = await supabase
    .from('services')
    .select('id, base_price, is_active');

  if (error) throw error;

  const activeServices = services.filter((s) => s.is_active).length;
  const totalPrice = services.reduce((sum, s) => sum + Number(s.base_price), 0);
  const averagePrice = services.length > 0 ? totalPrice / services.length : 0;

  return {
    totalServices: services.length,
    activeServices,
    averagePrice,
  };
}

export function useServices(query: string) {
  return useInfiniteQuery({
    queryKey: servicesKeys.list(query),
    queryFn: ({ pageParam }) =>
      getServicesPage({
        query,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: servicesKeys.detail(id),
    queryFn: () => getService(id),
    enabled: !!id,
  });
}

export function useServiceMetrics() {
  return useQuery({
    queryKey: servicesKeys.metrics(),
    queryFn: getServiceMetrics,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newService: NewService) => {
      const { data, error } = await supabase
        .from('services')
        .insert(newService)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateService & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(data.id) });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

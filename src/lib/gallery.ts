import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from './database.types';
import { supabase } from './supabase';

export type GalleryImage =
  Database['public']['Tables']['gallery_images']['Row'];
export type NewGalleryImage =
  Database['public']['Tables']['gallery_images']['Insert'];
export type UpdateGalleryImage =
  Database['public']['Tables']['gallery_images']['Update'];

export type GalleryImageWithRelations = GalleryImage & {
  vehicles: {
    id: string;
    make: string;
    model: string;
    registration: string;
    clients: {
      full_name: string;
    } | null;
  } | null;
  bookings: {
    id: string;
    scheduled_at: string;
    services: {
      name: string;
    } | null;
  } | null;
};

export const galleryKeys = {
  all: ['gallery'] as const,
  lists: () => [...galleryKeys.all, 'list'] as const,
  list: (filters: unknown) => [...galleryKeys.lists(), { filters }] as const,
  details: () => [...galleryKeys.all, 'detail'] as const,
  detail: (id: string) => [...galleryKeys.details(), id] as const,
};

export async function getGalleryImages(): Promise<GalleryImageWithRelations[]> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select(
      `
      *,
      vehicles (
        id,
        make,
        model,
        registration,
        clients (
          full_name
        )
      ),
      bookings (
        id,
        scheduled_at,
        services (
          name
        )
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as GalleryImageWithRelations[];
}

export async function uploadGalleryImage(
  file: File,
  metadata: {
    booking_id?: string | null;
    vehicle_id?: string | null;
    type: GalleryImage['type'];
  },
): Promise<GalleryImage> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('gallery').getPublicUrl(filePath);

  const { data, error: dbError } = await supabase
    .from('gallery_images')
    .insert({
      booking_id: metadata.booking_id,
      vehicle_id: metadata.vehicle_id,
      type: metadata.type,
      storage_path: filePath,
      image_url: publicUrl,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from('gallery').remove([filePath]);
    throw dbError;
  }

  return data;
}

export async function deleteGalleryImage(
  id: string,
  storagePath: string,
): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from('gallery')
    .remove([storagePath]);

  if (storageError) {
    throw storageError;
  }

  const { error: dbError } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id);

  if (dbError) {
    throw dbError;
  }
}

export function useGalleryImages() {
  return useQuery({
    queryKey: galleryKeys.lists(),
    queryFn: getGalleryImages,
  });
}

export function useUploadGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      metadata,
    }: {
      file: File;
      metadata: {
        booking_id?: string | null;
        vehicle_id?: string | null;
        type: GalleryImage['type'];
      };
    }) => uploadGalleryImage(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) =>
      deleteGalleryImage(id, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useUpdateGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_featured,
      ...updates
    }: UpdateGalleryImage & { id: string }) => {
      const { data: currentImage, error: fetchError } = await supabase
        .from('gallery_images')
        .select('vehicle_id, image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('gallery_images')
        .update({ is_featured, ...updates })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (is_featured && currentImage.vehicle_id) {
        await supabase
          .from('gallery_images')
          .update({ is_featured: false })
          .eq('vehicle_id', currentImage.vehicle_id)
          .neq('id', id);

        await supabase
          .from('vehicles')
          .update({ featured_image_url: currentImage.image_url })
          .eq('id', currentImage.vehicle_id);
      } else if (is_featured === false && currentImage.vehicle_id) {
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('featured_image_url')
          .eq('id', currentImage.vehicle_id)
          .single();

        if (vehicle?.featured_image_url === currentImage.image_url) {
          await supabase
            .from('vehicles')
            .update({ featured_image_url: null })
            .eq('id', currentImage.vehicle_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

import { Maximize2, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeleteGalleryImage,
  useUpdateGalleryImage,
  type GalleryImageWithRelations,
} from '../../lib/gallery';

type ImageCardProps = {
  image: GalleryImageWithRelations;
  onView: (image: GalleryImageWithRelations) => void;
};

export function ImageCard({ image, onView }: ImageCardProps) {
  const deleteMutation = useDeleteGalleryImage();
  const updateMutation = useUpdateGalleryImage();

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync({
        id: image.id,
        storagePath: image.storage_path,
      });
      toast.success('Zdjęcie zostało usunięte');
    } catch {
      toast.error('Błąd podczas usuwania zdjęcia');
    }
  }

  async function toggleFeatured(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await updateMutation.mutateAsync({
        id: image.id,
        is_featured: !image.is_featured,
      });
      toast.success(
        image.is_featured
          ? 'Zdjęcie usunięte z wyróżnionych'
          : 'Zdjęcie wyróżnione',
      );
    } catch {
      toast.error('Błąd podczas aktualizacji zdjęcia');
    }
  }

  const vehicleName = image.vehicles
    ? `${image.vehicles.make} ${image.vehicles.model}`
    : 'Nieznany pojazd';
  const clientName = image.vehicles?.clients?.full_name ?? 'Brak klienta';

  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all hover:border-white/20"
      onClick={() => onView(image)}
    >
      <img
        src={image.image_url}
        alt={vehicleName}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {image.type && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              image.type === 'Before'
                ? 'bg-amber-500/80 text-white'
                : image.type === 'After'
                  ? 'bg-emerald-500/80 text-white'
                  : 'bg-blue-500/80 text-white'
            }`}
          >
            {image.type === 'Before'
              ? 'Przed'
              : image.type === 'After'
                ? 'Po'
                : image.type}
          </span>
        )}
        {image.is_featured && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg">
            <Star className="h-3 w-3 fill-current" />
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-stone-300">{clientName}</p>
            <h4 className="mt-0.5 truncate font-semibold text-white">
              {vehicleName}
            </h4>
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={toggleFeatured}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
                image.is_featured
                  ? 'bg-amber-400 text-black hover:bg-amber-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={
                image.is_featured ? 'Usuń wyróżnienie' : 'Wyróżnij zdjęcie'
              }
            >
              <Star
                className={`h-4 w-4 ${image.is_featured ? 'fill-current' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400 backdrop-blur-md transition hover:bg-red-500/20"
              title="Usuń zdjęcie"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20">
              <Maximize2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

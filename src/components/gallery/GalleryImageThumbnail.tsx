import { Star, Trash2 } from 'lucide-react';
import type { GalleryImageWithRelations } from '../../lib/gallery';

type GalleryImageThumbnailProps = {
  image: GalleryImageWithRelations;
  isActive: boolean;
  onOpenPreview: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
};

export const GalleryImageThumbnail = ({
  image,
  isActive,
  onOpenPreview,
  onToggleFeatured,
  onDelete,
}: GalleryImageThumbnailProps) => {
  return (
    <button
      type="button"
      onClick={onOpenPreview}
      className={`group relative aspect-square overflow-hidden rounded-3xl border bg-white/5 text-left ring-1 transition ${
        isActive
          ? 'border-amber-200/40 ring-amber-200/30'
          : 'border-white/10 ring-white/5 hover:border-white/20'
      }`}
    >
      <img
        src={image.image_url}
        alt={image.type || 'Zdjecie realizacji'}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-all duration-150 group-hover:opacity-100">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFeatured();
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-md transition ${
            image.is_featured
              ? 'bg-amber-400 text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title="Ustaw jako glowne zdjecie pojazdu"
        >
          <Star
            className={`h-5 w-5 ${image.is_featured ? 'fill-current' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 backdrop-blur-md transition hover:bg-red-500/40"
          title="Usun zdjecie"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {image.is_featured ? (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg">
          <Star className="h-3 w-3 fill-current" />
        </div>
      ) : null}
    </button>
  );
};

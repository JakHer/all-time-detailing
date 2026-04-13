import * as Dialog from '@radix-ui/react-dialog';
import {
  CarFront,
  ChevronRight,
  Clock,
  Hash,
  ImageIcon,
  Minus,
  Plus,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useDeleteGalleryImage,
  useGalleryImages,
  useUpdateGalleryImage,
  type GalleryImageWithRelations,
} from '../../lib/gallery';
import { Skeleton } from '../ui/Skeleton';

type Realization = {
  id: string;
  title: string;
  date: string;
  images: GalleryImageWithRelations[];
  isIndependent: boolean;
};

type VehicleGallery = {
  id: string;
  make: string;
  model: string;
  registration: string;
  clientName: string;
  realizations: Realization[];
  totalPhotos: number;
  featuredImageUrl?: string;
};

export function GalleryGrid({ query }: { query: string }) {
  const { data: images = [], isLoading } = useGalleryImages();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedRealizationId, setSelectedRealizationId] = useState<string | null>(null);
  const [selectedPreviewImageId, setSelectedPreviewImageId] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const updateMutation = useUpdateGalleryImage();
  const deleteMutation = useDeleteGalleryImage();

  const vehicleGalleries = useMemo(() => {
    const vehicleMap: Record<string, VehicleGallery> = {};

    images.forEach((image) => {
      const vehicle = image.vehicles;
      if (!vehicle) return;

      if (!vehicleMap[vehicle.id]) {
        vehicleMap[vehicle.id] = {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          registration: vehicle.registration,
          clientName: vehicle.clients?.full_name ?? 'Brak klienta',
          realizations: [],
          totalPhotos: 0,
        };
      }

      vehicleMap[vehicle.id].totalPhotos += 1;

      if (image.is_featured) {
        vehicleMap[vehicle.id].featuredImageUrl = image.image_url;
      }

      const realizationId = image.booking_id || `independent-${vehicle.id}`;
      let realization = vehicleMap[vehicle.id].realizations.find(
        (entry) => entry.id === realizationId,
      );

      if (!realization) {
        const hasBooking = Boolean(image.bookings);
        const referenceDate = image.bookings?.scheduled_at ?? image.created_at;

        realization = {
          id: realizationId,
          title: hasBooking
            ? image.bookings?.services?.name ?? 'Usługa'
            : 'Inne / Portfolio',
          date: new Date(referenceDate).toLocaleDateString('pl-PL'),
          images: [],
          isIndependent: !hasBooking,
        };

        vehicleMap[vehicle.id].realizations.push(realization);
      }

      realization.images.push(image);
    });

    return Object.values(vehicleMap)
      .map((vehicleGallery) => {
        vehicleGallery.realizations.sort((left, right) => {
          const leftDate = new Date(
            left.images[0].bookings?.scheduled_at ?? left.images[0].created_at,
          ).getTime();
          const rightDate = new Date(
            right.images[0].bookings?.scheduled_at ?? right.images[0].created_at,
          ).getTime();

          return rightDate - leftDate;
        });

        if (!vehicleGallery.featuredImageUrl && vehicleGallery.realizations.length > 0) {
          vehicleGallery.featuredImageUrl =
            vehicleGallery.realizations[0].images.find((img) => img.type === 'After')?.image_url ??
            vehicleGallery.realizations[0].images[0].image_url;
        }

        return vehicleGallery;
      })
      .filter((vehicleGallery) => {
        const searchValue = query.toLowerCase().trim();
        if (!searchValue) return true;

        return (
          vehicleGallery.make.toLowerCase().includes(searchValue) ||
          vehicleGallery.model.toLowerCase().includes(searchValue) ||
          vehicleGallery.registration.toLowerCase().includes(searchValue) ||
          vehicleGallery.clientName.toLowerCase().includes(searchValue)
        );
      });
  }, [images, query]);

  const selectedVehicle = useMemo(
    () => vehicleGalleries.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicleGalleries],
  );

  const selectedRealization = useMemo(() => {
    if (!selectedVehicle || !selectedRealizationId) {
      return null;
    }

    return (
      selectedVehicle.realizations.find(
        (realization) => realization.id === selectedRealizationId,
      ) ?? null
    );
  }, [selectedRealizationId, selectedVehicle]);

  const realizationBuckets = useMemo(() => {
    const realizationImages = selectedRealization?.images ?? [];

    return {
      beforeImages: realizationImages.filter((image) => image.type === 'Before'),
      afterImages: realizationImages.filter((image) => image.type === 'After'),
      otherImages: realizationImages.filter(
        (image) => image.type !== 'Before' && image.type !== 'After',
      ),
    };
  }, [selectedRealization]);

  const previewImages = useMemo(() => {
    if (!selectedRealization) {
      return [] as GalleryImageWithRelations[];
    }

    if (selectedRealization.isIndependent) {
      return selectedRealization.images;
    }

    return [
      ...realizationBuckets.beforeImages,
      ...realizationBuckets.afterImages,
      ...realizationBuckets.otherImages,
    ];
  }, [realizationBuckets.afterImages, realizationBuckets.beforeImages, realizationBuckets.otherImages, selectedRealization]);

  const selectedPreviewImage = useMemo(() => {
    if (!selectedPreviewImageId) {
      return previewImages[0] ?? null;
    }

    return previewImages.find((image) => image.id === selectedPreviewImageId) ?? previewImages[0] ?? null;
  }, [previewImages, selectedPreviewImageId]);

  useEffect(() => {
    if (selectedRealization?.images.length) {
      const preferredImage =
        selectedRealization.images.find((image) => image.type === 'After') ??
        selectedRealization.images[0];
      setSelectedPreviewImageId(preferredImage.id);
      setPreviewZoom(1);
      return;
    }

    setSelectedPreviewImageId(null);
    setPreviewZoom(1);
  }, [selectedRealization]);

  async function handleToggleFeatured(imageId: string, currentFeatured: boolean) {
    try {
      await updateMutation.mutateAsync({
        id: imageId,
        is_featured: !currentFeatured,
      });
      toast.success(
        !currentFeatured
          ? 'Ustawiono jako główne zdjęcie pojazdu'
          : 'Usunięto wyróżnienie',
      );
    } catch {
      toast.error('Błąd podczas aktualizacji zdjęcia');
    }
  }

  async function handleDeleteImage(id: string, path: string) {
    if (!confirm('Czy na pewno chcesz usunąć to zdjęcie?')) return;

    try {
      await deleteMutation.mutateAsync({ id, storagePath: path });
      toast.success('Zdjęcie zostało usunięte');
    } catch {
      toast.error('Błąd podczas usuwania zdjęcia');
    }
  }

  function handlePreviewOpen(imageId: string) {
    setSelectedPreviewImageId(imageId);
    setPreviewZoom(1);
  }

  function handlePreviewZoomIn() {
    setPreviewZoom((currentZoom) => Math.min(3, Number((currentZoom + 0.25).toFixed(2))));
  }

  function handlePreviewZoomOut() {
    setPreviewZoom((currentZoom) => Math.max(1, Number((currentZoom - 0.25).toFixed(2))));
  }

  function resetPreviewZoom() {
    setPreviewZoom(1);
  }

  if (isLoading) {
    return (
      <div className="grid min-h-180 gap-6 lg:grid-cols-[1fr_500px]">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-[26px]" />
          ))}
        </div>
        <Skeleton className="h-full rounded-4xl" />
      </div>
    );
  }

  return (
    <div className="grid min-h-180 min-w-0 gap-6 overflow-hidden 2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start">
      <div className="min-w-0 max-w-full space-y-4">
        <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Pojazdy w bibliotece ({vehicleGalleries.length})
        </p>
        <div className="grid gap-3">
          {vehicleGalleries.map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setSelectedVehicleId(vehicle.id)}
              className={`group flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-[26px] border p-5 text-left transition-all ${
                selectedVehicleId === vehicle.id
                  ? 'border-white/20 bg-white/8 shadow-lg ring-1 ring-white/10'
                  : 'border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/6'
              }`}
            >
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/6 shadow-inner">
                    {vehicle.featuredImageUrl ? (
                      <img
                        src={vehicle.featuredImageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white">
                        <CarFront className="h-5 w-5 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="wrap-break-word font-semibold text-white">
                      {vehicle.make} {vehicle.model}
                    </h4>
                    <div className="mt-1 grid gap-1 text-sm text-stone-400">
                      <div className="flex min-w-0 items-start gap-1.5">
                        <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="break-all uppercase">{vehicle.registration}</span>
                      </div>
                      <div className="flex min-w-0 items-start gap-1.5">
                        <User className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="wrap-break-word">{vehicle.clientName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                    {vehicle.totalPhotos} zdjęć
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 transition-all ${
                      selectedVehicleId === vehicle.id
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 max-w-full">
        {!selectedVehicle ? (
          <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-4xl border border-dashed border-white/10 bg-black/10 py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-stone-500">
              <ImageIcon className="h-8 w-8" />
            </div>
            <p className="px-6 text-lg font-medium text-white">
              Wybierz pojazd, aby zobaczyć realizacje
            </p>
            <p className="mt-2 px-10 text-sm text-stone-400">
              Historia wizualna auta pojawi się w tym panelu.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
            <div className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-xl md:p-7">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    Oś czasu pojazdu
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <p className="mt-2 text-sm text-stone-400">
                    Właściciel:{' '}
                    <span className="font-medium text-stone-300">
                      {selectedVehicle.clientName}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-400 ring-1 ring-white/10">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedVehicle.realizations.length} realizacje
                </div>
              </div>

              <div className="grid gap-4">
                {selectedVehicle.realizations.map((realization) => (
                  <div
                    key={realization.id}
                    onClick={() => setSelectedRealizationId(realization.id)}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/4 transition-all hover:border-white/20 hover:bg-white/8"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                        <img
                          src={
                            realization.images.find((image) => image.type === 'After')?.image_url ??
                            realization.images[0].image_url
                          }
                          alt={realization.title}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="min-w-0 flex-1 py-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-widest ${
                              realization.isIndependent ? 'text-blue-400' : 'text-amber-400'
                            }`}
                          >
                            {realization.isIndependent ? 'Projekt' : 'Realizacja'}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            • {realization.date}
                          </span>
                        </div>
                        <h4 className="mt-1 truncate font-bold text-white transition-colors group-hover:text-amber-200">
                          {realization.title}
                        </h4>
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                          <ImageIcon className="h-3 w-3" /> {realization.images.length} zdjęć
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center pr-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white transition-transform group-hover:translate-x-1">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog.Root
        open={!!selectedRealizationId}
        onOpenChange={(open) => !open && setSelectedRealizationId(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm transition-all duration-150 animate-in fade-in" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col overflow-y-auto p-4 outline-none sm:p-8">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-8 flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        selectedRealization?.isIndependent
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {selectedRealization?.isIndependent
                        ? 'Projekt wolny'
                        : 'Realizacja usługi'}
                    </span>
                    <span className="text-sm text-stone-500">
                      {selectedRealization?.date}
                    </span>
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                    {selectedRealization?.title}
                  </h2>
                  <p className="mt-2 text-xl text-stone-400">
                    {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.registration})
                  </p>
                </div>
                <Dialog.Close className="rounded-full bg-white/5 p-3 text-stone-400 transition-colors hover:bg-white/10 hover:text-white">
                  <X className="h-6 w-6" />
                </Dialog.Close>
              </div>

              {selectedPreviewImage ? (
                <section className="rounded-4xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                  <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                        Podgląd zdjęcia
                      </p>
                      <p className="mt-2 text-sm text-stone-400">
                        Klikaj miniatury niżej, aby płynnie przełączać zdjęcia bez przeładowywania całego modala.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePreviewZoomOut}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
                        aria-label="Pomniejsz zdjęcie"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={resetPreviewZoom}
                        className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition hover:border-white/16 hover:bg-white/10"
                      >
                        {Math.round(previewZoom * 100)}%
                      </button>
                      <button
                        type="button"
                        onClick={handlePreviewZoomIn}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
                        aria-label="Powiększ zdjęcie"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4">
                    <img
                      key={selectedPreviewImage.id}
                      src={selectedPreviewImage.image_url}
                      alt={selectedPreviewImage.type || 'Zdjęcie realizacji'}
                      decoding="async"
                      draggable={false}
                      className="max-h-[70vh] w-auto max-w-full select-none object-contain transition-transform duration-200 ease-out"
                      style={{ transform: `scale(${previewZoom})`, transformOrigin: 'center center' }}
                    />
                  </div>
                </section>
              ) : null}

              <div className="mt-8 grid gap-12 pb-20">
                {selectedRealization?.isIndependent ? (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                      Wszystkie zdjęcia projektu
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {selectedRealization.images.map((image) => (
                        <ImageThumbnail
                          key={image.id}
                          image={image}
                          isActive={selectedPreviewImage?.id === image.id}
                          onOpenPreview={() => handlePreviewOpen(image.id)}
                          onToggleFeatured={() =>
                            handleToggleFeatured(image.id, image.is_featured)
                          }
                          onDelete={() =>
                            handleDeleteImage(image.id, image.storage_path)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-12 lg:grid-cols-2">
                      <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-200/60">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Przed usługą
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {realizationBuckets.beforeImages.map((image) => (
                            <ImageThumbnail
                              key={image.id}
                              image={image}
                              isActive={selectedPreviewImage?.id === image.id}
                              onOpenPreview={() => handlePreviewOpen(image.id)}
                              onToggleFeatured={() =>
                                handleToggleFeatured(image.id, image.is_featured)
                              }
                              onDelete={() =>
                                handleDeleteImage(image.id, image.storage_path)
                              }
                            />
                          ))}
                          {realizationBuckets.beforeImages.length === 0 ? (
                            <div className="col-span-2 flex items-center justify-center rounded-3xl border border-dashed border-white/10 py-8 text-xs text-stone-500">
                              Brak zdjęć „Przed”
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/60">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Po usłudze
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {realizationBuckets.afterImages.map((image) => (
                            <ImageThumbnail
                              key={image.id}
                              image={image}
                              isActive={selectedPreviewImage?.id === image.id}
                              onOpenPreview={() => handlePreviewOpen(image.id)}
                              onToggleFeatured={() =>
                                handleToggleFeatured(image.id, image.is_featured)
                              }
                              onDelete={() =>
                                handleDeleteImage(image.id, image.storage_path)
                              }
                            />
                          ))}
                          {realizationBuckets.afterImages.length === 0 ? (
                            <div className="col-span-2 flex items-center justify-center rounded-3xl border border-dashed border-white/10 py-8 text-xs text-stone-500">
                              Brak zdjęć „Po”
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {realizationBuckets.otherImages.length > 0 ? (
                      <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                          Inne zdjęcia dokumentacji
                        </h3>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                          {realizationBuckets.otherImages.map((image) => (
                            <ImageThumbnail
                              key={image.id}
                              image={image}
                              isActive={selectedPreviewImage?.id === image.id}
                              onOpenPreview={() => handlePreviewOpen(image.id)}
                              onToggleFeatured={() =>
                                handleToggleFeatured(image.id, image.is_featured)
                              }
                              onDelete={() =>
                                handleDeleteImage(image.id, image.storage_path)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function ImageThumbnail({
  image,
  isActive,
  onOpenPreview,
  onToggleFeatured,
  onDelete,
}: {
  image: GalleryImageWithRelations;
  isActive: boolean;
  onOpenPreview: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
}) {
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
        alt={image.type || 'Zdjęcie realizacji'}
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
          title="Ustaw jako główne zdjęcie pojazdu"
        >
          <Star className={`h-5 w-5 ${image.is_featured ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 backdrop-blur-md transition hover:bg-red-500/40"
          title="Usuń zdjęcie"
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
}

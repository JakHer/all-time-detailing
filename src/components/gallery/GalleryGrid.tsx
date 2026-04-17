import * as Dialog from '@radix-ui/react-dialog';
import {
  ChevronRight,
  Clock,
  Minus,
  Plus,
  Star,
  Trash2,
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
import { CollapsibleDetailSection } from '../ui/CollapsibleDetailSection';
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [isMobileVehicleOpen, setIsMobileVehicleOpen] = useState(false);
  const [selectedRealizationId, setSelectedRealizationId] = useState<
    string | null
  >(null);
  const [selectedPreviewImageId, setSelectedPreviewImageId] = useState<
    string | null
  >(null);
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
            ? (image.bookings?.services?.name ?? 'Usługa')
            : 'Portfolio',
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
            right.images[0].bookings?.scheduled_at ??
              right.images[0].created_at,
          ).getTime();

          return rightDate - leftDate;
        });

        if (
          !vehicleGallery.featuredImageUrl &&
          vehicleGallery.realizations.length > 0
        ) {
          vehicleGallery.featuredImageUrl =
            vehicleGallery.realizations[0].images.find(
              (img) => img.type === 'After',
            )?.image_url ?? vehicleGallery.realizations[0].images[0].image_url;
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
    () =>
      vehicleGalleries.find((vehicle) => vehicle.id === selectedVehicleId) ??
      null,
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
      beforeImages: realizationImages.filter(
        (image) => image.type === 'Before',
      ),
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
  }, [
    realizationBuckets.afterImages,
    realizationBuckets.beforeImages,
    realizationBuckets.otherImages,
    selectedRealization,
  ]);

  const selectedPreviewImage = useMemo(() => {
    if (!selectedPreviewImageId) {
      return previewImages[0] ?? null;
    }

    return (
      previewImages.find((image) => image.id === selectedPreviewImageId) ??
      previewImages[0] ??
      null
    );
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

  async function handleToggleFeatured(
    imageId: string,
    currentFeatured: boolean,
  ) {
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
    setPreviewZoom((currentZoom) =>
      Math.min(3, Number((currentZoom + 0.25).toFixed(2))),
    );
  }

  function handlePreviewZoomOut() {
    setPreviewZoom((currentZoom) =>
      Math.max(1, Number((currentZoom - 0.25).toFixed(2))),
    );
  }

  function resetPreviewZoom() {
    setPreviewZoom(1);
  }

  function handleVehicleSelect(vehicleId: string) {
    setSelectedVehicleId(vehicleId);
    setIsMobileVehicleOpen(true);
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
    <div
      className={`grid min-h-180 min-w-0 gap-6 overflow-hidden ${
        selectedVehicle
          ? '2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start'
          : ''
      }`}
    >
      <article className="w-full max-w-full self-start overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl sm:px-4 sm:py-3.5 xl:px-5 xl:py-4">
        <div className="hidden items-end justify-between gap-3 sm:flex">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              Lista pojazdow
            </p>
            <h3 className="mt-0.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
              Pojazdy w bibliotece
            </h3>
          </div>
          <div className="text-xs text-stone-400">
            {vehicleGalleries.length} pozycji
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between sm:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            Lista pojazdow
          </p>
          <div className="text-xs text-stone-400">
            {vehicleGalleries.length} pozycji
          </div>
        </div>

        <div className="grid gap-2.5 sm:mt-3">
          {vehicleGalleries.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400 sm:min-h-97.5">
              Nie znaleziono pojazdow w bibliotece dla tego wyszukiwania.
            </div>
          ) : (
            vehicleGalleries.map((vehicle) => {
              const isActive = selectedVehicleId === vehicle.id;

              return (
                <div key={vehicle.id}>
                  <button
                    type="button"
                    onClick={() => handleVehicleSelect(vehicle.id)}
                    className={`grid w-full min-w-0 grid-cols-[4.75rem_minmax(0,1fr)_0.75rem] items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition sm:hidden ${
                      isActive
                        ? 'border-amber-200/30 bg-amber-300/10 shadow-[0_10px_30px_rgba(214,158,46,0.12)]'
                        : 'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8'
                    }`}
                  >
                    <div className="min-w-0 truncate text-sm font-semibold tracking-[-0.03em] text-white">
                      {vehicle.registration}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {vehicle.make} {vehicle.model}{' '}
                        <span className="text-stone-500">|</span>{' '}
                        <span className="text-stone-400">
                          {vehicle.clientName}
                        </span>
                      </p>
                    </div>
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        isActive ? 'bg-amber-300' : 'bg-stone-500'
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`hidden w-full min-w-0 max-w-full grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left transition sm:grid ${
                      isActive
                        ? 'border-amber-200/30 bg-amber-300/10 shadow-[0_10px_30px_rgba(214,158,46,0.12)]'
                        : 'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold tracking-[-0.03em] text-white">
                        {vehicle.registration}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-stone-400">
                        {vehicle.clientName}
                      </p>
                    </div>

                    <div className="min-w-0 text-right">
                      <p className="truncate text-xs text-stone-300">
                        {vehicle.totalPhotos} zdjec
                        <span className="px-1 text-stone-500">|</span>
                        {vehicle.realizations.length} realizacji
                      </p>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </article>

      <div
        className={`min-w-0 max-w-full ${
          selectedVehicle ? 'hidden 2xl:block' : 'hidden'
        }`}
      >
        {selectedVehicle ? (
          <article className="min-h-160 w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:rounded-4xl md:p-7">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedVehicleId(null);
                  setSelectedRealizationId(null);
                  setSelectedPreviewImageId(null);
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setSelectedVehicleId(null);
                  setSelectedRealizationId(null);
                  setSelectedPreviewImageId(null);
                }}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
                aria-label="Zamknij szczegoly galerii"
                title="Zamknij szczegoly galerii"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-amber-200 sm:block">
                  Biblioteka pojazdu
                </p>
                <h3 className="mt-1 wrap-break-word text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
                  {selectedVehicle.make} {selectedVehicle.model}
                </h3>
                <p className="mt-1.5 break-all text-xs text-stone-400">
                  {selectedVehicle.clientName} | {selectedVehicle.registration}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                <div className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] text-stone-300">
                  {selectedVehicle.realizations.length} realizacje |{' '}
                  {selectedVehicle.totalPhotos} zdjec
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <SummaryChip
                label="Realizacje"
                value={`${selectedVehicle.realizations.length}`}
              />
              <SummaryChip
                label="Zdjecia"
                value={`${selectedVehicle.totalPhotos}`}
              />
            </div>

            <CollapsibleDetailSection
              title="Os czasu realizacji"
              icon={<Clock className="h-4.5 w-4.5" />}
              countLabel={`${selectedVehicle.realizations.length} wpisow`}
              defaultOpen
            >
              <div className="grid gap-3">
                {selectedVehicle.realizations.map((realization) => (
                  <button
                    key={realization.id}
                    type="button"
                    onClick={() => setSelectedRealizationId(realization.id)}
                    className={`group flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                      selectedRealizationId === realization.id
                        ? 'border-white/20 bg-white/10'
                        : 'border-white/8 bg-white/6 hover:border-white/16 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/6">
                        <img
                          src={
                            realization.images.find(
                              (image) => image.type === 'After',
                            )?.image_url ?? realization.images[0].image_url
                          }
                          alt={realization.title}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-widest ${
                              realization.isIndependent
                                ? 'text-blue-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {realization.isIndependent
                              ? 'Projekt'
                              : 'Realizacja'}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            | {realization.date}
                          </span>
                        </div>
                        <h4 className="mt-1 wrap-break-word text-sm font-semibold text-white">
                          {realization.title}
                        </h4>
                        <p className="mt-1 text-xs text-stone-500">
                          {realization.images.length} zdjec w tej realizacji
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="h-4.5 w-4.5 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </button>
                ))}
              </div>
            </CollapsibleDetailSection>
          </article>
        ) : null}
      </div>

      <Dialog.Root
        open={isMobileVehicleOpen && !!selectedVehicle}
        onOpenChange={setIsMobileVehicleOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/72 backdrop-blur-sm sm:hidden" />
          <Dialog.Content className="fixed inset-0 z-60 flex h-dvh flex-col overflow-hidden bg-[#121314] outline-none sm:hidden">
            {selectedVehicle ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                      Biblioteka pojazdu
                    </p>
                    <p className="mt-1 truncate text-sm text-stone-400">
                      {selectedVehicle.make} {selectedVehicle.model} |{' '}
                      {selectedVehicle.registration}
                    </p>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-stone-100 transition hover:border-white/16 hover:bg-white/10"
                      aria-label="Zamknij szczegoly pojazdu"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <article className="w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="wrap-break-word text-xl font-semibold tracking-[-0.04em] text-white">
                          {selectedVehicle.make} {selectedVehicle.model}
                        </h3>
                        <p className="mt-1 break-all text-sm text-stone-400">
                          {selectedVehicle.clientName} |{' '}
                          {selectedVehicle.registration}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-stone-300">
                        {selectedVehicle.totalPhotos} zdjec
                      </div>
                    </div>

                    <section className="mt-5 rounded-3xl border border-white/8 bg-black/18 p-4">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <Clock className="h-4.5 w-4.5 opacity-40" />
                        <h3 className="text-sm">Realizacje</h3>
                      </div>

                      <div className="mt-4 grid gap-2.5">
                        {selectedVehicle.realizations.map((realization) => (
                          <button
                            key={realization.id}
                            type="button"
                            onClick={() => {
                              setIsMobileVehicleOpen(false);
                              setSelectedRealizationId(realization.id);
                            }}
                            className={`flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                              selectedRealizationId === realization.id
                                ? 'border-white/20 bg-white/10'
                                : 'border-white/8 bg-white/6 hover:border-white/16 hover:bg-white/10'
                            }`}
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/6">
                              <img
                                src={
                                  realization.images.find(
                                    (image) => image.type === 'After',
                                  )?.image_url ??
                                  realization.images[0].image_url
                                }
                                alt={realization.title}
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {realization.title}
                              </p>
                              <p className="mt-1 truncate text-xs text-stone-500">
                                {realization.date} | {realization.images.length}{' '}
                                zdjec
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-white/50" />
                          </button>
                        ))}
                      </div>
                    </section>
                  </article>
                </div>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={!!selectedRealizationId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRealizationId(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 animate-in fade-in bg-black/92 backdrop-blur-sm transition-all duration-150" />
          <Dialog.Content className="fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-[#0d0e10] outline-none">
            <div className="flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
              <div className="mx-auto w-full max-w-6xl">
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/8 pb-4 sm:mb-8 sm:gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:px-3 sm:py-1 sm:text-[10px] ${
                          selectedRealization?.isIndependent
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {selectedRealization?.isIndependent
                          ? 'Projekt'
                          : 'Realizacja'}
                      </span>
                      <span className="text-xs text-stone-500 sm:text-sm">
                        {selectedRealization?.date}
                      </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-4xl">
                      {selectedRealization?.title}
                    </h2>
                    <p className="mt-1 text-sm text-stone-400 sm:mt-2 sm:text-xl">
                      {selectedVehicle?.make} {selectedVehicle?.model} (
                      {selectedVehicle?.registration})
                    </p>
                  </div>
                  <Dialog.Close className="rounded-full bg-white/5 p-2 text-stone-400 transition-colors hover:bg-white/10 hover:text-white sm:p-3">
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
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
                          Klikaj miniatury niżej, aby płynnie przełączać zdjęcia
                          bez przeładowywania całego modala.
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

                    <div className="flex min-h-105 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4">
                      <img
                        key={selectedPreviewImage.id}
                        src={selectedPreviewImage.image_url}
                        alt={selectedPreviewImage.type || 'Zdjecie realizacji'}
                        decoding="async"
                        draggable={false}
                        className="max-h-[70vh] w-auto max-w-full select-none object-contain transition-transform duration-200 ease-out"
                        style={{
                          transform: `scale(${previewZoom})`,
                          transformOrigin: 'center center',
                        }}
                      />
                    </div>
                  </section>
                ) : null}

                <div className="mt-8 grid gap-12 pb-20">
                  {selectedRealization?.isIndependent ? (
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                        Wszystkie zdjecia projektu
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
                            Przed usluga
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {realizationBuckets.beforeImages.map((image) => (
                              <ImageThumbnail
                                key={image.id}
                                image={image}
                                isActive={selectedPreviewImage?.id === image.id}
                                onOpenPreview={() =>
                                  handlePreviewOpen(image.id)
                                }
                                onToggleFeatured={() =>
                                  handleToggleFeatured(
                                    image.id,
                                    image.is_featured,
                                  )
                                }
                                onDelete={() =>
                                  handleDeleteImage(
                                    image.id,
                                    image.storage_path,
                                  )
                                }
                              />
                            ))}
                            {realizationBuckets.beforeImages.length === 0 ? (
                              <div className="col-span-2 flex items-center justify-center rounded-3xl border border-dashed border-white/10 py-8 text-xs text-stone-500">
                                Brak zdjec "Przed"
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/60">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Po usludze
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {realizationBuckets.afterImages.map((image) => (
                              <ImageThumbnail
                                key={image.id}
                                image={image}
                                isActive={selectedPreviewImage?.id === image.id}
                                onOpenPreview={() =>
                                  handlePreviewOpen(image.id)
                                }
                                onToggleFeatured={() =>
                                  handleToggleFeatured(
                                    image.id,
                                    image.is_featured,
                                  )
                                }
                                onDelete={() =>
                                  handleDeleteImage(
                                    image.id,
                                    image.storage_path,
                                  )
                                }
                              />
                            ))}
                            {realizationBuckets.afterImages.length === 0 ? (
                              <div className="col-span-2 flex items-center justify-center rounded-3xl border border-dashed border-white/10 py-8 text-xs text-stone-500">
                                Brak zdjec "Po"
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {realizationBuckets.otherImages.length > 0 ? (
                        <div className="space-y-6">
                          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                            Inne zdjecia dokumentacji
                          </h3>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                            {realizationBuckets.otherImages.map((image) => (
                              <ImageThumbnail
                                key={image.id}
                                image={image}
                                isActive={selectedPreviewImage?.id === image.id}
                                onOpenPreview={() =>
                                  handlePreviewOpen(image.id)
                                }
                                onToggleFeatured={() =>
                                  handleToggleFeatured(
                                    image.id,
                                    image.is_featured,
                                  )
                                }
                                onDelete={() =>
                                  handleDeleteImage(
                                    image.id,
                                    image.storage_path,
                                  )
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

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-stone-300">
      <span className="text-stone-500">{label}:</span>
      <span className="truncate font-medium text-white">{value}</span>
    </div>
  );
}

import * as Dialog from '@radix-ui/react-dialog';
import { ChevronRight, Clock, Minus, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useDeleteGalleryImage,
  useGalleryImages,
  useUpdateGalleryImage,
  type GalleryImageWithRelations,
} from '../../lib/gallery';
import { scrollPageToTop } from '../../lib/scroll';
import { ActionButton } from '../primitives/ActionButton';
import { ListSkeleton } from '../entity/ListSkeleton';
import { MasterDetailLayout } from '../layout/MasterDetailLayout';
import { SelectableListItem } from '../entity/SelectableListItem';
import { Skeleton } from '../primitives/Skeleton';
import { layoutStyles, surfaceStyles, textStyles } from '../design/styles';
import { GalleryImageThumbnail } from './GalleryImageThumbnail';
import { GalleryVehicleDetails } from './GalleryVehicleDetails';
import type { VehicleGallery } from './galleryTypes';

export function GalleryGrid({ query }: { query: string }) {
  const { data: images = [], isLoading } = useGalleryImages();
  const [visibleVehicleCount, setVisibleVehicleCount] = useState(10);
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
            ? (image.bookings?.services?.name ?? 'Us�uga')
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

  useEffect(() => {
    setVisibleVehicleCount(10);
  }, [query]);

  const visibleVehicleGalleries = useMemo(
    () => vehicleGalleries.slice(0, visibleVehicleCount),
    [vehicleGalleries, visibleVehicleCount],
  );

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
          ? 'Ustawiono jako g��wne zdj�cie pojazdu'
          : 'Usuni�to wyr�nienie',
      );
    } catch {
      toast.error('B��d podczas aktualizacji zdj�cia');
    }
  }

  async function handleDeleteImage(id: string, path: string) {
    if (!confirm('Czy na pewno chcesz usun�� to zdj�cie?')) return;

    try {
      await deleteMutation.mutateAsync({ id, storagePath: path });
      toast.success('Zdj�cie zosta�o usuni�te');
    } catch {
      toast.error('B��d podczas usuwania zdj�cia');
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
    scrollPageToTop();
  }

  if (isLoading) {
    return (
      <MasterDetailLayout
        showDetails
        list={<ListSkeleton itemClassName="h-24 rounded-[26px]" />}
        details={<Skeleton className="h-full rounded-4xl" />}
      />
    );
  }

  return (
    <>
      <MasterDetailLayout
        showDetails={!!selectedVehicle}
        list={
          <article className={surfaceStyles.entityList}>
            <div className={layoutStyles.listHeaderDesktop}>
              <div>
                <p className={textStyles.eyebrowAmber}>Lista pojazdow</p>
                <h3 className={textStyles.listTitle}>Pojazdy w bibliotece</h3>
              </div>
              <div className={textStyles.listCount}>
                {visibleVehicleGalleries.length} z {vehicleGalleries.length}{' '}
                pozycji
              </div>
            </div>

            <div className={layoutStyles.listHeaderMobile}>
              <p className={textStyles.eyebrowMuted}>Lista pojazdow</p>
              <div className={textStyles.listCount}>
                {visibleVehicleGalleries.length} z {vehicleGalleries.length}
              </div>
            </div>

            <div className={layoutStyles.listItems}>
              {vehicleGalleries.length === 0 ? (
                <div className={surfaceStyles.emptyState}>
                  Nie znaleziono pojazdow w bibliotece dla tego wyszukiwania.
                </div>
              ) : (
                visibleVehicleGalleries.map((vehicle) => {
                  const isActive = selectedVehicleId === vehicle.id;

                  return (
                    <div key={vehicle.id}>
                      <SelectableListItem
                        onClick={() => handleVehicleSelect(vehicle.id)}
                        isActive={isActive}
                        mobileLeading={
                          <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
                            {vehicle.registration}
                          </div>
                        }
                        mobileBody={
                          <p className="truncate text-sm font-medium text-white">
                            {vehicle.make} {vehicle.model}{' '}
                            <span className="text-stone-500">|</span>{' '}
                            <span className="text-stone-400">
                              {vehicle.clientName}
                            </span>
                          </p>
                        }
                        mobileTrailing={
                          <div
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                              isActive ? 'bg-amber-300' : 'bg-stone-500'
                            }`}
                            aria-hidden="true"
                          />
                        }
                        desktopLeading={
                          <div className="truncate text-base font-semibold tracking-[-0.03em] text-white">
                            {vehicle.registration}
                          </div>
                        }
                        desktopBody={
                          <>
                            <p className="truncate text-sm font-semibold text-white">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-stone-400">
                              {vehicle.clientName}
                            </p>
                          </>
                        }
                        desktopTrailing={
                          <p className="truncate text-xs text-stone-300">
                            {vehicle.totalPhotos} zdjec
                            <span className="px-1 text-stone-500">|</span>
                            {vehicle.realizations.length} realizacji
                          </p>
                        }
                      />
                    </div>
                  );
                })
              )}

              {visibleVehicleCount < vehicleGalleries.length ? (
                <div className="pt-2">
                  <ActionButton
                    variant="amber"
                    onClick={() =>
                      setVisibleVehicleCount((current) => current + 10)
                    }
                    className="w-full justify-center"
                  >
                    Doladuj kolejne pojazdy
                  </ActionButton>
                </div>
              ) : null}
            </div>
          </article>
        }
        details={
          selectedVehicle ? (
            <GalleryVehicleDetails
              vehicle={selectedVehicle}
              selectedRealizationId={selectedRealizationId}
              onSelectRealization={setSelectedRealizationId}
              onClose={() => {
                setSelectedVehicleId(null);
                setSelectedRealizationId(null);
                setSelectedPreviewImageId(null);
              }}
            />
          ) : null
        }
      />

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
                          Podgl�d zdj�cia
                        </p>
                        <p className="mt-2 text-sm text-stone-400">
                          Klikaj miniatury ni�ej, aby p�ynnie prze��cza� zdj�cia
                          bez prze�adowywania ca�ego modala.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePreviewZoomOut}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
                          aria-label="Pomniejsz zdj�cie"
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
                          aria-label="Powi�ksz zdj�cie"
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
                          <GalleryImageThumbnail
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
                              <GalleryImageThumbnail
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
                              <GalleryImageThumbnail
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
                              <GalleryImageThumbnail
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
    </>
  );
}

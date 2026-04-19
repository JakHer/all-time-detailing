import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageIntro } from '../components/PageIntro';
import { VehicleDetails } from '../components/vehicles/VehicleDetails';
import { VehicleList } from '../components/vehicles/VehicleList';
import { VehicleModal } from '../components/vehicles/VehicleModal';
import { VehicleToolbar } from '../components/vehicles/VehicleToolbar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { useClientOptions } from '../lib/clients';
import { scrollPageToTop } from '../lib/scroll';
import {
  useVehicle,
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicleMetrics,
  useVehicles,
  type NewVehicle,
} from '../lib/vehicles';

export function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDesktopDetailsLayout, setIsDesktopDetailsLayout] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1536px)').matches
      : false,
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const vehiclesQuery = useVehicles(deferredQuery);
  const { data: clients = [] } = useClientOptions();
  const { data: metricsData } = useVehicleMetrics();
  const selectedVehicleQuery = useVehicle(selectedVehicleId ?? '');
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 1536px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktopDetailsLayout(event.matches);
    };

    setIsDesktopDetailsLayout(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (isDesktopDetailsLayout) {
      setIsMobileDetailsOpen(false);
    }
  }, [isDesktopDetailsLayout]);

  useEffect(() => {
    const vehicleIdFromQuery = searchParams.get('vehicle');

    if (!vehicleIdFromQuery) {
      return;
    }

    setSelectedVehicleId(vehicleIdFromQuery);
    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
    scrollPageToTop();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('vehicle');
    setSearchParams(nextParams, { replace: true });
  }, [isDesktopDetailsLayout, searchParams, setSearchParams]);

  const vehicles =
    vehiclesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalVehicles = vehiclesQuery.data?.pages[0]?.totalCount ?? 0;
  const selectedVehicle = selectedVehicleQuery.data ?? null;
  const isListLoading = vehiclesQuery.isLoading;
  const isDetailsLoading =
    vehiclesQuery.isLoading ||
    (selectedVehicleId !== null && selectedVehicleQuery.isLoading);

  const metrics = useMemo(
    () => [
      {
        label: 'Pojazdy w bazie',
        value: String(metricsData?.totalVehicles ?? totalVehicles),
      },
      {
        label: 'Nowe (30 dni)',
        value: String(metricsData?.newVehiclesLast30Days ?? 0),
      },
      {
        label: 'Z historią wizyt',
        value: String(metricsData?.vehiclesWithHistory ?? 0),
      },
      {
        label: 'Marki w bazie',
        value: String(metricsData?.uniqueMakes ?? 0),
      },
    ],
    [metricsData, totalVehicles],
  );

  function handleCreateClick() {
    setModalMode('create');
    setIsModalOpen(true);
  }

  function handleEditClick() {
    if (!selectedVehicleId) {
      return;
    }

    setIsMobileDetailsOpen(false);
    setModalMode('edit');
    setIsModalOpen(true);
  }

  function handleDeleteClick() {
    if (!selectedVehicleId) {
      return;
    }

    setIsDeleteDialogOpen(true);
  }

  async function handleModalSubmit(data: NewVehicle) {
    try {
      if (modalMode === 'edit' && selectedVehicleId) {
        await updateMutation.mutateAsync({ ...data, id: selectedVehicleId });
        toast.success('Dane pojazdu zostały zaktualizowane');
      } else {
        const newVehicle = await createMutation.mutateAsync(data);
        setSelectedVehicleId(newVehicle.id);
        toast.success('Nowy pojazd został dodany');
      }

      setIsModalOpen(false);
    } catch {
      toast.error('Wystąpił błąd podczas zapisywania pojazdu');
    }
  }

  async function confirmDelete() {
    if (!selectedVehicleId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedVehicleId);
      setSelectedVehicleId(null);
      setIsDeleteDialogOpen(false);
      setIsMobileDetailsOpen(false);
      toast.success('Pojazd został usunięty');
    } catch {
      toast.error(
        'Nie można usunąć pojazdu, ponieważ prawdopodobnie ma przypisane rezerwacje.',
      );
    }
  }

  function handleSelectVehicle(id: string) {
    setSelectedVehicleId(id);
    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
    scrollPageToTop();
  }

  function closeVehicleDetails() {
    setSelectedVehicleId(null);
    setIsMobileDetailsOpen(false);
  }

  const shouldShowVehicleDetails = selectedVehicleId !== null;

  return (
    <div
      className="flex min-w-0 flex-col gap-4 overflow-x-hidden"
      style={{ overflowAnchor: 'none' }}
    >
      <div className="hidden sm:block">
        <PageIntro eyebrow="Pojazdy" title="Kartoteka aut" metrics={metrics} />
      </div>

      <MobilePageHeader
        eyebrow="Pojazdy"
        title="Baza pojazdow"
        chips={[
          `${metricsData?.totalVehicles ?? totalVehicles} aut`,
          `${metricsData?.uniqueMakes ?? 0} marek`,
        ]}
      />

      <VehicleToolbar
        query={query}
        onQueryChange={setQuery}
        onCreateClick={handleCreateClick}
      />

      <section
        className={`grid min-h-180 min-w-0 gap-6 ${
          shouldShowVehicleDetails
            ? '2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)] 2xl:items-start'
            : ''
        }`}
        style={{ overflowAnchor: 'none' }}
      >
        <div className="min-w-0 max-w-full">
          {isListLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-22 rounded-[26px]" />
              ))}
            </div>
          ) : (
            <VehicleList
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onSelect={handleSelectVehicle}
              totalCount={totalVehicles}
              hasNextPage={vehiclesQuery.hasNextPage ?? false}
              isFetchingNextPage={vehiclesQuery.isFetchingNextPage}
              onLoadMore={() => {
                void vehiclesQuery.fetchNextPage();
              }}
            />
          )}
        </div>

        <div
          className={`min-w-0 max-w-full ${
            shouldShowVehicleDetails ? 'hidden 2xl:block' : 'hidden'
          }`}
          style={{ overflowAnchor: 'none' }}
        >
          <VehicleDetails
            vehicle={selectedVehicle}
            isLoading={isDetailsLoading}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onCloseClick={closeVehicleDetails}
          />
        </div>
      </section>

      <Dialog.Root
        open={
          !isDesktopDetailsLayout && isMobileDetailsOpen && !!selectedVehicleId
        }
        onOpenChange={setIsMobileDetailsOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm 2xl:hidden" />
          <Dialog.Content className="fixed inset-0 z-70 flex h-dvh flex-col overflow-hidden bg-[#121314] outline-none 2xl:hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Szczegoly pojazdu
                </p>
                <p className="mt-1 truncate text-sm text-stone-400">
                  {selectedVehicle
                    ? `${selectedVehicle.make} ${selectedVehicle.model}`
                    : 'Wybrany pojazd'}
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
              <VehicleDetails
                vehicle={selectedVehicle}
                isLoading={isDetailsLoading}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                variant="sheet"
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={modalMode === 'edit' ? selectedVehicle : null}
        clients={clients}
        title={modalMode === 'edit' ? 'Edytuj pojazd' : 'Dodaj nowy pojazd'}
      />

      {isDeleteDialogOpen && selectedVehicle ? (
        <ConfirmDialog
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            void confirmDelete();
          }}
          title="Usuń pojazd"
          description={`Czy na pewno chcesz usunąć pojazd ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.registration})? Tej operacji nie można cofnąć.`}
          confirmLabel="Usuń pojazd"
          tone="danger"
        />
      ) : null}
    </div>
  );
}
